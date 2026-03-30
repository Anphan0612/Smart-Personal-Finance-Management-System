"""
NER Service: wraps the fine-tuned PhoBERT model to extract transaction
entities from Vietnamese text using a Hybrid pipeline
(Transformer NER + Regex money parser + keyword category mapping).
"""

from __future__ import annotations

import os
import re
from datetime import date
from typing import Optional

from transformers import pipeline, TokenClassificationPipeline

from utils.money_parser import parse_amount
from utils.text_normalizer import normalize_for_rules

from services.llm_service import is_llm_configured, repair_transaction_with_llm_sync


# ---------------------------------------------------------------------------
# Category keyword mapping (rule-based fallback / confirmation)
# ---------------------------------------------------------------------------
_CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "FOOD": [
        "pho", "phở", "com", "cơm", "bun", "bún", "banh", "bánh", "an", "ăn",
        "cafe", "ca phe", "cà phê", "coffee", "tra sua", "trà sữa",
        "sang", "tối", "toi", "trua", "trưa", "bia", "bun bo", "bún bò", "do an vat", "đồ ăn vặt",
        "buffet", "lau", "lẩu", "sushi", "ga ran", "gà rán", "mi", "mì",
        "do an", "đồ ăn", "rau", "sua", "sữa", "com tam", "cơm tấm",
        "banh mi", "bánh mì",
    ],
    "TRANSPORT": [
        "grab", "taxi", "xe om", "xe ôm", "xang", "xăng", "bus", "xe buyt",
        "xe buýt", "xe khach", "xe khách", "may bay", "máy bay", "do xe",
        "sua xe", "rua xe", "bao hiem xe", "gui xe", "gửi xe",
    ],
    "UTILITIES": [
        "dien", "điện", "nuoc", "nước", "wifi", "internet", "nap dt",
        "nạp điện thoại", "nap the", "nạp thẻ", "cuoc", "cước",
        "tien dien", "tiền điện", "tien nuoc", "tiền nước",
        "mang", "mạng", "tien mang", "tiền mạng",
        "rac", "rác", "tien rac", "tiền rác",
        "dien thoai", "điện thoại", "card dien thoai", "card điện thoại",
    ],
    "EDUCATION": [
        "hoc phi", "học phí", "sach", "sách", "khoa hoc", "khóa học",
        "tieu hoc", "tieu học", "dai hoc", "tai lieu", "tài liệu",
        "do dung hoc", "den hoc", "tieng anh", "tiếng anh", "lap trinh",
    ],
    "SHOPPING": [
        "mua", "ao", "áo", "quan", "quần", "giay", "giày", "tui", "túi",
        "sieu thi", "siêu thị", "tai nghe", "ban phim", "chuot", "sac",
        "do cu", "đồ cũ", "linh tinh",
    ],
    "HEALTH": [
        "thuoc", "thuốc", "kham", "khám", "benh", "bệnh", "bao hiem",
        "bảo hiểm", "gym", "boi", "bơi", "vitamin", "y te", "y tế",
    ],
    "HOUSING": [
        "phong", "phòng", "nha tro", "nhà trọ", "tien phong", "tiền phòng",
        "thue nha", "thuê nhà",
    ],
    "ENTERTAINMENT": [
        "phim", "game", "net", "karaoke", "bida", "nap game", "nạp game",
    ],
    "SALARY": [
        "luong", "lương", "freelance", "thuong", "thưởng", "kpi",
        "day them", "dạy thêm",
    ],
    "GIFT": [
        "qua", "quà", "tang", "tặng", "sinh nhat", "sinh nhật", "tet", "tết",
    ],
    "SAVING": [
        "tiet kiem", "tiết kiệm", "gui tiet kiem", "rut tiet kiem",
    ],
    "HOUSEHOLD": [
        "noi com", "nồi cơm", "bot giat", "bột giặt", "giay ve sinh",
        "ban hoc", "bàn học", "ghe", "ghế",
    ],
    "OTHER_INCOME": [
        "hoan tien", "hoàn tiền", "refund", "lai ngan hang", "lãi ngân hàng",
        "bo me", "bố mẹ", "hoc bong", "học bổng", "thuong hoc tap",
    ],
    "OTHER_EXPENSE": [
        "tra no", "trả nợ", "linh tinh",
    ],
}

# INCOME keywords → override type to INCOME
_INCOME_KEYWORDS = [
    "nhan", "nhận", "luong", "lương", "duoc", "được",
    "refund", "hoan", "hoàn", "lai", "lãi", "rut", "rút", "tang",
]

# Normalized keyword dictionaries for rule-based matching.
# We normalize both keywords and inputs to be accent-insensitive ("không dấu").
_CATEGORY_KEYWORDS_NORMALIZED: dict[str, list[str]] = {
    category: [normalize_for_rules(kw) for kw in keywords]
    for category, keywords in _CATEGORY_KEYWORDS.items()
}
_INCOME_KEYWORDS_NORMALIZED: list[str] = [normalize_for_rules(kw) for kw in _INCOME_KEYWORDS]


