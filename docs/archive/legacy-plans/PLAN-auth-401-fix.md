# PLAN-auth-401-fix

Dự án: Smart Personal Finance Management System
Vấn đề: Build thành công nhưng không mở được App (kẹt ở Splash/Blank) và gặp lỗi 401 (Unauthorized) liên hoàn.

## 1. Phân tích nguyên nhân (Root Cause)
1. **Zustand Hydration & New Arch**: Việc bật New Architecture có thể khiến `AsyncStorage` phản hồi chậm hoặc gây lỗi trong quá trình Hydration, khiến `isReady` trong `_layout.tsx` bị treo.
2. **Refresh Token Race Condition**: Khi App khởi động, nhiều request (`/wallets`, `/dashboard`) được gọi cùng lúc. Khi tất cả bị 401, Interceptor gọi lệnh Refresh Token nhiều lần song song. Nếu Backend sử dụng Token Rotation (vô hiệu hóa RT sau khi dùng), các request sau sẽ làm hỏng RT của các request trước, gây lỗi 401 vĩnh viễn.
3. **Routing Loop**: Nếu `currentToken` bị `null` do refresh thất bại, nhưng `router.replace` gặp lỗi hoặc không kích hoạt được do App chưa "mounted" hoàn toàn, người dùng sẽ thấy màn hình trắng hoặc Splash.

## 2. Giải pháp kỹ thuật (Solution)
1. **Refresh Mutex**: Chỉnh sửa `api.ts` để đảm bảo tại một thời điểm chỉ có 1 request refresh duy nhất được thực hiện. Các request 401 khác phải đợi kết quả của request này.
2. **Hydration Timeout/Safety**: Thêm log vào `_layout.tsx` để theo dõi tiến trình load Fonts và Hydration.
3. **Reset Tokens on Fail**: Đảm bảo khi Refresh thất bại, token được xóa sạch để Auth Guard đẩy người dùng về màn hình Login thay vì treo.

## 3. Kế hoạch triển khai (Task Breakdown)

### Phase 1: Debug & Logging
- [ ] Thêm chi tiết log vào `src/services/api.ts` để xem giá trị `accessToken` và `refreshToken` thực tế khi gọi.
- [ ] Thêm log vào `app/_layout.tsx` để xác định `isReady` có bị `false` mãi không.

### Phase 2: Fix Auth Interceptor (Critical)
- [ ] Triển khai hàng đợi (queueing) cho các request bị 401 trong lúc đang refresh.
- [ ] Xử lý lỗi `/auth/refresh-token` trả về 401 (xóa sạch session).

### Phase 3: Kiểm tra tính tương thích
- [ ] Kiểm tra xem `expo-secure-store` và `AsyncStorage` có hoạt động ổn định trên New Architecture không (thông qua log).

## 4. Danh sách kiểm tra (Verification Checklist)
- [ ] App mở được (Splash screen ẩn đi).
- [ ] Tự động chuyển về màn hình Login nếu token hết hạn mà không refresh được.
- [ ] Login thành công và không bị văng ra ngay lập tức.

## 5. Phân công Agent
- **Backend Specialist**: Hỗ trợ kiểm tra log từ phía server nếu RT bị báo lỗi "reuse".
- **Mobile Developer**: Thực hiện sửa lỗi Interceptor và Routing.
