# Maestro Automation (Android Emulator)

## Scope

Bộ flow Maestro hiện tại tự động hoá smoke test cho các luồng P0:

1. Mở app trong Expo Go
2. Đăng nhập (nếu app đang ở màn Welcome/Login)
3. Tạo giao dịch thủ công
4. Mở Atelier AI và gửi 1 prompt
5. Điều hướng tab cơ bản

Flow files:

- `.maestro/flows/p0-smoke.yaml`
- `.maestro/flows/p0-strict.yaml`
- `.maestro/flows/subflows/*.yaml`

## Prerequisites

- Android emulator đang chạy và `adb devices` thấy trạng thái `device`
- Metro đang chạy ở `mobile` (`npm start -- --clear`)
- Backend local đang sẵn sàng (`http://10.0.2.2:8080`)
- Expo Go đã mở app

## Install Maestro CLI

Xem hướng dẫn chính thức: <https://docs.maestro.dev/getting-started/installing-maestro>

## Run

### 1) Smoke (app đang mở sẵn)

```bash
npm run test:auto
```

### 2) Strict (mở app qua deep link exp://)

```bash
APP_URL=exp://192.168.1.9:8081 npm run test:auto:strict
```

PowerShell:

```powershell
$env:APP_URL="exp://192.168.1.9:8081"; npm run test:auto:strict
```

## Override credentials/data

Bạn có thể override env khi chạy Maestro trực tiếp:

```bash
maestro test .maestro/flows/p0-smoke.yaml \
  -e LOGIN_EMAIL=demo@example.com \
  -e LOGIN_PASSWORD=123456 \
  -e TRANSACTION_AMOUNT=120000 \
  -e AI_PROMPT="Tuần này tôi chi bao nhiêu?"
```

## Notes

- Flow đang dùng `testID` để giảm flaky.
- `ManualTransactionModal` đã tự chọn ví/danh mục mặc định khi có dữ liệu để ổn định E2E.
- Nếu app tự đăng nhập demo account, step login sẽ tự bỏ qua.
