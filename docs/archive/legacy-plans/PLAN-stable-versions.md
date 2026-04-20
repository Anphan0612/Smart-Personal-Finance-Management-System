# 📋 PLAN: Stabilize Project Versions

## 🎯 Mục tiêu
Đưa toàn bộ môi trường phát triển (Local Development) về các phiên bản ổn định (LTS/Stable) để khắc phục lỗi build native Android và lỗi crash runtime Node v25.

---

## 🏗️ Cấu trúc Phiên bản Mục tiêu (Target Matrix)

| Thành phần | Phiên bản | Trách nhiệm |
| :--- | :--- | :--- |
| **Node.js** | **v22.x (LTS)** | Mobile, Scripts |
| **Android NDK** | **26.1.10909125** | Mobile (Native Build) |
| **JDK** | **17 or 21** | Backend (Spring Boot) |
| **Python** | **3.11.x** | AI Service |

---

## 🛠️ Lộ trình triển khai (Task Breakdown)

### Phase 1: Môi trường Hệ thống (System Environment)
- [ ] Gỡ bỏ Node v25.
- [ ] Cài đặt Node v22 LTS (via MSI or NVM).
- [ ] Cài đặt NDK bản 26.1.x qua Android SDK Manager.
- [ ] Kiểm tra path Java (`JAVA_HOME`) trỏ về JDK 17/21.

### Phase 2: Dọn dẹp & Tái thiết (Cleanup & Rebuild)
- [ ] Xóa triệt để `node_modules` và `.expo` trong thư mục `mobile`.
- [ ] Xóa cache build Android (`mobile/android/.gradle`, `mobile/android/app/build`).
- [ ] Chạy `npm install` bằng Node v22.
- [ ] Chạy `./gradlew clean` trong thư mục `mobile/android`.

### Phase 3: Khóa phiên bản (Locking Configuration)
- [ ] Tạo file `.nvmrc` tại thư mục gốc chứa nội dung `v22`.
- [ ] Cập nhật `local.properties` trong Android để trỏ đúng NDK 26.1.x.
- [ ] Kiểm tra `package.json` để đảm bảo `engines` field được thiết lập.

---

## 🧪 Kiểm tra & Xác nhận (Checklist)

- [ ] Lệnh `node -v` trả về `v22.x.x`.
- [ ] `npx expo-doctor` không báo lỗi phiên bản.
- [ ] Lệnh build native Android (Debug) thành công không còn lỗi `gold linker`.
- [ ] Ứng dụng khởi động trên thiết bị thật/giả lập mà không bị crash ngay lập tức.

---

## 👥 Phân công Agent
- **@debugger**: Xử lý các lỗi phát sinh trong quá trình build native.
- **@backend-specialist**: Đảm bảo môi trường Java/JDK không bị ảnh hưởng.
- **@frontend-specialist**: Kiểm tra tính ổn định của ứng dụng sau khi hạ cấp Node.
