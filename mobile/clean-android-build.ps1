param(
    [string]$BuildRoot = "C:\.builds\atelier-finance",
    [switch]$SkipGradleClean
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$androidDir = Join-Path $scriptDir "android"

if (-not (Test-Path $androidDir)) {
    throw "Android directory not found: $androidDir"
}

$pathsToDelete = @(
    (Join-Path $androidDir "app\.cxx"),
    (Join-Path $androidDir "build"),
    (Join-Path $androidDir ".gradle"),
    (Join-Path $BuildRoot "cxx")
)

Write-Host "Cleaning Android caches..." -ForegroundColor Cyan

foreach ($targetPath in $pathsToDelete) {
    if (Test-Path $targetPath) {
        Remove-Item -Recurse -Force $targetPath
        Write-Host "Removed: $targetPath" -ForegroundColor Green
    } else {
        Write-Host "Skip (not found): $targetPath" -ForegroundColor DarkGray
    }
}

if (-not (Test-Path $BuildRoot)) {
    New-Item -ItemType Directory -Path $BuildRoot -Force | Out-Null
}

Write-Host "Ensured build root exists: $BuildRoot" -ForegroundColor Green

if (-not $SkipGradleClean) {
    Push-Location $androidDir
    try {
        Write-Host "Running gradlew clean..." -ForegroundColor Cyan
        & .\gradlew clean
    } finally {
        Pop-Location
    }
}

Write-Host "Android cleanup completed." -ForegroundColor Cyan
