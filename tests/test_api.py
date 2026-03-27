"""
Tests for Issue #20 — NLP Parse Transaction MVP

Covers:
  - money_parser unit tests (isolated, no model needed)
  - FastAPI integration tests via TestClient (mock NERService)
"""

from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

# ---------------------------------------------------------------------------
# Unit Tests: money_parser (no AI model needed)
# ---------------------------------------------------------------------------
from api.utils.money_parser import parse_amount

# ---------------------------------------------------------------------------
# Unit Tests: rule-based helpers (no AI model needed)
# ---------------------------------------------------------------------------
from api.services.ner_service import _infer_type, _map_category


class TestMoneyParser:
    def test_k_suffix(self):
        assert parse_amount("cafe 30k") == 30_000

    def test_K_uppercase(self):
        assert parse_amount("Mua sach 180K") == 180_000

    def test_trieu_suffix(self):
        assert parse_amount("nhan luong 12 triệu") == 12_000_000

    def test_tr_short(self):
        assert parse_amount("freelance duoc 2tr") == 2_000_000

    def test_tr_decimal_suffix(self):
        # "1tr2" → 1.2M, "1tr9" → 1.9M
        assert parse_amount("Mua giay 1tr2") == 1_200_000
        assert parse_amount("Book ve may bay 1tr9") == 1_900_000

    def test_plain_large_number(self):
        assert parse_amount("Dong tien dien 650000") == 650_000

    def test_hoc_phi_large(self):
        assert parse_amount("Dong hoc phi ky nay 6800000") == 6_800_000

    def test_no_amount_returns_none(self):
        assert parse_amount("an pho voi ban") is None

    def test_cu_slang(self):
        assert parse_amount("3 củ") == 3_000_000

    def test_nghin_suffix(self):
        assert parse_amount("Uong ca phe 32 nghin") == 32_000

    def test_chuc_slash(self):
        assert parse_amount("an phở 5 chục") == 50_000

    def test_xi_slash(self):
        assert parse_amount("uống cafe 5 xị") == 500_000

    def test_chai_slash(self):
        assert parse_amount("nạp tiền 1 chai") == 1_000_000

    def test_lit_slash(self):
        assert parse_amount("nạp tiền 2 lít") == 2_000_000

    def test_loet_slash(self):
        assert parse_amount("nạp tiền 1 loét") == 100_000

    def test_nua_cu(self):
        assert parse_amount("nửa củ") == 500_000

    def test_cu_ruoi(self):
        assert parse_amount("1 củ rưỡi") == 1_500_000

    def test_no_diacritics_rul_slang(self):
        assert parse_amount("nua cu") == 500_000
        assert parse_amount("1 cu ruoi") == 1_500_000
        assert parse_amount("5 chuc") == 50_000
        assert parse_amount("5 xi") == 500_000


class TestRuleBasedCategoryAndType:
    def test_map_category_longest_match_sua_xe(self):
        # "sua xe" must not be misclassified as FOOD via substring "sua"
        assert _map_category("sửa xe 1tr") == "TRANSPORT"
        assert _map_category("sua xe 1tr") == "TRANSPORT"

    def test_infer_type_loan_expense(self):
        # Loan/borrow verbs imply expense (outgoing money)
        assert _infer_type("cho bạn mượn 50k", category="OTHER_EXPENSE") == "EXPENSE"
        assert _infer_type("cho mượn 50k", category="OTHER_EXPENSE") == "EXPENSE"


# ---------------------------------------------------------------------------
# Integration Tests: FastAPI endpoint (NERService is mocked)
# ---------------------------------------------------------------------------

@pytest.fixture(scope="module")
def client():
    """Create a TestClient with NERService mocked to avoid loading the model."""
    mock_ner = MagicMock()

    def _fake_extract(text: str):
        amount = parse_amount(text)
        if not amount:
            raise ValueError("MISSING_AMOUNT")
        return {
            "amount": amount,
            "type": "EXPENSE",
            "category": "FOOD",
            "date": "2026-03-25",
            "note": text[:50],
            "confidence": 0.92,
        }

    mock_ner.extract.side_effect = _fake_extract

    with patch("api.main._ner_service", mock_ner):
        from api.main import app
        with TestClient(app) as c:
            yield c


