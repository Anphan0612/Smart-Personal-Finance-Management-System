# 🤖 Smart Finance NLP Service (AI Microservice)

This microservice provides Vietnamese Natural Language Parsing (NLP) for financial transactions. It uses a hybrid approach: **Transformer-based NER (PhoBERT)** + **Regex-based Money Parsing** + **Keyword-based Categorization**.

## 🚀 Getting Started

### 1. Environment Setup
We recommend using the project-wide virtual environment located in the root directory.

```bash
# From the root directory:
python -m venv .venv

# Activate (Windows):
.venv\Scripts\activate

# Activate (macOS/Linux):
source .venv/bin/activate

# Install dependencies:
pip install -r ai-service/requirements.txt
```

### 2. Running the Service
Use the provided PowerShell script for Windows or run uvicorn manually.

**Windows:**
```powershell
cd ai-service
.\start-ai.ps1
```

**Manual:**
```bash
uvicorn main:app --reload --port 8000
```

---

## 🛠️ Tech Stack
- **FastAPI**: High-performance web framework.
- **PhoBERT**: Transformer model fine-tuned for Vietnamese NER.
- **HuggingFace Transformers**: Pipeline for model inference.
- **Pydantic**: Data validation and settings management.
- **Groq LLM**: Optional fallback for low-confidence parses.

## 📡 API Endpoints

### `POST /api/ai/extract-transaction`
Parses a Vietnamese sentence into a structured transaction.

**Request:**
```json
{
  "text": "ăn phở 50k"
}
```

**Response:**
```json
{
  "amount": 50000,
  "type": "EXPENSE",
  "category": "FOOD",
  "date": "2026-04-03",
  "note": "ăn phở 50k",
  "confidence": 0.98
}
```

---

## 🔍 Architecture & Hybrid Pipeline
1. **Regex Parser**: High-precision extraction for numeric amounts (e.g., "50k", "1.2tr", "2 triệu").
2. **PhoBERT NER**: Identifies categories and entities defined in the `ml-models/` directory.
3. **Keyword Map**: Rule-based fallback for common financial terms (accent-insensitive handled by `utils/text_normalizer.py`).
4. **LLM Repair (Optional)**: If `ENABLE_LLM_REPAIR` is true and confidence is low, the service calls Groq to "repair" the data.

---
*Developed for the Smart Personal Finance Management System.*