def _map_category(text: str) -> str:
    """Return the best-matching category from the keyword dictionary."""
    text_norm = normalize_for_rules(text)
    best_category: str | None = None
    best_len = -1

    # Longest-match: prefer more specific multi-word keywords like "sua xe"
    # over shorter substrings like "sua" that would otherwise cause false positives.
    for category, keywords in _CATEGORY_KEYWORDS_NORMALIZED.items():
        for kw in keywords:
            if not kw:
                continue

            matched = False
            # Avoid false positives for very short tokens (e.g. "an" inside "khoan").
            if len(kw) <= 2 and " " not in kw:
                matched = re.search(rf"\b{re.escape(kw)}\b", text_norm) is not None
            else:
                matched = kw in text_norm

            if not matched:
                continue

            kw_len = len(kw)
            if kw_len > best_len:
                best_len = kw_len
                best_category = category

    if best_category:
        return best_category
    return "OTHER_EXPENSE"


def _infer_type(text: str, category: str) -> str:
    """Infer INCOME or EXPENSE from text + category."""
    income_categories = {"SALARY", "SAVING", "GIFT", "OTHER_INCOME"}
    if category in income_categories:
        return "INCOME"

    text_norm = normalize_for_rules(text)

    # Loan/borrow language almost always implies expense (outgoing money),
    # and also acts as an anti-false-positive for the ambiguous "ban"/"bán"/"bạn" token.
    loan_cues = ("cho muon", "cho mượn", "muon", "mượn", "vay", "trả nợ", "tra no")
    if any(cue in text_norm for cue in loan_cues):
        return "EXPENSE"

    if any(kw in text_norm for kw in _INCOME_KEYWORDS_NORMALIZED):
        return "INCOME"
    return "EXPENSE"


def _build_note(text: str) -> str:
    """Extract a short note from the raw text (max 50 chars)."""
    return text.strip()[:50]


