# Smart Personal Finance Management System - E2E Data Flow

## Core Features Data Flow Diagrams

### 1. OCR Receipt Processing Flow (Async)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         OCR RECEIPT PROCESSING FLOW                          │
└─────────────────────────────────────────────────────────────────────────────┘

Mobile App                Controller              Service Layer           External AI        Database
    │                         │                         │                      │                │
    │  POST /receipts/upload  │                         │                      │                │
    ├────────────────────────>│                         │                      │                │
    │  (MultipartFile)        │                         │                      │                │
    │                         │                         │                      │                │
    │                         │  1. Store Image         │                      │                │
    │                         ├────────────────────────>│                      │                │
    │                         │  StorageService.store() │                      │                │
    │                         │<────────────────────────┤                      │                │
    │                         │  fileUrl                │                      │                │
    │                         │                         │                      │                │
    │                         │  2. Create Receipt      │                      │                │
    │                         │  (PENDING status)       │                      │   INSERT       │
    │                         ├─────────────────────────┼──────────────────────┼───────────────>│
    │                         │                         │                      │                │
    │  202 ACCEPTED           │                         │                      │                │
    │<────────────────────────┤                         │                      │                │
    │  {id, status: PENDING}  │                         │                      │                │
    │                         │                         │                      │                │
    │                         │  3. Trigger Async OCR   │                      │                │
    │                         ├────────────────────────>│                      │                │
    │                         │  @Async processOcrAsync()                      │                │
    │                         │                         │                      │                │
    │                         │                         │  4. Call AI OCR      │                │
    │                         │                         ├─────────────────────>│                │
    │                         │                         │  extractReceiptData()│                │
    │                         │                         │                      │                │
    │                         │                         │  5. AI Response      │                │
    │                         │                         │<─────────────────────┤                │
    │                         │                         │  {store_name,        │                │
    │                         │                         │   amount,            │                │
    │                         │                         │   date,              │                │
    │                         │                         │   category_id,       │                │
    │                         │                         │   confidence}        │                │
    │                         │                         │                      │                │
    │                         │                         │  6. Intelligence Layer: Merchant Mapping
    │                         │                         ├──────────────────────┼───────────────>│
    │                         │                         │  Query merchant_preferences           │
    │                         │                         │  findPreferredCategoryId()            │
    │                         │                         │<──────────────────────────────────────┤
    │                         │                         │  Priority 1: User History            │
    │                         │                         │  Priority 2: AI Prediction           │
    │                         │                         │                      │                │
    │                         │                         │  7. Update Receipt   │                │
    │                         │                         │  (PROCESSED status)  │   UPDATE       │
    │                         │                         ├──────────────────────┼───────────────>│
    │                         │                         │                      │                │
    │  GET /receipts/{id}     │                         │                      │                │
    │  (Polling)              │                         │                      │                │
    ├────────────────────────>│                         │                      │                │
    │                         ├─────────────────────────┼──────────────────────┼───────────────>│
    │                         │                         │                      │   SELECT       │
    │  200 OK                 │<────────────────────────┼──────────────────────┼────────────────┤
    │<────────────────────────┤                         │                      │                │
    │  {status: PROCESSED,    │                         │                      │                │
    │   storeName,            │                         │                      │                │
    │   amount,               │                         │                      │                │
    │   categoryId,           │                         │                      │                │
    │   isMappedFromHistory}  │                         │                      │                │
    │                         │                         │                      │                │
    │  POST /receipts/{id}/   │                         │                      │                │
    │       confirm           │                         │                      │                │
    ├────────────────────────>│                         │                      │                │
    │  {walletId,             │                         │                      │                │
    │   categoryId,           │  8. Create Transaction  │                      │                │
    │   amount,               ├────────────────────────>│                      │                │
    │   storeName}            │  CreateTransactionUseCase                      │                │
    │                         │                         │                      │                │
    │                         │                         │  9. Update Wallet    │   UPDATE       │
    │                         │                         ├──────────────────────┼───────────────>│
    │                         │                         │  wallet.withdraw()   │                │
    │                         │                         │                      │                │
    │                         │                         │  10. Save Transaction│   INSERT       │
    │                         │                         ├──────────────────────┼───────────────>│
    │                         │                         │                      │                │
    │                         │                         │  11. Learn Preference│   UPSERT       │
    │                         │                         ├──────────────────────┼───────────────>│
    │                         │                         │  merchantMappingService              │
    │                         │                         │  .upsertPreference() │                │
    │                         │                         │                      │                │
    │                         │                         │  12. Confirm Receipt │   UPDATE       │
    │                         │                         ├──────────────────────┼───────────────>│
    │                         │                         │  (CONFIRMED status)  │                │
    │  200 OK                 │<────────────────────────┤                      │                │
    │<────────────────────────┤                         │                      │                │
    │  {transactionId}        │                         │                      │                │
    │                         │                         │                      │                │

