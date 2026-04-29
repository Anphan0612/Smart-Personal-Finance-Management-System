# Phân Tích Tổng Thể Kiến Trúc Dự án
# Smart Personal Finance Management System

**Ngày phân tích**: 2026-04-25  
**Phạm vi**: Toàn bộ hệ thống (Backend, Mobile, AI Service, Infrastructure)

---

## 1. TỔNG QUAN HỆ THỐNG

### 1.1 Mô Hình Kiến Trúc Tổng Thể

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE LAYER                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   Mobile App (React Native + Expo)                   │  │
│  │   - iOS/Android Cross-platform                       │  │
│  │   - Expo Router (File-based routing)                 │  │
│  │   - NativeWind (Tailwind CSS)                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   Backend API (Spring Boot 3)                        │  │
│  │   - REST Controllers                                 │  │
│  │   - JWT Authentication                               │  │
│  │   - Business Logic (Use Cases)                       │  │
│  │   - Clean Architecture                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↓                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   AI Service (FastAPI)                               │  │
│  │   - NLP Processing                                   │  │
│  │   - OCR (Receipt scanning)                           │  │
│  │   - Groq LLM Integration                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   MySQL Database                                     │  │
│  │   - Users, Wallets, Transactions                     │  │
│  │   - Categories, Budgets                              │  │
│  │   - AI Processing History                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Đặc Điểm Kiến Trúc

- **Microservices-oriented**: Backend và AI Service tách biệt
- **Clean Architecture**: Áp dụng ở cả Backend (Java) và Mobile (TypeScript)
- **API-First**: RESTful API làm trung tâm giao tiếp
- **Event-Driven**: Sử dụng async processing cho AI tasks
- **Mobile-First**: Ưu tiên trải nghiệm mobile native

---

## 2. BACKEND ARCHITECTURE (Spring Boot)

### 2.1 Cấu Trúc Thư Mục

```
backend/src/main/java/com/example/smartmoneytracking/
├── application/              # Application Layer
│   ├── dto/                  # Data Transfer Objects
│   ├── mapper/               # DTO ↔ Entity mappers
│   ├── service/              # Application services
│   └── usecase/              # Use case implementations
│       └── impl/
├── domain/                   # Domain Layer (Core Business Logic)
│   ├── entities/             # Domain entities (User, Wallet, Transaction)
│   ├── repositories/         # Repository interfaces
│   ├── service/              # Domain services
│   └── exception/            # Domain exceptions
└── infrastructure/           # Infrastructure Layer
    ├── controllers/          # REST API endpoints
    ├── persistence/          # JPA implementations
    ├── security/             # Security config (JWT, filters)
    ├── ai/                   # AI service client
    ├── config/               # Spring configurations
    ├── exception/            # Global exception handlers
    └── service/              # Infrastructure services
```

### 2.2 Clean Architecture Implementation

**Dependency Rule**: Dependencies chỉ trỏ vào trong

```
Infrastructure → Application → Domain
     ↓               ↓            ↑
Controllers    Use Cases    Entities
Persistence    Services     Repositories (interfaces)
Security       DTOs         Domain Services
AI Client      Mappers      Exceptions
```

### 2.3 Các Layer Chi Tiết

#### Domain Layer (Lõi nghiệp vụ)
- **Entities**: `User`, `Wallet`, `Transaction`, `Category`, `Budget`
- **Repository Interfaces**: Định nghĩa contract cho data access
- **Domain Services**: Business logic phức tạp (tính toán, validation)
- **Exceptions**: Business rule violations

**Đặc điểm**:
- Không phụ thuộc vào framework
- Chứa business rules thuần túy
- Testable độc lập

#### Application Layer (Orchestration)
- **Use Cases**: `DashboardUseCase`, `TransactionUseCase`, `BudgetUseCase`
- **DTOs**: Request/Response objects cho API
- **Mappers**: Chuyển đổi giữa Entity và DTO
- **Application Services**: Điều phối use cases

**Đặc điểm**:
- Orchestrate domain logic
- Không chứa business rules
- Gọi domain services và repositories

#### Infrastructure Layer (Technical Details)
- **Controllers**: REST endpoints (`@RestController`)
- **Persistence**: JPA repositories implementation
- **Security**: JWT authentication, authorization
- **AI Client**: HTTP client gọi AI service
- **Config**: Spring Boot configurations

**Đặc điểm**:
- Framework-specific code
- External integrations
- Technical implementations

### 2.4 Security Architecture

