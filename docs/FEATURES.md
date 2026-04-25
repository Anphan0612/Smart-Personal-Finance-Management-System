# FEATURES

> Related documents:
> - [Documentation Index](./README.md)
> - [Use Cases](./USE_CASES.md)
> - [Workflows](./WORKFLOWS.md)

Đặc tả tính năng theo module của hệ thống **Smart Personal Finance Management System**.

---

## F-01
### Authentication & Token Management

**Mục tiêu nghiệp vụ**

- Cho phép người dùng đăng ký, đăng nhập và duy trì phiên làm việc an toàn bằng JWT.

**Phạm vi**

- Register, Login, Refresh Token.

**API liên quan**

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh-token`

**Input/Output chính**

- Register input: `username`, `email`, `password`, `phone`, `cccd`
- Login input: `username`, `password`
- Output: `AuthenticationResponse` gồm `accessToken`, `refreshToken`, `tokenType`, `userId`, `email`, `name`

**Constraints**

- Validate dữ liệu đầu vào bằng Bean Validation.
- Refresh token được nhận từ header `Refresh-Token`.

**Liên kết**

- Use case: [UC-01](./USE_CASES.md#uc-01)
- Workflow: [WF-02](./WORKFLOWS.md#wf-02)

---

## F-02
### Wallet Management

**Mục tiêu nghiệp vụ**

- Quản lý nhiều ví tiền của người dùng (tiền mặt, ngân hàng, ví điện tử, đầu tư).

**Phạm vi**

- Tạo ví, lấy danh sách ví, xem chi tiết, cập nhật, xóa.

**API liên quan**

- `POST /api/v1/wallets`
- `GET /api/v1/wallets`
- `GET /api/v1/wallets/{id}`
- `PUT /api/v1/wallets/{id}`
- `DELETE /api/v1/wallets/{id}`

**Input/Output chính**

- Create input: `name`, `balance`, `currencyCode`, `type`, `bankName?`, `accountNumber?`, `branch?`
- Update input: `name?`, `balance?`, `currencyCode?`, `type?`, `bankName?`, `accountNumber?`, `branch?`
- Output: `WalletResponse`

**Constraints**

- `balance` phải >= 0.
- Chỉ thao tác trên ví của user hiện tại.
- `WalletType`: `CASH`, `BANK`, `EWALLET`, `INVESTMENT`.

**Liên kết**

- Use case: [UC-02](./USE_CASES.md#uc-02)
- Workflow: [WF-01](./WORKFLOWS.md#wf-01)

---

## F-03
### Transaction Management

**Mục tiêu nghiệp vụ**

- Ghi nhận và quản lý giao dịch thu/chi/chuyển tiền theo ví.

**Phạm vi**

- Tạo, cập nhật, xóa, xem chi tiết, danh sách phân trang, so sánh theo kỳ.

**API liên quan**

- `POST /api/v1/transactions`
- `GET /api/v1/transactions?walletId=&page=&size=`
- `GET /api/v1/transactions/{id}`
- `PUT /api/v1/transactions/{id}`
- `DELETE /api/v1/transactions/{id}`
- `GET /api/v1/transactions/comparison?walletId=...`

**Input/Output chính**

- Create input: `walletId`, `categoryId?`, `amount`, `description?`, `type`, `transactionDate`, `receiptImageUrl?`
- Update input: `walletId?`, `categoryId?`, `amount?`, `description?`, `type?`, `transactionDate?`
- Output: `TransactionResponse`, `PagedResponse<TransactionResponse>`, `TransactionComparisonResponse`

**Constraints**

- `amount > 0`.
- `transactionDate` không được ở tương lai.
- `TransactionType`: `INCOME`, `EXPENSE`, `TRANSFER`.

**Liên kết**

- Use case: [UC-03](./USE_CASES.md#uc-03), [UC-05](./USE_CASES.md#uc-05)
- Workflow: [WF-01](./WORKFLOWS.md#wf-01), [WF-05](./WORKFLOWS.md#wf-05)

---

## F-04
### Category Management

**Mục tiêu nghiệp vụ**

- Quản lý danh mục giao dịch phục vụ người dùng và AI mapping.

**Phạm vi**

- Lấy danh sách category, tạo category mới.

**API liên quan**

- `GET /api/v1/categories`
- `POST /api/v1/categories`

**Input/Output chính**

- Create input: `name`, `type`, `iconName`
- Output: `Category`

**Constraints**

- `name`, `type`, `iconName` bắt buộc.
- Category có thể có `nlpLabel` để map AI output.

**Liên kết**

- Use case: [UC-03](./USE_CASES.md#uc-03), [UC-06](./USE_CASES.md#uc-06)
- Workflow: [WF-01](./WORKFLOWS.md#wf-01), [WF-06](./WORKFLOWS.md#wf-06)

---

## F-05
### Budget Planning & Monitoring

**Mục tiêu nghiệp vụ**

- Thiết lập và giám sát ngân sách theo tháng/năm, theo category hoặc tổng.

**Phạm vi**

- Upsert budget, lấy summary, lấy planning, reset budget.

**API liên quan**

- `POST /api/v1/budgets`
- `GET /api/v1/budgets?month=&year=`
- `GET /api/v1/budgets/planning?month=&year=`
- `DELETE /api/v1/budgets/reset?month=&year=`

**Input/Output chính**

- Input: `categoryId?`, `amount`, `month`, `year`
- Output: `Budget`, `BudgetResponse[]`, `BudgetPlanningResponse`

**Constraints**

- `categoryId = null` tương ứng ngân sách tổng tháng.
- Scope dữ liệu theo user đang đăng nhập.

**Liên kết**

- Use case: [UC-07](./USE_CASES.md#uc-07)
- Workflow: [WF-01](./WORKFLOWS.md#wf-01)

---

## F-06
### Dashboard Summary & Analytics

**Mục tiêu nghiệp vụ**

- Cung cấp tổng quan tài chính cho một ví theo khoảng thời gian.

**Phạm vi**

- Summary, monthly trend, category breakdown, recent transactions.

**API liên quan**

- `GET /api/v1/dashboard/summary?walletId=&timeRange=`

**Output chính**

- `DashboardResponseDTO`

**Constraints**

- Yêu cầu `walletId` hợp lệ.
- `timeRange` mặc định: `current_month`.

**Liên kết**

- Use case: [UC-08](./USE_CASES.md#uc-08)
- Workflow: [WF-06](./WORKFLOWS.md#wf-06)

---

## F-07
### AI Assistant (NLP Query/Insights)

**Mục tiêu nghiệp vụ**

- Hỗ trợ tương tác ngôn ngữ tự nhiên: trích xuất giao dịch, truy vấn lịch sử, sinh insight.

**Phạm vi**

- Extract transaction from text.
- Unified chat endpoint with smart intent orchestration.
- Query history với intent classification (`QUERY`, `SUMMARY`, `INSIGHT_CHART`, `COMMAND`, `DEFAULT`).
- Generate insights và budget insight.

**API backend (gateway)**

- `POST /api/v1/ai/chat` ⭐ **Primary endpoint** - Unified chat orchestrator
- `POST /api/v1/ai/extract-transaction`
- `POST /api/v1/ai/query-history` (Deprecated - use `/chat` instead)
- `POST /api/v1/ai/generate-insights`
- `POST /api/v1/ai/budget-insight`

**AI service nội bộ**

- `POST /api/ai/extract-transaction`
- `POST /api/ai/query-history`
- `POST /api/ai/generate-insights`
- `POST /api/ai/budget-insight`
- `POST /api/ai/detect-anomalies`

**Input/Output chính**

**Chat Request** (`POST /api/v1/ai/chat`):
- Input: `message` (string), `walletId` (string)
- Output: `AtelierChatResponse`
  - `message` (string) - Natural language response
  - `type` (enum) - `QUERY`, `SUMMARY`, `INSIGHT_CHART`, `COMMAND`, `DEFAULT`
  - `data` (object) - Structured data container
    - `transactions` (array, optional) - List of matched transactions
    - `summary` (object, optional) - `{totalSpent, budgetLimit, percentage}`
    - `chartData` (array, optional) - Data points for charts
    - `filters` (object, optional) - Applied query filters

**Extract Transaction**:
- Input: `text`
- Output: `amount`, `type`, `category`, `date`, `note`, `confidence`, `categoryId?`

**Constraints**

- Text input không được rỗng.
- Chat endpoint handles intent recognition on backend (no client-side regex).
- Response uses standardized key `transactions` (not `matchedTransactions`).
- Query history yêu cầu dữ liệu transactions ngữ cảnh (backend chuẩn bị trước khi gọi AI).

**Liên kết**

- Use case: [UC-04](./USE_CASES.md#uc-04), [UC-05](./USE_CASES.md#uc-05), [UC-08](./USE_CASES.md#uc-08)
- Workflow: [WF-06](./WORKFLOWS.md#wf-06)

---

## F-08
### Receipt OCR Pipeline

**Mục tiêu nghiệp vụ**

- Tự động trích xuất thông tin hóa đơn từ ảnh và chuyển thành giao dịch xác nhận.

**Phạm vi**

- Upload ảnh hóa đơn.
- OCR async.
- Polling trạng thái.
- Confirm tạo transaction.
- Truy xuất ảnh hóa đơn.

**API liên quan**

- `POST /api/v1/receipts/upload`
- `GET /api/v1/receipts`
- `GET /api/v1/receipts/{id}`
- `POST /api/v1/receipts/{id}/confirm`
- `GET /api/v1/receipts/images/{filename}`

**Input/Output chính**

- Upload input: `multipart/form-data` (`file`)
- Confirm input: `walletId`, `categoryId`, `storeName`, `amount`, `transactionDate?`, `description?`
- Output: `ReceiptResponse`, `TransactionResponse`

**Receipt status**

- `PENDING` → `PROCESSED` → `CONFIRMED`
- Nhánh lỗi: `FAILED`

**Constraints**

- Upload trả về `202 Accepted` để client polling.
- Chỉ owner được confirm receipt.
- Confirm tạo transaction mặc định type `EXPENSE`.
- Có lớp học thói quen người dùng qua `merchant_preferences`.

**Liên kết**

- Use case: [UC-06](./USE_CASES.md#uc-06)
- Workflow: [WF-03](./WORKFLOWS.md#wf-03), [WF-04](./WORKFLOWS.md#wf-04), [WF-06](./WORKFLOWS.md#wf-06)

---

## F-09
### Mobile API Layer & Session Resilience

**Mục tiêu nghiệp vụ**

- Đảm bảo mobile client giao tiếp API ổn định, an toàn và khôi phục phiên tự động.

**Phạm vi**

- Axios interceptor gắn JWT.
- Mutex refresh token khi gặp nhiều request 401 đồng thời.
- Polling receipt status.

**Thành phần liên quan**

- `mobile/src/services/api.ts`
- `mobile/src/types/api.ts`

**Liên kết**

- Use case: [UC-01](./USE_CASES.md#uc-01), [UC-06](./USE_CASES.md#uc-06)
- Workflow: [WF-02](./WORKFLOWS.md#wf-02), [WF-03](./WORKFLOWS.md#wf-03)
