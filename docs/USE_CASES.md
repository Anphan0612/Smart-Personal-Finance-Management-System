# USE_CASES

> Related documents:
> - [Documentation Index](./README.md)
> - [Features](./FEATURES.md)
> - [Workflows](./WORKFLOWS.md)

Tài liệu mô tả kịch bản sử dụng chính/phụ cho hệ thống **Smart Personal Finance Management System**.

---

## Actors

- **A1 — End User**: người dùng mobile app.
- **A2 — Backend API**: hệ thống Spring Boot xử lý nghiệp vụ.
- **A3 — AI Service**: dịch vụ FastAPI xử lý NLP/OCR/insight.
- **A4 — External Model Runtime**: LLM/OCR engine phía AI service.

---

## UC-01
### Đăng ký / Đăng nhập / Duy trì phiên

**Goal**

- Người dùng truy cập hệ thống và duy trì session hợp lệ.

**Primary actor**

- A1 (End User)

**Preconditions**

- User có kết nối mạng.
- Với login: user đã có tài khoản.

**Main flow**

1. User nhập thông tin register/login.
2. Mobile gọi API auth.
3. Backend xác thực và trả token.
4. Mobile lưu token, chuyển vào khu vực chính.
5. Khi access token hết hạn, mobile tự refresh token.

**Alternate flow**

- Sai thông tin đăng nhập -> trả lỗi xác thực.
- Refresh token không hợp lệ -> xóa session và yêu cầu login lại.

**Postconditions**

- Session hoạt động với `accessToken`/`refreshToken` hợp lệ.

**Related features/workflows**