```
Request → SecurityFilterChain
            ↓
       JwtAuthenticationFilter
            ↓
       Extract & Validate JWT
            ↓
       Set SecurityContext
            ↓
       Controller (with @PreAuthorize)
```

**Components**:
- `JwtAuthenticationFilter`: Validate JWT từ header
- `SecurityConfig`: Configure security rules
- `JwtService`: Generate/validate tokens
- `UserDetailsService`: Load user for authentication

### 2.5 API Design Patterns

**Endpoint Structure**:
```
/api/v1/
├── auth/                    # Authentication
│   ├── POST /register
│   ├── POST /login
│   └── POST /refresh-token
├── wallets/                 # Wallet management
│   ├── GET /
│   ├── POST /
│   ├── GET /{id}
│   ├── PUT /{id}
│   └── DELETE /{id}
├── transactions/            # Transaction management
│   ├── GET /
│   ├── POST /
│   ├── GET /{id}
│   ├── PUT /{id}
│   └── DELETE /{id}
├── categories/              # Category management
├── budgets/                 # Budget management
├── dashboard/               # Dashboard analytics
└── ai/                      # AI-powered features
    ├── POST /extract-transaction
    └── POST /query-history
```

**Response Format** (Standardized):
```json
{
  "success": true,
  "code": 200,
  "message": "Success",
  "data": { ... },
  "timestamp": "2026-04-25T08:12:26.994Z",
  "traceId": "uuid",
  "path": "/api/v1/transactions"
}
```

### 2.6 Data Flow Example (Create Transaction)

```
1. Client → POST /api/v1/transactions
2. JwtAuthenticationFilter → Validate token
3. TransactionController → Receive request
4. TransactionMapper → DTO → Entity
5. TransactionUseCase → Business logic
6. TransactionRepository → Save to DB
7. TransactionMapper → Entity → DTO
8. Controller → Return ApiResponse<TransactionResponse>
```

---

## 3. MOBILE ARCHITECTURE (React Native + Expo)

### 3.1 Cấu Trúc Thư Mục

```
mobile/
├── app/                      # Expo Router (File-based routing)
│   ├── (auth)/               # Auth screens group
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── welcome.tsx
│   ├── (tabs)/               # Main app tabs
│   │   ├── _layout.tsx
│   │   ├── index.tsx         # Dashboard
│   │   ├── transactions.tsx
│   │   ├── budgets.tsx
│   │   ├── analytics.tsx
│   │   └── profile.tsx
│   ├── _layout.tsx           # Root layout
│   └── +not-found.tsx
├── src/
│   ├── domain/               # Domain Layer (NEW - Clean Architecture)
│   │   ├── entities/         # Domain entities
│   │   ├── repositories/     # Repository interfaces
│   │   ├── specifications/   # Validation rules
│   │   └── usecases/         # Business logic
│   ├── infrastructure/       # Infrastructure Layer (NEW)
│   │   ├── repositories/     # API implementations
│   │   └── mappers/          # DTO ↔ Entity mappers
│   ├── features/             # Feature modules
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── transactions/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── presentation/ # Presentation mappers (NEW)
│   │   │   └── TransactionsScreen.tsx
│   │   ├── budgets/
│   │   ├── analytics/
│   │   ├── profile/
│   │   ├── receipt/          # OCR receipt scanning
│   │   └── atelier-ai/       # AI chat interface
│   ├── components/           # Shared components
│   │   ├── ui/               # Design system components
│   │   ├── common/
│   │   └── atelier/
│   ├── hooks/                # Shared hooks
│   ├── services/             # API client
│   ├── store/                # Zustand state management
│   ├── types/                # TypeScript types
│   ├── utils/                # Utilities
│   └── constants/            # Constants & tokens
└── assets/                   # Images, fonts, etc.
```

### 3.2 Clean Architecture Implementation (Mobile)

**Mới được refactor (2026-04-25)** - Áp dụng cho Transactions feature:

```
Presentation Layer (UI)
    ↓
Use Cases (Business Logic)
    ↓
Repository Interface (Contract)
    ↑
Infrastructure (API Implementation)
```

**Dependency Flow**:
```
TransactionsScreen.tsx
    ↓ uses
TransactionPresentationMapper (grouping, filtering)
    ↓ uses
useTransactions hook (TanStack Query adapter)
    ↓ uses
GetTransactionsUseCase / AddTransactionUseCase
    ↓ uses
TransactionRepository interface
    ↑ implemented by
ApiTransactionRepository
    ↓ uses
apiClient (Axios)
```

### 3.3 State Management Strategy

