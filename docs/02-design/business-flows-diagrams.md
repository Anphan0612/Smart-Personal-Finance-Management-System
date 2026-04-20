# 🔄 Business Flow Diagrams

Tài liệu này mô tả chi tiết các luồng nghiệp vụ người dùng tương tác với hệ thống, từ nhập liệu thủ công đến các tính năng AI nâng cao.

---

## 1. ✍️ Nhập Giao dịch Thủ công (Manual Entry)

Đây là chức năng cơ bản nhất giúp người dùng kiểm soát chính xác từng khoản chi tiêu.

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Người dùng
    participant App as 📱 Frontend (React)
    participant API as ⚙️ Backend API
    participant DB as 💾 Database

    User->>App: Mở form "Thêm giao dịch"
    App-->>User: Hiển thị form input
    User->>App: Nhập: 50.000đ, Ăn trưa, Ghi chú...
    App->>API: POST /api/v1/transactions
    API->>API: Validate logic & User Context
    API->>DB: INSERT INTO transactions...
    DB-->>API: Success
    API-->>App: HTTP 201 Created
    App-->>User: Toast: "Lưu thành công!" & Update UI
```

---

## 2. 🧠 Nhập liệu qua AI (NLP Input)

Tự động hóa việc trích xuất thông tin giúp giảm tải thao tác cho người dùng.

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Người dùng
    participant App as 📱 Frontend (React)
    participant API as ⚙️ Backend API
    participant AI as 🧠 NLP Engine (OpenAI)
    participant DB as 💾 Database

    User->>App: Chat/Voice: "Vừa mới đổ xăng 50k"
    App->>API: POST /api/v1/ai/parse
    API->>AI: Gửi text yêu cầu cấu trúc hóa dữ liệu
    Note over AI: Trích xuất intent: Expense<br/>Amount: 50000<br/>Category: Transport
    AI-->>API: Trả về JSON structured
    API-->>App: Trả kết quả dự kiến (Preview)
    App->>User: Hiển thị popup xác nhận
    User->>App: Click "Xác nhận & Lưu"
    App->>API: POST /api/v1/transactions
    API->>DB: Lưu giao dịch chính thức
    DB-->>API: Success
    API-->>App: OK
    App-->>User: Thông báo thành công
```

---

## 3. 📷 Quét Hóa đơn (OCR Feature)

Sử dụng Computer Vision để đọc dữ liệu trực tiếp từ hóa đơn.

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Người dùng
    participant App as 📱 APP
    participant API as ⚙️ Backend
    participant OCR as 👁️ OCR Service
    participant DB as 💾 Database

    User->>App: Chụp ảnh hóa đơn nhà hàng
    App->>API: Upload File Image
    API->>OCR: Phân tích vùng chứa text & số tiền
    OCR-->>API: Trả về: Tổng tiền & Tên cửa hàng
    API->>API: Mapping cửa hàng -> Category
    API-->>App: Gợi ý các trường dữ liệu
    App->>User: User kiểm tra lại
    User->>App: Nhấn "Lưu hóa đơn"
    App->>API: Kết thúc luồng nhập liệu
    API->>DB: Archive Info
```

---

## 4. 🚨 Cảnh báo Chi tiêu Bất thường (Anomaly Detection)

Hệ thống chủ động giám sát và đưa ra các khuyến nghị bảo vệ ngân sách.

```mermaid
sequenceDiagram
    autonumber
    participant Job as ⏲️ Scheduler (Cron)
    participant API as ⚙️ Backend API
    participant Engine as 🛡️ Logic Engine
    participant DB as 💾 Database
    actor User as 👤 Người dùng

    Job->>API: Chạy kiểm tra định kỳ (20:00 mỗi ngày)
    API->>DB: Query chi tiêu của User trong ngày
    DB-->>API: Danh sách giao dịch
    API->>Engine: So sánh với Ngân sách (Budget)
    
    alt Nếu chi tiêu vượt quá 80% Budget
        Engine-->>API: Cảnh báo: Alert Level 1
        API->>DB: Lưu thông báo (Notification)
        API->>User: Gửi Push Notification / Email
    else An toàn
        Engine-->>API: No action
    end
```

---

## 5. 🤖 Truy vấn qua Chatbot (AI Assistant)

Hỏi đáp trực tiếp về tình hình tài chính bằng ngôn ngữ tự nhiên.

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Người dùng
    participant Chat as 📱 Chat UI
    participant API as ⚙️ Backend
    participant AI as 🧠 AI Brain
    participant DB as 💾 DB

    User->>Chat: "Tháng này tôi còn bao nhiêu tiền?"
    Chat->>API: POST /api/v1/ai/query
    API->>AI: Phân tích ý định: Query Balance
    AI-->>API: Cấu trúc: GET balance, filter: Month=Now
    API->>DB: SQL: SELECT SUM(amount)...
    DB-->>API: Result: 5.000.000 VND
    API->>AI: Gửi số liệu yêu cầu sinh câu thoại (NLG)
    AI-->>API: "Bạn hiện còn 5 triệu trong ngân sách tháng này!"
    API-->>Chat: Trả tin nhắn text
    Chat-->>User: Hiển thị bong bóng chat
```

---
*Các quy trình trên đảm bảo tuân thủ tiêu chuẩn bảo mật OWASP và hiệu năng tối ưu.*

