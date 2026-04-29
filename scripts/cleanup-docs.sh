#!/bin/bash

# Script dọn dẹp tài liệu thừa
# Ngày tạo: 2026-04-29
# Mục đích: Archive và xóa các file tài liệu lỗi thời

set -e

echo "=========================================="
echo "  SCRIPT DỌN DẸP TÀI LIỆU"
echo "=========================================="
echo ""

# Màu sắc
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Hàm hiển thị
info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Kiểm tra git status
check_git_status() {
    info "Kiểm tra git status..."
    if [[ -n $(git status -s) ]]; then
        warn "Có thay đổi chưa commit. Đề xuất commit trước khi chạy script."
        read -p "Tiếp tục? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            error "Script bị hủy bởi người dùng."
            exit 1
        fi
    fi
}

# Tạo backup
create_backup() {
    info "Tạo backup..."
    BACKUP_DIR="docs/backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    cp -r docs/* "$BACKUP_DIR/" 2>/dev/null || true
    info "Backup tạo tại: $BACKUP_DIR"
}

# Tạo archive folders
create_archive_folders() {
    info "Tạo archive folders..."
    mkdir -p docs/archive/plans
    mkdir -p docs/archive/reports
    info "✓ Archive folders đã tạo"
}

# Di chuyển PLANS files
archive_plans() {
    info "Archive PLANS files..."
    local count=0

    if [ -d "docs/PLANS" ]; then
        for file in docs/PLANS/*.md; do
            if [ -f "$file" ]; then
                mv "$file" docs/archive/plans/
                count=$((count + 1))
            fi
        done

        # Xóa thư mục PLANS nếu rỗng
        if [ -z "$(ls -A docs/PLANS)" ]; then
            rmdir docs/PLANS
            info "✓ Đã xóa thư mục PLANS rỗng"
        fi
    fi

    info "✓ Đã archive $count PLANS files"
}

# Archive reports đã hoàn thành
archive_reports() {
    info "Archive reports đã hoàn thành..."
    local count=0

    local reports=(
        "docs/FINAL-REPORT-mobile-refactor.md"
        "docs/LINT_FIX_SUMMARY.md"
        "docs/ECC_INSTALLATION_REPORT.md"
        "docs/SESSION_SUMMARY_2026-04-29.md"
    )

    for file in "${reports[@]}"; do
        if [ -f "$file" ]; then
            mv "$file" docs/archive/reports/
            count=$((count + 1))
            info "  → Archived: $(basename "$file")"
        fi
    done

    info "✓ Đã archive $count report files"
}

# Xóa file trùng lặp
remove_duplicates() {
    info "Xóa file trùng lặp..."
    local count=0

    local duplicates=(
        "docs/PROGRESS-mobile-refactor.md"
        "docs/SUMMARY-mobile-refactor.md"
    )

    for file in "${duplicates[@]}"; do
        if [ -f "$file" ]; then
            rm "$file"
            count=$((count + 1))
            info "  → Deleted: $(basename "$file")"
        fi
    done

    info "✓ Đã xóa $count duplicate files"
}

# Xóa file root tạm (tùy chọn)
remove_temp_root_files() {
    warn "Xóa file root tạm thời..."
    echo "Các file sau sẽ bị xóa:"
    echo "  - MERGE_READINESS_REPORT.md"
    echo "  - PR_DESCRIPTION.md"
    echo ""
    read -p "Xác nhận xóa? (y/n): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        local count=0

        if [ -f "MERGE_READINESS_REPORT.md" ]; then
            rm "MERGE_READINESS_REPORT.md"
            count=$((count + 1))
            info "  → Deleted: MERGE_READINESS_REPORT.md"
        fi

        if [ -f "PR_DESCRIPTION.md" ]; then
            rm "PR_DESCRIPTION.md"
            count=$((count + 1))
            info "  → Deleted: PR_DESCRIPTION.md"
        fi

        info "✓ Đã xóa $count root temp files"
    else
        warn "Bỏ qua xóa root temp files"
    fi
}

# Tạo summary
create_summary() {
    info "Tạo summary..."

    echo ""
    echo "=========================================="
    echo "  KẾT QUẢ DỌN DẸP"
    echo "=========================================="
    echo ""

    echo "📁 Cấu trúc docs/ sau dọn dẹp:"
    tree -L 2 docs/ 2>/dev/null || find docs/ -type f -name "*.md" | head -20

    echo ""
    echo "📊 Thống kê:"
    echo "  - Files trong docs/: $(find docs/ -maxdepth 1 -name "*.md" | wc -l)"
    echo "  - Files trong docs/archive/: $(find docs/archive/ -name "*.md" 2>/dev/null | wc -l)"
    echo "  - Files trong docs/REPORTS/: $(find docs/REPORTS/ -name "*.md" 2>/dev/null | wc -l)"

    echo ""
    info "✓ Dọn dẹp hoàn tất!"
}

# Main execution
main() {
    echo ""
    info "Bắt đầu dọn dẹp tài liệu..."
    echo ""

    # Bước 1: Kiểm tra git
    check_git_status

    # Bước 2: Tạo backup
    create_backup

    # Bước 3: Tạo archive folders
    create_archive_folders

    # Bước 4: Archive PLANS
    archive_plans

    # Bước 5: Archive reports
    archive_reports

    # Bước 6: Xóa duplicates
    remove_duplicates

    # Bước 7: Xóa temp root files (tùy chọn)
    remove_temp_root_files

    # Bước 8: Tạo summary
    create_summary

    echo ""
    warn "Đừng quên commit thay đổi:"
    echo "  git add ."
    echo "  git commit -m \"docs: cleanup and archive old documentation\""
    echo ""
}

# Chạy script
main
