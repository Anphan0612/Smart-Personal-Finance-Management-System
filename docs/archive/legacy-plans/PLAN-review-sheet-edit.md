# PLAN-review-sheet-edit

Dự án: Smart Personal Finance Management System
Tính năng: Tương tác hóa các trường trong CompactReviewSheet (AI Review)

## 1. Mục tiêu (Goals)
Khắc phục tình trạng các trường thông tin trong `CompactReviewSheet` không thể chỉnh sửa được, mang lại trải nghiệm xác nhận giao dịch mượt mà sau khi AI trích xuất.

## 2. Phân tích vấn đề (Analysis)
- **Số tiền & Ghi chú**: Đang dùng `TextInput` nhưng có thể bị xung đột layout hoặc bàn phím che khuất.
- **Danh mục & Ví**: Hiện tại chỉ là UI tĩnh (TouchableOpacity nhưng chưa có logic chọn).
- **Ngày**: Chưa có bộ chọn ngày (DatePicker).

## 3. Giải pháp đề xuất (Proposed Solutions)

### A. Inline Quick Selection (Cho Danh mục & Ví)
Thay vì mở Modal mới, tôi sẽ tận dụng diện tích của Sheet để hiển thị danh sách lựa chọn nhanh ngay tại chỗ:
- Khi nhấn vào "Danh mục", vùng Grid nội dung sẽ tạm thời biến thành danh sách icon/tên danh mục.
- Khi nhấn vào "Tài khoản", tương tự sẽ hiện danh sách các ví đang có.
- **Performance**: Sử dụng `ScrollView` với `keyboardShouldPersistTaps="handled"` để đảm bảo mượt mà khi lọc danh mục dài.

### B. Hệ thống DatePicker
Sử dụng thư viện chuẩn của React Native (`@react-native-community/datetimepicker`).
- **Lưu ý Mobile Developer**: Xử lý UX đồng nhất giữa iOS (Wheel/Calendar) và Android (Dialog).

### C. Keyboard & Dirty State Handling
- **Dirty State**: Thêm biến `isDirty` để theo dõi thay đổi. Nếu người dùng đóng sheet khi `isDirty === true`, hiển thị Alert xác nhận.
- **Keyboard**: Sử dụng `Keyboard.dismiss()` khi mở picker và căn chỉnh lại `KeyboardAvoidingView`.

### D. Đồng bộ dữ liệu (Data Sync)
- Đảm bảo UI cập nhật đầy đủ Icon và Màu sắc của Danh mục/Ví mới chọn dựa trên Metadata từ Store, không chỉ đổi ID.

## 4. Kế hoạch triển khai (Task Breakdown)

### Phase 1: Thư viện & State
- [x] Cài đặt `@react-native-community/datetimepicker`.
- [x] Bổ sung state `activePicker`, `isDirty` vào `CompactReviewSheet.tsx`.

### Phase 2: Thành phần giao diện (UI Components)
- [x] Xây dựng `InlineSelector`: Thành phần hiển thị danh sách lựa chọn nhanh (Grid/List) hỗ trợ Scrolling.
- [x] Tích hợp `DateTimePicker` với cấu hình riêng cho iOS/Android.

### Phase 3: Logic tương tác & Dirty State
- [x] Gắn `onPress` cho các trường Grid.
- [x] Triển khai `handleClose` với logic kiểm tra `isDirty` và Alert xác nhận.
- [x] Logic lấy Metadata (Icon, Color) từ Store khi thay đổi Category/Wallet.

### Phase 4: Đánh bóng (Polishing)
- [x] Thêm Haptic Feedback cho mỗi lần đổi giá trị.
- [x] Đảm bảo nút "Xác nhận & Lưu" luôn hiển thị đúng trạng thái.

## 5. Danh sách kiểm tra (Verification Checklist)
- [x] Kiểm tra số tiền: Nhập được số mới, tự động format tiền tệ.
- [x] Kiểm tra Dirty State: Thay đổi giá trị -> Nhấn Hủy -> Alert hiện lên -> Đúng logic.
- [x] Kiểm tra danh mục/ví: UI cập nhật đúng Icon/Color sau khi chọn thành công.
- [x] Kiểm tra ngày: DatePicker hoạt động đúng trên cả iOS và Android.

## 6. Phân công Agent
- **Frontend Specialist**: Phụ trách UI/UX InlineSelector, logic Sync Metadata và Dirty State.
- **Mobile Developer**: Xử lý `datetimepicker` (OS compatibility) và Keyboard interaction.

---

[OK] Plan created: docs/PLAN-review-sheet-edit.md

Next steps:
- Review the plan
- Run `/create` to start implementation
- Or modify plan manually
