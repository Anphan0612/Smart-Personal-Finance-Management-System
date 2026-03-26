"""
Text normalizer for rule-based matching.

Goal:
  - Keep diacritics out of keyword matching to handle "không dấu" inputs.
  - Normalize casing and whitespace.
"""

from __future__ import annotations

import re
import unicodedata


_WHITESPACE_RE = re.compile(r"\s+")


def remove_diacritics(text: str) -> str:
    """
    Remove Vietnamese diacritics by stripping combining marks.

    Example:
      "điện" -> "dien"
    """

    normalized = unicodedata.normalize("NFD", text)
    without = "".join(ch for ch in normalized if unicodedata.category(ch) != "Mn")
    return without


def normalize_for_rules(text: str) -> str:
    """
    Normalize text for keyword matching:
      - strip leading/trailing spaces
      - lowercase
      - remove diacritics
      - collapse multiple spaces
    """

    if text is None:
        return ""

    text = text.strip().lower()
    text = remove_diacritics(text)
    text = _WHITESPACE_RE.sub(" ", text)
    return text