Key Intelligence Features:
- Priority 1: User confirmation history (merchant_preferences table)
- Priority 2: AI category prediction with NLP label mapping
- Fallback: Smart category mapping for unmapped labels
- Implicit learning: Every confirmation updates merchant preferences
```

---

### 2. Manual Transaction Creation Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      MANUAL TRANSACTION CREATION FLOW                        │
└─────────────────────────────────────────────────────────────────────────────┘

Mobile App            Controller              UseCase                Database
    │                     │                       │                      │
    │  POST /transactions │                       │                      │
    ├────────────────────>│                       │                      │
    │  {walletId,         │                       │                      │
    │   categoryId,       │                       │                      │
    │   amount,           │                       │                      │
    │   type: EXPENSE,    │                       │                      │
    │   description,      │                       │                      │
    │   transactionDate}  │                       │                      │
    │                     │                       │                      │
    │                     │  1. Validate Wallet   │                      │
    │                     ├──────────────────────>│                      │
    │                     │  CreateTransactionUseCase                    │
    │                     │                       ├─────────────────────>│
    │                     │                       │  SELECT wallet       │
    │                     │                       │  WHERE id = ?        │
    │                     │                       │  AND user_id = ?     │
    │                     │                       │<─────────────────────┤
    │                     │                       │                      │
    │                     │                       │  2. Validate Category│
    │                     │                       ├─────────────────────>│
    │                     │                       │  SELECT category     │
    │                     │                       │<─────────────────────┤
    │                     │                       │                      │
    │                     │                       │  3. Create Transaction
    │                     │                       │  Transaction.create()│
    │                     │                       │  - Convert timezone  │
    │                     │                       │  - Validate amount   │
    │                     │                       │                      │
    │                     │                       │  4. Update Wallet    │
    │                     │                       │  wallet.withdraw()   │
    │                     │                       │  OR wallet.deposit() │
    │                     │                       │                      │
    │                     │                       │  5. Save (Transaction)
    │                     │                       ├─────────────────────>│
    │                     │                       │  @Transactional      │
    │                     │                       │  INSERT transaction  │
    │                     │                       │  UPDATE wallet       │
    │                     │                       │<─────────────────────┤
    │                     │<──────────────────────┤                      │
    │  201 CREATED        │                       │                      │
    │<────────────────────┤                       │                      │
    │  {id,               │                       │                      │
    │   walletId,         │                       │                      │
    │   categoryId,       │                       │                      │
    │   amount,           │                       │                      │
    │   type,             │                       │                      │
    │   transactionDate,  │                       │                      │
    │   createdAt}        │                       │                      │
    │                     │                       │                      │

Key Features:
- Timezone-aware: Local time → UTC storage
- Atomic operation: Transaction + Wallet update in single DB transaction
- Domain validation: Business rules enforced in entity layer
- Authorization: Wallet ownership verified before operation
```

---

### 3. Dashboard Summary Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DASHBOARD SUMMARY FLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

