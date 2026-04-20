# Smart Personal Finance Management System - E2E Data Flow

## Core Features Data Flow Diagrams (Mermaid)

### 1. OCR Receipt Processing Flow (Async)

```mermaid
sequenceDiagram
    participant Mobile as Mobile App
    participant Controller as ReceiptController
    participant Storage as StorageService
    participant Async as OcrAsyncService
    participant AI as OcrExtractionClient
    participant Merchant as MerchantMappingService
    participant DB as Database

    Mobile->>Controller: POST /receipts/upload<br/>(MultipartFile)
    
    rect rgb(240, 248, 255)
        Note over Controller,Storage: Phase 1: Synchronous Upload
        Controller->>Storage: store(filename, bytes)
        Storage-->>Controller: fileUrl
        
        Controller->>DB: INSERT receipt<br/>(status: PENDING)
        DB-->>Controller: receipt.id
    end
    
    Controller-->>Mobile: 202 ACCEPTED<br/>{id, status: PENDING}
    
    rect rgb(255, 250, 240)
        Note over Controller,AI: Phase 2: Async OCR Processing
        Controller->>Async: @Async processOcrAsync()<br/>(receiptId, bytes, timezone)
        
        Async->>AI: extractReceiptData(bytes)
        AI-->>Async: {store_name, amount,<br/>date, category_id,<br/>confidence}
    end
    
    rect rgb(240, 255, 240)
        Note over Async,DB: Phase 3: Intelligence Layer
        Async->>Merchant: findPreferredCategoryId()<br/>(userId, storeName)
        Merchant->>DB: SELECT merchant_preferences
        DB-->>Merchant: user history
        
        alt User has history for this merchant
            Merchant-->>Async: categoryId (Priority 1)
            Note over Async: isMappedFromHistory = true
        else No history, use AI prediction
            Async->>DB: SELECT category<br/>WHERE nlp_label = ?
            DB-->>Async: categoryId (Priority 2)
            Note over Async: isMappedFromHistory = false
        end
    end
    
    Async->>DB: UPDATE receipt<br/>(status: PROCESSED,<br/>storeName, amount,<br/>categoryId, confidence)
    
    rect rgb(255, 240, 245)
        Note over Mobile,DB: Phase 4: Polling & Confirmation
        loop Poll every 2s
            Mobile->>Controller: GET /receipts/{id}
            Controller->>DB: SELECT receipt
            DB-->>Controller: receipt data
            Controller-->>Mobile: {status: PROCESSED,<br/>storeName, amount,<br/>categoryId}
        end
    end
    
    Mobile->>Controller: POST /receipts/{id}/confirm<br/>{walletId, categoryId,<br/>amount, storeName}
    
    rect rgb(255, 255, 240)
        Note over Controller,DB: Phase 5: Transaction Creation & Learning
        Controller->>Controller: CreateTransactionUseCase
        Controller->>DB: INSERT transaction<br/>UPDATE wallet (withdraw)
        
        Controller->>Merchant: upsertPreference()<br/>(userId, storeName, categoryId)
        Merchant->>DB: UPSERT merchant_preferences
        Note over Merchant: Implicit Learning:<br/>Store user's choice
        
        Controller->>DB: UPDATE receipt<br/>(status: CONFIRMED,<br/>transactionId)
    end
    
    Controller-->>Mobile: 200 OK<br/>{transactionId}
```

---

### 2. Manual Transaction Creation Flow

