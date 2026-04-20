"""
Groq LLM helper for gated "repair" of low-confidence parses.

Used by `api/services/ner_service.py` when rule/model confidence is low.
If Groq is not configured via env vars, the service safely returns `None`.
"""

from __future__ import annotations

import json
import os
import re
from typing import Any, Optional

import httpx


_ALLOWED_CATEGORIES: set[str] = {
    "FOOD",
    "TRANSPORT",
    "UTILITIES",
    "EDUCATION",
    "SHOPPING",
    "HEALTH",
    "HOUSING",
    "ENTERTAINMENT",
    "SALARY",
    "GIFT",
    "SAVING",
    "HOUSEHOLD",
    "OTHER_INCOME",
    "OTHER_EXPENSE",
}


def _pick_api_key() -> str:
    for name in ("GROQ_API_KEY", "LLM_API_KEY", "OPENAI_API_KEY"):
        key = os.getenv(name, "").strip()
        if key:
            return key
    return ""


def is_llm_configured() -> bool:
    return bool(_pick_api_key())


def _extract_json_object(text: str) -> Optional[dict[str, Any]]:
    """
    Best-effort extraction of a single JSON object from an LLM response.
    """
    try:
        parsed = json.loads(text)
        if isinstance(parsed, dict):
            return parsed
    except json.JSONDecodeError:
        pass

    # Handle common cases: ```json { ... } ```
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        return None

    try:
        parsed = json.loads(match.group(0))
        if isinstance(parsed, dict):
            return parsed
    except json.JSONDecodeError:
        return None

    return None


def repair_transaction_with_llm_sync(
    *,
    text: str,
    current_amount: Optional[int],
    current_type: str,
    current_category: str,
    low_confidence_reasons: list[str],
    timeout_sec: float,
    model: str,
) -> Optional[dict[str, Any]]:
    """
    Ask Groq LLM to repair low-confidence fields.

    Guardrails:
    - Keep `amount` unchanged unless `current_amount` is missing (`None`).
    - `type` must be INCOME or EXPENSE.
    - `category` must be one of allowed enums.
    """
    api_key = _pick_api_key()
    if not api_key:
        return None

    can_change_amount = current_amount is None or current_amount <= 0

    system = (
        "You are a Vietnamese personal finance transaction parser. "
        "Return ONLY a strict JSON object with keys: "
        "`amount` (integer VNĐ or null), `type` (INCOME or EXPENSE), "
        "`category` (one of allowed enums), `confidence` (0..1). "
        "If you are unsure, prefer keeping the current values. "
        f"Allowed categories: {sorted(_ALLOWED_CATEGORIES)}. "
        "Only change `amount` if the provided current_amount is null."
    )

    user_obj = {
        "text": text,
        "current_amount": current_amount,
        "current_type": current_type,
        "current_category": current_category,
        "low_confidence_reasons": low_confidence_reasons,
        "can_change_amount": can_change_amount,
    }

    payload: dict[str, Any] = {
        "model": model,
        "temperature": 0.0,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": json.dumps(user_obj, ensure_ascii=False)},
        ],
    }

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

    def _attempt(*, with_response_format: bool) -> Optional[dict[str, Any]]:
        req_payload = dict(payload)
        if with_response_format:
            req_payload["response_format"] = {"type": "json_object"}

        try:
            with httpx.Client(timeout=timeout_sec) as client:
                res = client.post(url, headers=headers, json=req_payload)
                res.raise_for_status()
        except httpx.HTTPStatusError as exc:
            # Groq may reject OpenAI-style `response_format` parameter.
            if with_response_format and exc.response.status_code == 400:
                body = ""
                try:
                    body = exc.response.text
                except Exception:
                    body = ""

                lowered = body.lower()
                if "response_format" in lowered or "json_object" in lowered:
                    return None
            return None
        except httpx.HTTPError:
            return None

        data = res.json()
        content = (
            data.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
        )
        if not isinstance(content, str) or not content.strip():
            return None

        obj = _extract_json_object(content)
        if not obj:
            return None

        out: dict[str, Any] = {}

        if "amount" in obj and obj["amount"] is not None:
            try:
                amount = int(obj["amount"])
                if amount > 0 and can_change_amount:
                    out["amount"] = amount
            except (TypeError, ValueError):
                pass

        typ = obj.get("type")
        if isinstance(typ, str) and typ in {"INCOME", "EXPENSE"}:
            out["type"] = typ

        cat = obj.get("category")
        if isinstance(cat, str) and cat in _ALLOWED_CATEGORIES:
            out["category"] = cat

        conf = obj.get("confidence")
        if conf is not None:
            try:
                conf_f = float(conf)
                if 0.0 <= conf_f <= 1.0:
                    out["confidence"] = conf_f
            except (TypeError, ValueError):
                pass

        return out or None

    # 1) Try with `response_format` first (best-effort JSON-only).
    # 2) If Groq rejects it, retry once without it.
    with_format = _attempt(with_response_format=True)
    if with_format is not None:
        return with_format

    # Retry without response_format (still JSON-only instruction via prompt).
    return _attempt(with_response_format=False)

    # Unreachable: function always returns above.

