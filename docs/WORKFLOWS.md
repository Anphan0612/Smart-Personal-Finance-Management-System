# WORKFLOWS

> Related documents:
> - [Documentation Index](./README.md)
> - [Features](./FEATURES.md)
> - [Use Cases](./USE_CASES.md)

Tài liệu trực quan hóa các luồng nghiệp vụ và kỹ thuật bằng Mermaid cho hệ thống **Smart Personal Finance Management System**.

---

## WF-01
### ERD — Core Business Entities

```mermaid
erDiagram
    USERS ||--o{ WALLETS : owns
    WALLETS ||--o{ TRANSACTIONS : records
    CATEGORIES ||--o{ TRANSACTIONS : classifies
    USERS ||--o{ BUDGETS : plans
    CATEGORIES ||--o{ BUDGETS : scoped_by
    USERS ||--o{ RECEIPTS : uploads
    RECEIPTS o|--|| TRANSACTIONS : confirms_to
    USERS ||--o{ MERCHANT_PREFERENCES : learns

    USERS {
      string id PK
      string username
      string email
      string password
      string user_role
      boolean is_enabled
      string preferred_currency
      datetime created_at
      datetime updated_at
    }

    WALLETS {
      string id PK
      string user_id FK
      string name
      decimal balance
      decimal initial_balance
      string wallet_type
      string account_number
      string bank_name
      string branch
      datetime created_at
      datetime updated_at
    }

    TRANSACTIONS {
      string id PK
      string wallet_id FK
      string category_id FK
      decimal amount
      string type
      string description
      datetime transaction_date
      string receipt_image_url
      datetime created_at
    }

    CATEGORIES {
      string id PK
      string name
      string type
      string icon_name
      string nlp_label
      datetime created_at
    }

    BUDGETS {
      string id PK
      string user_id FK
      string category_id FK
      decimal amount
      int month
      int year
      datetime created_at
      datetime updated_at
    }

    RECEIPTS {
      string id PK
      string user_id FK
      string image_url
      string store_name
      string ai_store_name
      decimal amount
      decimal ai_amount
      datetime transaction_date
      string status
      string transaction_id
      string raw_ocr_text
      float confidence
      float ai_confidence
      string category_id
      string ai_category_id
      boolean is_corrected
      boolean is_mapped_from_history
      string correction_reason
      datetime created_at
      datetime updated_at
    }

    MERCHANT_PREFERENCES {
      string id PK
      string user_id FK
      string normalized_pattern
      string category_id
      datetime last_used_at
    }
```

**Liên kết nghiệp vụ**

