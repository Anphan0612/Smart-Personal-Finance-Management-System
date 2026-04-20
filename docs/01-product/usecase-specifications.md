# Đặc tả Use Case chi tiết (Use Case Specifications)

Tài liệu này cung cấp mô tả chi tiết (focus use cases) cho các chức năng cốt lõi và chức năng thông minh của hệ thống Quản lý Tài chính Cá nhân.

---

## 1. UC-01: Ghi nhận giao dịch thủ công (Manual Transaction Entry)

*   **Actor (Tác nhân):** Người dùng (End-User)
*   **Mô tả:** Cho phép người dùng ghi nhận một giao dịch Thu hoặc Chi mới vào hệ thống bằng cách nhập tay các thông tin cơ bản.
*   **Tiền điều kiện (Pre-conditions):** Người dùng đã đăng nhập vào ứng dụng thành công.
*   **Hậu điều kiện (Post-conditions):** Giao dịch được lưu vào CSDL. Số dư ví và các báo cáo thống kê liên quan được cập nhật tự động.
*   **Luồng sự kiện chính (Main Flow):**
    1. Người dùng chọn chức năng "Thêm giao dịch" trên giao diện (Web/Mobile).
    2. Hệ thống hiển thị biểu mẫu (form) nhập liệu bao gồm: Số tiền, Loại (Thu/Chi), Danh mục, Ngày giờ, và Ghi chú.
    3. Người dùng điền đầy đủ các thông tin bắt buộc (Số tiền, Danh mục, Ngày giờ).
    4. Người dùng bấm nút "Lưu".
    5. Hệ thống kiểm tra tính hợp lệ của dữ liệu (Validate).
    6. Hệ thống lưu dữ liệu vào CSDL và tiến hành tính toán lại số dư hiện tại.
    7. Hệ thống thông báo "Thêm giao dịch thành công" và đưa người dùng về màn hình trang chủ hoặc danh sách giao dịch.
*   **Luồng ngoại lệ (Alternate/Exceptional Flows):**
    *   *A1 - Bỏ trống trường bắt buộc:* Nếu người dùng không nhập Số tiền hoặc Danh mục, hệ thống hiển thị cảnh báo yêu cầu điền đầy đủ và không cho phép Lưu.
    *   *A2 - Nhập sai định dạng:* Nếu người dùng nhập số tiền âm hoặc bằng 0, hệ thống báo lỗi định dạng số tiền.
    *   *A3 - Lỗi kết nối mạng:* Khi mất kết nối, hệ thống báo lỗi mạng và đề xuất lưu tạm (draft) giao dịch ở dưới local để đồng bộ sau.

---

## 2. UC-02: Ghi nhận giao dịch bằng Ngôn ngữ Tự nhiên (NLP Input)

*   **Actor:** Người dùng
*   **Mô tả:** Người dùng gõ text hoặc nói một câu văn tự nhiên mô tả giao dịch. Hệ thống dùng AI để tự động trích xuất thông tin và điền form.
*   **Tiền điều kiện:** Người dùng đã đăng nhập; Có kết nối Internet để gọi API AI/NLP.
*   **Hậu điều kiện:** Giao dịch được phân tích chính xác và lưu vào CSDL đúng như ý định của người dùng.
*   **Luồng sự kiện chính:**
    1. Người dùng chọn biểu tượng "Micro" hoặc "Nhập văn bản thông minh".
    2. Người dùng nhập nội dung (Ví dụ: "Chi 50 ngàn uống cafe sáng nay").
    3. Hệ thống gửi chuỗi văn bản lên NLP Engine để phân tích.
    4. NLP Engine trích xuất các thực thể: Loại (Chi), Số tiền (50,000), Danh mục (Ăn uống/Cafe), Ngày (Hôm nay).
    5. Hệ thống trả về giao diện Form Preview, các trường dữ liệu đã được điền sẵn thông số để người dùng đối chiếu.
    6. Người dùng kiểm tra, xác nhận thông tin đúng và ấn "Lưu".
    7. Hệ thống lưu giao dịch, cập nhật số dư, thống kê và báo thành công.
