"""
OCR Service v4: "Mắt sắc, Não tinh" — PaddleOCR + ProtonX T5 + Groq LLM
  - Phase 1: PaddleOCR (GPU) + Image Pre-processing
  - Phase 2: Post-OCR Healing (ProtonX Legal TC T5 in INT8) -> Corrects text artifacts
  - Phase 3: LLM Healing (Groq) -> Financial validation
  - Features: Selective Correction (protects numbers), Graceful Degradation (OOM fallback)
"""

import numpy as np
import cv2
import re
import os
import json
import time
import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger("ai-service.ocr")


class ProcessingTracker:
    """Tracks processing steps with timing for UX feedback."""

    def __init__(self):
        self.steps: List[Dict[str, Any]] = []
        self._current_start: float = 0

    def start(self, step: str, label_vi: str):
        self._current_start = time.time()
        self.steps.append({
            "step": step,
            "label": label_vi,
            "status": "processing",
            "duration_ms": 0,
        })

    def finish(self):
        if self.steps:
            elapsed = int((time.time() - self._current_start) * 1000)
            self.steps[-1]["duration_ms"] = elapsed
            self.steps[-1]["status"] = "done"

    def get_steps(self) -> List[Dict[str, Any]]:
        return self.steps


class OCRService:
    """
    Hybrid OCR pipeline for Vietnamese receipts (v3 — PaddleOCR).
    1. Pre-process image (grayscale, denoise, CLAHE, adaptive threshold)
    2. PaddleOCR for text extraction (Vietnamese + English, GPU accelerated)
    3. Rule-based parsing (store, amount, date) with Amount Trap protection
    4. LLM Healing via Groq for correction when confidence is low
    """

    def __init__(self):
        self.reader = self._build_reader()
        self.corrector = self._build_corrector()
        self.ai_correction_active = self.corrector is not None

        self.keywords = {
            "grand_total": [
                "tổng cộng", "thanh toán", "tổng tiền", "thành tiền",
                "cộng tiền hàng", "tổng thanh toán", "tong cong",
                "total", "grand total", "amount due", "net amount",
                "tổng", "phải trả", "tạm tính",
            ],
            "cash_tendered": [
                "khách đưa", "tiền khách", "tiền đưa", "khach dua",
                "cash", "tendered", "received", "tiền mặt",
            ],
            "change": [
                "tiền thừa", "tiền thối", "tien thua", "tien thoi",
                "change", "trả lại",
            ],
            "date": [
                "ngày", "ngay", "date", "thời gian", "time",
            ],
            "store": [
                "siêu thị", "nhà hàng", "quán", "cửa hàng", "shop", "mart",
                "bách hóa", "bach hoa", "co.op", "lotte", "vinmart",
                "circle k", "ministop", "family mart", "gs25",
                "bách hoá xanh", "big c", "mega market", "emart",
                "saigon co.op", "winmart", "tops market",
            ],
        }

    def _build_reader(self, force_cpu_safe: bool = False):
        from paddleocr import PaddleOCR
        import paddle

        # Hard-disable OneDNN/MKLDNN flags before predictor creation.
        os.environ["FLAGS_use_onednn"] = "0"
        os.environ["FLAGS_use_mkldnn"] = "0"
        try:
            paddle.set_flags({"FLAGS_use_onednn": 0, "FLAGS_use_mkldnn": 0})
        except Exception:
            pass

        logger.info("Initializing PaddleOCR (vi, GPU mode)...")
        try:
            if force_cpu_safe:
                raise RuntimeError("Force safe CPU initialization")

            # Use larger batch size for GPU if available
            rec_batch = 12 if not force_cpu_safe else 6
            
            reader = PaddleOCR(
                use_angle_cls=True,
                lang='vi',
                use_gpu=not force_cpu_safe,
                det_db_thresh=0.3,
                det_db_box_thresh=0.5,
                rec_batch_num=rec_batch,
                enable_mkldnn=False,
                show_log=False,
            )
            logger.info("✅ PaddleOCR initialized with GPU acceleration (v2.8.1).")
            return reader
        except Exception as e:
            logger.warning(f"⚠️ GPU Initialization failed: {e}")
            logger.info("🔄 Falling back to CPU mode...")
            reader = PaddleOCR(
                use_angle_cls=True,
                lang='vi',
                use_gpu=False,
                det_db_thresh=0.3,
                det_db_box_thresh=0.5,
                rec_batch_num=6,
                enable_mkldnn=False,
                cpu_threads=1,
                show_log=False,
            )
            logger.info("✅ PaddleOCR initialized in CPU mode.")
            return reader

    def _build_corrector(self):
        """Initialize ProtonX Legal OCR Corrector with INT8 for VRAM efficiency."""
        try:
            import os
            # Set local cache path BEFORE importing transformers to ensure it's picked up
            os.environ["HF_HOME"] = os.path.join(os.getcwd(), "models", "cache")
            
            from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
            import torch
 
            # Use a specialized ViT5 Correction model
            model_id = "hoanghaiduong/vit5-correction"
            
            # Detect fastest available device
            device = "cuda" if torch.cuda.is_available() else "cpu"
            torch_dtype = torch.float16 if device == "cuda" else torch.float32
            
            logger.info(f"Initializing ViT5 Corrector ({model_id}) on {device.upper()}...")

            def load_tokenizer():
                # Keep T5 tokenizer behavior explicit to avoid runtime warning noise
                # and preserve compatibility with existing checkpoints.
                try:
                    return AutoTokenizer.from_pretrained(model_id, use_fast=False, legacy=True)
                except TypeError:
                    # Non-T5 tokenizers may not accept `legacy`.
                    return AutoTokenizer.from_pretrained(model_id, use_fast=False)

            def align_embeddings(model, tokenizer):
                tokenizer_vocab_size = len(tokenizer)
                model_vocab_size = model.get_input_embeddings().num_embeddings
                if tokenizer_vocab_size > model_vocab_size:
                    logger.warning(
                        "Tokenizer vocab (%s) > model embeddings (%s). Resizing embeddings for compatibility.",
                        tokenizer_vocab_size,
                        model_vocab_size,
                    )
                    model.resize_token_embeddings(tokenizer_vocab_size)

            try:
                tokenizer = load_tokenizer()
                if device == "cuda":
                    model = AutoModelForSeq2SeqLM.from_pretrained(
                        model_id,
                        device_map={"": device},
                        torch_dtype=torch_dtype,
                        trust_remote_code=True
                    )
                else:
                    model = AutoModelForSeq2SeqLM.from_pretrained(
                        model_id,
                        trust_remote_code=True
                    ).to(device)
                
                align_embeddings(model, tokenizer)
                pipe = pipeline("text2text-generation", model=model, tokenizer=tokenizer)
                logger.info(f"✅ ViT5 OCR Corrector initialized on {device.upper()}.")
            except Exception as e:
                if device == "cuda":
                    logger.warning(f"⚠️ GPU Initialization for T5 failed: {e}. Falling back to CPU...")
                    tokenizer = load_tokenizer()
                    model = AutoModelForSeq2SeqLM.from_pretrained(
                        model_id,
                        trust_remote_code=True
                    ).to("cpu")
                    align_embeddings(model, tokenizer)
                    pipe = pipeline("text2text-generation", model=model, tokenizer=tokenizer)
                    logger.info(f"✅ ViT5 OCR Corrector initialized on CPU (Fallback).")
                else:
                    raise e

            return pipe
        except Exception as e:
            import traceback
            logger.error(f"❌ Failed to initialize ProtonX Corrector: {e}")
            logger.error(traceback.format_exc())
            logger.info("⚠️ Graceful Degradation: AI Correction will be disabled.")
            return None

    # ------------------------------------------------------------------
    # Phase 1: Image Pre-processing Pipeline
    # ------------------------------------------------------------------
    def _preprocess_image(self, img: np.ndarray) -> np.ndarray:
        """
        Enhance receipt image for better OCR accuracy.
        Pipeline: Upscale → Grayscale → Denoise → CLAHE → Adaptive Threshold
        """
        h, w = img.shape[:2]

        # 1. Upscale small images (phone camera crops)
        if max(h, w) < 1500:
            scale = 2000 / max(h, w)
            img = cv2.resize(img, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)

        # 2. Convert to Grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # 3. Denoise (Bilateral Filter preserves edges while removing noise)
        denoised = cv2.bilateralFilter(gray, 9, 75, 75)

        # 4. CLAHE (Contrast Limited Adaptive Histogram Equalization)
        #    Excellent for uneven lighting on receipts (shadow, glare)
        clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
        enhanced = clahe.apply(denoised)

        # 5. Adaptive Threshold (handles shadow/glare across the receipt)
        thresh = cv2.adaptiveThreshold(
            enhanced, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY,
            blockSize=15,
            C=8,
        )

        return thresh

    # ------------------------------------------------------------------
    # Main entry point
    # ------------------------------------------------------------------
    def process_receipt(self, file_bytes: bytes) -> Dict[str, Any]:
        """Processes image bytes, performs OCR, and extracts structured data."""

        tracker = ProcessingTracker()

        nparr = np.frombuffer(file_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise ValueError("INVALID_IMAGE_FORMAT")

        # Step 1: Pre-process
        tracker.start("PREPROCESSING", "Đang làm sắc nét ảnh...")
        processed_img = self._preprocess_image(img)
        tracker.finish()

        # Step 2: PaddleOCR extraction
        tracker.start("OCR_EXTRACTING", "Đang trích xuất văn bản...")
        results = self._run_ocr_with_recovery(processed_img)
        tracker.finish()

        # PaddleOCR returns: [[[box], (text, confidence)], ...]
        # Flatten results (PaddleOCR may return nested list per image)
        ocr_lines = []
        if results and results[0]:
            for line in results[0]:
                box = line[0]
                text = line[1][0]
                confidence = line[1][1]
                ocr_lines.append((box, text, confidence))

        raw_text_lines = [line[1] for line in ocr_lines]
        full_text = "\n".join(raw_text_lines)

        # Step 3: Post-OCR Healing (ProtonX T5)
        tracker.start("AI_CLEANING", "AI đang chuẩn hóa văn bản...")
        corrected_lines, correction_flag = self._selective_correction(raw_text_lines)
        full_text = "\n".join(corrected_lines)
        tracker.finish()

        # Step 4: Rule-based parsing with Amount Trap protection
        tracker.start("PARSING", "Đang phân tích dữ liệu hóa đơn...")
        structured_data = self._parse_receipt(ocr_lines, corrected_lines if correction_flag != "AI_CORRECTION_DISABLED" else None)
        structured_data["raw_ocr_text"] = "\n".join(raw_text_lines) # Original OCR output
        structured_data["raw_text"] = full_text # Final corrected output
        structured_data["ai_correction_status"] = correction_flag
        tracker.finish()

        # Step 5: LLM Healing (if confidence < 75% or amount seems wrong)
        if structured_data["confidence"] < 0.75 or structured_data["amount"] < 1000:
            tracker.start("AI_HEALING", "AI đang đối soát số tiền...")
            healed = self._llm_heal(full_text, structured_data)
            if healed:
                structured_data.update(healed)
            tracker.finish()

        # Add processing steps to response
        structured_data["processing_steps"] = tracker.get_steps()

        return structured_data

    def _run_ocr_with_recovery(self, processed_img: np.ndarray):
        """Run OCR and recover from Paddle runtime failures per request."""
        try:
            return self.reader.ocr(processed_img, cls=True)
        except RuntimeError as exc:
            err_text = str(exc)
            if "OneDnnContext" in err_text or "fused_conv2d" in err_text:
                logger.warning(
                    "⚠️ OneDNN runtime error detected, rebuilding OCR predictor in safe CPU mode and retrying once."
                )
            else:
                logger.warning(
                    "⚠️ OCR runtime error detected, rebuilding OCR predictor in safe CPU mode and retrying once."
                )

            try:
                self.reader = self._build_reader(force_cpu_safe=True)
                return self.reader.ocr(processed_img, cls=True)
            except Exception as retry_exc:
                logger.error(f"❌ OCR retry failed after predictor rebuild: {retry_exc}")
                raise ValueError("OCR_RUNTIME_ERROR") from retry_exc

    def _selective_correction(self, lines: List[str]) -> (List[str], str):
        """
        Only correct lines with alpha characters. Protect numeric lines.
        Handles OOM and errors with Graceful Degradation.
        """
        if not self.ai_correction_active or not self.corrector:
            return lines, "AI_CORRECTION_DISABLED"

        corrected_lines = []
        status = "AI_CORRECTION_OK"

        try:
            for line in lines:
                # 1. Check if line is mostly numbers/symbols
                if not any(c.isalpha() for c in line):
                    # Numeric protection: skip AI, just clean whitespace
                    corrected_lines.append(line.strip())
                    continue

                # 2. Mixed line or Alpha line: Send to T5
                # Pre-clean for T5 (lowercase is often better for this model)
                input_text = f"sửa lỗi: {line.lower()}"
                
                try:
                    out = self.corrector(input_text, max_length=128)
                    corrected_text = out[0]['generated_text']
                    corrected_lines.append(corrected_text)
                except Exception as e:
                    logger.warning(f"Line correction failed: {e}")
                    corrected_lines.append(line)
                    if "out of memory" in str(e).lower():
                        raise e # Trigger OOM fallback

            return corrected_lines, status

        except Exception as oom_e:
            if "out of memory" in str(oom_e).lower() or "CUDA out of memory" in str(oom_e):
                logger.error("🔥 GPU OOM during correction! Disabling AI Healing for this session.")
                self.ai_correction_active = False
                return lines, "AI_CORRECTION_DISABLED"
            return lines, "AI_CORRECTION_FAILED"

    # ------------------------------------------------------------------
    # Rule-based receipt parsing (with Amount Trap protection)
    # ------------------------------------------------------------------
    def _parse_receipt(self, ocr_results: List[Any], corrected_lines: Optional[List[str]] = None) -> Dict[str, Any]:
        """Heuristic-based parsing for Vietnamese receipts."""

        data = {
            "store_name": "Unknown Store",
            "transaction_date": None,
            "amount": 0.0,
            "confidence": 0.0,
            "category_id": "OTHER_EXPENSE",
        }

        if not ocr_results:
            return data

        # ocr_results: [(box, text, confidence), ...]
        raw_lines = [res[1].lower() for res in ocr_results]
        lines = [l.lower() for l in corrected_lines] if corrected_lines else raw_lines
        confidences = [res[2] for res in ocr_results]

        if confidences:
            data["confidence"] = sum(confidences) / len(confidences)

        # 1. Store Name: First 3 lines, prioritize known keywords
        for i in range(min(3, len(lines))):
            if any(k in lines[i] for k in self.keywords["store"]):
                data["store_name"] = ocr_results[i][1]
                break
        if data["store_name"] == "Unknown Store" and ocr_results:
            data["store_name"] = ocr_results[0][1]

        # 2. Amount: Grand Total (CRITICAL: avoid Cash Tendered / Change traps)
        amount_regex = r'(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?)'
        grand_total = 0.0

        for i, line in enumerate(lines):
            search_text = line + " " + (lines[i + 1] if i + 1 < len(lines) else "")

            # SKIP Cash Tendered lines (Tiền khách đưa)
            if any(k in line for k in self.keywords["cash_tendered"]):
                continue

            # SKIP Change lines (Tiền thừa/thối)
            if any(k in line for k in self.keywords["change"]):
                continue

            # MATCH Grand Total lines
            if any(k in line for k in self.keywords["grand_total"]):
                matches = re.findall(amount_regex, search_text)
                if matches:
                    nums = [self._clean_number(m) for m in matches]
                    if nums:
                        grand_total = max(nums)
                        break

        # Fallback: largest number in bottom half (excluding cash/change lines)
        if grand_total == 0.0:
            all_numbers = []
            for line in lines[len(lines) // 2:]:
                if any(k in line for k in self.keywords["cash_tendered"] + self.keywords["change"]):
                    continue
                matches = re.findall(amount_regex, line)
                if matches:
                    all_numbers.extend([self._clean_number(m) for m in matches])
            if all_numbers:
                grand_total = max(all_numbers)

        data["amount"] = grand_total

        # 3. Date
        date_regex = r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})'
        for line in lines:
            matches = re.findall(date_regex, line)
            if matches:
                data["transaction_date"] = matches[0]
                break

        # 4. Category (NER keyword mapping)
        from services.ner_service import _map_category
        full_text_for_mapping = " ".join(lines)
        data["category_id"] = _map_category(full_text_for_mapping)

        return data

    # ------------------------------------------------------------------
    # Phase 2: LLM Healing (Groq-based correction)
    # ------------------------------------------------------------------
    def _llm_heal(self, raw_text: str, current_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Use Groq LLM to correct OCR mistakes.
        Critical: Distinguish Grand Total vs Cash Tendered vs Change.
        Model: openai/gpt-oss-120b (configured via GROQ_MODEL env var)
        """
        import httpx

        api_key = os.getenv("GROQ_API_KEY", "").strip()
        if not api_key:
            logger.warning("GROQ_API_KEY not set, skipping LLM Healing.")
            return None

        model = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
        timeout = float(os.getenv("GROQ_TIMEOUT_SEC", "15"))

        system_prompt = """You are an expert Vietnamese receipt OCR correction system.

Given raw OCR text from a Vietnamese receipt, extract the CORRECT structured data.

CRITICAL RULES for Amount:
- "Tổng cộng" / "Thanh toán" / "Thành tiền" / "Tạm tính" = GRAND TOTAL → This is the amount we want.
- "Khách đưa" / "Tiền khách" / "Tiền mặt" = CASH TENDERED → DO NOT use this as amount.
- "Tiền thừa" / "Tiền thối" / "Trả lại" = CHANGE → DO NOT use this as amount.
- Vietnamese money uses dots as thousands separator: 250.000 = 250,000 VNĐ.
- If OCR reads "700" but context shows items like "kem hộp", it likely means 700,000 VNĐ.
- Common Vietnamese stores: Bách Hóa Xanh, Lotte Mart, Co.opmart, VinMart, Circle K, WinMart, Big C, Emart, Tops Market.

ANALYSIS STRATEGY:
1. First, identify ALL monetary values in the text and label them (Grand Total, Cash Tendered, Change, Item Price).
2. Verify: Grand Total = Sum of item prices (approximately).
3. Verify: Change = Cash Tendered - Grand Total.
4. Select the GRAND TOTAL as the final amount.
5. If multiple "total" lines exist, pick the LAST/LARGEST one before Cash Tendered.

Return ONLY a JSON object:
{
  "store_name": "Exact store name",
  "amount": 250000,
  "category_id": "SHOPPING",
  "transaction_date": "dd/mm/yyyy or null",
  "is_corrected": true,
  "correction_reason": "brief explanation of what was corrected and why"
}

Allowed category_id values: FOOD, TRANSPORT, UTILITIES, EDUCATION, SHOPPING, HEALTH, HOUSING, ENTERTAINMENT, SALARY, GIFT, SAVING, HOUSEHOLD, OTHER_INCOME, OTHER_EXPENSE"""

        user_content = json.dumps({
            "raw_ocr_text": raw_text[:800],
            "current_parsed": {
                "store_name": current_data.get("store_name"),
                "amount": current_data.get("amount"),
                "category_id": current_data.get("category_id"),
                "confidence": current_data.get("confidence"),
            }
        }, ensure_ascii=False)

        payload = {
            "model": model,
            "temperature": 0.0,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
        }

        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

        try:
            with httpx.Client(timeout=timeout) as client:
                res = client.post(url, headers=headers, json=payload)
                res.raise_for_status()

            data = res.json()
            content = (
                data.get("choices", [{}])[0]
                .get("message", {})
                .get("content", "")
            )

            if not content:
                return None

            obj = self._extract_json(content)
            if not obj:
                return None

            result = {}
            allowed_cats = {
                "FOOD", "TRANSPORT", "UTILITIES", "EDUCATION", "SHOPPING",
                "HEALTH", "HOUSING", "ENTERTAINMENT", "SALARY", "GIFT",
                "SAVING", "HOUSEHOLD", "OTHER_INCOME", "OTHER_EXPENSE",
            }

            if "store_name" in obj and isinstance(obj["store_name"], str) and obj["store_name"].strip():
                result["store_name"] = obj["store_name"].strip()

            if "amount" in obj and obj["amount"] is not None:
                try:
                    amount = float(obj["amount"])
                    if amount > 0:
                        result["amount"] = amount
                except (TypeError, ValueError):
                    pass

            if "category_id" in obj and obj["category_id"] in allowed_cats:
                result["category_id"] = obj["category_id"]

            if "transaction_date" in obj and obj["transaction_date"]:
                result["transaction_date"] = obj["transaction_date"]

            if "is_corrected" in obj:
                result["is_corrected"] = bool(obj["is_corrected"])

            if "correction_reason" in obj:
                result["correction_reason"] = str(obj["correction_reason"])

            if result:
                reason = obj.get("correction_reason", "LLM auto-corrected")
                logger.info(f"🔧 [LLM HEAL] Corrections applied: {reason}")
                for k, v in result.items():
                    old_val = current_data.get(k)
                    if old_val != v:
                        logger.info(f"   {k}: {old_val} → {v}")

            return result if result else None

        except Exception as e:
            logger.warning(f"LLM Healing failed: {e}")
            return None

    # ------------------------------------------------------------------
    # Utilities
    # ------------------------------------------------------------------
    @staticmethod
    def _extract_json(text: str) -> Optional[Dict]:
        """Best-effort JSON extraction from LLM output."""
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                pass
        return None

    def _clean_number(self, num_str: str) -> float:
        """Normalizes Vietnamese number strings to float."""
        cleaned = num_str.replace(" ", "")

        if "." in cleaned and "," in cleaned:
            if cleaned.find(".") < cleaned.find(","):
                cleaned = cleaned.replace(".", "").replace(",", ".")
            else:
                cleaned = cleaned.replace(",", "")
        elif "," in cleaned:
            parts = cleaned.split(",")
            if len(parts[-1]) == 3:
                cleaned = cleaned.replace(",", "")
            else:
                cleaned = cleaned.replace(",", ".")
        elif "." in cleaned:
            parts = cleaned.split(".")
            if len(parts[-1]) == 3:
                cleaned = cleaned.replace(".", "")

        try:
            return float(cleaned)
        except (ValueError, TypeError):
            return 0.0
