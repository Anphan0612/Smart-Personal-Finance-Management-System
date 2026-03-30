"""
Vietnamese money parser - normalizes diverse currency formats into integer VNĐ.

Supported formats (from nlp-benchmark-dataset-v1.csv analysis):
  30k, 30K, 30.000, 30,000, 30.000đ, 30000đ, 30000 dong
  3tr, 3tr2, 3 triệu, 3 trieu, 3 trieu ruoi
  3 cu, 3 canh (slang)
  1tr5 (1.5 million), 1tr9 (1.9 million)

Additional slang supported in this repo (Issue #20):
  - 5 chục -> 50_000
  - 5 xị -> 500_000
  - 1 chai / 2 lít -> 1_000_000 / 2_000_000
  - 1 loét -> 100_000
  - nửa <unit> -> 0.5 * unit (ex: "nửa củ" -> 500_000)
  - <num> <unit> rưỡi -> 1.5 * unit (ex: "1 củ rưỡi" -> 1_500_000)

Numbers in words (limited): ba tram nghin → still not supported in MVP
"""

import re
from typing import Optional


# Multipliers for Vietnamese currency shorthand
_MULTIPLIERS = {
    "k": 1_000,
    "nghin": 1_000,
    "nghìn": 1_000,
    "ngàn": 1_000,
    "ngan": 1_000,
    "tr": 1_000_000,
    "trieu": 1_000_000,
    "triệu": 1_000_000,
    "cu": 1_000_000,
    "củ": 1_000_000,
    "canh": 1_000_000,
    "cành": 1_000_000,
    "ty": 1_000_000_000,
    "tỷ": 1_000_000_000,

    # Common slang
    "chuc": 10_000,
    "chục": 10_000,
    "xi": 100_000,
    "xị": 100_000,
    "xì": 100_000,
    "chai": 1_000_000,
    "lit": 1_000_000,
    "lít": 1_000_000,
    "loet": 100_000,
    "loét": 100_000,
}

# Build unit alternation safely (sort by length to avoid partial matches like "tr" in "triệu")
_MULTIPLIER_UNITS_PATTERN = "|".join(
    re.escape(u) for u in sorted(_MULTIPLIERS.keys(), key=len, reverse=True)
)

# <nửa> <unit>  -> 0.5 * unit
_PATTERN_NUA = re.compile(
    rf"(nửa|nua)\s*({_MULTIPLIER_UNITS_PATTERN})",
    re.IGNORECASE,
)

# <num> <unit> <rưỡi> -> 1.5 * num * unit
_PATTERN_RUOI = re.compile(
    rf"(\d[\d.,]*)\s*({_MULTIPLIER_UNITS_PATTERN})\s*(rưỡi|ruoi)",
    re.IGNORECASE,
)

# Pattern: number (with optional decimal part) followed by a multiplier
# e.g. "3tr2" means 3.2 triệu = 3,200,000
_PATTERN_WITH_MULTIPLIER = re.compile(
    r"(\d[\d.,]*)"                          # base number (e.g. "3", "1.5", "30,000")
    r"\s*"
    rf"({_MULTIPLIER_UNITS_PATTERN})"         # multiplier
    r"(\d+)?",                              # optional decimal suffix (e.g. "tr2" → .2M)
    re.IGNORECASE,
)

# Plain number without multiplier (with optional đ/dong/vnd suffix)
_PATTERN_PLAIN = re.compile(
    r"(\d[\d.,]{2,})"                       # at least 4 digits to avoid matching "25" alone
    r"\s*(?:đ|dong|vnd|vnđ)?",
    re.IGNORECASE,
)


def _clean_number(raw: str) -> float:
    """
    Convert a number string that may contain '.' and/or ',' into float.

    Heuristic:
      - If both '.' and ',' exist -> treat both as thousand separators
      - If only one separator exists:
          - if fractional part length is 1-2 -> treat it as decimal point
          - else -> treat it as thousand separator
    """
    s = raw.strip()
    if not s:
        return 0.0

    has_dot = "." in s
    has_comma = "," in s

    if has_dot and has_comma:
        # Thousands separators
        return float(s.replace(",", "").replace(".", ""))

    if has_dot:
        integer_part, fractional_part = s.split(".", 1)
        if fractional_part and len(fractional_part) in (1, 2):
            return float(s.replace(",", ""))  # keep '.'
        # Thousand separators like 200.000
        return float(s.replace(".", "").replace(",", ""))

    if has_comma:
        integer_part, fractional_part = s.split(",", 1)
        if fractional_part and len(fractional_part) in (1, 2):
            # Convert decimal comma to decimal dot
            return float(s.replace(".", "").replace(",", "."))
        # Thousand separators like 30,000
        return float(s.replace(",", "").replace(".", ""))

    return float(s)


def parse_amount(text: str) -> Optional[int]:
    """
    Extract and return the first monetary amount found in `text` as integer VNĐ.
    Returns None if no amount is detected.
    """
    text_lower = text.lower()

    # 1) "<num> <unit> rưỡi"
    match = _PATTERN_RUOI.search(text_lower)
    if match:
        base_str, unit, _ = match.group(1), match.group(2), match.group(3)
        base = _clean_number(base_str)
        multiplier = _MULTIPLIERS[unit.lower()]
        amount = base * multiplier * 1.5
        return int(round(amount))

    # 2) "nửa <unit>"
    match = _PATTERN_NUA.search(text_lower)
    if match:
        _, unit = match.group(1), match.group(2)
        multiplier = _MULTIPLIERS[unit.lower()]
        amount = multiplier * 0.5
        return int(round(amount))

    # 3) Try multiplier pattern first (higher priority)
    match = _PATTERN_WITH_MULTIPLIER.search(text_lower)
    if match:
        base_str, unit, decimal_suffix = match.group(1), match.group(2), match.group(3)
        base = _clean_number(base_str)
        multiplier = _MULTIPLIERS[unit.lower()]
        amount = base * multiplier

        # Handle decimal suffix: "1tr9" → 1.9 million
        if decimal_suffix:
            decimal_part = int(decimal_suffix) * (multiplier // 10)
            amount += decimal_part

        return int(round(amount))

    # 4) Fallback: plain number with ≥ 4 digits (e.g. "650000", "3500000")
    match = _PATTERN_PLAIN.search(text_lower)
    if match:
        try:
            return int(_clean_number(match.group(1)))
        except ValueError:
            return None

    return None
