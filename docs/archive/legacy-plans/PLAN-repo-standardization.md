# 📋 PLAN: Repo Standardization & Cleanup

## 🎯 Overview
Dự án đã trải qua nhiều giai đoạn sửa lỗi và tối ưu hóa hệ thống build, dẫn đến việc cấu hình (Node, NDK, Build Properties) bị phân mảnh và trùng lặp giữa các file của Expo (`app.json`) và Native (`android/`). Đồng thời, các file kế hoạch cũ trong `docs/` đã hoàn thành nhưng vẫn tồn tại gây nhiễu.

Mục tiêu của kế hoạch này là:
1. Thiết lập **Single Source of Truth (SSOT)**: Mọi cấu hình build mobile sẽ tập trung tại `app.json`.
2. Đồng bộ hóa phiên bản môi trường (Node v22).
3. Dọn dẹp triệt để các file rác và tài liệu trùng lặp.

---

## ✅ Success Criteria
- [ ] `ndkVersion` chỉ còn khai báo tại `app.json` (plugins section).
- [ ] Xóa bỏ code hardcode `ndkVersion` trong `mobile/android/build.gradle`.
- [ ] `.nvmrc` và `package.json` cùng chỉ định Node v22.
- [ ] Các file trong `docs/archive/` được dọn dẹp (xóa hoặc tinh gọn).
- [ ] `npx expo prebuild` chạy thành công mà không làm mất cấu hình NDK.

---

## 🏗️ Tech Stack
- **Core**: Node.js v22 (LTS)
- **Mobile**: Expo SDK 54, React Native 0.76+
- **Build Tools**: NDK 27.1.12297006, Android Gradle Plugin 8.x

---

## 📋 Task Breakdown

### Phase 1: Environment Alignment (Node.js)
| ID | Task | Agent | Skills | Priority |
| :--- | :--- | :--- | :--- | :--- |
| 1.1 | Kiểm tra và đồng bộ hóa `engines` trong `mobile/package.json` về Node v22. (Lưu ý: `ai-service` dùng Python nên bỏ qua). | `orchestrator` | clean-code | P1 |
| 1.2 | Đảm bảo `.nvmrc` ở root là `v22`. | `orchestrator` | clean-code | P1 |

**INPUT**: `mobile/package.json`, `.nvmrc`
**OUTPUT**: Các file đồng bộ phiên bản Node.
**VERIFY**: `node -v` và kiểm tra nội dung file.

---

### Phase 2: Mobile Configuration SSOT (Expo-First)
| ID | Task | Agent | Skills | Priority |
| :--- | :--- | :--- | :--- | :--- |
| 2.1 | Kiểm tra các file native trong `mobile/android/` để tìm các tùy chỉnh thủ công khác ngoài NDK (ví dụ: permission, splash screen). | `mobile-developer` | mobile-design | P0 |
| 2.2 | Di dời các tùy chỉnh (nếu có) vào `plugins` trong `app.json`. | `mobile-developer` | mobile-design | P1 |
| 2.3 | Xóa `ndkVersion` trong `mobile/android/build.gradle`. | `mobile-developer` | clean-code | P1 |
| 2.4 | Tạo file `mobile/android/local.properties.example` chứa các biến môi trường cần thiết (sdk.dir, ndk.dir). | `mobile-developer` | documentation-templates | P2 |

**INPUT**: `mobile/app.json`, `mobile/android/build.gradle`, `local.properties`
**OUTPUT**: Cấu hình tập trung tại `app.json` và file template cho người mới.
**VERIFY**: Kiểm tra sự tồn tại của `local.properties.example`.

---

### Phase 3: Final Documentation Cleanup
| ID | Task | Agent | Skills | Priority |
| :--- | :--- | :--- | :--- | :--- |
| 3.0 | Tạo file `docs/SITEMAP.md` để liệt kê các tài liệu quan trọng và hướng dẫn tìm kiếm thông tin cũ trong archive. | `documentation-writer` | documentation-templates | P1 |
| 3.1 | Phân loại và dọn dẹp thư mục `docs/archive/`. Xóa những file thực sự không còn giá trị tham khảo. | `documentation-writer` | documentation-templates | P2 |
| 3.2 | Cập nhật `ARCHITECTURE.md` để reflect chuẩn cấu hình mới. | `documentation-writer` | documentation-templates | P2 |

**INPUT**: `docs/archive/`, `ARCHITECTURE.md`
**OUTPUT**: Repo sạch sẽ, có sitemap hướng dẫn.
**VERIFY**: Mở `docs/SITEMAP.md` và kiểm tra cấu trúc thư mục.

---

## 🧪 Phase X: Final Verification
- [ ] Chạy `npx expo-doctor` để kiểm tra sức khỏe project.
- [ ] Thử nghiệm build local (nếu môi trường cho phép) hoặc `npx expo prebuild` để verify template native mới.
- [ ] Kiểm tra lại `mobile/package.json` không còn `engines` gây xung đột.
- [ ] Xóa folder `docs/archive/` hoàn toàn nếu người dùng đồng ý.

---

## 👥 Agent Assignments
- **@mobile-developer**: Chịu trách nhiệm chính phần cấu hình Native/Expo.
- **@documentation-writer**: Xử lý dọn dẹp và cập nhật tài liệu.
- **@orchestrator**: Điều phối và đồng bộ môi trường Node.js.
