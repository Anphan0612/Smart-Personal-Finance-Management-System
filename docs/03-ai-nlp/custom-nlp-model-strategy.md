# Quản trị Dự án: Chiến lược Xây dựng Model AI/NLP Nội bộ (Custom NLP Model)

Tài liệu này trình bày phương án kỹ thuật chuyên sâu (Technical Strategy) để xây dựng một model Xử lý Ngôn ngữ Tự nhiên (NLP) hoàn toàn tự chủ, miễn phí và chạy Offline cho đồ án Smart Finance. Giải pháp này thay thế hoàn toàn việc gọi API OpenAI trả phí nhằm tối đa hoá điểm Thiết kế Thuật toán (Algorithms).

⚠️ **QUY ĐỊNH TRIỂN KHAI TICKETS (Roadmap Priority):** 
Khuyến nghị đặc biệt: **TUYỆT ĐỐI ƯU TIÊN** hoàn thiện 100% Core Features ở **Sprint 1** (Java Spring Boot API, MySQL, Đăng nhập, CRUD giao dịch thủ công). Nhóm chỉ bắt tay vào việc gán nhãn Data và Code AI ở **Sprint 2**, sau khi Frame Source Code Backend cốt lõi đã chạy mượt mà không có Bug lỗi.

---

## 1. Bài toán Kỹ thuật (Technical NLP Problem)
Hệ thống cần bóc tách các mảng thông tin rời rạc từ văn bản tự nhiên (ví dụ: *"Sáng nay đổ xăng hết 50k"*).
- **Intent Classification (Phân loại Ý định):** Xác định mục đích của tin nhắn là tạo một giao dịch dạng CHI TIÊU.
- **Named Entity Recognition - NER (Nhận diện Thực thể):** 
  - `CATEGORY_KEYWORD` = "đổ xăng"
  - `AMOUNT` = "50000"

## 2. Bảng Phân Tích Lựa chọn Công nghệ
Để xây dựng Model nội bộ, chúng ta có 2 option phổ biến:

| Tiêu chí | Lựa chọn 1: Thư viện `spaCy` (Rule-based + ML) | Lựa chọn 2: `PhoBERT` của VinAI (Hugging Face) |
|---|---|---|
| **Đặc điểm** | Thư viện Python rất gọn nhẹ, train NER cực kỳ hiệu quả bằng thiết bị cấu hình cấp thấp (CPU). Cấu trúc Pipeline dễ xử lý. | Mô hình Deep Learning Transformers Pre-trained riêng cho tiếng Việt. Độ chính xác thuộc hàng đỉnh cao (SOTA). |
| **Độ khó setup** | Rất Dễ (Phù hợp cho những bạn chưa master về AI/Python). | Khó (Yêu cầu tài khoản Google Colab để train qua GPU, code Pytorch phức tạp). |
| **Phù hợp khi** | Dataset tự gõ nhỏ (dưới 1000 câu mẫu), tiết kiệm thời gian gán nhãn, máy tính train yếu. | Cần bóc tách ngữ nghĩa câu dài cực kỳ phức tạp hoặc muốn demo độ "chất" đồ án ở quy mô cao. |

➡️ **Đề xuất từ PO:** Chọn **`spaCy`**. Vì tập dữ liệu chi tiêu cá nhân thường đơn giản, có rule (quy luật) rõ ràng ("ăn", "mua", "uống", số tiền nằm cạnh chữ "k", "nghìn"). `spaCy` sẽ giúp tiết kiệm thời gian train Model để nhóm focus vào Backend Core.

## 3. Kiến trúc Tích hợp (Microservice Flow)
Vì Backend cốt lõi chạy bằng **Java**, Model AI (Python) sẽ được bọc lại trong một Microservice độc lập.
- **Language:** Python 3.10+
- **RESTful Gateway:** FastAPI (Framework chuẩn, siêu nhẹ).
- **Workflow Inter-service:**
  1. Frontend React gởi Request: `POST HTTP /api/v1/ai/parse` tới Backend Spring Boot.
  2. Spring Boot đóng vai trò Security Filter (Xác thực JWT User) và gọi tiếp nội bộ (RestTemplate): `POST http://localhost:8000/parse-expense` (tới Server Python).
  3. Server FastAPI Load `.bin` Model `spaCy` -> phân tách chữ lấy giá trị -> Trả về JSON.
  4. Spring Boot mapping JSON thành Entity Transaction -> Insert `MySQL`.

## 4. Quy trình Thực thi Mô hình AI (Training Workflow)
Công việc cho AI Developer / Backend của nhóm vào **Sprint 2**:
- **Bước 1: Thu thập Dữ liệu (Data Collection)**
  - Tự tay tạo file Excel gồm ít nhất 500-1000 câu ví dụ chi tiêu thông dụng của sinh viên.
- **Bước 2: Gán nhãn (Data Annotation - Cực nhất)**
  - Xài tool Local mã nguồn mở (như Doccano hoặc Prodigy) để bôi đen chữ "50k" gán nhãn `AMOUNT`, bôi đen "ăn phở" gán nhãn `CATEGORY_KEYWORD`. Xuất kết quả ra file định dạng JSONL.
- **Bước 3: Training & Evaluation**
  - Chạy Script Train `spaCy` chuẩn. Máy tính tự học qua tập dữ liệu.
  - Test độ chính xác (F1-Score). Nếu F1 > 0.85 là cực kỳ ngon. Thêm biểu đồ Accuracy này vào Báo cáo giữa kỳ!
- **Bước 4: Xuất Model và Deploy**
  - Lưu cấu trúc Model về một thư mục. Kéo vào Source code Backend Python FastAPI để chạy lệnh Start.
