# Standard Documentation Set

> Bộ tài liệu nghiệp vụ chuẩn cho dự án **Smart Personal Finance Management System**.
>
> Ngôn ngữ áp dụng: mô tả nghiệp vụ bằng tiếng Việt, giữ thuật ngữ kỹ thuật bằng tiếng Anh để đồng bộ với codebase.

## Mục tiêu tài liệu

- Chuẩn hóa mô tả **Feature**, **Use Case** và **Workflow** của hệ thống.
- Tạo khả năng **traceability** từ nghiệp vụ đến API và luồng xử lý kỹ thuật.
- Dễ đọc trên GitHub/VSCode, dễ bảo trì khi hệ thống mở rộng.

## Bản đồ tài liệu

| Tài liệu | Vai trò | Đối tượng đọc |
|---|---|---|
| [`FEATURES.md`](./FEATURES.md) | Đặc tả tính năng theo module, input/output, constraints, endpoint | Product, BA, Backend, Mobile |
| [`USE_CASES.md`](./USE_CASES.md) | Kịch bản người dùng, luồng chính/phụ, điều kiện trước/sau | Product, BA, QA, Dev |
| [`WORKFLOWS.md`](./WORKFLOWS.md) | Mermaid diagrams: ERD, Sequence, State, AI flow | Backend, Mobile, AI, QA |
| [`PLAN-standard-docs.md`](./PLAN-standard-docs.md) | Kế hoạch triển khai tài liệu theo phase | PM, Tech Lead |

## Quy ước chung

- ID chuẩn:
  - Feature: `F-xx`
  - Use case: `UC-xx`
  - Workflow: `WF-xx`
- Response contract backend dùng `ApiResponse<T>`.
- Nhóm endpoint chuẩn trong hệ thống:
  - Auth: `/api/v1/auth/*`
  - Business APIs: `/api/v1/*`
  - AI proxy từ backend: `/api/v1/ai/*`
- Mermaid là chuẩn sơ đồ chính (GitHub/VSCode friendly).

## Liên kết nhanh theo module

### Auth & Session
- Feature: [`F-01`](./FEATURES.md#f-01)
- Use case: [`UC-01`](./USE_CASES.md#uc-01)
- Workflow: [`WF-02`](./WORKFLOWS.md#wf-02)

### Wallet & Transaction
- Feature: [`F-02`](./FEATURES.md#f-02), [`F-03`](./FEATURES.md#f-03)
- Use case: [`UC-02`](./USE_CASES.md#uc-02), [`UC-03`](./USE_CASES.md#uc-03)
- Workflow: [`WF-01`](./WORKFLOWS.md#wf-01), [`WF-05`](./WORKFLOWS.md#wf-05)

### AI/NLP/OCR
- Feature: [`F-07`](./FEATURES.md#f-07), [`F-08`](./FEATURES.md#f-08)
- Use case: [`UC-04`](./USE_CASES.md#uc-04), [`UC-05`](./USE_CASES.md#uc-05), [`UC-06`](./USE_CASES.md#uc-06)
- Workflow: [`WF-03`](./WORKFLOWS.md#wf-03), [`WF-04`](./WORKFLOWS.md#wf-04), [`WF-06`](./WORKFLOWS.md#wf-06)

### Budget & Dashboard
- Feature: [`F-05`](./FEATURES.md#f-05), [`F-06`](./FEATURES.md#f-06)
- Use case: [`UC-07`](./USE_CASES.md#uc-07), [`UC-08`](./USE_CASES.md#uc-08)
- Workflow: [`WF-01`](./WORKFLOWS.md#wf-01), [`WF-06`](./WORKFLOWS.md#wf-06)

## Traceability Matrix (UC ↔ Feature ↔ Workflow ↔ API)

| Use case | Feature | Workflow | API chính |
|---|---|---|---|
| [`UC-01`](./USE_CASES.md#uc-01) | [`F-01`](./FEATURES.md#f-01) | [`WF-02`](./WORKFLOWS.md#wf-02) | `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh-token` |
| [`UC-02`](./USE_CASES.md#uc-02) | [`F-02`](./FEATURES.md#f-02) | [`WF-01`](./WORKFLOWS.md#wf-01) | `POST/GET/PUT/DELETE /api/v1/wallets` |
| [`UC-03`](./USE_CASES.md#uc-03) | [`F-03`](./FEATURES.md#f-03) | [`WF-01`](./WORKFLOWS.md#wf-01), [`WF-05`](./WORKFLOWS.md#wf-05) | `POST /api/v1/transactions`, `PUT /api/v1/transactions/{id}` |
| [`UC-04`](./USE_CASES.md#uc-04) | [`F-07`](./FEATURES.md#f-07) | [`WF-06`](./WORKFLOWS.md#wf-06) | `POST /api/v1/ai/query-history` |
| [`UC-05`](./USE_CASES.md#uc-05) | [`F-07`](./FEATURES.md#f-07), [`F-03`](./FEATURES.md#f-03) | [`WF-06`](./WORKFLOWS.md#wf-06), [`WF-05`](./WORKFLOWS.md#wf-05) | `POST /api/v1/ai/extract-transaction`, `POST /api/v1/transactions` |
| [`UC-06`](./USE_CASES.md#uc-06) | [`F-08`](./FEATURES.md#f-08) | [`WF-03`](./WORKFLOWS.md#wf-03), [`WF-04`](./WORKFLOWS.md#wf-04) | `POST /api/v1/receipts/upload`, `GET /api/v1/receipts/{id}`, `POST /api/v1/receipts/{id}/confirm` |
| [`UC-07`](./USE_CASES.md#uc-07) | [`F-05`](./FEATURES.md#f-05) | [`WF-01`](./WORKFLOWS.md#wf-01) | `POST /api/v1/budgets`, `GET /api/v1/budgets`, `GET /api/v1/budgets/planning`, `DELETE /api/v1/budgets/reset` |
| [`UC-08`](./USE_CASES.md#uc-08) | [`F-06`](./FEATURES.md#f-06), [`F-07`](./FEATURES.md#f-07) | [`WF-06`](./WORKFLOWS.md#wf-06) | `GET /api/v1/dashboard/summary`, `POST /api/v1/ai/generate-insights`, `POST /api/v1/ai/budget-insight` |

## Tài liệu liên quan

- Project overview: [`../README.md`](../README.md)
- Planning file: [`PLAN-standard-docs.md`](./PLAN-standard-docs.md)
