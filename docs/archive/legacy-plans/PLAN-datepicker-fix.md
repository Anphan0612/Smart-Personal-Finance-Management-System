# PLAN-datepicker-fix

Dự án: Smart Personal Finance Management System
Vấn đề: Lỗi `Invariant Violation: 'RNCDatePicker' could not be found` khi khởi động App.

## 1. Phân tích nguyên nhân (Root Cause)
Bạn đang sử dụng **Bare Workflow** và **Development Client**, nhưng chưa thực hiện build lại mã nguồn Native sau khi cài đặt thư viện `@react-native-community/datetimepicker`. 
Vì thư viện này chứa mã nguồn native (Android/iOS), nó không thể chạy bằng mã Javascript đơn thuần mà cần được biên dịch vào file thực thi của ứng dụng.

## 2. Giải pháp kỹ thuật (Solution)
Thực hiện quy trình dọn dẹp và rebuild lại ứng dụng Native để tích hợp module `RNCDatePicker`.

## 3. Kế hoạch triển khai (Task Breakdown)

### Phase 1: Dọn dẹp & Chuẩn bị
- [ ] Dọn dẹp cache của Metro Bundler.
- [ ] Kiểm tra tính toàn vẹn của thư mục `android/`.
- [ ] Xóa các bản build cũ để tránh xung đột.

### Phase 2: Biên dịch Native (Rebuild)
- [ ] Thực hiện lệnh `npx expo run:android` (Dành cho Android) hoặc `npx expo run:ios` (Nếu ở macOS/iOS).
- [ ] Theo dõi quá trình build để đảm bảo Autolinking cho `@react-native-community/datetimepicker` thành công.

### Phase 3: Xác minh (Verification)
- [ ] Khởi động Development Client mới trên máy ảo/thiết bị thật.
- [ ] Mở tính năng AI Review (CompactReviewSheet) để kiểm tra xem DatePicker có hiển thị mà không gây lỗi Crash hay không.

## 4. Danh sách kiểm tra (Verification Checklist)
- [ ] App không còn báo lỗi `Invariant Violation: 'RNCDatePicker' could not be found`.
- [ ] DatePicker hiển thị đúng giao diện hệ điều hành khi nhấn vào trường "Ngày".

## 5. Phân công Agent
- **Mobile Developer**: Thực hiện các lệnh CLI để build và debug quá trình biên dịch native.

---

## Câu hỏi mở (Open Questions)
> [!IMPORTANT]
> - Bạn đang test trên thiết bị thật hay máy ảo? Nếu là thiết bị thật, hãy đảm bảo đã kết nối qua USB và bật Debug mode.
> - Máy tính của bạn đã cài đặt sẵn **Android SDK** và **JDK** chưa? (Cần thiết cho quá trình build Android).
