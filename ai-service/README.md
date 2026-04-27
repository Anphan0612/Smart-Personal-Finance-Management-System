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

### 2. ML Model Setup

The AI Service uses machine learning models that are **not included in the repository** due to their size. Models are automatically downloaded from Hugging Face on first run.

**Option A: Automatic Download (Recommended)**
```bash
cd ai-service

# Windows:
.\start-ai.ps1

# Linux/macOS:
./start-ai.sh
```

The bootstrap scripts will automatically detect missing models and download them before starting the service.

**Option B: Manual Download**
```bash
cd ai-service
python scripts/setup_models.py

# Download specific model only:
python scripts/setup_models.py --model vit5-correction

# Force re-download:
python scripts/setup_models.py --force
```

**Option C: Docker (Production)**
```bash
cd ai-service
docker build -t ai-service .
docker run -p 8000:8000 ai-service
```

Docker images include pre-downloaded models and can run in air-gapped environments.

### 3. Verify Setup
```bash
cd ai-service
python scripts/verify_setup.py
```

This will check that all configuration files, scripts, and services are properly configured.

### 4. Running the Service

**Windows:**
```powershell
cd ai-service
.\start-ai.ps1
```

**Linux/macOS:**
```bash
cd ai-service
./start-ai.sh
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

### Model Storage Strategy

This project uses a **hybrid approach** for ML model management:

- **Development**: Models auto-download from Hugging Face on first run
- **Production**: Docker images contain pre-downloaded models (air-gapped ready)
- **Fallback**: Services gracefully degrade to rule-based methods if models unavailable

**Model Locations:**
- `ml-models/phobert-finance-ner-final/` - Fine-tuned PhoBERT (project-specific, requires training)
- `models/cache/` - Hugging Face cache (ViT5, PaddleOCR)

**Note**: Model directories are excluded from git via `.gitignore` to keep the repository lightweight.

### NER Pipeline (Transaction Extraction)

1. **Regex Parser**: High-precision extraction for numeric amounts (e.g., "50k", "1.2tr", "2 triệu").
2. **PhoBERT NER**: Identifies categories and entities using fine-tuned transformer model.
3. **Keyword Map**: Rule-based fallback for common financial terms (accent-insensitive handled by `utils/text_normalizer.py`).
4. **LLM Repair (Optional)**: If `ENABLE_LLM_REPAIR` is true and confidence is low, the service calls Groq to "repair" the data.

### OCR Pipeline (Receipt Extraction)

1. **Image Pre-processing**: Upscale → Grayscale → Denoise → CLAHE → Adaptive Threshold
2. **PaddleOCR**: Vietnamese text extraction with GPU acceleration
3. **ViT5 Correction**: AI-powered OCR error correction (selective, protects numbers)
4. **Rule-based Parsing**: Extract store name, amount, date with Amount Trap protection
5. **LLM Healing (Optional)**: Groq-based validation for low-confidence results

---
*Developed for the Smart Personal Finance Management System.*
