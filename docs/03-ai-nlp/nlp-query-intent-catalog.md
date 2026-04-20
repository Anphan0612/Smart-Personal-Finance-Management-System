# NLP Query Intent Catalog (Sprint 3 Scope Lock)

## Scope cố định cho SP3-US1..US5

- Chỉ hỗ trợ các intent trong tài liệu này cho Sprint 3.
- Ngoài danh sách này: trả `UNSUPPORTED_INTENT` kèm gợi ý câu hợp lệ.

## Intent list (locked)

| Intent ID | Ý nghĩa | Ví dụ câu hỏi | Entity bắt buộc | Output tối thiểu |
|:---|:---|:---|:---|:---|
| INTENT_TOTAL_EXPENSE_PERIOD | Tổng chi theo khoảng thời gian | "Tháng này tôi chi bao nhiêu?" | `period` | `totalExpense` |
| INTENT_TOTAL_INCOME_PERIOD | Tổng thu theo khoảng thời gian | "Tháng này thu nhập bao nhiêu?" | `period` | `totalIncome` |
| INTENT_BALANCE_PERIOD | Số dư theo khoảng thời gian | "Số dư tháng này là bao nhiêu?" | `period` | `balance` |
| INTENT_EXPENSE_BY_CATEGORY_PERIOD | Tổng chi theo danh mục và thời gian | "Tháng này ăn uống hết bao nhiêu?" | `period`, `category` | `categoryExpense` |
| INTENT_COMPARE_EXPENSE_PREV_PERIOD | So sánh chi tiêu kỳ này với kỳ trước | "Chi tháng này so với tháng trước?" | `period` | `currentExpense`, `previousExpense`, `delta` |
| INTENT_TOP_CATEGORY_PERIOD | Danh mục chi nhiều nhất | "Danh mục chi nhiều nhất tháng này?" | `period` | `topCategory`, `amount` |
| INTENT_RECENT_TRANSACTIONS | Liệt kê giao dịch gần đây | "Cho tôi 5 giao dịch gần nhất" | `limit` (default=5) | `transactions[]` |

## Entity schema

- `period`: `today`, `this_week`, `this_month`, `last_month`, `custom_range`.
- `category`: enum backend chuẩn (`FOOD`, `TRANSPORT`, `SHOPPING`, ...).
- `limit`: số nguyên dương, tối đa 20.
- `custom_range`: chỉ dùng khi câu có mốc từ-ngày đến-ngày rõ.

## Mapping intent -> API/use case

| Intent ID | Use case backend đề xuất | Endpoint gọi | Ghi chú |
|:---|:---|:---|:---|
| INTENT_TOTAL_EXPENSE_PERIOD | GetTotalExpenseUseCase | `POST /api/ai/query-stats` | query theo `period` |
| INTENT_TOTAL_INCOME_PERIOD | GetTotalIncomeUseCase | `POST /api/ai/query-stats` | query theo `period` |
| INTENT_BALANCE_PERIOD | GetBalanceUseCase | `POST /api/ai/query-stats` | thu - chi |
| INTENT_EXPENSE_BY_CATEGORY_PERIOD | GetCategoryExpenseUseCase | `POST /api/ai/query-stats` | validate enum category |
| INTENT_COMPARE_EXPENSE_PREV_PERIOD | CompareExpenseUseCase | `POST /api/ai/query-stats` | period hiện tại và kỳ trước |
| INTENT_TOP_CATEGORY_PERIOD | GetTopCategoryUseCase | `POST /api/ai/query-stats` | top 1 category theo amount |
| INTENT_RECENT_TRANSACTIONS | GetRecentTransactionsUseCase | `POST /api/ai/query-stats` | giới hạn kết quả |

## Response contract tối thiểu

```json
{
  "intent": "INTENT_TOTAL_EXPENSE_PERIOD",
  "entities": {
    "period": "this_month",
    "category": null,
    "limit": null
  },
  "answerText": "Tháng này bạn đã chi 3,450,000 VND.",
  "data": {
    "currency": "VND",
    "totalExpense": 3450000
  },
  "confidence": 0.89
}
```

## Gợi ý fallback khi parse intent thấp

- Nếu `confidence < 0.65`:
  - Trả intent `UNKNOWN`.
  - Trả danh sách câu mẫu:
    - "Tháng này tôi chi bao nhiêu?"
    - "Ăn uống tháng này hết bao nhiêu?"
    - "So sánh chi tháng này và tháng trước"

## Tiêu chí AC liên kết Sprint 3

- SP3-US1:
  - Pass 7/7 intent locked ở trên.
  - Sai intent phải trả gợi ý mẫu.
- SP3-US2:
  - `QueryScreen` render `answerText` và `data` cho tất cả intent locked.
- SP3-US4:
  - Có benchmark accuracy theo intent-level (intent classification accuracy).