Mobile App            Controller              UseCase                Database
    │                     │                       │                      │
    │  GET /dashboard/    │                       │                      │
    │      summary        │                       │                      │
    ├────────────────────>│                       │                      │
    │  ?walletId=xxx      │                       │                      │
    │  &timeRange=        │                       │                      │
    │   current_month     │                       │                      │
    │                     │                       │                      │
    │                     │  1. Calculate Range   │                      │
    │                     ├──────────────────────>│                      │
    │                     │  DashboardUseCaseImpl │                      │
    │                     │                       │  - Get user timezone │
    │                     │                       │  - Calculate start   │
    │                     │                       │  - Convert to UTC    │
    │                     │                       │                      │
    │                     │                       │  2. Query Transactions
    │                     │                       ├─────────────────────>│
    │                     │                       │  SELECT *            │
    │                     │                       │  FROM transactions   │
    │                     │                       │  WHERE wallet_id = ? │
    │                     │                       │  AND transaction_date│
    │                     │                       │  BETWEEN ? AND ?     │
    │                     │                       │<─────────────────────┤
    │                     │                       │                      │
    │                     │                       │  3. Aggregate Data   │
    │                     │                       │  - Sum income        │
    │                     │                       │  - Sum expenses      │
    │                     │                       │  - Calculate net flow│
    │                     │                       │  - Calculate savings │
    │                     │                       │                      │
    │                     │                       │  4. Group by Month   │
    │                     │                       │  - Convert UTC → Local
    │                     │                       │  - Group by month    │
    │                     │                       │  - Build trend data  │
    │                     │                       │                      │
    │                     │                       │  5. Category Breakdown
    │                     │                       ├─────────────────────>│
    │                     │                       │  JOIN categories     │
    │                     │                       │  GROUP BY category_id│
    │                     │                       │<─────────────────────┤
    │                     │                       │                      │
    │                     │                       │  6. Recent Transactions
    │                     │                       ├─────────────────────>│
    │                     │                       │  SELECT TOP 5        │
    │                     │                       │  ORDER BY date DESC  │
    │                     │                       │<─────────────────────┤
    │                     │<──────────────────────┤                      │
    │  200 OK             │                       │                      │
    │<────────────────────┤                       │                      │
    │  {summary: {        │                       │                      │
    │    income,          │                       │                      │
    │    expenses,        │                       │                      │
    │    balance,         │                       │                      │
    │    netFlow,         │                       │                      │
    │    savingsRate},    │                       │                      │
    │   monthlyTrend: [], │                       │                      │
    │   categoryBreakdown,│                       │                      │
    │   recentTransactions│                       │                      │
    │  }                  │                       │                      │
    │                     │                       │                      │

Key Features:
- Timezone-aware aggregation: UTC storage → Local grouping
- Multiple time ranges: current_month, last_3_months, last_6_months, current_year
- Real-time calculations: No pre-aggregated data
- Category breakdown with percentage
- Savings rate calculation
```

---

### 4. Budget Management Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BUDGET MANAGEMENT FLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

Mobile App            Controller              UseCase                Database
    │                     │                       │                      │
    │  POST /budgets      │                       │                      │
    ├────────────────────>│                       │                      │
    │  {categoryId,       │                       │                      │
    │   amount,           │                       │                      │
    │   month,            │                       │                      │
    │   year}             │                       │                      │
    │                     │                       │                      │
    │                     │  1. Upsert Budget     │                      │
    │                     ├──────────────────────>│                      │
    │                     │  UpsertBudgetUseCase  │                      │
    │                     │                       ├─────────────────────>│
    │                     │                       │  SELECT budget       │
    │                     │                       │  WHERE user_id = ?   │
    │                     │                       │  AND category_id = ? │
    │                     │                       │  AND month = ?       │
    │                     │                       │  AND year = ?        │
    │                     │                       │<─────────────────────┤
    │                     │                       │                      │
    │                     │                       │  INSERT or UPDATE    │
    │                     │                       ├─────────────────────>│
    │                     │<──────────────────────┤                      │
    │  200 OK             │                       │                      │
    │<────────────────────┤                       │                      │
    │                     │                       │                      │
    │  GET /budgets       │                       │                      │
    ├────────────────────>│                       │                      │
    │  ?month=4&year=2026 │                       │                      │
    │                     │                       │                      │
    │                     │  2. Get Summary       │                      │
    │                     ├──────────────────────>│                      │
    │                     │  GetBudgetSummaryUseCase                     │
    │                     │                       │                      │
    │                     │                       │  3. Query Budgets    │
    │                     │                       ├─────────────────────>│
    │                     │                       │  SELECT *            │
    │                     │                       │  FROM budgets        │
    │                     │                       │  WHERE user_id = ?   │
    │                     │                       │  AND month = ?       │
    │                     │                       │  AND year = ?        │
    │                     │                       │<─────────────────────┤
    │                     │                       │                      │
    │                     │                       │  4. Calculate Spent  │
    │                     │                       ├─────────────────────>│
    │                     │                       │  SELECT SUM(amount)  │
    │                     │                       │  FROM transactions   │
    │                     │                       │  WHERE category_id=? │
    │                     │                       │  AND month = ?       │
    │                     │                       │  AND type = EXPENSE  │
    │                     │                       │<─────────────────────┤
    │                     │                       │                      │
    │                     │                       │  5. Calculate %      │
    │                     │                       │  percentage =        │
    │                     │                       │  (spent/budget)*100  │
    │                     │                       │                      │
    │                     │<──────────────────────┤                      │
    │  200 OK             │                       │                      │
    │<────────────────────┤                       │                      │
    │  [{categoryId,      │                       │                      │
    │    categoryName,    │                       │                      │
    │    budgetAmount,    │                       │                      │
    │    spentAmount,     │                       │                      │
    │    percentage,      │                       │                      │
    │    remaining}]      │                       │                      │
    │                     │                       │                      │

Key Features:
- Upsert pattern: Create or update in single operation
- Real-time tracking: Spent amount calculated from transactions
- Percentage calculation: Visual progress indicator
- Category-level budgets: Granular control
- Monthly budgets: Time-bound tracking
```

