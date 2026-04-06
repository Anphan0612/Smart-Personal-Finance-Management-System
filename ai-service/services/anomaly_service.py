"""
Anomaly Detection Engine for transaction spending patterns.

Uses a statistical Z-Score approach to identify transactions that deviate
significantly from the user's historical spending pattern within a category.
Lightweight — no heavy ML library dependency, runs on plain Python/numpy-free.
"""

from __future__ import annotations

import math
from typing import Any, Optional


def detect_anomalies(
    transactions: list[dict[str, Any]],
    z_threshold: float = 2.0,
) -> list[dict[str, Any]]:
    """
    Detect anomalous transactions based on Z-Score within each category.

    Args:
        transactions: List of transaction dicts with keys:
            id, amount, type, category, transactionDate, description
        z_threshold: Z-Score threshold above which a transaction is flagged.
            Default 2.0 means ~2.3% of transactions would be flagged
            if normally distributed.

    Returns:
        List of anomaly dicts with: transaction_id, amount, category,
        z_score, mean, std_dev, severity, message
    """
    if not transactions:
        return []

    # Group EXPENSE transactions by category
    category_groups: dict[str, list[dict[str, Any]]] = {}
    for txn in transactions:
        if txn.get("type", "").upper() != "EXPENSE":
            continue
        cat = txn.get("category", "OTHER_EXPENSE")
        category_groups.setdefault(cat, []).append(txn)

    anomalies: list[dict[str, Any]] = []

    for category, txns in category_groups.items():
        amounts = [float(t.get("amount", 0)) for t in txns]
        if len(amounts) < 3:
            # Not enough data to compute meaningful statistics
            continue

        mean = sum(amounts) / len(amounts)
        variance = sum((x - mean) ** 2 for x in amounts) / len(amounts)
        std_dev = math.sqrt(variance) if variance > 0 else 0

        if std_dev == 0:
            # All amounts are identical — no anomaly possible
            continue

        for txn, amount in zip(txns, amounts):
            z_score = (amount - mean) / std_dev
            if z_score > z_threshold:
                severity = _classify_severity(z_score)
                anomalies.append({
                    "transaction_id": txn.get("id", ""),
                    "amount": amount,
                    "category": category,
                    "z_score": round(z_score, 2),
                    "mean": round(mean, 0),
                    "std_dev": round(std_dev, 0),
                    "severity": severity,
                    "description": txn.get("description", ""),
                    "transaction_date": txn.get("transactionDate", ""),
                    "message": _build_anomaly_message(
                        amount=amount,
                        category=category,
                        mean=mean,
                        z_score=z_score,
                        severity=severity,
                    ),
                })

    # Sort by z_score descending (most anomalous first)
    anomalies.sort(key=lambda a: a["z_score"], reverse=True)
    return anomalies


def _classify_severity(z_score: float) -> str:
    """Classify anomaly severity based on Z-Score magnitude."""
    if z_score >= 4.0:
        return "CRITICAL"
    elif z_score >= 3.0:
        return "HIGH"
    elif z_score >= 2.0:
        return "MEDIUM"
    return "LOW"


# Vietnamese category display names
_CATEGORY_DISPLAY: dict[str, str] = {
    "FOOD": "Ăn uống",
    "TRANSPORT": "Di chuyển",
    "UTILITIES": "Tiện ích",
    "EDUCATION": "Giáo dục",
    "SHOPPING": "Mua sắm",
    "HEALTH": "Sức khỏe",
    "HOUSING": "Nhà ở",
    "ENTERTAINMENT": "Giải trí",
    "SALARY": "Lương",
    "GIFT": "Quà tặng",
    "SAVING": "Tiết kiệm",
    "HOUSEHOLD": "Gia dụng",
    "OTHER_INCOME": "Thu nhập khác",
    "OTHER_EXPENSE": "Chi phí khác",
}


def _build_anomaly_message(
    *,
    amount: float,
    category: str,
    mean: float,
    z_score: float,
    severity: str,
) -> str:
    """Build a Vietnamese warning message for an anomaly."""
    cat_name = _CATEGORY_DISPLAY.get(category, category)
    ratio = amount / mean if mean > 0 else 0

    if severity == "CRITICAL":
        prefix = "🚨 Cảnh báo nghiêm trọng"
    elif severity == "HIGH":
        prefix = "⚠️ Cảnh báo cao"
    else:
        prefix = "📊 Lưu ý"

    return (
        f"{prefix}: Khoản chi {amount:,.0f} VNĐ cho {cat_name} "
        f"cao gấp {ratio:.1f}x so với mức trung bình ({mean:,.0f} VNĐ). "
        f"Đây là mức chi tiêu bất thường trong danh mục này."
    )
