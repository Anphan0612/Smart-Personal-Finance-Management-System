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
    $files = @("-f", "docker-compose.yml")
    if (-not $NoOverride -and (Test-Path "docker-compose.override.yml")) {
        $files += @("-f", "docker-compose.override.yml")
    }
    return $files
}

function Get-EnvFilePath {
    param([string]$TargetEnv)

    $envFile = Join-Path "infrastructure/envs" ".env.$TargetEnv"
    if (Test-Path $envFile) {
        return $envFile
    }

    # Backward compatibility for local setups that still keep env files at root.
    $legacyEnvFile = ".env.$TargetEnv"
    if (Test-Path $legacyEnvFile) {
        return $legacyEnvFile
    }

    throw "Environment file for '$TargetEnv' not found. Expected '$envFile' (or legacy '$legacyEnvFile')."
}

function Invoke-Compose {
    param([string[]]$ComposeArgs)

    $resolvedEnvFile = Get-EnvFilePath -TargetEnv $Env
    $baseArgs = @("compose") + (Get-ComposeFiles) + @("--env-file", $resolvedEnvFile)
    & docker @baseArgs @ComposeArgs
    if ($LASTEXITCODE -ne 0) {
        throw "docker compose command failed: docker $($baseArgs + $ComposeArgs -join ' ')"
    }
}

$null = Get-EnvFilePath -TargetEnv $Env

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

    if (& docker volume ls -q -f name=$dbVolume) {
        & docker volume rm $dbVolume 2>$null | Out-Null
        Write-Step "Removed volume $dbVolume"
    } else {
        Write-Step "Volume $dbVolume already removed"
    }

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
