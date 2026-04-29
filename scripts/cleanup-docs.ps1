# Script dọn dẹp tài liệu thừa (Windows PowerShell)
# Ngày tạo: 2026-04-29
# Mục đích: Archive và xóa các file tài liệu lỗi thời

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  SCRIPT DỌN DẸP TÀI LIỆU" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Hàm hiển thị
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Kiểm tra git status
function Check-GitStatus {
    Write-Info "Kiểm tra git status..."
    $status = git status -s
    if ($status) {
        Write-Warn "Có thay đổi chưa commit. Đề xuất commit trước khi chạy script."
        $continue = Read-Host "Tiếp tục? (y/n)"
        if ($continue -ne "y" -and $continue -ne "Y") {
            Write-Error-Custom "Script bị hủy bởi người dùng."
            exit 1
        }
    }
}

# Tạo backup
function Create-Backup {
    Write-Info "Tạo backup..."
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $backupDir = "docs\backup-$timestamp"

    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    Copy-Item -Path "docs\*" -Destination $backupDir -Recurse -Force -ErrorAction SilentlyContinue

    Write-Info "Backup tạo tại: $backupDir"
}

# Tạo archive folders
function Create-ArchiveFolders {
    Write-Info "Tạo archive folders..."
    New-Item -ItemType Directory -Path "docs\archive\plans" -Force | Out-Null
    New-Item -ItemType Directory -Path "docs\archive\reports" -Force | Out-Null
    Write-Info "✓ Archive folders đã tạo"
}

# Di chuyển PLANS files
function Archive-Plans {
    Write-Info "Archive PLANS files..."
    $count = 0

    if (Test-Path "docs\PLANS") {
        $files = Get-ChildItem -Path "docs\PLANS\*.md" -File
        foreach ($file in $files) {
            Move-Item -Path $file.FullName -Destination "docs\archive\plans\" -Force
            $count++
        }

        # Xóa thư mục PLANS nếu rỗng
        $remaining = Get-ChildItem -Path "docs\PLANS" -File
        if ($remaining.Count -eq 0) {
            Remove-Item -Path "docs\PLANS" -Force
            Write-Info "✓ Đã xóa thư mục PLANS rỗng"
        }
    }

    Write-Info "✓ Đã archive $count PLANS files"
}

# Archive reports đã hoàn thành
function Archive-Reports {
    Write-Info "Archive reports đã hoàn thành..."
    $count = 0

    $reports = @(
        "docs\FINAL-REPORT-mobile-refactor.md",
        "docs\LINT_FIX_SUMMARY.md",
        "docs\ECC_INSTALLATION_REPORT.md",
        "docs\SESSION_SUMMARY_2026-04-29.md"
    )

    foreach ($file in $reports) {
        if (Test-Path $file) {
            Move-Item -Path $file -Destination "docs\archive\reports\" -Force
            $count++
            Write-Info "  → Archived: $(Split-Path $file -Leaf)"
        }
    }

    Write-Info "✓ Đã archive $count report files"
}

# Xóa file trùng lặp
function Remove-Duplicates {
    Write-Info "Xóa file trùng lặp..."
    $count = 0

    $duplicates = @(
        "docs\PROGRESS-mobile-refactor.md",
        "docs\SUMMARY-mobile-refactor.md"
    )

    foreach ($file in $duplicates) {
        if (Test-Path $file) {
            Remove-Item -Path $file -Force
            $count++
            Write-Info "  → Deleted: $(Split-Path $file -Leaf)"
        }
    }

    Write-Info "✓ Đã xóa $count duplicate files"
}

# Xóa file root tạm (tùy chọn)
function Remove-TempRootFiles {
    Write-Warn "Xóa file root tạm thời..."
    Write-Host "Các file sau sẽ bị xóa:"
    Write-Host "  - MERGE_READINESS_REPORT.md"
    Write-Host "  - PR_DESCRIPTION.md"
    Write-Host ""

    $confirm = Read-Host "Xác nhận xóa? (y/n)"

    if ($confirm -eq "y" -or $confirm -eq "Y") {
        $count = 0

        if (Test-Path "MERGE_READINESS_REPORT.md") {
            Remove-Item -Path "MERGE_READINESS_REPORT.md" -Force
            $count++
            Write-Info "  → Deleted: MERGE_READINESS_REPORT.md"
        }

        if (Test-Path "PR_DESCRIPTION.md") {
            Remove-Item -Path "PR_DESCRIPTION.md" -Force
            $count++
            Write-Info "  → Deleted: PR_DESCRIPTION.md"
        }

        Write-Info "✓ Đã xóa $count root temp files"
    } else {
        Write-Warn "Bỏ qua xóa root temp files"
    }
}

# Tạo summary
function Create-Summary {
    Write-Info "Tạo summary..."

    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "  KẾT QUẢ DỌN DẸP" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""

    Write-Host "📁 Cấu trúc docs/ sau dọn dẹp:"
    Get-ChildItem -Path "docs" -Recurse -File -Filter "*.md" | Select-Object -First 20 | ForEach-Object {
        Write-Host "  $($_.FullName.Replace((Get-Location).Path + '\', ''))"
    }

    Write-Host ""
    Write-Host "📊 Thống kê:"
    $docsCount = (Get-ChildItem -Path "docs" -File -Filter "*.md" | Measure-Object).Count
    $archiveCount = (Get-ChildItem -Path "docs\archive" -Recurse -File -Filter "*.md" -ErrorAction SilentlyContinue | Measure-Object).Count
    $reportsCount = (Get-ChildItem -Path "docs\REPORTS" -File -Filter "*.md" -ErrorAction SilentlyContinue | Measure-Object).Count

    Write-Host "  - Files trong docs/: $docsCount"
    Write-Host "  - Files trong docs/archive/: $archiveCount"
    Write-Host "  - Files trong docs/REPORTS/: $reportsCount"

    Write-Host ""
    Write-Info "✓ Dọn dẹp hoàn tất!"
}

# Main execution
function Main {
    Write-Host ""
    Write-Info "Bắt đầu dọn dẹp tài liệu..."
    Write-Host ""

    # Bước 1: Kiểm tra git
    Check-GitStatus

    # Bước 2: Tạo backup
    Create-Backup

    # Bước 3: Tạo archive folders
    Create-ArchiveFolders

    # Bước 4: Archive PLANS
    Archive-Plans

    # Bước 5: Archive reports
    Archive-Reports

    # Bước 6: Xóa duplicates
    Remove-Duplicates

    # Bước 7: Xóa temp root files (tùy chọn)
    Remove-TempRootFiles

    # Bước 8: Tạo summary
    Create-Summary

    Write-Host ""
    Write-Warn "Đừng quên commit thay đổi:"
    Write-Host "  git add ."
    Write-Host "  git commit -m `"docs: cleanup and archive old documentation`""
    Write-Host ""
}

# Chạy script
Main
