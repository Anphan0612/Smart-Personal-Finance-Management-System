import os
# RESOLVE DLL CONFLICT: Set environment flags before any DL library is imported
# 1. Disable OneDNN to prevent PaddleOCR crash on Windows
os.environ["FLAGS_use_onednn"] = "0"
os.environ["FLAGS_use_mkldnn"] = "0"
# 2. Allow multiple OpenMP runtimes (Fixes WinError 127 co-existence between Paddle and Torch)
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
# 3. Keep CPU threading conservative to reduce oneDNN/export instability
os.environ["OMP_NUM_THREADS"] = "1"

from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, HTTPException, Request, File, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from models.schemas import (
    EntityResponse,
    ErrorResponse,
    TransactionRequest,
    QueryHistoryRequest,
    QueryHistoryResponse,
    AnomalyDetectRequest,
    AnomalyDetectResponse,
    OCRResponse,
)
from services.ner_service import NERService
from services.ocr_service import OCRService
from services.insight_generator import generate_financial_insights
from services.query_service import classify_intent, extract_filters
from services.anomaly_service import detect_anomalies
from dotenv import load_dotenv

# Load root .env if it exists
load_dotenv("../.env")

# Singleton services (loaded once at startup to avoid per-request latency)
# ---------------------------------------------------------------------------
_ner_service: NERService | None = None
_ocr_service: OCRService | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _ner_service, _ocr_service
    _ner_service = NERService()
    # Lazy load OCR service or load it here?
    # OCR models are heavy (~150MB), better load at startup if RAM allows
    _ocr_service = OCRService()
    yield


# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Smart Finance NLP Service",
    description="PhoBERT-powered Vietnamese transaction parser — Issue #20",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production per Issue #23
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Error messages (Vietnamese)
# ---------------------------------------------------------------------------
_ERROR_MESSAGES = {
    "MISSING_AMOUNT": (
        "Không tìm thấy số tiền trong câu nhập. "
        "Vui lòng thêm số tiền, ví dụ: 'ăn phở 50k'."
    ),
    "EMPTY_TEXT": "Câu nhập không được để trống.",
    "INVALID_TEXT": "Định dạng câu nhập không hợp lệ.",
    "NLP_SERVICE_ERROR": "Lỗi xử trị từ dịch vụ NLP.",
}