class NERService:
    """
    Singleton-friendly NLP service.
    Loads the PhoBERT token-classification pipeline once at startup.
    """

    _pipeline: Optional[TokenClassificationPipeline] = None
    MODEL_PATH = "../ml-models/phobert-finance-ner-final"

    def __init__(self) -> None:
        # Load model weights lazily/defensively:
        # - If the model folder isn't present, we still allow endpoint to work
        #   using regex money_parser + keyword mapping (rule-based fallback).
        if NERService._pipeline is not None:
            return

        model_path = os.getenv("PHOBERT_MODEL_PATH", self.MODEL_PATH)

        # HuggingFace will throw if model directory doesn't exist.
        # In MVP clones, model assets may be excluded from git due to size.
        import os as _os

        if not _os.path.exists(model_path):
            NERService._pipeline = None
            return

        NERService._pipeline = pipeline(
            task="token-classification",
            model=model_path,
            aggregation_strategy="simple",
        )

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def extract(self, text: str) -> dict:
        """
        Run hybrid pipeline on `text`.

        Returns a dict compatible with EntityResponse on success,
        or raises ValueError with an error code on failure.
        """
        # 1. Try Regex money parser first (highest precision for amount)
        # Use normalized text for accent-insensitive money parsing.
        text_norm = normalize_for_rules(text)
        amount = parse_amount(text_norm)
        amount_from_regex = amount is not None

        # 2. Run PhoBERT NER for category / additional context
        if self._pipeline is None:
            ner_results = []
            model_confidence = 0.55
        else:
            ner_results = self._pipeline(text)  # type: ignore[misc]
            model_confidence = self._avg_confidence(ner_results)

        # 3. Category via model label, fallback to keyword map
        category, category_confidence = self._extract_category_with_confidence(ner_results, text)

        # 4. If regex missed amount, try to get AMOUNT entity from model
        if amount is None:
            amount = self._extract_amount_from_ner(ner_results)
            amount_from_regex = False

        # 5. Infer transaction type
        transaction_type = _infer_type(text_norm, category)

        # 6. Composite confidence for gated LLM repair
        amount_confidence = 0.95 if amount_from_regex and amount is not None else 0.55
        overall_confidence = self._composite_confidence(
            amount_confidence=amount_confidence,
            category_confidence=category_confidence,
        )

        # Global rule-based fallback when confidence is low.
        # This improves category stability even when LLM repair is disabled/unavailable.
        # If LLM repair is enabled and configured, we skip this coarse override
        # so Groq can decide from PhoBERT signals + low-confidence reasons.
        threshold = float(os.getenv("LLM_CONFIDENCE_THRESHOLD", "0.65"))
        llm_enabled = os.getenv("ENABLE_LLM_REPAIR", "true").strip().lower() not in {"0", "false", "no"}
        llm_available = llm_enabled and is_llm_configured()
        if overall_confidence < threshold and not llm_available:
            category = _map_category(text)
            category_confidence = 0.55
            transaction_type = _infer_type(text, category)
            overall_confidence = self._composite_confidence(
                amount_confidence=amount_confidence,
                category_confidence=category_confidence,
            )

        # 7. Optional LLM "repair" when confidence is low
        if self._should_call_llm(
            amount_confidence=amount_confidence,
            category_confidence=category_confidence,
            overall_confidence=overall_confidence,
        ):
            llm_result = repair_transaction_with_llm_sync(
                text=text,
                current_amount=amount if amount and amount > 0 else None,
                current_type=transaction_type,
                current_category=category,
                low_confidence_reasons=self._low_confidence_reasons(
                    amount_from_regex=amount_from_regex,
                    amount=amount,
                    category_confidence=category_confidence,
                    model_confidence=model_confidence,
                ),
                timeout_sec=float(os.getenv("GROQ_TIMEOUT_SEC", "15")),
                model=os.getenv("GROQ_MODEL", "openai/gpt-oss-20b"),
            )
            if llm_result:
                # Only overwrite `amount` if regex/model couldn't find it.
                if (amount is None or amount <= 0) and isinstance(llm_result.get("amount"), int):
                    amount = int(llm_result["amount"])

                if isinstance(llm_result.get("category"), str):
                    category = llm_result["category"]

                # Re-derive type for consistency with final category + text.
                transaction_type = _infer_type(text_norm, category)

                if isinstance(llm_result.get("confidence"), float):
                    overall_confidence = float(llm_result["confidence"])

        # 8. Raise structured error if still no amount
        if amount is None or amount <= 0:
            raise ValueError("MISSING_AMOUNT")

        return {
            "amount": amount,
            "type": transaction_type,
            "category": category,
            "date": date.today().isoformat(),
            "note": _build_note(text),
            "confidence": round(float(overall_confidence), 4),
        }

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _avg_confidence(ner_results: list) -> float:
        if not ner_results:
            return 0.5
        scores = [r.get("score", 0.5) for r in ner_results]
        return sum(scores) / len(scores)

    @staticmethod
    def _extract_category_with_confidence(ner_results: list, text: str) -> tuple[str, float]:
        """
        Prefer model's CATEGORY label if confidence >= 0.70,
        otherwise fall back to keyword mapping.
        """
        for entity in ner_results:
            label: str = entity.get("entity_group", "")
            score: float = entity.get("score", 0.0)
            if "CATEGORY" in label.upper() and score >= 0.70:
                word = entity.get("word", "")
                # Map raw model word to our category keys
                mapped = _map_category(word)
                if mapped != "OTHER_EXPENSE":
                    return mapped, float(min(0.99, max(0.0, score)))
        # Fallback: keyword map on full text
        return _map_category(text), 0.55

    @staticmethod
    def _composite_confidence(*, amount_confidence: float, category_confidence: float) -> float:
        """
        Weighted composite confidence for gated LLM repair.
        Amount gets higher weight to protect Amount Exact Accuracy.
        """
        amount_w = 0.65
        category_w = 0.35
        score = (amount_w * amount_confidence) + (category_w * category_confidence)
        if score < 0.0:
            return 0.0
        if score > 1.0:
            return 1.0
        return score

    @staticmethod
    def _should_call_llm(*, amount_confidence: float, category_confidence: float, overall_confidence: float) -> bool:
        """
        Call LLM only when confidence is low AND Groq is configured.
        """
        threshold = float(os.getenv("LLM_CONFIDENCE_THRESHOLD", "0.65"))
        enabled = os.getenv("ENABLE_LLM_REPAIR", "true").strip().lower() not in {"0", "false", "no"}
        low_enough = (
            overall_confidence < threshold
            or amount_confidence < threshold
            or category_confidence < threshold
        )
        return enabled and is_llm_configured() and low_enough

    @staticmethod
    def _low_confidence_reasons(
        *,
        amount_from_regex: bool,
        amount: Optional[int],
        category_confidence: float,
        model_confidence: float,
    ) -> list[str]:
        reasons: list[str] = []
        if not amount_from_regex:
            reasons.append("amount_from_model_or_missing")
        if amount is None or amount <= 0:
            reasons.append("missing_amount")
        if category_confidence < 0.65:
            reasons.append("category_low_confidence")
        if model_confidence < 0.65:
            reasons.append("ner_low_confidence")
        return reasons or ["low_confidence"]

    @staticmethod
    def _extract_amount_from_ner(ner_results: list) -> Optional[int]:
        """Try to parse amount from model's AMOUNT entity as a last resort."""
        for entity in ner_results:
            label: str = entity.get("entity_group", "")
            if "AMOUNT" in label.upper():
                word = entity.get("word", "")
                parsed = parse_amount(normalize_for_rules(word))
                if parsed:
                    return parsed
        return None
