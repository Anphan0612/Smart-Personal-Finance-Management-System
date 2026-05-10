# Test Execution Batch - 2026-05-06

## 1) Scope batch
- Muc tieu: khoi dong Task 1 (environment readiness) trong `PLAN-test-case-strategy.md`.
- Pham vi: xac minh ket noi emulator -> backend, login flow co that, va baseline test tu dong.

## 2) Evidence thu duoc
- Emulator ADB state: `device` (khong con `offline`).
- API URL tren app log: `http://10.0.2.2:8080/api/v1`.
- Login flow thanh cong:
  - `POST /auth/login` thanh cong.
  - Co `accessToken`, app route sang tabs.
- API calls sau login thanh cong:
  - `/wallets`, `/categories`, `/budgets`, `/dashboard/summary`, `/transactions`.
- Automated baseline:
  - `npm test -- --runInBand`
  - Ket qua: `4 suites passed`, `17/17 tests passed`.

## 3) Ket luan batch
- Task 1 dat trang thai: **In Progress (gan hoan tat)**.
- Van con 1 buoc chua chot:
  - Can xac thuc bang tay tren emulator: tao giao dich thu cong va doi soat so du/budget cap nhat.

## 4) Next actions (batch tiep theo)
1. Chay UJ-02 day du (manual transaction) va luu evidence screenshot/log.
2. Sau khi UJ-02 pass, chay tiep UJ-01/UJ-03/UJ-04/UJ-06 de chot P0.
3. Cap nhat `test-report-template.md` thanh report ket qua dot 1.

## 5) Open risks
- OCR/AI chua duoc evaluate theo metric dataset (Task 5 chua bat dau).
- Session refresh (`UJ-06`) chua test dieu kien token het han thuc te.
