# PLAN: Manual Transaction System Fix

## 📌 Context
Hệ thống gặp 2 vấn đề chính khi nhập giao dịch thủ công:
1. Danh mục không hiển thị dù đã có trong Database.
2. Không lưu được giao dịch do lỗi parse ngày tháng (`LocalDateTime`) ở Backend.

---

## 🛠️ Phase 1: Frontend - Category Data Flow & UX
- [x] Thay thế nguồn dữ liệu từ `useAppStore` sang `useCategories` hook trong `ManualTransactionModal.tsx`.
- [x] Đảm bảo lọc danh mục theo đúng `activeTab` (EXPENSE/INCOME).
- [x] Bổ sung trạng thái Loading/Skeleton khi danh mục đang được fetch.
- [ ] Triển khai tùy chọn "Tạo danh mục mới" ngay trong danh sách danh mục để giảm ma sát cho người dùng.
- [ ] Xử lý trạng thái disable nút "Lưu giao dịch" và hiển thị cảnh báo trực quan khi số dư ví không đủ (cho giao dịch chi).
- [ ] Kiểm tra logic hiển thị Icon cho các danh mục từ DB.

## 🛠️ Phase 2: Backend - Serialization & Business Logic
- [x] Cập nhật `TransactionRequest.java` với `@JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSX")` để hỗ trợ ISO-8601 từ Mobile.
- [x] Đồng nhất định dạng ngày tháng trong `TransactionResponse.java` theo chuẩn ISO-8601 đầy đủ để đảm bảo tính nhất quán giữa Request và Response.
- [ ] Triển khai logic kiểm tra số dư thực tế tại tầng Service/UseCase cho giao dịch chi (Expense), ném ra `InsufficientBalanceException` nếu không đủ tiền.
- [ ] Kiểm tra `TransactionMapper` hoặc `Service` để đảm bảo chuyển đổi `transactionDate` vào Entity chính xác.

## 🛠️ Phase 3: Validation & Edge Cases
- [ ] Kiểm tra trường hợp nhập số tiền = 0 hoặc số tiền âm.
- [ ] Thử nghiệm nhập giao dịch chi với số tiền lớn hơn số dư hiện tại -> Backend trả về lỗi 400/422 và Frontend hiển thị thông báo tương ứng.
- [ ] Thử nghiệm tạo danh mục nhanh thông qua Modal -> Kiểm tra giao dịch được lưu với danh mục mới tạo thành công.
- [ ] Verify hành vi sau khi lưu thành công (Clear form, đóng modal, cập nhật danh sách giao dịch ở màn hình chính).

---

## 👥 Agent Assignments
- **Mobile Developer**: Xử lý logic Modal và Category Hook.
- **Backend Specialist**: Xử lý DTO, Serialization và API Logic.

---

## ✅ Verification Checklist
1. [ ] Mở Modal: Danh mục xuất hiện ngay lập tức (hoặc sau loading).
2. [ ] Chuyển tab Thu nhập/Chi tiêu: Danh mục thay đổi tương ứng.
3. [ ] Nhấn "Lưu giao dịch": 
    - Request gửi lên thành công (Status 200/201).
    - Database cập nhật đúng ngày giờ.
    - Không còn lỗi `JSON_PARSE_ERROR` trong log backend.