*   **Luồng ngoại lệ:**
    *   *A1 - AI không nhận diện được Danh mục:* Form Preview sẽ để trống trường "Danh mục". Hệ thống yêu cầu người dùng tự chọn tay trước khi lưu.
    *   *A2 - Nhập nội dung không liên quan:* (Ví dụ "Chào bạn"). NLP Engine trả về `Unknown Intent`. Hệ thống phản hồi: "Không tìm thấy thông tin giao dịch trong câu nói của bạn, vui lòng thử lại."
    *   *A3 - Chỉnh sửa trước khi lưu:* Người dùng phát hiện AI nhận diện nhầm số tiền, có quyền sửa lại trực tiếp trên Form Preview trước khi bấm Lưu.

---

## 3. UC-03: Ghi nhận giao dịch qua Quét Hóa đơn (OCR/Image AI)

*   **Actor:** Người dùng
*   **Mô tả:** Tự động quét và trích xuất dữ liệu chi tiêu từ hình ảnh hóa đơn/biên lai mua hàng.
*   **Tiền điều kiện:** Người dùng đã đăng nhập; App có quyền truy cập Camera hoặc Thư viện ảnh.
*   **Hậu điều kiện:** Giao dịch chi tiêu được ghi nhận tự động vào hệ thống kèm theo hình chụp hóa đơn lưu trữ lại làm bằng chứng.
*   **Luồng sự kiện chính:**
    1. Người dùng chọn tính năng "Quét hóa đơn".
    2. Người dùng chụp ảnh trực tiếp hoặc tải ảnh có sẵn từ thư viện.
    3. Hệ thống upload ảnh lên OCR Module để xử lý.
    4. Hệ thống nhận diện các text box và trích xuất: Tổng tiền hóa đơn, Tên cửa hàng, Ngày giờ lập bill.
    5. AI dự đoán "Danh mục" dựa trên Tên cửa hàng (Ví dụ: CGV -> Giải trí; Highlands -> Ăn uống).
    6. Hệ thống hiển thị giao diện đối chiếu: Một bến là ảnh gốc, một bên là Form Preview đã điền dữ liệu.
    7. Người dùng kiểm tra, ấn "Xác nhận và Lưu".
    8. Hệ thống lưu giao dịch vào CSDL và lưu link ảnh (URL) lên hệ thống lưu trữ đám mây.
*   **Luồng ngoại lệ:**
    *   *A1 - Ảnh chất lượng kém/Mờ/Bị lóa:* Hệ thống không đọc được chữ, hiển thị thông báo "Hóa đơn không rõ nét, xin vui lòng chụp lại hoặc quay về nhập bằng tay."
    *   *A2 - OCR đọc nhầm số:* Form Preview hiện sai tổng tiền. Người dùng được phép can thiệp gõ sửa lại số tiền hoặc ngày tháng cho đúng trước khi xác nhận.

---

## 4. UC-04: Đoán nhận & Cảnh báo chi tiêu bất thường (Anomaly/Overspending Alert)