@pytest.fixture(scope="module")
def client_llm_repair_path():
    """
    Integration test that exercises the real NERService flow, but avoids
    loading the PhoBERT model by mocking the underlying transformers pipeline.

    Goal: verify gated LLM repair doesn't break the endpoint contract.
    """
    from api.services.ner_service import NERService

    # Ensure __init__ uses our mocked pipeline.
    NERService._pipeline = None

    mock_pipeline = MagicMock()
    mock_pipeline.return_value = []

    llm_fix = {
        "amount": 50_000,
        "category": "FOOD",
        "confidence": 0.9,
        "type": "EXPENSE",
    }

    # LLM must be considered "available" for gating; we patch the imported
    # symbol in ner_service to avoid relying on real GROQ env/network.
    with patch("api.services.ner_service.pipeline", return_value=mock_pipeline), patch(
        "api.services.ner_service.is_llm_configured", return_value=True
    ), patch("api.services.ner_service.repair_transaction_with_llm_sync", return_value=llm_fix):
        # Import inside the fixture so lifespan runs under mocks.
        from api.main import app

        with TestClient(app) as c:
            yield c


class TestExtractTransactionEndpoint:
    def test_health_check(self, client):
        res = client.get("/health")
        assert res.status_code == 200
        assert res.json() == {"status": "ok"}

    def test_happy_path_cafe(self, client):
        res = client.post(
            "/api/ai/extract-transaction",
            json={"text": "Sang nay uong cafe 35k"},
        )
        assert res.status_code == 200
        data = res.json()
        assert data["amount"] == 35_000
        assert "confidence" in data
        assert "category" in data
        assert "date" in data

    def test_happy_path_no_diacritic(self, client):
        """'an banh mi 25k' — no accent marks, must still parse."""
        res = client.post(
            "/api/ai/extract-transaction",
            json={"text": "an banh mi 25k"},
        )
        assert res.status_code == 200
        assert res.json()["amount"] == 25_000

    def test_happy_path_slang_chuc(self, client):
        res = client.post(
            "/api/ai/extract-transaction",
            json={"text": "an phở 5 chục"},
        )
        assert res.status_code == 200
        assert res.json()["amount"] == 50_000

    def test_happy_path_slang_xi(self, client):
        res = client.post(
            "/api/ai/extract-transaction",
            json={"text": "uống cafe 5 xị"},
        )
        assert res.status_code == 200
        assert res.json()["amount"] == 500_000

    def test_happy_path_slang_ruoi(self, client):
        res = client.post(
            "/api/ai/extract-transaction",
            json={"text": "uống cafe 1 củ rưỡi"},
        )
        assert res.status_code == 200
        assert res.json()["amount"] == 1_500_000

    def test_happy_path_large_amount(self, client):
        res = client.post(
            "/api/ai/extract-transaction",
            json={"text": "mua xe 500 triệu"},
        )
        assert res.status_code == 200
        assert res.json()["amount"] == 500_000_000

    def test_missing_amount_returns_422(self, client):
        res = client.post(
            "/api/ai/extract-transaction",
            json={"text": "ăn phở"},
        )
        assert res.status_code == 422
        detail = res.json()["detail"]
        assert detail["error"] == "MISSING_AMOUNT"
        assert "message" in detail
        assert "suggestion" in detail

    def test_empty_text_returns_422(self, client):
        res = client.post(
            "/api/ai/extract-transaction",
            json={"text": ""},
        )
        assert res.status_code == 422
        detail = res.json()["detail"]
        assert detail["error"] == "EMPTY_TEXT"
        assert "message" in detail
        assert "suggestion" in detail

    def test_whitespace_text_returns_422(self, client):
        res = client.post(
            "/api/ai/extract-transaction",
            json={"text": "   "},
        )
        assert res.status_code == 422
        detail = res.json()["detail"]
        assert detail["error"] == "EMPTY_TEXT"

    def test_response_has_all_six_fields(self, client):
        """Acceptance Criteria: response must have all 6 required fields."""
        res = client.post(
            "/api/ai/extract-transaction",
            json={"text": "Nap dien thoai 100k"},
        )
        assert res.status_code == 200
        data = res.json()
        for field in ("amount", "type", "category", "date", "note", "confidence"):
            assert field in data, f"Missing field: {field}"


class TestExtractTransactionLLMRepairContract:
    def test_llm_repair_keeps_contract(self, client_llm_repair_path):
        # "năm mươi nghìn" isn't supported by parse_amount() => amount missing
        # and must be repaired by the mocked LLM.
        res = client_llm_repair_path.post(
            "/api/ai/extract-transaction",
            json={"text": "ăn phở năm mươi nghìn"},
        )
        assert res.status_code == 200
        data = res.json()
        for field in ("amount", "type", "category", "date", "note", "confidence"):
            assert field in data, f"Missing field: {field}"
        assert data["amount"] == 50_000
        assert data["category"] == "FOOD"
        assert data["type"] == "EXPENSE"
        assert 0.0 <= data["confidence"] <= 1.0
        assert 0.0 <= data["confidence"] <= 1.0
