"""
Query Intent Classifier & Text-to-Filter service.

Determines whether a user message is:
  - QUERY   → asking about past spending data
  - COMMAND → registering a new transaction (existing flow)

For QUERY intents, extracts structured filters:
  time_period, category, amount_range
"""

from __future__ import annotations

import re
from datetime import date, timedelta
from typing import Any, Optional

from utils.text_normalizer import normalize_for_rules


# ---------------------------------------------------------------------------
# Intent keywords (Vietnamese)
# ---------------------------------------------------------------------------
_QUERY_INDICATORS: list[str] = [
    "bao nhieu", "bao nhiêu",
    "tong", "tổng",
    "da chi", "đã chi", "da tieu", "đã tiêu",
    "thong ke", "thống kê",
    "liet ke", "liệt kê",
    "danh sach", "danh sách",
    "cho toi xem", "cho tôi xem",
    "hien thi", "hiển thị",
    "phan tich", "phân tích",
    "xu huong", "xu hướng",
    "so sanh", "so sánh",
    "chi nhieu nhat", "chi nhiều nhất",
    "tieu nhieu nhat", "tiêu nhiều nhất",
    "thu nhieu nhat", "thu nhiều nhất",
    "trung binh", "trung bình",
    "hang thang", "hàng tháng",
    "hang tuan", "hàng tuần",
    "co bao nhieu", "có bao nhiêu",
    "xem lai", "xem lại",
    "lich su", "lịch sử",
    "giao dich nao", "giao dịch nào",
    "tieu gi", "tiêu gì",
    "chi gi", "chi gì",
    "chi cho", "tiêu cho",
    "mua gi", "mua gì",
    "nhieu hon", "nhiều hơn",
    "it hon", "ít hơn",
    "kiem tra", "kiểm tra", "check",
    "xem", "cho xem",
    "giup", "giúp",
    "bot", "ai", "atelier",
]

# ---------------------------------------------------------------------------
# Time period patterns (Vietnamese)
# ---------------------------------------------------------------------------
_TIME_PATTERNS: dict[str, list[str]] = {
    "today": ["hom nay", "hôm nay", "ngay hom nay", "ngày hôm nay"],
    "yesterday": ["hom qua", "hôm qua"],
    "this_week": ["tuan nay", "tuần này", "tuan nay", "7 ngay qua", "7 ngày qua"],
    "last_week": ["tuan truoc", "tuần trước", "tuan rui", "tuần rồi"],
    "this_month": ["thang nay", "tháng này"],
    "last_month": ["thang truoc", "tháng trước", "thang rui", "tháng rồi"],
    "last_3_months": ["3 thang", "ba thang", "3 tháng", "ba tháng", "quy nay", "quý này"],
}

# Explicit month references: "tháng 1", "tháng 12", "thang 3"
_MONTH_REGEX = re.compile(r"(?:thang|tháng)\s*(\d{1,2})")

# ---------------------------------------------------------------------------
# Category mapping (reuse from ner_service but simplified for query)
# ---------------------------------------------------------------------------
_QUERY_CATEGORY_MAP: dict[str, list[str]] = {
    "FOOD": ["an", "ăn", "an sang", "ăn sáng", "an trua", "ăn trưa", "an toi", "ăn tối",
             "com", "cơm", "cafe", "ca phe", "cà phê", "do an", "đồ ăn", "tra sua", "trà sữa",
             "pho", "phở", "bun", "bún", "banh", "bánh", "lau", "lẩu", "bia", "nuoc uong", "nước uống"],
    "TRANSPORT": ["grab", "taxi", "xe", "xang", "xăng", "di chuyen", "di chuyển", "giao thong", "giao thông"],
    "UTILITIES": ["dien", "điện", "nuoc", "nước", "wifi", "internet", "dien thoai", "điện thoại"],
    "EDUCATION": ["hoc", "học", "sach", "sách", "khoa hoc", "khóa học"],
    "SHOPPING": ["mua", "shopping", "mua sam", "mua sắm", "ao quan", "áo quần"],
    "HEALTH": ["thuoc", "thuốc", "kham", "khám", "gym", "suc khoe", "sức khỏe"],
    "HOUSING": ["nha", "nhà", "phong", "phòng", "tro", "trọ", "thue", "thuê"],
    "ENTERTAINMENT": ["phim", "game", "giai tri", "giải trí", "karaoke"],
    "SALARY": ["luong", "lương", "thu nhap", "thu nhập"],
    "GIFT": ["qua", "quà", "tang", "tặng"],
    "SAVING": ["tiet kiem", "tiết kiệm"],
}


