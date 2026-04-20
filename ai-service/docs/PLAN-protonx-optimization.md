Dự án này tập trung vào việc khắc phục triệt để lỗi `KeyError: 0` khi nạp mô hình ProtonX bằng cách thiết lập môi trường cô lập và sử dụng phiên bản thư viện ổn định nhất.

## 🎯 Mục tiêu
- Khôi phục khả năng nạp mô hình `protonx-models/protonx-legal-ocr-corrector`.
- Đổi mới cơ cấu khởi động: Tích hợp venv và cache local vào `start-ai.ps1`.
- Đảm bảo an toàn VRAM (< 8GB) cho RTX 3050 khi chạy đa mô hình.

## 🛠️ Thành phần & Phân công
| Thành phần | Hành động | Vai trò |
|------------|-----------|---------|
| **Environment** | Tạo venv `ocr-env`, config `HF_HOME` local | Infrastructure |
| **Model** | Triển khai `protonx-legal-ocr-corrector` | AI Engineering |
| **Startup** | Nâng cấp `start-ai.ps1` để auto-activate venv | DevOps |

---

## 📅 Các giai đoạn triển khai

### Giai đoạn 1: Thiết lập môi trường cô lập & Thứ tự cài đặt
- [ ] Tạo môi trường ảo `venv` tại thư mục `.venv-ocr`.
- [ ] Cài đặt dependencies theo thứ tự bắt buộc (Để tránh lỗi CUDA/DLL):
    1. `torch --index-url https://download.pytorch.org/whl/cu118` (Phù hợp RTX 3050).
    2. `bitsandbytes`, `accelerate`.
    3. `transformers==4.40.2`, `sentencepiece`.
- [ ] Thiết lập thư mục cache local: `ai-service/models/cache`.

### Giai đoạn 2: Di chuyển & Cấu hình Model mới
- [ ] Cấu hình `model_id = "protonx-models/protonx-legal-ocr-corrector"`.
- [ ] Cập nhật `ocr_service.py` hỗ trợ nạp từ local cache.
- [ ] Triển khai nạp mô hình qua Pipeline trong môi trường venv.

### Giai đoạn 3: Kiểm soát Tổng lượng VRAM (Crucial)
- [ ] Đo lường VRAM riêng lẻ: PaddleOCR (~3GB), ProtonX INT8 (~1.5GB).
- [ ] Thực hiện Load Stress Test: Chạy đồng thời cả 2 mô hình.
- [ ] Đảm bảo **Tổng VRAM dự phòng luôn < 7GB** (để lại 1GB cho hệ thống/UI).

### Giai đoạn 4: Tự động hóa (Start-up Script)
- [ ] Nâng cấp `start-ai.ps1`:
    - Tự động kiểm tra/activate `.venv-ocr`.
    - Set biến môi trường `HF_HOME` về thư mục local dự án.
    - Khởi chạy service.

---

## ✅ Kế hoạch xác minh (Verification)

### Kiểm tra tự động
- Script khởi chạy service phải trả về `Success` ở bước nạp Corrector mà không cần lệnh activate ngoài.
- `pip show transformers` bên trong venv phải trả về đúng `4.40.2`.

### Kiểm tra thủ công
- Chạy `nvidia-smi` khi service đang xử lý hóa đơn để chốt con số Tổng VRAM.
- Kiểm tra thư mục `ai-service/models/cache` xem model có thực sự được lưu tại đó không.