- Features: [F-02](./FEATURES.md#f-02), [F-03](./FEATURES.md#f-03), [F-04](./FEATURES.md#f-04), [F-05](./FEATURES.md#f-05), [F-08](./FEATURES.md#f-08)
- Use cases: [UC-02](./USE_CASES.md#uc-02), [UC-03](./USE_CASES.md#uc-03), [UC-06](./USE_CASES.md#uc-06), [UC-07](./USE_CASES.md#uc-07)

---

## WF-02
### Sequence — Login & Refresh Token Flow

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant M as Mobile App
    participant B as Backend API

    U->>M: Nhập username/password
    M->>B: POST /api/v1/auth/login
    B-->>M: accessToken + refreshToken
    M-->>U: Đăng nhập thành công

    M->>B: Gọi protected API (Bearer accessToken)
    B-->>M: 401 Unauthorized (token expired)

    M->>B: POST /api/v1/auth/refresh-token\nHeader: Refresh-Token
    B-->>M: accessToken mới + refreshToken mới

    M->>B: Retry request với token mới
    B-->>M: 200 OK
```

**Liên kết nghiệp vụ**

- Features: [F-01](./FEATURES.md#f-01), [F-09](./FEATURES.md#f-09)
- Use case: [UC-01](./USE_CASES.md#uc-01)

---

## WF-03
### Sequence — Receipt OCR Async & Confirm Transaction

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant M as Mobile App
    participant B as Backend API
    participant A as AI Service

    U->>M: Chọn/chụp ảnh hóa đơn
    M->>B: POST /api/v1/receipts/upload (multipart)
    B->>B: Lưu file + tạo Receipt(PENDING)
    B-->>M: 202 Accepted + receiptId

    B->>A: POST /api/ai/ocr-receipt
    A-->>B: OCR data (store, amount, date, confidence, category)
    B->>B: Update Receipt(PROCESSED) hoặc FAILED

    loop Polling mỗi 3 giây
      M->>B: GET /api/v1/receipts/{id}
      B-->>M: status = PENDING/PROCESSED/FAILED
    end

    alt status = PROCESSED
      U->>M: Review và Confirm
      M->>B: POST /api/v1/receipts/{id}/confirm
      B->>B: Create Transaction(EXPENSE)
      B->>B: Receipt -> CONFIRMED
      B-->>M: TransactionResponse
    else status = FAILED
      B-->>M: OCR processing failed
      M-->>U: Thông báo lỗi và cho phép thử lại
    end
```

**Liên kết nghiệp vụ**

- Features: [F-08](./FEATURES.md#f-08), [F-09](./FEATURES.md#f-09)
- Use case: [UC-06](./USE_CASES.md#uc-06)

---

## WF-04
### State — Receipt Lifecycle

```mermaid
stateDiagram-v2
    [*] --> PENDING
    PENDING --> PROCESSED: OCR success
    PENDING --> FAILED: OCR failed
    PROCESSED --> CONFIRMED: User confirm
    PROCESSED --> FAILED: Processing/validation error
    CONFIRMED --> [*]
    FAILED --> [*]
```

**Liên kết nghiệp vụ**

- Feature: [F-08](./FEATURES.md#f-08)
- Use case: [UC-06](./USE_CASES.md#uc-06)

---

## WF-05
### State — Transaction Business State (Documentation-level)

> Lưu ý: đây là **business state** ở mức tài liệu nghiệp vụ. Entity `Transaction` hiện tại chưa lưu field state riêng trong DB.

```mermaid
stateDiagram-v2
    [*] --> DRAFT
    DRAFT --> PARSED_BY_AI: AI extract (text/ocr)
    DRAFT --> POSTED: Manual create
    PARSED_BY_AI --> USER_REVIEWED: User edits/accepts
    USER_REVIEWED --> POSTED: Confirm save
    USER_REVIEWED --> CANCELLED: User cancels
    POSTED --> UPDATED: User edits transaction
    UPDATED --> POSTED
    CANCELLED --> [*]
```

**Liên kết nghiệp vụ**

- Feature: [F-03](./FEATURES.md#f-03)
- Use cases: [UC-03](./USE_CASES.md#uc-03), [UC-05](./USE_CASES.md#uc-05)

---

## WF-06
### Flowchart — AI Processing & Error Handling

```mermaid
flowchart TD
    A[User Input] --> B{Input Type}

    B -->|Natural Language| C[POST /api/v1/ai/chat]
    B -->|Receipt Image| D[POST /api/v1/receipts/upload]

    C --> E[Backend Intent Recognition]
    E --> F{Intent Type}
    
    F -->|COMMAND| G[Extract Transaction Flow]
    F -->|QUERY| H[Query History Handler]
    F -->|SUMMARY| I[Summary Handler]
    F -->|INSIGHT_CHART| J[Chart Handler]
    F -->|DEFAULT| K[Default Response]
    
    G --> L[POST /api/v1/ai/extract-transaction]
    L --> M{Valid parse?}
    M -->|No| N[Return error + suggestion]
    M -->|Yes| O[Return transaction draft with type: review_transaction]
    
    H --> P[Return data.transactions array]
    I --> Q[Return data.summary object]
    J --> R[Return data.chartData array]
    K --> S[Return conversational response]

    D --> T[Create Receipt PENDING]
    T --> U[Async OCR /api/ai/ocr-receipt]
    U --> V{OCR success?}
    V -->|No| W[Receipt FAILED]
    V -->|Yes| X[Receipt PROCESSED\nMapping category + confidence]

    O --> Y[User review]
    X --> Y
    Y --> Z{User confirm?}
    Z -->|No| AA[Edit/Retry/Cancel]
    Z -->|Yes| AB[Create Transaction]
    AB --> AC[Update Receipt CONFIRMED]
    AB --> AD[Learn Merchant Preference]
```

**Key Changes**
- ⭐ Unified `/api/v1/ai/chat` endpoint handles all natural language inputs
- Backend performs intent recognition (no client-side regex)
- Standardized response contract with `type` and `data` fields
- `data.transactions` replaces `matchedTransactions`
- Fallback to extract flow when intent is `COMMAND`

**Liên kết nghiệp vụ**

- Features: [F-07](./FEATURES.md#f-07), [F-08](./FEATURES.md#f-08)
- Use cases: [UC-04](./USE_CASES.md#uc-04), [UC-05](./USE_CASES.md#uc-05), [UC-06](./USE_CASES.md#uc-06), [UC-08](./USE_CASES.md#uc-08)

---

## Verification Checklist

- [ ] Mermaid render đúng trên GitHub.
- [ ] Mermaid render đúng trên VSCode.
- [ ] Tên API trong sơ đồ khớp với controller hiện tại (`/api/v1/*`).
- [ ] Luồng OCR phản ánh đúng trạng thái `PENDING -> PROCESSED -> CONFIRMED/FAILED`.
- [ ] Luồng transaction state có chú thích rõ là business-level.
