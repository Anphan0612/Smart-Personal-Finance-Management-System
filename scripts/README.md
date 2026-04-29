# Scripts Utilities

Thư mục chứa các script tiện ích cho dự án.

## 📋 Danh Sách Scripts

### 1. cleanup-docs.sh (Bash/Linux/macOS)

Script dọn dẹp tài liệu thừa và archive các file lỗi thời.

**Cách sử dụng:**

```bash
# Cấp quyền thực thi
chmod +x scripts/cleanup-docs.sh

# Chạy script
./scripts/cleanup-docs.sh
```

**Chức năng:**
- ✅ Kiểm tra git status trước khi thực hiện
- ✅ Tạo backup tự động
- ✅ Archive 20 PLANS files
- ✅ Archive 4 report files đã hoàn thành
- ✅ Xóa 2 file trùng lặp
- ✅ Xóa file root tạm (tùy chọn)
- ✅ Hiển thị summary kết quả

---

### 2. cleanup-docs.ps1 (PowerShell/Windows)

Phiên bản PowerShell của script dọn dẹp tài liệu.

**Cách sử dụng:**

```powershell
# Chạy script
.\scripts\cleanup-docs.ps1

# Hoặc nếu gặp lỗi execution policy
powershell -ExecutionPolicy Bypass -File .\scripts\cleanup-docs.ps1
```

**Chức năng:** Tương tự cleanup-docs.sh

---

## 🎯 Kết Quả Mong Đợi

### Trước Dọn Dẹp
```
docs/
├── PLANS/ (20 files)
├── REPORTS/ (1 file)
├── ARCHITECTURE_ANALYSIS.md
├── AUDIT_CHECKLIST_2026-04-24.md
├── ECC_INSTALLATION_REPORT.md
├── FEATURES.md
├── FINAL-REPORT-mobile-refactor.md
├── LINT_FIX_SUMMARY.md
├── LINT_WARNINGS_ANALYSIS.md
├── PROGRESS-mobile-refactor.md (duplicate)
├── README.md
├── SESSION_SUMMARY_2026-04-29.md
├── SUMMARY-mobile-refactor.md (duplicate)
├── TESTING_GATES.md
├── USE_CASES.md
├── WHY_CANT_FIX_LINT_WARNINGS.md
└── WORKFLOWS.md

Root:
├── MERGE_READINESS_REPORT.md (temp)
└── PR_DESCRIPTION.md (temp)
```

### Sau Dọn Dẹp
```
docs/
├── archive/
│   ├── plans/ (20 files)
│   └── reports/ (4 files)
├── REPORTS/ (1 file)
├── ARCHITECTURE_ANALYSIS.md
├── AUDIT_CHECKLIST_2026-04-24.md
├── CLEANUP_RECOMMENDATIONS.md (new)
├── FEATURES.md
├── LINT_WARNINGS_ANALYSIS.md
├── README.md
├── TESTING_GATES.md
├── USE_CASES.md
├── WHY_CANT_FIX_LINT_WARNINGS.md
└── WORKFLOWS.md

Root:
├── README.md
├── CHANGELOG.md
└── CLAUDE.md
```

---

## 📊 Thống Kê

| Metric | Trước | Sau | Cải Thiện |
|--------|-------|-----|-----------|
| Files trong docs/ | 36 | ~10 | -72% |
| Files trong docs/PLANS/ | 20 | 0 | -100% |
| Duplicate files | 2 | 0 | -100% |
| Temp root files | 2 | 0 | -100% |
| Archive files | 0 | 24 | +24 |

---

## ⚠️ Lưu Ý Quan Trọng

1. **Backup Tự Động:** Script tự động tạo backup trong `docs/backup-{timestamp}/`
2. **Git Status:** Script kiểm tra git status và cảnh báo nếu có thay đổi chưa commit
3. **Xác Nhận:** Script yêu cầu xác nhận trước khi xóa file root tạm
4. **Rollback:** Có thể rollback bằng cách restore từ backup hoặc git history

---

## 🔄 Quy Trình Sau Khi Chạy Script

```bash
# 1. Kiểm tra kết quả
ls -la docs/
ls -la docs/archive/

# 2. Review thay đổi
git status
git diff

# 3. Commit nếu hài lòng
git add .
git commit -m "docs: cleanup and archive old documentation"

# 4. Hoặc rollback nếu cần
git restore .
# hoặc restore từ backup
cp -r docs/backup-{timestamp}/* docs/
```

---

## 🐛 Troubleshooting

### Lỗi: Permission Denied (Linux/macOS)

```bash
chmod +x scripts/cleanup-docs.sh
```

### Lỗi: Execution Policy (Windows)

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Lỗi: Git Not Found

Đảm bảo git đã được cài đặt và có trong PATH:

```bash
git --version
```

---

## 📝 Changelog

### 2026-04-29
- ✨ Tạo cleanup-docs.sh (Bash version)
- ✨ Tạo cleanup-docs.ps1 (PowerShell version)
- 📝 Tạo CLEANUP_RECOMMENDATIONS.md
- 📝 Tạo scripts/README.md

---

## 🤝 Contributing

Nếu muốn thêm script mới:

1. Tạo file script trong thư mục `scripts/`
2. Thêm mô tả vào README.md này
3. Đảm bảo script có:
   - Kiểm tra điều kiện trước khi thực hiện
   - Tạo backup tự động
   - Hiển thị progress và kết quả
   - Xử lý lỗi đúng cách

---

## 📚 Tài Liệu Liên Quan

- [CLEANUP_RECOMMENDATIONS.md](../docs/CLEANUP_RECOMMENDATIONS.md) - Báo cáo chi tiết về dọn dẹp tài liệu
- [CLAUDE.md](../CLAUDE.md) - Hướng dẫn cho Claude Code
- [README.md](../README.md) - Tổng quan dự án