```mermaid
sequenceDiagram
    participant Mobile as Mobile App
    participant Controller as TransactionController
    participant UseCase as CreateTransactionUseCase
    participant Wallet as Wallet Entity
    participant DB as Database

    Mobile->>Controller: POST /transactions<br/>{walletId, categoryId,<br/>amount, type: EXPENSE,<br/>description, transactionDate}
    
    rect rgb(240, 248, 255)
        Note over Controller,DB: Phase 1: Validation
        Controller->>UseCase: execute(request, userId)
        
        UseCase->>DB: SELECT wallet<br/>WHERE id = ? AND user_id = ?
        DB-->>UseCase: wallet
        
        alt Wallet not found or unauthorized
            UseCase-->>Controller: 403 FORBIDDEN
            Controller-->>Mobile: Error: Unauthorized
        end
        
        UseCase->>DB: SELECT category<br/>WHERE id = ?
        DB-->>UseCase: category
        
        alt Category not found
            UseCase-->>Controller: 404 NOT FOUND
            Controller-->>Mobile: Error: Category not found
        end
    end
    
    rect rgb(255, 250, 240)
        Note over UseCase,Wallet: Phase 2: Domain Logic
        UseCase->>UseCase: Transaction.create()<br/>- Validate amount > 0<br/>- Convert timezone (Local → UTC)
        
        alt type = EXPENSE
            UseCase->>Wallet: withdraw(amount)
            Wallet->>Wallet: Validate balance >= amount
            Wallet-->>UseCase: balance updated
        else type = INCOME
            UseCase->>Wallet: deposit(amount)
            Wallet-->>UseCase: balance updated
        end
    end
    
    rect rgb(240, 255, 240)
        Note over UseCase,DB: Phase 3: Atomic Persistence
        UseCase->>DB: @Transactional<br/>INSERT transaction<br/>UPDATE wallet
        DB-->>UseCase: transaction saved
    end
    
    UseCase-->>Controller: TransactionResponse
    Controller-->>Mobile: 201 CREATED<br/>{id, walletId, categoryId,<br/>amount, type, transactionDate}
```

---

### 3. Dashboard Summary Flow

```mermaid
sequenceDiagram
    participant Mobile as Mobile App
    participant Controller as DashboardController
    participant UseCase as DashboardUseCaseImpl
    participant DB as Database

    Mobile->>Controller: GET /dashboard/summary<br/>?walletId=xxx<br/>&timeRange=current_month
    
    rect rgb(240, 248, 255)
        Note over Controller,UseCase: Phase 1: Time Range Calculation
        Controller->>UseCase: getDashboardSummary()
        
        UseCase->>UseCase: Get user timezone<br/>Calculate start date<br/>Convert to UTC
        Note over UseCase: current_month:<br/>Start = 2026-04-01 00:00 (Local)<br/>→ 2026-03-31 17:00 (UTC+7)
    end
    
    rect rgb(255, 250, 240)
        Note over UseCase,DB: Phase 2: Query Transactions
        UseCase->>DB: SELECT * FROM transactions<br/>WHERE wallet_id = ?<br/>AND transaction_date<br/>BETWEEN startUtc AND nowUtc
        DB-->>UseCase: List<Transaction>
    end
    
    rect rgb(240, 255, 240)
        Note over UseCase: Phase 3: Aggregation
        UseCase->>UseCase: Calculate Summary<br/>- Sum income<br/>- Sum expenses<br/>- Calculate net flow<br/>- Calculate savings rate
        
        UseCase->>UseCase: Build Monthly Trend<br/>- Convert UTC → Local<br/>- Group by month<br/>- Aggregate per month
        
        UseCase->>DB: JOIN categories<br/>GROUP BY category_id
        DB-->>UseCase: Category breakdown
        
        UseCase->>DB: SELECT TOP 5<br/>ORDER BY date DESC
        DB-->>UseCase: Recent transactions
    end
    
    UseCase-->>Controller: DashboardResponseDTO
    Controller-->>Mobile: 200 OK<br/>{summary: {income, expenses,<br/>balance, netFlow, savingsRate},<br/>monthlyTrend: [],<br/>categoryBreakdown: [],<br/>recentTransactions: []}
```

---

### 4. Budget Management Flow

