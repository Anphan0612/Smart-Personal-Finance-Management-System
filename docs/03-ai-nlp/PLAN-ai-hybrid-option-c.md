# Project Plan: AI/NLP Hybrid Approach (Option C)

## 1. Context & Objectives
Triển khai hệ thống AI quản lý tài chính theo hướng lai (Hybrid Approach):
- **Local Model (Tự Train/Fine-tune):** Đảm nhiệm tác vụ bóc tách thông tin giao dịch NLP (NER/Intent) - Tối ưu tốc độ, chi phí và bảo mật. Chứng minh năng lực học thuật.
- **LLM API (Gemini/OpenAI):** Đảm nhiệm tác vụ Chatbot tư vấn tài chính thông minh, suy luận logic.
- **OCR/Vision API:** Nhận diện và số hóa hóa đơn vật lý.

## 2. System Architecture
Kiến trúc Microservices kết hợp:
1. **Core Backend (Java Spring Boot):** Xử lý nghiệp vụ chính, bảo mật, lưu trữ Database.
2. **AI Microservice (FastAPI - Python):** Host mô hình ngôn ngữ Local. Nơi tiếp nhận Request phân tích văn bản từ Core Backend.
3. **External Services:** APIs bên thứ ba cho Chatbot và OCR.

## 3. Workflow & Task Breakdown

### Phase 1: Chuẩn bị Dữ liệu (Synthetic Dataset)
- [ ] Viết Prompt Engineering kịch bản tạo dữ liệu cho LLM (ChatGPT/Claude).
- [ ] Sinh tự động khoảng 3,000 - 5,000 mẫu câu chi tiêu tiếng Việt (bao gồm đa dạng hoàn cảnh: từ lóng, viết tắt, tiền k, củ, cành...).
- [ ] Làm sạch (Clean) và gán nhãn Format dữ liệu cho bài toán Sequence Labeling (BIO Tags) chứa các field: `amount`, `category`, `time`, `note`.
- [ ] Phân chia Train / Validation / Test dataset.

### Phase 2: Đào tạo Local Model
- [ ] Setup môi trường huấn luyện (Local GPU hoặc Google Colab).
- [ ] Xây dựng mã nguồn (Python/PyTorch) để Fine-tune mô hình (Pretrained Model đề xuất: `PhoBERT` hoặc mô hình sequence labeling nhẹ hơn).
- [ ] Tiến hành Training và Evaluate độ chính xác F1-Score trên tập Test.
- [ ] Xử lý Cân bằng dữ liệu (nếu mất cân bằng giữa các tag Category).
- [ ] Lưu trữ và Export file Weights của Model.

### Phase 3: Thiết lập AI Microservice (FastAPI)
- [ ] Khởi tạo dự án Python FastAPI.
- [ ] Đưa file Model Weights đã train vào Service.
- [ ] API Endpoint 1: `/nlp/extract-transaction` (Nhận chuỗi Text -> Trả về JSON Model dự đoán).
- [ ] API Endpoint 2: `/nlp/chat-assistant` (Nhận chuỗi Text Context -> Proxy gọi sang Gemini/OpenAI API trả lời -> Trả về JSON).
- [ ] Viết Dockerfile container hóa AI Microservice.

### Phase 4: Tích hợp với Core Backend (Java)
- [ ] Viết AI Client Service trong Java Spring Boot để gọi HTTP Rest đến FastAPI Service.
- [ ] Thêm Use Case `CreateTransactionViaNLPUseCase`: Xử lý text user nhập -> Gọi AI Microservice -> Nhận JSON -> Lưu Transaction xuống Database.
- [ ] Cập nhật ERD và Database schema nếu cần lưu trữ raw text (lịch sử chat/nhập liệu).
- [ ] (Tùy chọn) Log lại độ chính xác của AI do User modify sau khi nhận diện để có Data Feedback Loop phục vụ Retrain.

### Phase 5: Kiểm thử và Hoàn thiện
- [ ] Unit Test cho AI Service.
- [ ] End-to-End Test luồng Nhập liệu giọng nói/văn bản trực tiếp từ Frontend -> Backend -> DB.
- [ ] Xử lý Edge Cases (User nhập text vô nghĩa, không trích xuất được số tiền).

## 4. Risk Management (Quản lý Rủi ro)
| Rủi ro | Mức độ | Giải pháp |
|--------|--------|-----------|
| Hụt tài nguyên Train Model | Cao | Sử dụng Google Colab hoặc Kaggle GPU miễn phí. Dùng model tham số nhỏ gọn. |
| Độ chính xác Local Model thấp lúc đầu | Trung bình | Kết hợp Rule-based (Regex cơ bản để quét lại lượng tiền/ngày tháng) hỗ trợ Model. |
| Trễ mạng do gọi Microservice | Thấp | Cấu hình Docker network local giữa Java và Python. Tối ưu thời gian Inference Model. |

## 5. Agent Assignments
- **`project-planner`**: Theo dõi tiến độ, tạo các sub-tasks chi tiết.
- **`backend-specialist`**: Triển khai tích hợp API vào Java & Build kiến trúc FastAPI gốc.
- **`data-scientist`** *(nếu có)*: Chuẩn bị Prompt làm Dataset, code script Model Training.
