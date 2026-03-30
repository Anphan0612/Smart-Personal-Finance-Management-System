from pydantic import BaseModel, field_validator
from typing import Optional
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
