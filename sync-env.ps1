param(
    [ValidateSet("develop", "staging")]
    [string]$Env = "develop",

    [switch]$Up,
    [switch]$Clean,
    [switch]$ResetDB,
    [switch]$MobileBuild,
    [switch]$NoOverride
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host "[SYNC-ENV] $Message" -ForegroundColor Cyan
}

function Get-ComposeFiles {
    if ($NoOverride) {
        return @("-f", "docker-compose.yml")
    }
    return @("-f", "docker-compose.yml", "-f", "docker-compose.override.yml")
}

function Invoke-Compose {
    param([string[]]$ComposeArgs)

    $baseArgs = @("compose") + (Get-ComposeFiles) + @("--env-file", ".env.$Env")
    & docker @baseArgs @ComposeArgs
    if ($LASTEXITCODE -ne 0) {
        throw "docker compose command failed: docker $($baseArgs + $ComposeArgs -join ' ')"
    }
}

if (-not (Test-Path ".env.$Env")) {
    throw "Environment file .env.$Env does not exist."
}

if (-not ($Up -or $Clean -or $ResetDB -or $MobileBuild)) {
    Write-Step "No action provided. Defaulting to -Up"
    $Up = $true
}

if ($Clean) {
    Write-Step "Stopping containers and removing anonymous resources"
    Invoke-Compose -ComposeArgs @("down", "-v", "--remove-orphans")

    Write-Step "Cleaning mobile cache folders"
    $mobilePaths = @(
        "mobile/.expo",
        "mobile/.expo-shared",
        "mobile/android/build",
        "mobile/android/.gradle"
    )

    foreach ($path in $mobilePaths) {
        if (Test-Path $path) {
            Remove-Item -Recurse -Force $path
            Write-Step "Removed $path"
        }
    }
}

if ($ResetDB) {
    Write-Step "Resetting DB volume for reseed"
    Invoke-Compose -ComposeArgs @("down", "-v", "--remove-orphans")

    $projectName = "smart-finance"
    $dbVolume = "${projectName}_db_data"

    & docker volume rm $dbVolume 2>$null | Out-Null
    Write-Step "Removed volume $dbVolume (if existed)"

    Write-Step "Bringing DB back up to trigger /docker-entrypoint-initdb.d seed scripts"
    Invoke-Compose -ComposeArgs @("up", "-d", "db")
}

if ($Up) {
    Write-Step "Starting full stack for environment '$Env'"
    Invoke-Compose -ComposeArgs @("up", "-d", "--build")
}

if ($MobileBuild) {
    Write-Step "Ensuring mobile-builder service is running"
    Invoke-Compose -ComposeArgs @("up", "-d", "mobile-builder")

    Write-Step "Running local APK build inside mobile-builder"
    Invoke-Compose -ComposeArgs @("exec", "mobile-builder", "bash", "-lc", "build-apk.sh")

    Write-Step "APK output expected at mobile/artifacts/app-release.apk"
}

Write-Step "Done"