def classify_intent(text: str) -> str:
    """
    Classify user message as 'QUERY' or 'COMMAND'.
    Returns 'QUERY' if the text looks like a question about history,
    'COMMAND' if it looks like a new transaction entry.
    """
    norm = normalize_for_rules(text).lower()

    query_score = 0
    for indicator in _QUERY_INDICATORS:
        indicator_norm = normalize_for_rules(indicator).lower()
        if indicator_norm in norm:
            query_score += 1

    # Question mark is a strong signal
    if "?" in text:
        query_score += 2

    return "QUERY" if query_score >= 1 else "COMMAND"


def extract_filters(text: str) -> dict[str, Any]:
    """
    Extract structured filters from a query text.
    Returns: { time_period, category, date_start, date_end }
    """
    norm = normalize_for_rules(text).lower()
    filters: dict[str, Any] = {}

    # --- Time period ---
    time_period = _extract_time_period(norm)
    if time_period:
        filters["time_period"] = time_period["label"]
        filters["date_start"] = time_period["start"]
        filters["date_end"] = time_period["end"]
    else:
        # Default: last 30 days
        today = date.today()
        filters["time_period"] = "last_30_days"
        filters["date_start"] = (today - timedelta(days=30)).isoformat()
        filters["date_end"] = today.isoformat()

    # --- Category ---
    category = _extract_category(norm)
    if category:
        filters["category"] = category

    return filters


def _extract_time_period(norm_text: str) -> Optional[dict[str, str]]:
    """Match time period from normalized Vietnamese text."""
    today = date.today()

    # Check explicit month reference first: "tháng 3", "thang 12"
    month_match = _MONTH_REGEX.search(norm_text)
    if month_match:
        month_num = int(month_match.group(1))
        if 1 <= month_num <= 12:
            year = today.year
            # If the referenced month is in the future, assume last year
            if month_num > today.month:
                year -= 1
            start = date(year, month_num, 1)
            if month_num == 12:
                end = date(year + 1, 1, 1) - timedelta(days=1)
            else:
                end = date(year, month_num + 1, 1) - timedelta(days=1)
            return {
                "label": f"month_{month_num}",
                "start": start.isoformat(),
                "end": end.isoformat(),
            }

    # Check predefined patterns
    for label, keywords in _TIME_PATTERNS.items():
        for kw in keywords:
            kw_norm = normalize_for_rules(kw).lower()
            if re.search(r'\b' + re.escape(kw_norm) + r'\b', norm_text):
                return _resolve_time_range(label, today)

    return None


def _resolve_time_range(label: str, today: date) -> dict[str, str]:
    """Convert a time label to start/end dates."""
    ranges = {
        "today": (today, today),
        "yesterday": (today - timedelta(days=1), today - timedelta(days=1)),
        "this_week": (today - timedelta(days=today.weekday()), today),
        "last_week": (
            today - timedelta(days=today.weekday() + 7),
            today - timedelta(days=today.weekday() + 1),
        ),
        "this_month": (today.replace(day=1), today),
        "last_month": (
            (today.replace(day=1) - timedelta(days=1)).replace(day=1),
            today.replace(day=1) - timedelta(days=1),
        ),
        "last_3_months": (today - timedelta(days=90), today),
    }
    start, end = ranges.get(label, (today - timedelta(days=30), today))
    return {"label": label, "start": start.isoformat(), "end": end.isoformat()}


def _extract_category(norm_text: str) -> Optional[str]:
    """Match a spending category from the query text."""
    best_category: Optional[str] = None
    best_len = -1

    for category, keywords in _QUERY_CATEGORY_MAP.items():
        for kw in keywords:
            kw_norm = normalize_for_rules(kw).lower()
            # Use word boundaries to prevent substring bugs (e.g. "nha" matching inside "nhat")
            if re.search(r'\b' + re.escape(kw_norm) + r'\b', norm_text):
                if len(kw_norm) > best_len:
                    best_len = len(kw_norm)
                    best_category = category

    return best_category
