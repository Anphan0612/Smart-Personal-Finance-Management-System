"""
FastAPI entry point for the NLP Transaction Parser microservice.
Endpoint: POST /api/ai/extract-transaction
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from models.schemas import EntityResponse, ErrorResponse, TransactionRequest
from services.ner_service import NERService

# ---------------------------------------------------------------------------
# Singleton NER service (loaded once at startup to avoid per-request latency)
# ---------------------------------------------------------------------------
_ner_service: NERService | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _ner_service
    _ner_service = NERService()
    yield


# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Smart Finance NLP Service",
    description="PhoBERT-powered Vietnamese transaction parser — Issue #20",
    version="1.0.0",
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
}

_ERROR_SUGGESTIONS = {
    "MISSING_AMOUNT": "Thêm số tiền vào câu, ví dụ: '30k', '150.000đ', '2 triệu'.",
    "EMPTY_TEXT": "Vui lòng nhập câu mô tả giao dịch, ví dụ: 'ăn phở 50k'.",
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
    try:
        result = _ner_service.extract(request.text)
        return EntityResponse(**result)
    except ValueError as exc:
        error_code = str(exc)
        raise HTTPException(
            status_code=422,
            detail=ErrorResponse(
                error=error_code,
                message=_ERROR_MESSAGES.get(error_code, "Không thể phân tích câu nhập."),
                suggestion=_ERROR_SUGGESTIONS.get(error_code, "Hãy nhập lại câu rõ ràng hơn."),
            ).model_dump(),
        )