---

## Architecture Patterns

### 1. Clean Architecture Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                          │
│  - Controllers (REST API endpoints)                             │
│  - DTOs (Request/Response)                                      │
│  - Security (JWT, Authorization)                                │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
│  - Use Cases (Business workflows)                               │
│  - Services (Cross-cutting concerns)                            │
│  - Mappers (DTO ↔ Entity conversion)                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                        DOMAIN LAYER                              │
│  - Entities (Business objects)                                  │
│  - Value Objects (Immutable types)                              │
│  - Repository Interfaces                                        │
│  - Domain Services                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                          │
│  - JPA Repositories (Data access)                               │
│  - External APIs (OCR, AI)                                      │
│  - Storage Service (File management)                            │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Data Flow Principles

1. **Timezone Management**
   - User input: Local timezone
   - Storage: UTC
   - Display: Convert back to user timezone
   - Aggregation: Group by local time

2. **Transaction Integrity**
   - `@Transactional` on use cases
   - Atomic wallet + transaction updates
   - Rollback on any failure

3. **Async Processing**
   - OCR processing: `@Async` annotation
   - Non-blocking upload response (202 Accepted)
   - Polling for status updates

4. **Intelligence Layer**
   - Priority 1: User confirmation history
   - Priority 2: AI predictions
   - Fallback: Smart category mapping
   - Implicit learning: Every action updates preferences

5. **Security**
   - JWT authentication on all endpoints
   - User ownership validation
   - Resource-level authorization

---

## Database Schema (Optimized - Post Cleanup)

```sql
-- Core Tables (snake_case columns only)

categories
  - id (PK)
  - name
  - type (INCOME/EXPENSE)
  - icon_name
  - nlp_label
  - created_at

wallets
  - id (PK)
  - user_id (FK)
  - name
  - balance
  - initial_balance
  - wallet_type
  - created_at
  - updated_at

transactions
  - id (PK)
  - wallet_id (FK)
  - category_id (FK)
  - amount
  - type (INCOME/EXPENSE/TRANSFER)
  - description
  - receipt_image_url
  - transaction_date
  - created_at

receipts
  - id (PK)
  - user_id (FK)
  - image_url
  - store_name
  - ai_store_name
  - amount
  - ai_amount
  - transaction_date
  - status (PENDING/PROCESSED/CONFIRMED/FAILED)
  - transaction_id (FK)
  - confidence
  - ai_confidence
  - category_id (FK)
  - ai_category_id
  - is_corrected
  - is_mapped_from_history
  - correction_reason
  - raw_ocr_text
  - created_at
  - updated_at

merchant_preferences (Intelligence Layer)
  - id (PK)
  - user_id (FK)
  - normalized_pattern
  - category_id (FK)
  - last_used_at

budgets
  - id (PK)
  - user_id (FK)
  - category_id (FK, nullable for total budget)
  - amount
  - month
  - year
  - created_at
  - updated_at
```

---

## Key Improvements After Schema Optimization

1. ✅ **Consistent naming**: All columns use snake_case
2. ✅ **No redundancy**: Removed 16 duplicate camelCase columns
3. ✅ **Better performance**: Fewer columns to index and query
4. ✅ **Data integrity**: Single source of truth for each field
5. ✅ **Maintainability**: Clear, standard database conventions

---

## Mobile App Integration Points

### Polling Pattern (OCR)
```typescript
// 1. Upload receipt
const response = await uploadReceipt(file);
// 202 Accepted, {id, status: "PENDING"}

// 2. Poll for completion
const pollInterval = setInterval(async () => {
  const receipt = await getReceipt(response.id);
  
  if (receipt.status === "PROCESSED") {
    clearInterval(pollInterval);
    // Show review screen with AI predictions
    showReviewScreen(receipt);
  } else if (receipt.status === "FAILED") {
    clearInterval(pollInterval);
    showError();
  }
}, 2000); // Poll every 2 seconds
```

### Real-time Dashboard
```typescript
// Dashboard refreshes on:
// - App foreground
// - Pull-to-refresh
// - After transaction creation
// - After receipt confirmation

const dashboard = await getDashboardSummary(walletId, "current_month");
// Returns aggregated data in real-time
```

---

**Generated**: 2026-04-15
**Version**: 1.0 (Post Schema Optimization)
