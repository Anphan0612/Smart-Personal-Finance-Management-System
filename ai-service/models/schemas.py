from pydantic import BaseModel, field_validator
from typing import Optional, Any
from datetime import date


class TransactionRequest(BaseModel):
    text: str

    @field_validator("text")
    @classmethod
    def text_must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Input text cannot be empty.")
        return v.strip()


class EntityResponse(BaseModel):
    amount: int
    type: str  # "EXPENSE" | "INCOME"
    category: str
    date: str  # ISO format: "YYYY-MM-DD"
    note: str
    confidence: float


class ErrorResponse(BaseModel):
    error: str       # Error code, e.g. "MISSING_AMOUNT"
    message: str     # Human-readable Vietnamese message
    suggestion: str  # How to fix it


# ---------------------------------------------------------------------------
# Query History schemas
# ---------------------------------------------------------------------------
class QueryHistoryRequest(BaseModel):
    """Request from Backend → AI Service for smart history query."""
    text: str
    transactions: list[dict[str, Any]] = []

    @field_validator("text")
    @classmethod
    def text_must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Input text cannot be empty.")
        return v.strip()


class QueryHistoryResponse(BaseModel):
    """AI-generated answer to a history query."""
    intent: str  # "QUERY" or "COMMAND"
    filters: dict[str, Any] = {}
    answer: str = ""
    summary: Optional[dict[str, Any]] = None
    matched_txn_ids: list[str] = []


# ---------------------------------------------------------------------------
# Anomaly Detection schemas
# ---------------------------------------------------------------------------
class AnomalyDetectRequest(BaseModel):
    """Request to check transactions for anomalies."""
    transactions: list[dict[str, Any]] = []
    z_threshold: float = 2.0


class AnomalyDetectResponse(BaseModel):
    """List of detected anomalies."""
    anomalies: list[dict[str, Any]] = []
    total_checked: int = 0


# ---------------------------------------------------------------------------
# OCR Receipt schemas
# ---------------------------------------------------------------------------
class OCRResponse(BaseModel):
    store_name: str
    transaction_date: Optional[str] = None
    amount: float
    confidence: float
    raw_text: str
    category_id: str = "OTHER_EXPENSE"
    is_corrected: bool = False
    correction_reason: Optional[str] = None
    processing_steps: list[dict[str, Any]] = []
