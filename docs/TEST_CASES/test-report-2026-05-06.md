# Test Report: Smart Personal Finance Management System (Batch 2026-05-06)

## 0) Metadata

- **Ngay thuc hien:** 2026-05-06
- **Nguoi thuc hien:** AI Assistant + Mobile QA
- **Phien ban app/mobile:** Expo SDK 54 (`expo@~54.0.34`)
- **Phien ban backend/AI:** Local backend (`localhost:8080`)
- **Moi truong:** Local (Android Emulator + Expo Go)

## 1) Executive Summary

- **Tong scenario E2E:** 11
- **Ket qua tong (batch hien tai):** Pass 0 / Fail 0 / Blocked 0 / In Progress 4 / Not Run 7
- **Ty le pass:** 0% (chua chay full scenario)
- **Danh gia backend/API:** On (login + endpoint chinh da phan hoi)
- **Danh gia AI/OCR:** Chua danh gia
- **Quyet dinh demo:** No-Go (chua du data de chot)

## 2) Ket qua User Journey Scenarios

| Scenario ID | Priority | Result | Bug ID | Ghi chu |
|---|---|---|---|---|
| UJ-01 | P0 | In Progress | - | Login thanh cong, chua verify day du tao vi + budget |
| UJ-02 | P0 | In Progress | - | Chua verify day du create transaction va doi soat |
| UJ-03 | P0 | Not Run | - | Chua chay OCR flow |
| UJ-04 | P0 | In Progress | - | Chua chay chat E2E day du |
| UJ-05 | P1 | Not Run | - | Chua thuc thi |
| UJ-06 | P0 | In Progress | - | Chua test token refresh khi het han |
| UJ-07 | P1 | Not Run | - | Chua thuc thi |
| UJ-08 | P1 | Not Run | - | Chua thuc thi |
| UJ-09 | P1 | Not Run | - | Chua thuc thi |
| UJ-10 | P1 | Not Run | - | Chua thuc thi |
| UJ-11 | P2 | Not Run | - | Chua thuc thi |

## 3) Feature Coverage Summary (F-01 -> F-09)

| Feature ID | Status | Failed Items | Owner | Note |
|---|---|---|---|---|
| F-01 | In Progress | 0 | Backend + Mobile | Login API da pass trong batch |
| F-02 | In Progress | 0 | Backend + Mobile | Wallet endpoint da phan hoi |
| F-03 | In Progress | 0 | Backend + Mobile | Chua verify CRUD day du |
| F-04 | Not Run | 0 | Backend + Mobile | Chua bat dau |
| F-05 | Not Run | 0 | Backend + Mobile | Chua bat dau |
| F-06 | In Progress | 0 | Backend + Mobile | Dashboard summary endpoint da phan hoi |
| F-07 | Not Run | 0 | FastAPI + Mobile | Chua bat dau |
| F-08 | Not Run | 0 | FastAPI + Mobile | Chua bat dau |
| F-09 | In Progress | 0 | Backend + Mobile | Chua test refresh token edge case |

## 4) AI/OCR Evaluation Result

| Tieu chi | Nguong | Thuc te | Result |
|---|---|---|---|
| Amount accuracy | >= 90% | N/A | Not Run |
| Date/Merchant accuracy | >= 80% | N/A | Not Run |
| Category suggestion | >= 75% | N/A | Not Run |
| Response latency | <= 5 giay | N/A | Not Run |
| Hallucination | 0% | N/A | Not Run |

**Nhan xet AI/OCR:** Chua chay dataset evaluation trong batch nay.

## 5) Bug Log (Known Issues)

| Bug ID | Mo ta ngan gon | Priority | Anh huong | Owner | Trang thai |
|---|---|---|---|---|---|
| BUG-ENV-001 | Truoc khi doi API URL, emulator gap network error khi login | P0 | Chan UJ-01/UJ-06 | Mobile | Fixed |

## 6) Risk & Mitigation

| Risk | Tac dong | Ke hoach giam thieu |
|---|---|---|
| Chua chay full P0 | Chua du dieu kien chot demo | Uu tien chay UJ-02, UJ-03, UJ-04, UJ-06 trong batch tiep theo |
| OCR/AI chua duoc cham metric | Chua danh gia chat luong AI/OCR | Thuc hien Task 5 voi 20-30 sample theo plan |
| Session refresh chua test token expiry | RUI ro fail khi demo logout/re-auth | Tao testcase token het han va capture network log |

## 7) Ket luan va action tiep theo

- **Go/No-Go:** No-Go (tam thoi)
- **Danh sach can fix/chay truoc demo (P0):**
  1. Hoan tat UJ-02 (manual transaction + wallet/budget reconcile).
  2. Hoan tat UJ-03 (OCR full flow).
  3. Hoan tat UJ-04 (chatbot insight + dashboard action).
  4. Hoan tat UJ-06 (token expiry/refresh path).
- **Danh sach co the fix sau demo (P1/P2):**
  1. UJ-05/07/08/09/10/11 va bug non-critical lien quan.
