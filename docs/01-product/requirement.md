# ĐỒ ÁN CHUYÊN NGÀNH

## Xây dựng hệ thống quản lý tài chính cá nhân thông minh tích hợp AI/NLP

### 1. Mục tiêu đề tài

Đề tài hướng đến việc phát triển một hệ thống phần mềm hỗ trợ người dùng quản lý tài chính cá nhân một cách hiệu quả, thân thiện và thông minh. Sinh viên cần xây dựng một hệ thống cơ bản với các chức năng tối thiểu, đồng thời được yêu cầu mở rộng thêm các chức năng nâng cao bằng cách ứng dụng các kỹ thuật, công nghệ Trí tuệ nhân tạo (AI) và Xử lý ngôn ngữ tự nhiên (NLP) nhằm gia tăng trải nghiệm người dùng.

Đây là một đề tài mở, tạo điều kiện để sinh viên phát huy tư duy sáng tạo, kỹ năng kỹ thuật và tinh thần làm việc nhóm. Việc tích hợp AI/NLP là bắt buộc và là tiêu chí quan trọng để đánh giá năng lực và khả năng sáng tạo của sinh viên.

---

### Hình thức thực hiện và thời gian nộp đồ án

1.  Sinh viên làm việc theo nhóm từ **2–4 thành viên**, *không chấp nhận làm đồ án cá nhân*.
2.  
    * File đồ án được đặt tên theo qui ước: **MSSV\_Họ-tên\_lớp\_ĐACN**. Tên file chỉ cần ghi MSSV và họ tên của người đại diện nộp bài. Trong file phải ghi đầy đủ thông tin của các thành viên.
    * Cuốn in phải có chữ ký sống của mỗi thành viên bên cạnh tên.

### Nguyên tắc chấm điểm

Điểm của mỗi đồ án được xác định theo **thứ hạng tương đối**. Đồ án có chất lượng tốt nhất sẽ đạt điểm tối đa (10.0), các đồ án còn lại được đánh giá giảm dần theo thứ tự. Do đó, các nhóm cần chủ động bảo vệ *ý tưởng* và nội dung công việc trong thời gian thực hiện đồ án của nhóm.

### Qui định về việc thực hiện đồ án

* Sinh viên được phép tích hợp các mô hình ngôn ngữ lớn (qua API hoặc mã nguồn mở) như một phần tính năng của hệ thống (ví dụ: chatbot, phân tích ngôn ngữ tự nhiên, tóm tắt văn bản,...).
* Tuyệt đối không được sử dụng các công cụ AI để viết hộ mã nguồn, viết hộ báo cáo, hoặc thay thế hoàn toàn tư duy của sinh viên.
* Mọi thành phần AI tích hợp phải được giải thích rõ ràng trong phần trình bày và báo cáo (bao gồm: mô hình nào, cách gọi API, cách xử lý đầu vào/ra, chi phí...).

**Mọi Vi phạm sẽ bị trừ điểm hoặc không được chấp nhận tùy theo mức độ (có khả năng bị 0 điểm).**

---

### 2. Yêu cầu bắt buộc (mức tối thiểu)

Phần mềm phải đáp ứng các chức năng cơ bản sau:

* Quản lý thu chi cá nhân: nhập, chỉnh sửa và xoá các khoản thu và chi tiêu.
* Phân loại giao dịch theo các danh mục (ăn uống, di chuyển, giải trí, tiết kiệm, ...).
* Thống kê trực quan: biểu đồ thu – chi theo thời gian, danh mục.
* Tính toán số dư: hiển thị tổng thu, tổng chi, số dư theo từng giai đoạn.
* Hệ thống xác thực người dùng (đăng ký, đăng nhập).

Sinh viên được tự do lựa chọn công nghệ, nền tảng (web/mobile/desktop), ngôn ngữ lập trình và kiến trúc hệ thống.

---

### 3. Gợi ý mở rộng (yêu cầu tích hợp AI/NLP)

#### 3.1 Xử lý ngôn ngữ tự nhiên (NLP):

* Nhập liệu bằng ngôn ngữ tự nhiên, ví dụ: “Hôm nay chi 50k ăn sáng” và hệ thống tự động trích xuất và phân tích thông tin.
* Truy vấn bằng ngôn ngữ tự nhiên, ví dụ: “Tôi đã chi bao nhiêu cho cà phê trong tháng 12?”.
* Tích hợp chatbot hỗ trợ hỏi đáp thông tin tài chính.

#### 3.2 Trí tuệ nhân tạo (AI):

* Phân tích và dự đoán xu hướng chi tiêu cá nhân.
* Gợi ý kế hoạch tiết kiệm hoặc cắt giảm chi tiêu.
* Phát hiện bất thường trong chi tiêu (anomaly detection).
* Nhận diện thông tin từ hóa đơn qua hình ảnh (sử dụng OCR hoặc AI).

#### 3.3 Các tính năng bổ sung khác:

* Đồng bộ dữ liệu trên nhiều nền tảng (web/mobile).
* Tuỳ chỉnh giao diện, báo cáo theo sở thích người dùng.
* Gửi thông báo theo thời gian hoặc dựa trên hành vi chi tiêu.

---

### 4. Nền tảng triển khai

* Sử dụng hệ thống quản lý mã nguồn (Git) và có thể triển khai thử trên các nền tảng cloud
* Có thể sử dụng các công cụ mã nguồn mở như:
    * Backend: FastAPI, Flask, Django,...
    * Frontend: React, Flutter, Streamlit,...
    * NLP: spaCy, HuggingFace, OpenAI API,...
    * OCR: Tesseract, Google Vision API,...

---
