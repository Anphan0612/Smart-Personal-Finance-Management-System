#!/bin/bash
# Smart Finance NLP Service Startup Script (Linux/macOS)

set -e

# 1. Activation Check
# Prefer specialized OCR venv if available
OCR_VENV="$(dirname "$0")/.venv-ocr"
ROOT_VENV="$(dirname "$0")/../.venv"

if [ -f "$OCR_VENV/bin/activate" ]; then
    VENV_PATH="$OCR_VENV"
    echo "[INFO] Detected specialized OCR environment (.venv-ocr)"
elif [ -f "$ROOT_VENV/bin/activate" ]; then
    VENV_PATH="$ROOT_VENV"
    echo "[INFO] Using root virtual environment"
else
    echo "[ERROR] No virtual environment found!"
    exit 1
fi

# 2. Activate Environment
echo "[INFO] Activating environment at $VENV_PATH..."
source "$VENV_PATH/bin/activate"

# 2.1 Set AI Local Cache Path
export HF_HOME="$(dirname "$0")/models/cache"
mkdir -p "$HF_HOME"
echo "[INFO] AI Cache set to: $HF_HOME"

# 2.2 Auto-download ML Models if missing
ML_MODELS_DIR="$(dirname "$0")/ml-models"
SETUP_SCRIPT="$(dirname "$0")/scripts/setup_models.py"

if [ ! -d "$ML_MODELS_DIR" ] || [ -z "$(ls -A "$ML_MODELS_DIR" 2>/dev/null)" ]; then
    echo "[INFO] ML models not found. Running setup script..."
    if [ -f "$SETUP_SCRIPT" ]; then
        python "$SETUP_SCRIPT" || {
            echo "[WARNING] Model setup failed. Service will use fallback methods."
        }
    else
        echo "[WARNING] Setup script not found at $SETUP_SCRIPT"
        echo "[INFO] Service will use rule-based fallback methods."
    fi
else
    echo "[INFO] ML models directory exists, skipping download."
fi

# 3. Check Dependencies
echo "[INFO] Verifying uvicorn installation..."
if ! command -v uvicorn &> /dev/null; then
    echo "[WARNING] uvicorn not found in venv. Installing requirements..."
    pip install -r "$(dirname "$0")/requirements.txt"
fi

# 4. Global Stability Flags (Fixes Paddle/Torch DLL conflicts & OneDNN crashes)
export FLAGS_use_onednn=0
export FLAGS_use_mkldnn=0
export KMP_DUPLICATE_LIB_OK=TRUE
export OMP_NUM_THREADS=1
export PYTHONUTF8=1

# 5. Start Service
echo "[SUCCESS] Starting Smart Finance NLP Service on http://localhost:8000"
echo "Press Ctrl+C to stop."
cd "$(dirname "$0")"
uvicorn main:app --reload --port 8000 --host 0.0.0.0
