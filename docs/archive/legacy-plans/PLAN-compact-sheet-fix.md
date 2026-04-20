# PLAN: Fix & Polish CompactReviewSheet

Khắc phục lỗi runtime crash `TypeError: Cannot read property 'date' of null` và nâng cấp trải nghiệm người dùng bằng Skeleton screen và Strict Typing.

## User Review Required

> [!TIP]
> **Trải nghiệm Skeleton**: Thay vì ẩn hoàn toàn (`return null`), tôi sẽ render khung của Modal với các thành phần mờ (opacity) để tạo cảm giác "dữ liệu đang đến", giúp UI không bị giật.

## Proposed Changes

### 1. Component: [MODIFY] [CompactReviewSheet.tsx](file:///c:/Smart-Personal-Finance-Management-System/mobile/src/components/ui/CompactReviewSheet.tsx)
- **Typing**: 
    - Định nghĩa interface `InitialTransactionData`.
    - Cập nhật prop `initialData: InitialTransactionData | null`.
- **Skeleton Loading**: 
    - Nếu `isVisible` là true nhưng `initialData` là null, hiển thị phiên bản skeleton của các trường dữ liệu.
    - Thêm một `ActivityIndicator` nhỏ ở góc hoặc chính giữa amount.
- **Safe Hooks**:
    - Cập nhật `useEffect` để thoát sớm nếu `!initialData`.
- **Safe Rendering**:
    - Sử dụng `initialData?.date || "Chờ xử lý..."`.

### 2. Parent: [MODIFY] [AtelierAI.tsx](file:///c:/Smart-Personal-Finance-Management-System/mobile/src/components/ui/AtelierAI.tsx)
- Đảm bảo `selectedTxData` được quản lý chặt chẽ trong luồng logic mở modal.

## Verification Plan

### Manual Verification
1. Mở AI Chat, gửi tin nhắn bóc tách.
2. Kiểm tra việc bốc tách không gây crash UI chính.
3. Nhấn "Sửa chi tiết" -> Quan sát Skeleton (nếu load chậm) -> Quan sát dữ liệu thật.
4. Kiểm tra việc lưu và xác nhận sau khi sửa.