```mermaid
sequenceDiagram
    participant Mobile as Mobile App
    participant Controller as BudgetController
    participant Upsert as UpsertBudgetUseCase
    participant Summary as GetBudgetSummaryUseCase
    participant DB as Database

    rect rgb(240, 248, 255)
        Note over Mobile,DB: Create/Update Budget
        Mobile->>Controller: POST /budgets<br/>{categoryId, amount,<br/>month: 4, year: 2026}
        
        Controller->>Upsert: execute(userId, request)
        
        Upsert->>DB: SELECT budget<br/>WHERE user_id = ?<br/>AND category_id = ?<br/>AND month = ? AND year = ?
        DB-->>Upsert: existing budget or null
        
        alt Budget exists
            Upsert->>DB: UPDATE budget<br/>SET amount = ?
        else Budget not exists
            Upsert->>DB: INSERT budget
        end
        
        DB-->>Upsert: budget saved
        Upsert-->>Controller: Budget
        Controller-->>Mobile: 200 OK<br/>{id, categoryId, amount,<br/>month, year}
    end
    
    rect rgb(255, 250, 240)
        Note over Mobile,DB: Get Budget Summary
        Mobile->>Controller: GET /budgets<br/>?month=4&year=2026
        
        Controller->>Summary: execute(userId, month, year)
        
        Summary->>DB: SELECT * FROM budgets<br/>WHERE user_id = ?<br/>AND month = ? AND year = ?
        DB-->>Summary: List<Budget>
        
        loop For each budget
            Summary->>DB: SELECT SUM(amount)<br/>FROM transactions<br/>WHERE category_id = ?<br/>AND month = ?<br/>AND type = EXPENSE
            DB-->>Summary: spentAmount
            
            Summary->>Summary: Calculate percentage<br/>= (spent / budget) * 100<br/>Calculate remaining<br/>= budget - spent
        end
    end
    
    Summary-->>Controller: List<BudgetResponse>
    Controller-->>Mobile: 200 OK<br/>[{categoryId, categoryName,<br/>budgetAmount, spentAmount,<br/>percentage, remaining}]
```

---

## System Architecture Overview

```mermaid
graph TB
    subgraph "Presentation Layer"
        A[REST Controllers]
        B[DTOs]
        C[Security/JWT]
    end
    
    subgraph "Application Layer"
        D[Use Cases]
        E[Services]
        F[Mappers]
    end
    
    subgraph "Domain Layer"
        G[Entities]
        H[Value Objects]
        I[Repository Interfaces]
        J[Domain Services]
    end
    
    subgraph "Infrastructure Layer"
        K[JPA Repositories]
        L[External APIs]
        M[Storage Service]
    end
    
    A --> D
    B --> D
    C --> A
    D --> E
    D --> F
    D --> G
    D --> I
    G --> H
    I --> K
    E --> L
    E --> M
    K --> N[(MySQL Database)]
    L --> O[AI/OCR Service]
    M --> P[File Storage]
    
    style A fill:#e1f5ff
    style D fill:#fff4e1
    style G fill:#e8f5e9
    style K fill:#fce4ec
```

---

## Intelligence Layer Architecture

```mermaid
graph LR
    A[Receipt Upload] --> B{OCR Processing}
    B --> C[AI Prediction]
    C --> D{Category Mapping}
    
    D --> E{Check User History}
    E -->|Has History| F[Priority 1:<br/>User Preference]
    E -->|No History| G[Priority 2:<br/>AI Prediction]
    
    F --> H[Apply Category]
    G --> I{NLP Label Exists?}
    I -->|Yes| H
    I -->|No| J[Fallback Mapping]
    J --> H
    
    H --> K[User Confirms]
    K --> L[Learn Preference]
    L --> M[(merchant_preferences)]
    
    M -.->|Next Time| E
    
    style F fill:#90EE90
    style G fill:#FFD700
    style J fill:#FFA500
    style L fill:#87CEEB
```

---

## Database Schema (Post-Optimization)