**Zustand** (Global State):
- Authentication state (token, user)
- Active wallet selection
- App-level settings

**TanStack Query** (Server State):
- API data caching
- Infinite scroll pagination
- Optimistic updates
- Background refetching

**Local State** (React useState):
- UI state (modals, sheets)
- Form inputs
- Temporary selections

### 3.4 Data Flow Example (Fetch Transactions)

```
1. TransactionsScreen renders
2. useTransactions(walletId) hook called
3. TanStack Query checks cache
4. If stale → GetTransactionsUseCase.execute()
5. UseCase → ApiTransactionRepository.getTransactions()
6. Repository → HTTP GET /api/v1/transactions
7. Response → TransactionMapper.toDomainList()
8. Domain entities → TransactionPresentationMapper.groupByDate()
9. Grouped data → UI renders
```

### 3.5 Feature Architecture Pattern

Mỗi feature module theo cấu trúc:

```
features/[feature-name]/
├── components/              # Feature-specific components
├── hooks/                   # Feature-specific hooks
├── presentation/            # Presentation logic (NEW)
├── [Feature]Screen.tsx      # Main screen component
└── types.ts                 # Feature types
```

**Example: Transactions Feature**

```typescript
// Domain Layer
Transaction.ts              // Rich entity with methods
TransactionValidator.ts     // Validation specs
TransactionRepository.ts    // Interface
GetTransactionsUseCase.ts   // Business logic

// Infrastructure Layer
ApiTransactionRepository.ts // API implementation
TransactionMapper.ts        // DTO ↔ Entity

// Presentation Layer
TransactionPresentationMapper.ts  // UI transformations
useTransactions.ts          // TanStack Query hook
TransactionsScreen.tsx      // Pure UI component
```

### 3.6 UI Architecture (Atelier Design System)

**Component Hierarchy**:
```
AtelierCard
AtelierTypography
AtelierButton
AtelierSheet
AtelierActionSheet
AtelierTransactionCard
AtelierSpendingSummary
AtelierInsightChart
```

**Design Tokens**:
- Colors (primary, secondary, neutral, error, success)
- Typography (h1, h2, h3, body, caption, label)
- Spacing (xs, sm, md, lg, xl)
- Elevation (lowest, low, high)
- Border radius (sm, md, lg, xl)

**Animation**: Moti library cho smooth transitions

---

## 4. AI SERVICE ARCHITECTURE (FastAPI)

### 4.1 Cấu Trúc Dự Kiến

```
ai-service/
├── app/
│   ├── api/                 # API endpoints
│   │   ├── v1/
│   │   │   ├── nlp.py       # NLP endpoints
│   │   │   └── ocr.py       # OCR endpoints
│   ├── core/                # Core logic
│   │   ├── config.py
│   │   └── security.py
│   ├── services/            # Business logic
│   │   ├── nlp_service.py
│   │   ├── ocr_service.py
│   │   └── groq_client.py
│   ├── models/              # Data models
│   └── utils/               # Utilities
├── requirements.txt
└── main.py
```

### 4.2 AI Processing Pipeline

**NLP Pipeline** (Transaction Extraction):
```
User Input (text)
    ↓
Groq LLM (Prompt Engineering)
    ↓
Structured JSON Output
    ↓
Validation & Normalization
    ↓
Return to Backend
```

**OCR Pipeline** (Receipt Scanning):
```
Image Upload
    ↓
OCR Engine (Tesseract/Cloud Vision)
    ↓
Text Extraction
    ↓
NLP Processing (Groq)
    ↓
Structured Transaction Data
    ↓
Return to Backend
```

### 4.3 Integration với Backend

**Async Processing**:
```
Backend → POST /ai/extract-transaction
    ↓
AI Service → Process (async)
    ↓
Return 202 Accepted + taskId
    ↓
Backend polls or webhook
    ↓
AI Service → Return result
```

---

## 5. DATABASE ARCHITECTURE

### 5.1 Entity Relationship Diagram

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │ 1
       │
       │ N
┌──────┴──────┐
│   Wallet    │
└──────┬──────┘
       │ 1
       │
       │ N
┌──────┴──────────┐
│  Transaction    │
└──────┬──────────┘
       │ N
       │
       │ 1
┌──────┴──────┐
│  Category   │
└─────────────┘

┌─────────────┐
│   Budget    │
└──────┬──────┘
       │ N
       │
       │ 1