- Feature: [F-01](./FEATURES.md#f-01), [F-09](./FEATURES.md#f-09)
- Workflow: [WF-02](./WORKFLOWS.md#wf-02)

**Related APIs**

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh-token`

---

## UC-02
### Quản lý ví

**Goal**

- Tạo và quản lý danh sách ví phục vụ giao dịch.

**Primary actor**

- A1

**Preconditions**

- User đã đăng nhập.

**Main flow**

1. User tạo ví mới (cash/bank/e-wallet/investment).
2. User xem danh sách ví.
3. User chỉnh sửa thông tin ví.
4. User xóa ví không dùng.

**Alternate flow**

- Dữ liệu ví không hợp lệ (ví dụ balance âm) -> backend từ chối.

**Postconditions**

- Danh sách ví được cập nhật theo user.

**Related features/workflows**

- Feature: [F-02](./FEATURES.md#f-02)
- Workflow: [WF-01](./WORKFLOWS.md#wf-01)

**Related APIs**

- `POST /api/v1/wallets`
- `GET /api/v1/wallets`
- `GET /api/v1/wallets/{id}`
- `PUT /api/v1/wallets/{id}`
- `DELETE /api/v1/wallets/{id}`

---

## UC-03
### Nhập giao dịch thủ công

**Goal**

- Ghi nhận giao dịch do user tự nhập.

**Primary actor**

- A1

**Preconditions**

- User đã đăng nhập.
- Có ít nhất một wallet.

**Main flow**

1. User mở form transaction.
2. Nhập amount/type/date/description/category.
3. Mobile gọi API tạo transaction.
4. Backend lưu transaction và phản hồi.

**Alternate flow**

- Amount <= 0 hoặc ngày tương lai -> backend trả lỗi validation.

**Postconditions**

- Transaction mới xuất hiện trong danh sách giao dịch.

**Related features/workflows**

- Feature: [F-03](./FEATURES.md#f-03)
- Workflow: [WF-01](./WORKFLOWS.md#wf-01), [WF-05](./WORKFLOWS.md#wf-05)

**Related APIs**

- `POST /api/v1/transactions`

---

## UC-04
### Truy vấn lịch sử giao dịch bằng AI

**Goal**

- User hỏi AI về lịch sử chi tiêu/thu nhập bằng ngôn ngữ tự nhiên.

**Primary actor**

- A1

**Supporting actors**

- A2, A3

**Preconditions**

- User đăng nhập.
- Có wallet và dữ liệu giao dịch trong lịch sử.

**Main flow**

1. User nhập câu hỏi tự nhiên vào Atelier AI.
2. Mobile gọi `POST /api/v1/ai/chat` với `message` và `walletId`.
3. Backend nhận diện intent (QUERY, SUMMARY, INSIGHT_CHART, COMMAND, DEFAULT).
4. Backend lấy transaction context theo wallet và gọi AI service tương ứng.
5. AI trả về response với `type`, `message`, và `data` (chứa `transactions`, `summary`, `chartData`, `filters`).
6. Mobile hiển thị câu trả lời + dữ liệu có cấu trúc (danh sách giao dịch, biểu đồ, tóm tắt).

**Alternate flow**

- AI service timeout/lỗi -> trả fallback response với type `DEFAULT`.
- Intent là `COMMAND` -> Backend tự động fallback sang extract transaction flow.

**Postconditions**

- User nhận được câu trả lời tổng hợp có thể hành động.
- Response sử dụng key chuẩn `data.transactions` (không phải `matchedTransactions`).

**Related features/workflows**

- Feature: [F-07](./FEATURES.md#f-07)
- Workflow: [WF-06](./WORKFLOWS.md#wf-06)

**Related APIs**

- `POST /api/v1/ai/chat` ⭐ Primary endpoint
- `POST /api/v1/ai/query-history` (Deprecated)

---

## UC-05
### Nhập giao dịch qua AI text command

**Goal**

- Chuyển câu mô tả giao dịch thành transaction draft để user xác nhận.

**Primary actor**

- A1

**Supporting actors**

- A2, A3

**Preconditions**

- User đăng nhập.
- Có wallet đích để lưu giao dịch.

**Main flow**

1. User nhập câu (ví dụ: "ăn phở 50k").
2. Backend gọi AI `extract-transaction`.
3. AI trả amount/type/category/date/confidence.
4. User chỉnh sửa nếu cần.
5. User xác nhận, hệ thống lưu transaction.

**Alternate flow**

- AI không parse được amount -> trả lỗi có suggestion.
- User hủy thao tác -> không tạo transaction.

**Postconditions**

- Transaction được tạo hoặc draft bị hủy.

**Related features/workflows**

- Feature: [F-07](./FEATURES.md#f-07), [F-03](./FEATURES.md#f-03)
- Workflow: [WF-06](./WORKFLOWS.md#wf-06), [WF-05](./WORKFLOWS.md#wf-05)

**Related APIs**

- `POST /api/v1/ai/extract-transaction`
- `POST /api/v1/transactions`

---

## UC-06
### Upload hóa đơn và xác nhận OCR transaction

**Goal**

- Tự động trích xuất hóa đơn rồi chuyển thành giao dịch xác nhận.

**Primary actor**

- A1

**Supporting actors**

- A2, A3, A4

**Preconditions**

- User đăng nhập.
- User có ảnh hóa đơn hợp lệ.

**Main flow**

1. User chụp/chọn ảnh hóa đơn.
2. Mobile upload ảnh (`/receipts/upload`).
3. Backend lưu receipt trạng thái `PENDING`, trả `202 Accepted`.
4. Backend xử lý OCR async qua AI service.
5. Mobile polling `GET /receipts/{id}`.
6. Khi `PROCESSED`, user review dữ liệu OCR.
7. User confirm -> backend tạo transaction và cập nhật receipt `CONFIRMED`.

**Alternate flow**

- OCR thất bại -> receipt `FAILED`.
- User không sở hữu receipt -> `403 Forbidden`.

**Postconditions**

- Transaction được tạo từ hóa đơn hoặc receipt ở trạng thái lỗi/chưa xác nhận.

**Related features/workflows**

- Feature: [F-08](./FEATURES.md#f-08), [F-09](./FEATURES.md#f-09)
- Workflow: [WF-03](./WORKFLOWS.md#wf-03), [WF-04](./WORKFLOWS.md#wf-04), [WF-06](./WORKFLOWS.md#wf-06)

**Related APIs**

- `POST /api/v1/receipts/upload`
- `GET /api/v1/receipts/{id}`
- `POST /api/v1/receipts/{id}/confirm`

---

## UC-07
### Thiết lập ngân sách theo tháng

**Goal**

- Lập ngân sách tổng/quy theo category và theo dõi tiến độ.

**Primary actor**

- A1

**Preconditions**

- User đăng nhập.

**Main flow**

1. User nhập budget theo tháng/năm.
2. Backend upsert budget.
3. User xem budget summary và planning.
4. User reset budget nếu cần.

**Alternate flow**

- Dữ liệu tháng/năm không hợp lệ -> backend trả lỗi.

**Postconditions**

- Budget dữ liệu được cập nhật cho kỳ tương ứng.

**Related features/workflows**

- Feature: [F-05](./FEATURES.md#f-05)
- Workflow: [WF-01](./WORKFLOWS.md#wf-01)

**Related APIs**

- `POST /api/v1/budgets`
- `GET /api/v1/budgets`
- `GET /api/v1/budgets/planning`
- `DELETE /api/v1/budgets/reset`

---

## UC-08
### Xem dashboard và nhận insight AI

**Goal**

- Theo dõi tổng quan tài chính và nhận khuyến nghị ngắn từ AI.

**Primary actor**

- A1

**Supporting actors**

- A2, A3

**Preconditions**

- User đăng nhập.
- Có wallet hợp lệ.

**Main flow**

1. User mở dashboard.
2. Backend trả summary theo wallet/timeRange.
3. User yêu cầu insight.
4. Backend gọi AI generate-insights hoặc budget-insight.
5. Mobile hiển thị insight + biểu đồ danh mục nổi bật.

**Alternate flow**

- AI service unavailable -> hiển thị fallback insight.

**Postconditions**

- User có dữ liệu để ra quyết định tài chính ngắn hạn.

**Related features/workflows**

- Feature: [F-06](./FEATURES.md#f-06), [F-07](./FEATURES.md#f-07)
- Workflow: [WF-06](./WORKFLOWS.md#wf-06)

**Related APIs**

- `GET /api/v1/dashboard/summary`
- `POST /api/v1/ai/generate-insights`
- `POST /api/v1/ai/budget-insight`

---

## Traceability Matrix

| Use Case ID | Feature ID | Workflow ID | API chính |
|---|---|---|---|
| [UC-01](#uc-01) | [F-01](./FEATURES.md#f-01), [F-09](./FEATURES.md#f-09) | [WF-02](./WORKFLOWS.md#wf-02) | `/api/v1/auth/*` |
| [UC-02](#uc-02) | [F-02](./FEATURES.md#f-02) | [WF-01](./WORKFLOWS.md#wf-01) | `/api/v1/wallets` |
| [UC-03](#uc-03) | [F-03](./FEATURES.md#f-03) | [WF-01](./WORKFLOWS.md#wf-01), [WF-05](./WORKFLOWS.md#wf-05) | `/api/v1/transactions` |
| [UC-04](#uc-04) | [F-07](./FEATURES.md#f-07) | [WF-06](./WORKFLOWS.md#wf-06) | `/api/v1/ai/chat` ⭐ |
| [UC-05](#uc-05) | [F-07](./FEATURES.md#f-07), [F-03](./FEATURES.md#f-03) | [WF-06](./WORKFLOWS.md#wf-06), [WF-05](./WORKFLOWS.md#wf-05) | `/api/v1/ai/extract-transaction`, `/api/v1/transactions` |
| [UC-06](#uc-06) | [F-08](./FEATURES.md#f-08), [F-09](./FEATURES.md#f-09) | [WF-03](./WORKFLOWS.md#wf-03), [WF-04](./WORKFLOWS.md#wf-04) | `/api/v1/receipts/*` |
| [UC-07](#uc-07) | [F-05](./FEATURES.md#f-05) | [WF-01](./WORKFLOWS.md#wf-01) | `/api/v1/budgets/*` |
| [UC-08](#uc-08) | [F-06](./FEATURES.md#f-06), [F-07](./FEATURES.md#f-07) | [WF-06](./WORKFLOWS.md#wf-06) | `/api/v1/dashboard/summary`, `/api/v1/ai/*` |