*   **Actor:** Hệ thống (System Trigger / Job Scheduler)
*   **Mô tả:** AI tự động chạy ngầm để phân tích tần suất và dòng tiền chi tiêu của người dùng, từ đó phát đi cảnh báo nếu phát hiện người dùng đang tiêu xài vượt định mức / bất thường so với thói quen.
*   **Tiền điều kiện:** Người dùng phải có lượng dữ liệu giao dịch lịch sử đủ lớn (ví dụ: ít nhất > 2 tuần hoặc 1 tháng) để AI cấu trúc được "Baseline" (thói quen sinh hoạt).
*   **Hậu điều kiện:** Một cảnh báo (Notification) được ghi nhận vào hòm thư hệ thống và gửi đến điện thoại/web của người dùng.
*   **Luồng sự kiện chính:**
    1. Hệ thống Scheduler (Cron job) kích hoạt tác vụ phân tích mỗi cuối ngày (hoặc vào 23:59 Chủ Nhật hàng tuần).
    2. Hệ thống tổng hợp dữ liệu chi tiêu trong kỳ hiện tại và gom nhóm theo từng danh mục (Ăn uống, Giải trí, Mua sắm...).
    3. Anomaly Engine chạy thuật toán so sánh: Đối chiếu tốc độ chi tiêu hiện tại với mức trung bình của tháng trước hoặc giới hạn ngân sách (Budget) người dùng đã cài đặt.
    4. Nhận thấy một danh mục (VD: Giải trí) đang ở mức 150% so với bình thường dù mới giữa tháng, Engine gắn cờ (Flagged) là có rủi ro.
    5. Hệ thống tạo thông điệp thông minh dựa trên ngữ cảnh: *"Cảnh báo: Tốc độ chi tiêu danh mục Giải trí của bạn tuần này cao bất thường so với tháng trước. Hãy cân nhắc điều chỉnh lại nhé!"*
    6. Hệ thống gửi Push Notification tới thiết bị của người dùng và lưu nội dung vào mục Cảnh báo trong App.
*   **Luồng ngoại lệ:**
    *   *A1 - Người dùng mới (Newbie):* AI xác định số lượng dữ liệu chưa đủ để phân tích, tiến trình sẽ bypass không tạo cảnh báo giả, nhằm tránh gây phiền hà cho người dùng mới.

---

## 5. UC-05: Truy vấn và Hỏi đáp Tài chính qua Chatbot

*   **Actor:** Người dùng
*   **Mô tả:** Người dùng trò chuyện với Trợ lý ảo (Chatbot) để lấy nhanh các chỉ số báo cáo, truy vấn số dư hoặc xin lời khuyên tài chính cá nhân thay vì phải mò mẫm qua nhiều màn hình menu.
*   **Tiền điều kiện:** Người dùng đã đăng nhập thành công.
*   **Hậu điều kiện:** Trợ lý ảo phản hồi chính xác thông tin hoặc sinh biểu đồ mini minh họa ngay trong đoạn chat.
*   **Luồng sự kiện chính:**
    1. Người dùng mở cửa sổ tính năng "Trợ lý tài chính" (Chat).
    2. Người dùng gõ câu truy vấn, ví dụ: *"Tổng tiền tôi đã đổ xăng trong tháng 11 là bao nhiêu?"*.
    3. NLP Engine phân tích Intent. Nhận diện thao tác là `GET_AGGREGATION_SUM`, với các bộ lọc: Danh mục = "Đổ xăng/Di chuyển", Tháng = "11".
    4. Module xử lý query dữ liệu hệ thống tương ứng trên CSDL. CSDL trả về con số là 650,000 VND.
    5. Module sinh ngôn ngữ tự nhiên (NLG) chuyển đối dữ liệu thô thành câu văn thân thiện: *"Trong tháng 11, bạn đã chi 650,000đ cho hạng mục Đổ xăng. Trung bình mỗi tuần bạn tốn khoảng 150k cho việc này!"*.
    6. Hệ thống hiển thị câu trả lời (kèm theo một biểu đồ nhỏ trực quan nếu cần) lên màn hình Chat của người dùng.
*   **Luồng ngoại lệ:**
    *   *A1 - Không tìm thấy dữ liệu:* Nếu tháng 11 người dùng không có giao dịch "Đổ xăng", DB trả về 0. Chatbot trả lời: *"Tháng 11 tôi không thấy bạn có ghi nhận khoản chi nào cho việc đổ xăng cả."*
    *   *A2 - Câu hỏi nằm ngoài ngữ cảnh tài chính:* Ví dụ người dùng hỏi về *"thời tiết hôm nay"*. Chatbot từ chối khéo: *"Xin lỗi, tôi là trợ lý Tài chính, hiện tại tôi chuyên tâm hỗ trợ các câu hỏi liên quan đến ngân sách, thu chi và báo cáo của bạn thôi."*