┌──────┴──────┐
│  Category   │
└─────────────┘
```

### 5.2 Core Tables

**users**
- id (PK)
- username (unique)
- email (unique)
- password_hash
- full_name
- phone
- cccd
- created_at
- updated_at

**wallets**
- id (PK)
- user_id (FK → users)
- name
- balance
- currency_code
- currency_symbol
- type (CASH, BANK, EWALLET, INVESTMENT)
- bank_name
- account_number
- branch
- created_at

**transactions**
- id (PK)
- wallet_id (FK → wallets)
- category_id (FK → categories)
- amount
- description
- type (INCOME, EXPENSE, TRANSFER)
- transaction_date
- created_at
- receipt_image_url
- is_ai_suggested

**categories**
- id (PK)
- name
- icon_name
- type (INCOME, EXPENSE)
- created_at

**budgets**
- id (PK)
- user_id (FK → users)
- category_id (FK → categories)
- limit_amount
- current_spending
- month
- year
- created_at

### 5.3 Indexing Strategy

**Performance Indexes**:
```sql
-- User lookups
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- Wallet queries
CREATE INDEX idx_wallets_user_id ON wallets(user_id);

-- Transaction queries (most frequent)
CREATE INDEX idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_wallet_date ON transactions(wallet_id, transaction_date);

-- Budget queries
CREATE INDEX idx_budgets_user_month_year ON budgets(user_id, month, year);
CREATE INDEX idx_budgets_category ON budgets(category_id);
```

---

## 6. INFRASTRUCTURE & DEVOPS

### 6.1 Deployment Architecture

**Docker Compose Setup**:
```yaml
services:
  mysql:
    image: mysql:8
    ports: 3306:3306
    volumes: ./data/mysql
    
  backend:
    build: ./backend
    ports: 8080:8080
    depends_on: mysql
    
  ai-service:
    build: ./ai-service
    ports: 8000:8000
    
  mobile:
    # Development only (Expo)
```

### 6.2 CI/CD Pipeline

**GitHub Actions Workflows**:

```
.github/workflows/
├── ci-backend.yml           # Backend tests & build
├── ci-mobile.yml            # Mobile tests & build
└── ci-ai-service.yml        # AI service tests
```

**Pipeline Stages**:
1. **Lint**: Code quality checks
2. **Test**: Unit & integration tests
3. **Build**: Compile & package
4. **Deploy**: (Future) Deploy to staging/production

### 6.3 Environment Configuration

**Backend** (application.yml):
```yaml
spring:
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:dev}
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
jwt:
  secret: ${JWT_SECRET}
  expiration: ${JWT_EXPIRATION}
ai:
  service:
    url: ${AI_SERVICE_URL}