_ERROR_SUGGESTIONS = {
    "MISSING_AMOUNT": "Thêm số tiền vào câu, ví dụ: '30k', '150.000đ', '2 triệu'.",
    "EMPTY_TEXT": "Vui lòng nhập câu mô tả giao dịch, ví dụ: 'ăn phở 50k'.",
    "INVALID_TEXT": "Vui lòng kiểm tra lại câu nhập.",
    "NLP_SERVICE_ERROR": "Hãy thử lại sau giây lát.",
}


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Normalize validation errors to match our ErrorResponse contract:
      { "detail": { "error": ..., "message": ..., "suggestion": ... } }
    """
    error_code = "INVALID_TEXT"
    for err in exc.errors():
        loc = err.get("loc", [])
        if any(part == "text" for part in loc):
            msg = str(err.get("msg", "")).lower()
            if "cannot be empty" in msg or "empty" in msg:
                error_code = "EMPTY_TEXT"
                break

    error = ErrorResponse(
        error=error_code,
        message=_ERROR_MESSAGES.get(error_code, "Không thể phân tích câu nhập."),
        suggestion=_ERROR_SUGGESTIONS.get(error_code, "Hãy nhập lại câu rõ ràng hơn."),
    ).model_dump()

    return JSONResponse(status_code=422, content={"detail": error})


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "ok"}


@app.post(
    "/api/ai/generate-insights",
    tags=["NLP"],
    summary="Generate financial advice based on transaction comparison",
)
async def generate_insights(comparison_data: dict[str, Any]):
    """
    Accepts a dictionary of transaction comparisons and returns a 
    natural language insight in Vietnamese.
    """
    try:
        insight = generate_financial_insights(comparison_data)
        return {"insight": insight}
    except Exception as e:
        print(f"[AI SERVICE] Insight Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

from pydantic import BaseModel
class BudgetInsightRequest(BaseModel):
    category_name: str
    threshold: str

@app.post(
    "/api/ai/budget-insight",
    tags=["NLP"],
    summary="Generate zero-cost rule-based budget insight",
)
async def get_budget_insight(request: BudgetInsightRequest):
    """
    Returns localized gamification insight for a budget based on its threshold status.
    """
    from services.insight_generator import generate_budget_insight
    try:
        insight = generate_budget_insight(request.category_name, request.threshold)
        return {"insight": insight}
    except Exception as e:
        print(f"[AI SERVICE] Budget Insight Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post(
    "/api/ai/extract-transaction",
    response_model=EntityResponse,
    responses={422: {"model": ErrorResponse}},
    tags=["NLP"],
    summary="Parse Vietnamese transaction text into structured data",
)
async def extract_transaction(request: TransactionRequest):
    """
    Accepts a Vietnamese natural-language sentence describing a financial
    transaction and returns a structured JSON with:
    amount, type, category, date, note, confidence.
    """
    global _ner_service
    # Request logging handled by middleware or removed for stability on Windows
    try:
        if _ner_service is None:
            # Re-initialize if lifespan failed or initial load failed
            from services.ner_service import NERService
            _ner_service = NERService()
            
        result = _ner_service.extract(request.text)
        # Successfully extracted
        return EntityResponse(**result)
    except ValueError as exc:
        error_code = str(exc)
        print(f"[AI SERVICE] ValueError: {error_code}")
        raise HTTPException(
            status_code=422,
            detail=ErrorResponse(
                error=error_code,
                message=_ERROR_MESSAGES.get(error_code, "Không thể phân tích câu nhập."),
                suggestion=_ERROR_SUGGESTIONS.get(error_code, "Hãy nhập lại câu rõ ràng hơn."),
            ).model_dump(),
        )
    except Exception as e:
        print(f"[AI SERVICE] Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post(
    "/api/ai/query-history",
    response_model=QueryHistoryResponse,
    tags=["NLP"],
    summary="Classify intent and analyze transaction history via NLP",
)
async def query_history(request: QueryHistoryRequest):
    """
    1. Classifies user intent as QUERY (asking about history) or COMMAND (new transaction).
    2. For QUERY intent, extracts time/category filters and generates an AI summary.
    3. For COMMAND intent, returns intent='COMMAND' so the caller can route to extract-transaction.
    """
    # print(f"[AI SERVICE] Query request: {request.text}")

    intent = classify_intent(request.text)

    if intent == "COMMAND":
        return QueryHistoryResponse(intent="COMMAND", filters={}, answer="")

    # Extract filters from the query
    filters = extract_filters(request.text)

    # Filter the provided transactions based on extracted filters
    filtered = _apply_filters(request.transactions, filters)

    # Build summary statistics
    summary = _build_summary(filtered, filters)

    # Generate natural language answer using LLM
    answer = _generate_query_answer(request.text, filtered, summary, filters)

    # Extract IDs of the matched transactions to pass back to backend
    matched_txn_ids = [str(txn.get("id")) for txn in filtered if txn.get("id")]

    return QueryHistoryResponse(
        intent="QUERY",
        filters=filters,
        answer=answer,
        summary=summary,
        matched_txn_ids=matched_txn_ids,
    )


@app.post(
    "/api/ai/detect-anomalies",
    response_model=AnomalyDetectResponse,
    tags=["NLP"],
    summary="Detect spending anomalies in transaction history",
)
async def detect_anomalies_endpoint(request: AnomalyDetectRequest):
    """
    Accepts a list of transactions and returns detected spending anomalies
    based on Z-Score statistical analysis per category.
    """
    print(f"[AI SERVICE] Anomaly check: {len(request.transactions)} transactions")

    anomalies = detect_anomalies(
        transactions=request.transactions,
        z_threshold=request.z_threshold,
    )

    return AnomalyDetectResponse(
        anomalies=anomalies,
        total_checked=len(request.transactions),
    )


@app.post(
    "/api/ai/ocr-receipt",
    response_model=OCRResponse,
    tags=["OCR"],
    summary="Extract structured data from a receipt image (Vietnamese focus)",
)
async def ocr_receipt(file: UploadFile = File(...)):
    """
    Accepts an image file via multipart/form-data.
    Returns structured data: store_name, amount, transaction_date, confidence.
    Pipeline: Image Pre-processing → PaddleOCR → Rule-based Parse → LLM Healing
    """
    global _ocr_service
    try:
        if _ocr_service is None:
            _ocr_service = OCRService()
            
        contents = await file.read()
        result = _ocr_service.process_receipt(contents)

        # --- Detailed OCR Result Logging ---
        print("\n" + "=" * 60)
        print("[OCR SERVICE v3] ✅ Receipt processed (PaddleOCR + LLM Heal)")
        print("=" * 60)
        print(f"  📍 Store Name     : {result.get('store_name', 'N/A')}")
        print(f"  💰 Amount         : {result.get('amount', 0):,.0f} VNĐ")
        print(f"  📅 Date           : {result.get('transaction_date', 'Not detected')}")
        print(f"  🎯 Confidence     : {result.get('confidence', 0):.2%}")
        print(f"  🏷️  Category       : {result.get('category_id', 'OTHER_EXPENSE')}")
        if result.get('is_corrected'):
            print(f"  🔧 Corrected      : ✅ {result.get('correction_reason', 'N/A')}")
        raw_preview = (result.get('raw_text', '')[:120] + '...') if len(result.get('raw_text', '')) > 120 else result.get('raw_text', '')
        print(f"  📝 Raw Text       : {raw_preview}")

        # Processing Steps timing
        steps = result.get('processing_steps', [])
        if steps:
            print("-" * 60)
            print("  ⏱️  Processing Steps:")
            for step in steps:
                print(f"     [{step['step']}] {step['label']} — {step['duration_ms']}ms")

        print("-" * 60)
        print("[OCR SERVICE v3] Transaction-ready fields:")
        print(f"  → description : Hóa đơn từ {result.get('store_name', 'N/A')}")
        print(f"  → amount      : {result.get('amount', 0)}")
        print(f"  → type        : EXPENSE")
        print(f"  → category_id : {result.get('category_id', 'OTHER_EXPENSE')}")
        print(f"  → date        : {result.get('transaction_date', 'N/A')}")
        print("=" * 60 + "\n")

        return OCRResponse(**result)
    except ValueError as e:
        if str(e) == "INVALID_IMAGE_FORMAT":
            raise HTTPException(status_code=400, detail="Định dạng ảnh không hợp lệ.")
        if str(e) == "OCR_RUNTIME_ERROR":
            raise HTTPException(
                status_code=503,
                detail="OCR engine tạm thời không khả dụng. Vui lòng thử lại sau.",
            )
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        print(f"[AI SERVICE] OCR Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Lỗi xử lý OCR.")


# ---------------------------------------------------------------------------
# Internal helpers for query-history
# ---------------------------------------------------------------------------

def _apply_filters(
    transactions: list[dict[str, Any]],
    filters: dict[str, Any],
) -> list[dict[str, Any]]:
    """Filter transactions based on extracted date/category filters."""
    result = list(transactions)

    date_start = filters.get("date_start")
    date_end = filters.get("date_end")

    if date_start and date_end:
        filtered = []
        for txn in result:
            txn_date = str(txn.get("transactionDate", ""))[:10]
            if date_start <= txn_date <= date_end:
                filtered.append(txn)
        result = filtered

    category = filters.get("category")
    if category:
        result = [t for t in result if t.get("category", "").upper() == category.upper()]

    return result


def _build_summary(
    transactions: list[dict[str, Any]],
    filters: dict[str, Any],
) -> dict[str, Any]:
    """Build summary statistics from filtered transactions."""
    total_expense = 0.0
    total_income = 0.0
    category_totals: dict[str, float] = {}
    count = len(transactions)

    for txn in transactions:
        amount = float(txn.get("amount", 0))
        txn_type = str(txn.get("type", "")).upper()
        cat = txn.get("category", "OTHER")

        if txn_type == "EXPENSE":
            total_expense += amount
            category_totals[cat] = category_totals.get(cat, 0) + amount
        elif txn_type == "INCOME":
            total_income += amount

    # Top spending categories
    top_categories = sorted(
        category_totals.items(), key=lambda x: x[1], reverse=True
    )[:5]

    return {
        "total_expense": total_expense,
        "total_income": total_income,
        "transaction_count": count,
        "top_categories": [{"category": c, "amount": a} for c, a in top_categories],
        "time_period": filters.get("time_period", "unknown"),
    }


def _generate_query_answer(
    text: str,
    transactions: list[dict[str, Any]],
    summary: dict[str, Any],
    filters: dict[str, Any],
) -> str:
    """Generate a natural language answer using LLM or fallback."""
    from services.llm_service import _pick_api_key
    import httpx
    import json

    api_key = _pick_api_key()
    if not api_key:
        return _fallback_query_answer(summary, filters)

    system_prompt = (
        "Bạn là Atelier AI, trợ lý tài chính cá nhân thông minh. "
        "Người dùng đang hỏi về lịch sử chi tiêu của họ. "
        "Dựa trên dữ liệu được cung cấp, hãy trả lời ngắn gọn, "
        "chính xác bằng tiếng Việt. Sử dụng số liệu cụ thể. "
        "Nếu không có dữ liệu phù hợp, hãy nói rõ."
    )

    context = (
        f"Câu hỏi: {text}\n\n"
        f"Dữ liệu tóm tắt:\n{json.dumps(summary, ensure_ascii=False, indent=2)}\n\n"
        f"Bộ lọc đã áp dụng:\n{json.dumps(filters, ensure_ascii=False, indent=2)}\n\n"
        f"Số giao dịch khớp: {len(transactions)}\n"
    )

    # Include up to 10 sample transactions for context
    if transactions:
        samples = transactions[:10]
        context += f"\nMẫu giao dịch:\n{json.dumps(samples, ensure_ascii=False, indent=2)}"

    payload = {
        "model": "llama-3.3-70b-versatile",
        "temperature": 0.5,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": context},
        ],
    }

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

    try:
        with httpx.Client(timeout=20.0) as client:
            res = client.post(url, headers=headers, json=payload)
            res.raise_for_status()
            data = res.json()
            content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            return content.strip() if content else _fallback_query_answer(summary, filters)
    except Exception as e:
        print(f"[AI SERVICE] LLM query answer error: {e}")
        return _fallback_query_answer(summary, filters)


def _fallback_query_answer(summary: dict[str, Any], filters: dict[str, Any]) -> str:
    """Rule-based fallback when LLM is unavailable."""
    total_expense = summary.get("total_expense", 0)
    total_income = summary.get("total_income", 0)
    count = summary.get("transaction_count", 0)
    period = filters.get("time_period", "khoảng thời gian này")
    category = filters.get("category")

    if count == 0:
        return f"Không tìm thấy giao dịch nào trong {period}."

    cat_text = f" cho danh mục {category}" if category else ""
    return (
        f"Trong {period}{cat_text}, bạn có {count} giao dịch. "
        f"Tổng chi: {total_expense:,.0f} VNĐ. Tổng thu: {total_income:,.0f} VNĐ."
    )
