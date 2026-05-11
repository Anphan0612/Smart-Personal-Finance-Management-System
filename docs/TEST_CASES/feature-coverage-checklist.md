# Feature Coverage Checklist (F-01 -> F-09)

Muc tieu cua file nay la dam bao khong sot tinh nang nao khi test.
Moi feature duoc map voi scenario E2E va gom 3 nhom test:
- Happy Path
- Validation/Error
- Security/Permission

## 1) Bang mapping tong quan

| Feature ID | Feature Name | Journey Covered By | Priority | Owner | Status |
|---|---|---|---|---|---|
| F-01 | Authentication & Token | UJ-01, UJ-06 | P0 | Backend + Mobile | In Progress |
| F-02 | Wallet Management | UJ-01, UJ-08 | P0 | Backend + Mobile | In Progress |
| F-03 | Transaction Management | UJ-02, UJ-07, UJ-08, UJ-09 | P0 | Backend + Mobile | In Progress |
| F-04 | Category Management | UJ-02, UJ-03 | P1 | Backend + Mobile | Not Run |
| F-05 | Budget Planning & Monitoring | UJ-01, UJ-05 | P0 | Backend + Mobile | Not Run |
| F-06 | Dashboard Summary & Analytics | UJ-04, UJ-07, UJ-10 | P1 | Backend + Mobile | In Progress |
| F-07 | AI Assistant (NLP/Insights) | UJ-04 | P0 | FastAPI + Mobile | Not Run |
| F-08 | Receipt OCR Pipeline | UJ-03 | P0 | FastAPI + Mobile | Not Run |
| F-09 | Session Resilience & API Reliability | UJ-06, UJ-11 | P1 | Backend + Mobile | In Progress |

## 2) Checklist chi tiet theo feature

| Feature ID | Type | Checklist Item | Evidence | Result |
|---|---|---|---|---|
| F-01 | Happy Path | Dang ky/Dang nhap thanh cong voi thong tin hop le | Screenshot + API log | [ ] |
| F-01 | Validation/Error | Sai password, email sai dinh dang, tai khoan trung | Error message + status code | [ ] |
| F-01 | Security/Permission | API profile khong truy cap duoc khi thieu token | 401/403 response | [ ] |
| F-02 | Happy Path | Tao/sua/xoa vi hop le | Wallet list sau khi refresh | [ ] |
| F-02 | Validation/Error | Ten vi rong, so du am, trung ten vi (neu cam) | Validation message | [ ] |
| F-02 | Security/Permission | User A khong thay vi cua User B | API response boundary | [ ] |
| F-03 | Happy Path | Them giao dich va cap nhat tong hop dung | Dashboard truoc/sau | [ ] |
| F-03 | Validation/Error | So tien <= 0, category null, wallet null | UI validation + API 4xx | [ ] |
| F-03 | Security/Permission | Khong cho phep thao tac giao dich cua user khac | 403 + no data leakage | [ ] |
| F-04 | Happy Path | Tao category moi va su dung duoc khi them giao dich | Category dropdown | [ ] |
| F-04 | Validation/Error | Ten category trung/qua dai/rong | Validation message | [ ] |
| F-04 | Security/Permission | Category private khong bi lo cho user khac | API check | [ ] |
| F-05 | Happy Path | Tao budget theo ky va theo doi muc da dung | Budget progress bar | [ ] |
| F-05 | Validation/Error | Han muc <= 0, category khong hop le | API + UI validation | [ ] |
| F-05 | Security/Permission | Khong chinh sua duoc budget user khac | 403 response | [ ] |
| F-06 | Happy Path | Dashboard hien tong thu/chi dung theo bo loc | Snapshot + manual reconcile | [ ] |
| F-06 | Validation/Error | Bo loc ky khong hop le tra ket qua rong dung | Empty state | [ ] |
| F-06 | Security/Permission | Du lieu thong ke chi thuoc ve user hien tai | API boundary | [ ] |
| F-07 | Happy Path | AI tra loi cau hoi co lien quan du lieu thuc te | Chat transcript | [ ] |
| F-07 | Validation/Error | Prompt mo ho/khong ro van nhan intent hop ly | Intent log | [ ] |
| F-07 | Security/Permission | AI khong tiet lo thong tin user khac | Transcript audit | [ ] |
| F-08 | Happy Path | OCR trich xuat amount/date/merchant dat nguong | Evaluation sheet | [ ] |
| F-08 | Validation/Error | Anh mo, nghieng, thieu sang duoc xu ly co thong bao | Error handling log | [ ] |
| F-08 | Security/Permission | Khong luu anh/du lieu OCR sai tenant | Storage/API check | [ ] |
| F-09 | Happy Path | Token refresh thanh cong va retry request | Network log | [ ] |
| F-09 | Validation/Error | Refresh fail -> yeu cau dang nhap lai | UX flow screenshot | [ ] |
| F-09 | Security/Permission | Reuse token cu bi tu choi | 401 + token lifecycle log | [ ] |

## 3) Quy uoc cap nhat

- `Result`: `[ ]` chua chay, `Pass`, `Fail`, `Blocked`.
- Moi muc `Fail` phai kem bug id.
- Sau moi dot test, cap nhat cot `Status` o bang tong quan:
  - `In Progress` neu dang chay.
  - `Passed` neu tat ca item cua feature da pass.
  - `Failed` neu con it nhat 1 fail.
