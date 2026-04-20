# 🏗️ System Design & Architectural Patterns

Tài liệu này trình bày kiến trúc chi tiết, sơ đồ thực thể và các luồng xử lý kỹ thuật của hệ thống **Smart Personal Finance**.

---

## 1. Kiến Trúc Tổng Thề (High-Level Architecture)

Hệ thống được thiết kế theo mô hình **Clean Architecture** kết hợp với **DDD (Domain-Driven Design)** sơ khai, đảm bảo tính độc lập giữa logic nghiệp vụ và các framework bên ngoài.

```mermaid
graph TD
    %% Nodes
    Client["📱 Client App (React/Mobile)"]
    Gateway["🛡️ API Gateway (Spring Security)"]
    
    subgraph Backend ["Core System (Java Spring Boot)"]
        Controller["🎮 Presentation Layer (REST Controllers)"]
        UseCase["⚙️ Application Layer (Use Cases / Services)"]
        Domain["💎 Domain Layer (Core Entities & Logic)"]
        Adapters["🔌 Infrastructure Layer (Persistence & AI Adapters)"]
    end
    
    DB[("💾 MySQL Database")]
    AI_Service(("🧠 External AI Service (OpenAI)"))

    %% Connections
    Client -- "HTTPS" --> Gateway
    Gateway --> Controller
    Controller --> UseCase
    UseCase --> Domain
    UseCase --> Adapters
    Adapters -- "JPA/Hibernate" --> DB
    Adapters -- "REST/JSON" --> AI_Service

    %% Styling
    style Client fill:#4285F4,stroke:#1A73E8,stroke-width:2px,color:#fff
    style Gateway fill:#757575,stroke:#212121,stroke-width:2px,color:#fff
    style Domain fill:#34A853,stroke:#188038,stroke-width:2px,color:#fff
    style UseCase fill:#FBBC05,stroke:#F29900,stroke-width:2px,color:#fff
    style Controller fill:#EA4335,stroke:#C5221F,stroke-width:2px,color:#fff
    style Adapters fill:#FF6D00,stroke:#E65100,stroke-width:2px,color:#fff
    style DB fill:#0097A7,stroke:#006064,stroke-width:2px,color:#fff
    style AI_Service fill:#00C853,stroke:#00C853,stroke-width:2px,color:#fff
```

---

## 2. Thiết Kế Cơ Sở Dữ Liệu (ERD)

Cơ sở dữ liệu tập trung vào tính toàn vẹn và khả năng mở rộng cho các tính năng AI sau này.

```mermaid
erDiagram
    USERS ||--o{ TRANSACTIONS : "sở hữu"
    USERS ||--o{ BUDGETS : "thiết lập"
    CATEGORIES ||--o{ TRANSACTIONS : "phân loại"
    
    USERS {
        uuid id PK
        string full_name
        string email UK
        string password_hash
        timestamp created_at
    }
    
    CATEGORIES {
        int id PK
        string name
        string type "INCOME / EXPENSE"
        string icon_name
        boolean is_custom
    }
    
    TRANSACTIONS {
        uuid id PK
        uuid user_id FK
        int category_id FK
        decimal amount
        string note
        date transaction_date
        timestamp created_at
    }

    BUDGETS {
        uuid id PK
        uuid user_id FK
        int category_id FK
        decimal limit_amount
        date start_date
        date end_date
    }
```

---

## 3. Các Luồng Nghiệp Vụ Chính (Core Sequence)

### 3.1. Phân tích văn bản bằng AI (AI Extraction)

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Người dùng
    participant UI as 📱 Frontend (React)
    participant API as 🛡️ Backend (Java)
    participant AI as 🧠 AI Adapter (OpenAI)
    participant DB as 💾 Database (MySQL)
    
    User->>UI: Nhập text "Ăn phở 45k"
    UI->>API: POST /api/v1/ai/extract
    API->>AI: Chuyển đổi text sang JSON structured data
    AI-->>API: { amount: 45000, category: "Food" }
    API->>DB: Kiểm tra danh mục & Lưu giao dịch
    DB-->>API: Trả về Transaction ID
    API-->>UI: HTTP 201 Created (Success)
    UI-->>User: Thông báo "Ghi nhanh thành công!"
```

---

## 4. Phân Lớp Ứng Dụng (Clean Architecture Layers)

Mô hình chi tiết về sự phụ thuộc giữa các thành phần mã nguồn:

```mermaid
classDiagram
    direction TB
    class Presentation {
        <<Layer>>
        +REST Controllers
        +DTO Mappers
    }
    class Application {
        <<Layer>>
        +Use Case Logic
        +Command/Query Handlers
    }
    class Domain {
        <<Layer>>
        +Pure Entities
        +Value Objects
        +Repository Interfaces
    }
    class Infrastructure {
        <<Layer>>
        +JPA Implementation
        +AI Client Impl
        +Security Config
    }

    Presentation --> Application
    Application --> Domain
    Infrastructure ..|> Domain : Implements
    Infrastructure --> Application : Injects
```

---
*Tài liệu này sẽ được cập nhật khi có thay đổi về kiến trúc microservices hoặc tích hợp LLM cục bộ.*

