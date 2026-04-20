# 📋 PLAN: Package Cleanup & Global Tooling Setup

## 🎯 Overview
Kế hoạch này thực hiện dọn dẹp các dependency thừa tại root, đồng bộ hóa phiên bản môi trường và thiết lập bộ công cụ quản lý chất lượng code (Prettier/ESLint) tập trung theo mô hình **Hybrid (Lean & Standardized)**.

## ✅ Success Criteria
- [x] Root `package.json` chỉ còn lại `engines` và các công cụ phát triển (`devDependencies`).
- [x] Các thư viện i18n được loại bỏ khỏi root để giữ dự án tinh gọn.
- [x] Cài đặt thành công `prettier` và `eslint` tại root.
- [x] Tạo cấu hình `.prettierrc` (cơ bản) và `.eslintrc.json` (sử dụng overrides).
- [x] Root `node_modules` và `package-lock.json` được cập nhật sạch sẽ.

---

## 🏗️ Tech Stack
- **Node.js**: v22 LTS (SSOT)
- **Package Manager**: npm v11+
- **Tooling**: Prettier, ESLint

---

## 📋 Task Breakdown

### Phase 1: Clean & Align (Lean) - ✅ DONE
| ID | Task | Status |
| :--- | :--- | :--- |
| 1.1 | Xóa `i18next` và `react-i18next` khỏi `dependencies` tại root `package.json`. | ✅ Done |
| 1.2 | Đảm bảo `engines` trong `package.json` phản ánh đúng Node v22. | ✅ Done |
| 1.3 | Rebuild root `package-lock.json` sạch sẽ. | ✅ Done |

### Phase 2: Mobile i18n Migration - ⏩ SKIPPED
*Note: Giữ dự án tinh gọn, không cài deps i18n vào mobile cho đến khi thực sự cần thiết.*

### Phase 3: Global Tooling Setup (Standardized) - ✅ DONE
| ID | Task | Status |
| :--- | :--- | :--- |
| 3.1 | Cài đặt `prettier` và `eslint` tại root. | ✅ Done |
| 3.2 | Thiết lập `.prettierrc` và `.eslintrc.json` (overrides cho JS/TS). | ✅ Done |
| 3.3 | Cập nhật `.prettierignore` và `.gitignore`. | ✅ Done |

---

## 💡 Kỹ thuật triển khai an toàn (Safe Implementation)
1.  **ESLint Overrides**: Cấu hình root `.eslintrc.json` sử dụng `overrides` để chỉ target vào các file `.js, .ts, .tsx`. Đã cấu hình `ignorePatterns` cho `backend/` và `ai-service/`.
2.  **Prettier Strategy**:
    - Đã cài đặt rules cơ bản: `singleQuote: true`, `trailingComma: 'all'`, `tabWidth: 2`.
    - Đã tạo `.prettierignore` để tránh format nhầm các file Java, Python và Native Build.

---

## 👥 Agent Assignments
- **@orchestrator**: Đã hoàn thành dọn dẹp và cài đặt Tooling.
- **@mobile-developer**: Xác nhận cấu hình mobile không bị ảnh hưởng.
- **@frontend-specialist**: Đã hoàn thành thiết lập quy chuẩn format code.