```mermaid
erDiagram
    USERS ||--o{ WALLETS : owns
    USERS ||--o{ RECEIPTS : uploads
    USERS ||--o{ BUDGETS : creates
    USERS ||--o{ MERCHANT_PREFERENCES : has
    
    WALLETS ||--o{ TRANSACTIONS : contains
    CATEGORIES ||--o{ TRANSACTIONS : categorizes
    CATEGORIES ||--o{ BUDGETS : tracks
    
    RECEIPTS ||--o| TRANSACTIONS : confirms_to
    RECEIPTS }o--|| CATEGORIES : suggests
    
    USERS {
        string id PK
        string username
        string email
        string password
        datetime created_at
    }
    
    WALLETS {
        string id PK
        string user_id FK
        string name
        decimal balance
        decimal initial_balance
        enum wallet_type
        datetime created_at
        datetime updated_at
    }
    
    TRANSACTIONS {
        string id PK
        string wallet_id FK
        string category_id FK
        decimal amount
        enum type
        string description
        string receipt_image_url
        datetime transaction_date
        datetime created_at
    }
    
    CATEGORIES {
        string id PK
        string name
        enum type
        string icon_name
        string nlp_label
        datetime created_at
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
        enum status
        string transaction_id FK
        double confidence
        double ai_confidence
        string category_id FK
        string ai_category_id
        boolean is_corrected
        boolean is_mapped_from_history
        text correction_reason
        text raw_ocr_text
        datetime created_at
        datetime updated_at
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
    
    MERCHANT_PREFERENCES {
        string id PK
        string user_id FK
        string normalized_pattern
        string category_id FK
        datetime last_used_at
    }
```

---

## Data Flow Principles

```mermaid
graph TD
    A[User Input<br/>Local Timezone] --> B[Application Layer]
    B --> C{Operation Type}
    
    C -->|Write| D[Convert to UTC]
    D --> E[(Database<br/>UTC Storage)]
    
    C -->|Read| F[Query UTC Data]
    E --> F
    F --> G[Convert to User TZ]
    G --> H[Display to User]
    
    I[Transaction Operations] --> J{@Transactional}
    J --> K[Update Transaction]
    J --> L[Update Wallet]
    K --> M{Commit or Rollback}
    L --> M
    M -->|Success| N[Both Saved]
    M -->|Failure| O[Both Rolled Back]
    
    style D fill:#FFE4B5
    style G fill:#E0FFE0
    style M fill:#FFB6C1
```

---

## Mobile App Integration Pattern

```mermaid
sequenceDiagram
    participant App as Mobile App
    participant API as Backend API
    participant Worker as Background Worker
    
    rect rgb(240, 248, 255)
        Note over App,Worker: Polling Pattern (OCR)
        App->>API: Upload Receipt
        API-->>App: 202 Accepted<br/>{id, status: PENDING}
        
        loop Poll every 2s (max 30s)
            App->>API: GET /receipts/{id}
            API-->>App: {status: PENDING/PROCESSED}
            
            alt Status = PROCESSED
                Note over App: Stop polling<br/>Show review screen
            else Status = FAILED
                Note over App: Stop polling<br/>Show error
            else Timeout (30s)
                Note over App: Stop polling<br/>Show timeout error
            end
        end
    end
    
    rect rgb(255, 250, 240)
        Note over App,API: Real-time Dashboard
        App->>API: GET /dashboard/summary
        API-->>App: Aggregated data
        
        Note over App: Refresh triggers:<br/>- App foreground<br/>- Pull to refresh<br/>- After transaction<br/>- After confirmation
    end
```

---

## Key Features Summary

### 1. Timezone Management
- **Input**: User's local timezone
- **Storage**: UTC in database
- **Display**: Convert back to user timezone
- **Aggregation**: Group by local time for accurate monthly reports

### 2. Transaction Integrity
- `@Transactional` annotation ensures atomicity
- Wallet balance + Transaction creation in single DB transaction
- Automatic rollback on any failure

### 3. Async Processing
- OCR processing runs in background (`@Async`)
- Non-blocking upload (202 Accepted)
- Mobile polls for completion

### 4. Intelligence Layer
- **Priority 1**: User confirmation history (merchant_preferences)
- **Priority 2**: AI category prediction
- **Fallback**: Smart category mapping
- **Learning**: Every confirmation updates preferences

### 5. Security
- JWT authentication on all endpoints
- User ownership validation
- Resource-level authorization

---

**Generated**: 2026-04-15  
**Version**: 2.0 (Mermaid Charts)  
**Status**: Post Schema Optimization ✅
