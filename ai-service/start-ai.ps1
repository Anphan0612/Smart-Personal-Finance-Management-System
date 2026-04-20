# Smart Finance NLP Service Startup Script (Windows)

# 1. Activation Check
# Prefer specialized OCR venv if available
$OCR_VENV = "$PSScriptRoot\.venv-ocr"
$ROOT_VENV = "$PSScriptRoot\..\.venv"

if (Test-Path "$OCR_VENV\Scripts\activate.ps1") {
    $VENV_PATH = $OCR_VENV
    Write-Host "[INFO] Detected specialized OCR environment (.venv-ocr)" -ForegroundColor Magenta
} elseif (Test-Path "$ROOT_VENV\Scripts\activate.ps1") {
    $VENV_PATH = $ROOT_VENV
    Write-Host "[INFO] Using root virtual environment" -ForegroundColor Cyan
} else {
    Write-Host "[ERROR] No virtual environment found!" -ForegroundColor Red
    Exit 1
}

# 2. Activate Environment
Write-Host "[INFO] Activating environment at $VENV_PATH..." -ForegroundColor Cyan
& "$VENV_PATH\Scripts\Activate.ps1"

# 2.1 Set AI Local Cache Path
$env:HF_HOME = "$PSScriptRoot\models\cache"
if (-Not (Test-Path $env:HF_HOME)) { New-Item -ItemType Directory -Path $env:HF_HOME -Force | Out-Null }
Write-Host "[INFO] AI Cache set to: $env:HF_HOME" -ForegroundColor DarkGray

# 3. Check Dependencies
Write-Host "[INFO] Verifying uvicorn installation..." -ForegroundColor Cyan
try {
    $UVICORN_CHECK = Get-Command uvicorn -ErrorAction Stop
} catch {
    Write-Host "[WARNING] uvicorn not found in venv. Installing requirements..." -ForegroundColor Yellow
    pip install -r "$PSScriptRoot\requirements.txt"
}

# 4. Global Stability Flags (Fixes Paddle/Torch DLL conflicts & OneDNN crashes)
$env:FLAGS_use_onednn = "0"
$env:FLAGS_use_mkldnn = "0"
$env:KMP_DUPLICATE_LIB_OK = "TRUE"
$env:OMP_NUM_THREADS = "1"
$env:PYTHONUTF8 = 1

# 5. Start Service
Write-Host "[SUCCESS] Starting Smart Finance NLP Service on http://localhost:8000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop."
Set-Location "$PSScriptRoot"
uvicorn main:app --reload --port 8000 --host 0.0.0.0
