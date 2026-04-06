# Smart Finance NLP Service Startup Script (Windows)

# 1. Activation Check
$VENV_PATH = "$PSScriptRoot\..\.venv"
if (-Not (Test-Path "$VENV_PATH\Scripts\activate.ps1")) {
    Write-Host "[ERROR] Virtual environment not found at $VENV_PATH" -ForegroundColor Red
    Write-Host "Please ensure you have run 'python -m venv .venv' in the root directory."
    Exit 1
}

# 2. Activate Environment
Write-Host "[INFO] Activating virtual environment..." -ForegroundColor Cyan
& "$VENV_PATH\Scripts\Activate.ps1"

# 3. Check Dependencies
Write-Host "[INFO] Verifying uvicorn installation..." -ForegroundColor Cyan
try {
    $UVICORN_CHECK = Get-Command uvicorn -ErrorAction Stop
} catch {
    Write-Host "[WARNING] uvicorn not found in venv. Installing requirements..." -ForegroundColor Yellow
    pip install -r "$PSScriptRoot\requirements.txt"
}

# 4. Start Service
Write-Host "[SUCCESS] Starting Smart Finance NLP Service on http://localhost:8000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop."
uvicorn main:app --reload --port 8000 --host 0.0.0.0
