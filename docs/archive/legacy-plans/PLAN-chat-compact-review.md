# PLAN: Compact Transaction Review Flow (Chat AI)

## 1. Overview
Triển khai một giao diện Review thu gọn (Compact Modal) dành riêng cho luồng Chat AI, giúp người dùng nhanh chóng xác nhận và chỉnh sửa dữ liệu giao dịch đã trích xuất mà không làm gián đoạn trải nghiệm hội thoại.

---

## 2. Goals
- **Mượt mà**: Tích hợp trực tiếp vào Chat AI, sử dụng Glassmorphism để giữ bối cảnh hội thoại.
- **Tốc độ**: Giảm thiểu các thao tác không cần thiết, cho phép lưu giao dịch chỉ với 1-click nếu AI đúng.
- **Tái sử dụng**: Component có thể dùng lại cho các tính năng sửa nhanh khác trong tương lai.

---

## 3. Task Breakdown

### Phase 1: Phát triển UI Component chuyên dụng
- [ ] Tạo file `mobile/src/components/ui/CompactReviewSheet.tsx`
- [ ] Thiết kế Header với phong cách "The Financial Atelier" (Title + Close button)
- [ ] Triển khai khu vực hiển thị số tiền (Amount) trung tâm, font Manrope, kích thước lớn.
- [ ] Xây dựng Grid 2x2 cho các trường: Cửa hàng, Ngày tháng, Danh mục, Ví.
- [ ] Áp dụng Glassmorphism (semi-transparent surface + backdrop blur) và góc bo 32px.

### Phase 2: Logic & State Management
- [ ] Khởi tạo state nội bộ cho Modal dựa trên `initialData` truyền vào.
- [ ] Kết nối các Picker có sẵn (WalletPicker, CategoryPicker) vào Grid.
- [ ] Xử lý định dạng tiền tệ live khi người dùng sửa số tiền.

### Phase 3: Kết nối Chat AI (Integration)
- [ ] Cập nhật `AtelierAI.tsx` để quản lý state đóng/mở của `CompactReviewSheet`.
- [ ] Gắn listener cho nút "Sửa chi tiết" của `AtelierTransactionCard` để mở Sheet.
- [ ] Truyền dữ liệu AI hiện tại vào Sheet.

### Phase 4: Lưu dữ liệu & Hiệu ứng (Final Polish)
- [ ] Implement hàm `handleSave` gọi API `/transactions` trực tiếp.
- [ ] Tích hợp `expo-haptics` (Rung nhẹ khi mở, Rung thành công khi lưu).
- [ ] Sử dụng `moti` cho các hiệu ứng chuyển cảnh mượt mà.

---

## 4. Agent Assignments
- **Specialist**: `mobile-developer` (Chịu trách nhiệm chính về UI/UX và logic Frontend).
- **Consultant**: `frontend-specialist` (Kiểm tra compliance với hệ thống thiết kế "The Financial Atelier").

---

## 5. Verification Checklist
- [ ] Modal mở lên mượt mà, giữ được hiệu ứng Glassmorphism.
- [ ] Dữ liệu AI được pre-fill chính xác vào các trường.
- [ ] Thay đổi thông tin trên Modal không làm ảnh hưởng đến dữ liệu gốc trong chat cho đến khi nhấn Save.
- [ ] Lưu giao dịch thành công và có phản hồi (Haptics + Toast/Alert).
- [ ] Kiểm tra hiệu năng: Đảm bảo không gây lag khi mở Modal trên các thiết bị cấu hình thấp.

---
**Status**: APPROVED by USER
**Task Slug**: chat-compact-review