```

**Mobile** (.env):
```
EXPO_PUBLIC_API_URL=http://192.168.1.x:8080/api/v1
EXPO_PUBLIC_AI_SERVICE_URL=http://192.168.1.x:8000
```

**AI Service** (.env):
```
GROQ_API_KEY=xxx
BACKEND_API_URL=http://backend:8080
```

---

## 7. ĐÁNH GIÁ KIẾN TRÚC

### 7.1 Điểm Mạnh

#### ✅ Separation of Concerns
- Backend: Clean Architecture rõ ràng (Domain, Application, Infrastructure)
- Mobile: Đang chuyển sang Clean Architecture (Transactions đã hoàn thành)
- Mỗi layer có trách nhiệm riêng biệt

#### ✅ Scalability
- Microservices-oriented (Backend + AI Service tách biệt)
- Stateless API (JWT authentication)
- Horizontal scaling ready

#### ✅ Maintainability
- Code organization rõ ràng theo feature
- Dependency injection (Spring, React hooks)
- Type safety (Java, TypeScript)

#### ✅ Testability
- Domain logic tách biệt khỏi framework
- Repository pattern cho mocking
- Use cases testable độc lập

#### ✅ Security
- JWT authentication
- Spring Security integration
- Input validation ở nhiều layer

#### ✅ Developer Experience
- Hot reload (Expo, Spring DevTools)
- Type safety (TypeScript, Java)
- Clear project structure

### 7.2 Điểm Yếu & Cần Cải Thiện

#### ⚠️ Inconsistent Architecture
**Vấn đề**: Mobile chỉ mới refactor Transactions sang Clean Architecture
**Ảnh hưởng**: 
- Code inconsistency giữa các features
- Technical debt tích lũy
- Khó maintain

**Giải pháp**:
- Refactor các features còn lại (Dashboard, Budget, Analytics, Profile)
- Áp dụng cùng pattern: Domain → Use Cases → Repository → Infrastructure

#### ⚠️ State Management Complexity
**Vấn đề**: Zustand + TanStack Query + Local State
**Ảnh hưởng**:
- Khó trace data flow
- Potential state sync issues

**Giải pháp**:
- Document rõ state management strategy
- Định nghĩa clear boundaries cho mỗi loại state

#### ⚠️ Error Handling
**Vấn đề**: Error handling chưa consistent
**Ảnh hưởng**:
- User experience không tốt khi có lỗi
- Khó debug

**Giải pháp**:
- Standardize error response format
- Implement global error boundary (Mobile)
- Centralized error logging

#### ⚠️ API Versioning
**Vấn đề**: Chỉ có v1, chưa có strategy cho breaking changes
**Ảnh hưởng**:
- Khó maintain backward compatibility

**Giải pháp**:
- Plan API versioning strategy
- Document deprecation policy

#### ⚠️ Testing Coverage
**Vấn đề**: Test coverage chưa đầy đủ
**Ảnh hưởng**:
- Regression risks
- Refactoring confidence thấp

**Giải pháp**:
- Unit tests cho domain logic
- Integration tests cho API
- E2E tests cho critical flows

#### ⚠️ Documentation
**Vấn đề**: API documentation chưa đầy đủ
**Ảnh hưởng**:
- Onboarding khó khăn
- Frontend-Backend integration friction

**Giải pháp**:
- Swagger/OpenAPI documentation
- Architecture Decision Records (ADRs)
- Code comments cho complex logic

#### ⚠️ Performance Monitoring
**Vấn đề**: Chưa có monitoring & observability
**Ảnh hưởng**:
- Khó detect performance issues
- No visibility vào production

**Giải pháp**:
- Application Performance Monitoring (APM)
- Logging aggregation
- Metrics & alerting

### 7.3 Technical Debt

**High Priority**:
1. Refactor remaining mobile features to Clean Architecture
2. Implement comprehensive error handling
3. Add unit tests for domain logic

**Medium Priority**:
4. API documentation (Swagger)
5. Performance monitoring setup
6. CI/CD pipeline completion

**Low Priority**:
7. Code style consistency
8. Refactor legacy code
9. Optimize bundle size

---

## 8. ROADMAP KIẾN TRÚC

### Phase 1: Consolidation (Q2 2026) ✅ In Progress
- [x] Mobile Clean Architecture cho Transactions
- [ ] Mobile Clean Architecture cho Dashboard
- [ ] Mobile Clean Architecture cho Budget
- [ ] Standardize error handling

### Phase 2: Quality (Q3 2026)
- [ ] Unit test coverage > 70%
- [ ] Integration tests cho critical APIs
- [ ] E2E tests cho main flows
- [ ] API documentation (Swagger)

### Phase 3: Observability (Q4 2026)
- [ ] APM integration
- [ ] Centralized logging
- [ ] Metrics & dashboards
- [ ] Alerting setup

### Phase 4: Optimization (Q1 2027)
- [ ] Performance optimization
- [ ] Database query optimization
- [ ] Mobile bundle size reduction
- [ ] Caching strategy

---

## 9. KẾT LUẬN

### 9.1 Tổng Quan

Smart Personal Finance Management System có **kiến trúc tốt** với:
- Clean Architecture principles
- Clear separation of concerns
- Scalable microservices design
- Modern tech stack

### 9.2 Điểm Nổi Bật

1. **Backend**: Clean Architecture implementation xuất sắc
2. **Mobile**: Đang chuyển đổi sang Clean Architecture (progress tốt)
3. **AI Integration**: Tách biệt service, dễ scale
4. **Security**: JWT authentication solid

### 9.3 Ưu Tiên Cải Thiện

**Ngắn hạn** (1-3 tháng):
1. Hoàn thành Clean Architecture refactor cho Mobile
2. Implement error handling strategy
3. Add unit tests

**Trung hạn** (3-6 tháng):
4. API documentation
5. Performance monitoring
6. Integration tests

**Dài hạn** (6-12 tháng):
7. Optimization
8. Advanced features
9. Production hardening

### 9.4 Đánh Giá Cuối Cùng

**Architecture Score**: 8/10

**Strengths**:
- ✅ Solid foundation
- ✅ Modern patterns
- ✅ Scalable design

**Areas for Improvement**:
- ⚠️ Consistency across codebase
- ⚠️ Testing coverage
- ⚠️ Documentation

**Recommendation**: Tiếp tục refactor Mobile theo Clean Architecture pattern, sau đó focus vào testing và documentation.
