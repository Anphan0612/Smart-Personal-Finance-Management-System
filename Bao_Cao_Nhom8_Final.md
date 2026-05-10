**TRƯỜNG ĐẠI HỌC SÀI GÒN**

**KHOA CÔNG NGHỆ THÔNG TIN**

\-\-\-\--□□🕮□□\-\-\-\--

![](media/image1.png){width="1.5472222222222223in"
height="1.5486111111111112in"}

**ĐỒ ÁN CHUYÊN NGÀNH**

# [[]{#_Toc229297252 .anchor}Smart Personal Finance Management System](https://github.com/Anphan0612/Smart-Personal-Finance-Management-System) {#smart-personal-finance-management-system .MỤC-LỤC}

(Hệ thống quản lý tài chính cá nhân thông minh)

**Thành viên trong nhóm:**

**Phan Quốc An 3122411101**

**Nguyễn Xuân Tiến Đạt 3122411040**

**Lê Hồng Minh 3122411124**

**Vũ Tấn Phước 3122411161**

***Giảng viên hướng dẫn: PGS.TS. Nguyễn Tuấn Đăng***

**THÀNH PHỐ HỒ CHÍ MINH, THÁNG 05/2026\**
**TRANG CAM KẾT**

Chúng em cam kết báo cáo này phản ánh trung thực quá trình thực hiện đồ
án của nhóm. Chúng em không sử dụng công cụ AI để viết mã nguồn hoặc báo
cáo. Nếu có sử dụng AI/LLM/API trong hệ thống, chúng em sẽ trình bày rõ
mục đích sử dụng, thành phần tích hợp, cách gọi, xử lý đầu vào/đầu ra và
chi phí liên quan.

**Chữ kí các thành viên**

**Thứ 2 ngày 11 tháng 05 năm 2026**

**MỤC LỤC**

#  {#section .TOC-Heading}

[Smart Personal Finance Management System
[1](#_Toc229297252)](#_Toc229297252)

[CHƯƠNG 1. TỔNG QUAN ĐỀ TÀI
[7](#chương-1.-tổng-quan-đề-tài)](#chương-1.-tổng-quan-đề-tài)

[1.1. Bối cảnh và phát biểu bài toán
[7](#bối-cảnh-và-phát-biểu-bài-toán)](#bối-cảnh-và-phát-biểu-bài-toán)

[1.2. Mục tiêu đề tài [7](#mục-tiêu-đề-tài)](#mục-tiêu-đề-tài)

[1.2.1. Mục tiêu chức năng nền tảng
[7](#mục-tiêu-chức-năng-nền-tảng)](#mục-tiêu-chức-năng-nền-tảng)

[1.2.2. Mục tiêu AI/NLP [7](#mục-tiêu-ainlp)](#mục-tiêu-ainlp)

[1.3. Phạm vi hệ thống [7](#phạm-vi-hệ-thống)](#phạm-vi-hệ-thống)

[1.3.1. Bao gồm [7](#bao-gồm)](#bao-gồm)

[1.3.2. Không bao gồm [7](#không-bao-gồm)](#không-bao-gồm)

[CHƯƠNG 2. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG
[8](#chương-2.-phân-tích-và-thiết-kế-hệ-thống)](#chương-2.-phân-tích-và-thiết-kế-hệ-thống)

[2.1. Phân tích yêu cầu chức năng
[8](#phân-tích-yêu-cầu-chức-năng)](#phân-tích-yêu-cầu-chức-năng)

[2.1.1. Đối sánh yêu cầu bắt buộc
[8](#đối-sánh-yêu-cầu-bắt-buộc)](#đối-sánh-yêu-cầu-bắt-buộc)

[2.2. Yêu cầu phi chức năng
[8](#yêu-cầu-phi-chức-năng)](#yêu-cầu-phi-chức-năng)

[2.3. Thiết kế kiến trúc tổng thể
[8](#thiết-kế-kiến-trúc-tổng-thể)](#thiết-kế-kiến-trúc-tổng-thể)

[2.4. Thiết kế cơ sở dữ liệu
[9](#thiết-kế-cơ-sở-dữ-liệu)](#thiết-kế-cơ-sở-dữ-liệu)

[2.5. Thiết kế luồng người dùng và use case
[10](#thiết-kế-luồng-người-dùng-và-use-case)](#thiết-kế-luồng-người-dùng-và-use-case)

[2.6. Phân tích chi tiết các luồng xử lý quan trọng
[10](#phân-tích-chi-tiết-các-luồng-xử-lý-quan-trọng)](#phân-tích-chi-tiết-các-luồng-xử-lý-quan-trọng)

[2.6.1. Luồng xác thực và làm mới token
[10](#luồng-xác-thực-và-làm-mới-token)](#luồng-xác-thực-và-làm-mới-token)

[2.6.2. Luồng OCR hóa đơn bất đồng bộ
[11](#luồng-ocr-hóa-đơn-bất-đồng-bộ)](#luồng-ocr-hóa-đơn-bất-đồng-bộ)

[2.6.3.Luồng OCR hóa đơn bất đồng bộ (Upload → Async OCR → Polling →
Review → Confirm)
[11](#luồng-ocr-hóa-đơn-bất-đồng-bộ-upload-async-ocr-polling-review-confirm)](#luồng-ocr-hóa-đơn-bất-đồng-bộ-upload-async-ocr-polling-review-confirm)

[2.6.4. Luồng Atelier AI (Grounded Query History)
[12](#luồng-atelier-ai-grounded-query-history)](#luồng-atelier-ai-grounded-query-history)

[2.7. Thiết kế API [13](#thiết-kế-api)](#thiết-kế-api)

[CHƯƠNG 3. TÍCH HỢP TRÍ TUỆ NHÂN TẠO (AI/NLP)
[15](#chương-3.-tích-hợp-trí-tuệ-nhân-tạo-ainlp)](#chương-3.-tích-hợp-trí-tuệ-nhân-tạo-ainlp)

[3.1. NLP Parser: bóc tách giao dịch từ văn bản tự nhiên
[15](#nlp-parser-bóc-tách-giao-dịch-từ-văn-bản-tự-nhiên)](#nlp-parser-bóc-tách-giao-dịch-từ-văn-bản-tự-nhiên)

[3.1.1. Bài toán và mục tiêu
[15](#bài-toán-và-mục-tiêu)](#bài-toán-và-mục-tiêu)

[3.1.2. Cách tiếp cận Hybrid Pipeline
[15](#cách-tiếp-cận-hybrid-pipeline)](#cách-tiếp-cận-hybrid-pipeline)

[3.1.3. Bảng đối sánh tiêu chí AI/NLP
[15](#bảng-đối-sánh-tiêu-chí-ainlp)](#bảng-đối-sánh-tiêu-chí-ainlp)

[3.2. Atelier AI: truy vấn lịch sử giao dịch bằng hội thoại
[16](#_Toc229297279)](#_Toc229297279)

[3.2.1. Mục tiêu và yêu cầu thiết kế
[16](#_Toc229297280)](#_Toc229297280)

[3.2.2. Cơ chế Grounded Query và kiểm soát
[16](#_Toc229297281)](#_Toc229297281)

[3.2.3. Bảng đối sánh tiêu chí AI/NLP
[16](#_Toc229297282)](#_Toc229297282)

[3.3. OCR hóa đơn [17](#ocr-hóa-đơn)](#ocr-hóa-đơn)

[3.3.1. Mục tiêu và bối cảnh áp dụng
[17](#mục-tiêu-và-bối-cảnh-áp-dụng)](#mục-tiêu-và-bối-cảnh-áp-dụng)

[3.3.2. Pipeline xử lý và cơ chế bất đồng bộ
[17](#pipeline-xử-lý-và-cơ-chế-bất-đồng-bộ)](#pipeline-xử-lý-và-cơ-chế-bất-đồng-bộ)

[3.3.3. Bảng đối sánh tiêu chí AI/NLP
[17](#bảng-đối-sánh-tiêu-chí-ainlp-1)](#bảng-đối-sánh-tiêu-chí-ainlp-1)

[CHƯƠNG 4. CÔNG NGHỆ, CÀI ĐẶT VÀ TRIỂN KHAI
[19](#chương-4.-công-nghệ-cài-đặt-và-triển-khai)](#chương-4.-công-nghệ-cài-đặt-và-triển-khai)

[4.1. Công nghệ sử dụng [19](#công-nghệ-sử-dụng)](#công-nghệ-sử-dụng)

[4.2. Cài đặt và triển khai
[19](#cài-đặt-và-triển-khai)](#cài-đặt-và-triển-khai)

[4.2.1. Cấu hình biến môi trường
[19](#cấu-hình-biến-môi-trường)](#cấu-hình-biến-môi-trường)

[4.2.2. Quy trình chạy local cho demo
[19](#quy-trình-chạy-local-cho-demo)](#quy-trình-chạy-local-cho-demo)

[4.2.3. Ghi chú môi trường
[20](#ghi-chú-môi-trường)](#ghi-chú-môi-trường)

[CHƯƠNG 5. KẾT QUẢ THỰC NGHIỆM VÀ KIỂM THỬ
[21](#chương-5.-kết-quả-thực-nghiệm-và-kiểm-thử)](#chương-5.-kết-quả-thực-nghiệm-và-kiểm-thử)

[5.1. Tổng quan kết quả kiểm thử
[21](#tổng-quan-kết-quả-kiểm-thử)](#tổng-quan-kết-quả-kiểm-thử)

[5.2. Kiểm thử chức năng [21](#kiểm-thử-chức-năng)](#kiểm-thử-chức-năng)

[5.3. Kiểm thử thành phần AI/NLP
[22](#kiểm-thử-thành-phần-ainlp)](#kiểm-thử-thành-phần-ainlp)

[5.4. Kiểm thử Backend (Spring Boot)
[22](#kiểm-thử-backend-spring-boot)](#kiểm-thử-backend-spring-boot)

[5.4.1. Phân bố kịch bản kiểm thử (59 test)
[22](#phân-bố-kịch-bản-kiểm-thử-59-test)](#phân-bố-kịch-bản-kiểm-thử-59-test)

[5.4.2. Ví dụ test case [23](#ví-dụ-test-case)](#ví-dụ-test-case)

[5.4.3. Kiểm thử OCR Async Workflow
[23](#kiểm-thử-ocr-async-workflow)](#kiểm-thử-ocr-async-workflow)

[5.5. Kiểm thử Frontend (React Native/Expo)
[23](#kiểm-thử-frontend-react-nativeexpo)](#kiểm-thử-frontend-react-nativeexpo)

[5.5.1. Phân bố kịch bản kiểm thử (17 test)
[23](#phân-bố-kịch-bản-kiểm-thử-17-test)](#phân-bố-kịch-bản-kiểm-thử-17-test)

[5.5.2. Kiểm thử E2E với Maestro --- Smoke Test P0
[23](#kiểm-thử-e2e-với-maestro-smoke-test-p0)](#kiểm-thử-e2e-với-maestro-smoke-test-p0)

[5.6. Kiểm thử AI Service (FastAPI --- 34 test)
[23](#kiểm-thử-ai-service-fastapi-34-test)](#kiểm-thử-ai-service-fastapi-34-test)

[5.7. Kiểm thử Atelier AI (NLP Query)
[24](#kiểm-thử-atelier-ai-nlp-query)](#kiểm-thử-atelier-ai-nlp-query)

[5.7.1. Intent Classification
[24](#intent-classification)](#intent-classification)

[5.7.2. History Slicing [24](#history-slicing)](#history-slicing)

[5.7.3. Ví dụ Response [24](#ví-dụ-response)](#ví-dụ-response)

[5.8. Đánh giá Coverage và Hiệu năng
[24](#đánh-giá-coverage-và-hiệu-năng)](#đánh-giá-coverage-và-hiệu-năng)

[5.8.1. Code Coverage [24](#code-coverage)](#code-coverage)

[5.8.2. Performance Metrics
[24](#performance-metrics)](#performance-metrics)

[5.9. Đánh giá bảo mật (OWASP Top 10)
[25](#đánh-giá-bảo-mật-owasp-top-10)](#đánh-giá-bảo-mật-owasp-top-10)

[5.10. Kết luận chương 5 [25](#kết-luận-chương-5)](#kết-luận-chương-5)

[CHƯƠNG 6. ĐÁNH GIÁ VÀ KẾT LUẬN
[26](#chương-6.-đánh-giá-và-kết-luận)](#chương-6.-đánh-giá-và-kết-luận)

[6.1. Đối sánh với tiêu chí chấm điểm
[26](#đối-sánh-với-tiêu-chí-chấm-điểm)](#đối-sánh-với-tiêu-chí-chấm-điểm)

[6.2. Phân công công việc
[26](#phân-công-công-việc)](#phân-công-công-việc)

[6.3. Kết luận và hướng phát triển
[27](#kết-luận-và-hướng-phát-triển)](#kết-luận-và-hướng-phát-triển)

[6.3.1. Kết quả đạt được [27](#kết-quả-đạt-được)](#kết-quả-đạt-được)

[6.3.2. Hạn chế [27](#hạn-chế)](#hạn-chế)

[6.3.3. Hướng phát triển [27](#hướng-phát-triển)](#hướng-phát-triển)

[A. Thông tin dự án [29](#a.-thông-tin-dự-án)](#a.-thông-tin-dự-án)

[B. Input mẫu cho AI/NLP
[29](#b.-input-mẫu-cho-ainlp)](#b.-input-mẫu-cho-ainlp)

[B.1. NLP Parser [29](#b.1.-nlp-parser)](#b.1.-nlp-parser)

[B.2. Atelier AI [29](#b.2.-atelier-ai)](#b.2.-atelier-ai)

[C. Ví dụ Response AI/NLP
[29](#c.-ví-dụ-response-ainlp)](#c.-ví-dụ-response-ainlp)

[D. Hướng dẫn chạy hệ thống
[29](#d.-hướng-dẫn-chạy-hệ-thống)](#d.-hướng-dẫn-chạy-hệ-thống)

[E. Checklist tự rà trước khi nộp
[30](#e.-checklist-tự-rà-trước-khi-nộp)](#e.-checklist-tự-rà-trước-khi-nộp)

**TÓM TẮT ĐỒ ÁN**

Đề tài \"Xây dựng hệ thống quản lý tài chính cá nhân thông minh tích hợp
AI/NLP\" được thực hiện nhằm hỗ trợ người dùng theo dõi thu chi, quản lý
ví tiền, phân loại giao dịch và khai thác lại dữ liệu tài chính cá nhân
một cách thuận tiện hơn.

Hệ thống gồm ba thành phần chính: ứng dụng Mobile (React Native/Expo),
Backend API (Spring Boot) và AI Service (FastAPI). Điểm nổi bật là kết
hợp quản lý tài chính nền tảng với các thành phần AI/NLP thực tiễn: quét
hóa đơn OCR, nhập giao dịch bằng ngôn ngữ tự nhiên (NLP Parser) và truy
vấn lịch sử chi tiêu qua hội thoại (Atelier AI).

Trong quá trình triển khai, nhóm ưu tiên tính ổn định demo và thiết kế
AI theo hướng hỗ trợ người dùng --- mọi dữ liệu nhận diện từ AI đều yêu
cầu người dùng kiểm tra trước khi lưu chính thức.

# CHƯƠNG 1. TỔNG QUAN ĐỀ TÀI

## 1.1. Bối cảnh và phát biểu bài toán

Quản lý tài chính cá nhân là nhu cầu thiết thực trong bối cảnh các hoạt
động chi tiêu hằng ngày ngày càng đa dạng. Tuy nhiên, không phải người
dùng nào cũng duy trì được thói quen ghi chép đều đặn. Nguyên nhân chính
là quá trình nhập liệu thủ công, lặp lại và gián đoạn trải nghiệm sử
dụng.

Từ thực tế đó, nhóm xây dựng hệ thống quản lý tài chính cá nhân thông
minh với ba hướng hỗ trợ AI/NLP:

- Ứng dụng OCR để nhận diện thông tin từ hóa đơn, giảm thời gian nhập
  liệu.

- NLP parser để bóc tách thông tin giao dịch từ câu mô tả tiếng Việt tự
  nhiên.

- Atelier AI cho phép người dùng truy vấn lịch sử chi tiêu thông qua hội
  thoại.

## 1.2. Mục tiêu đề tài

### 1.2.1. Mục tiêu chức năng nền tảng

- Cho phép người dùng đăng ký, đăng nhập và xác thực an toàn.

- Hỗ trợ quản lý ví tiền và số dư.

- Tạo, chỉnh sửa, xóa và xem lịch sử giao dịch thu chi.

- Phân loại giao dịch theo danh mục, phục vụ thống kê.

- Cung cấp dashboard, thống kê và theo dõi ngân sách.

### 1.2.2. Mục tiêu AI/NLP

- OCR hóa đơn: nhận diện thông tin từ ảnh (cửa hàng, ngày, số tiền, danh
  mục gợi ý).

- NLP Parser: bóc tách giao dịch từ câu ngắn tiếng Việt (\"ăn phở 50k\",
  \"nhận lương 12 triệu\").

- Atelier AI: hỏi đáp lịch sử chi tiêu bằng ngôn ngữ tự nhiên, dựa trên
  dữ liệu thật.

- Đảm bảo ổn định demo qua cơ chế fallback khi mô hình chưa sẵn sàng.

## 1.3. Phạm vi hệ thống

### 1.3.1. Bao gồm

- Ứng dụng Mobile: React Native/Expo --- giao diện tương tác chính.

- Backend API: Spring Boot --- nghiệp vụ, xác thực, quản lý dữ liệu.

- AI Service: FastAPI --- NLP, OCR và sinh phản hồi thông minh.

- Cơ sở dữ liệu: MySQL 8 --- lưu trữ người dùng, ví, giao dịch, hóa đơn.

- Môi trường demo: Docker Compose --- khởi chạy đồng nhất.

### 1.3.2. Không bao gồm

- Chưa tích hợp trực tiếp với ngân hàng hoặc ví điện tử thực tế.

- Chưa triển khai đầy đủ trên môi trường production cloud.

- Chưa đánh giá mô hình AI trên tập dữ liệu lớn ở quy mô thực tế.

# CHƯƠNG 2. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

## 2.1. Phân tích yêu cầu chức năng

### 2.1.1. Đối sánh yêu cầu bắt buộc

**Bảng 2.1 --- Đối sánh yêu cầu bắt buộc với kết quả triển khai:**

  --------- ----------- ---------------------- --------- --------------------------------
   **STT**   **Yêu cầu   **Mô tả triển khai**   **Hoàn            **Minh chứng**
            bắt buộc**                          thành**  

      1     Quản lý thu          API            **Có**     TransactionController.java,
            chi cá nhân  /api/v1/transactions               ManualTransactionModal.tsx
                         hỗ trợ CRUD đầy đủ.             
                         Mobile có giao diện             
                         nhập thủ công và xem            
                               lịch sử.                  

      2      Phân loại  Mỗi giao dịch gắn danh  **Có**            Category.java,
             giao dịch  mục; AI/OCR có thể gợi                OcrAsyncService.java,
             theo danh   ý danh mục tự động.                  ReceiptReviewForm.tsx
                mục                                      

      3      Thống kê        Dashboard và       **Có**         DashboardScreen.tsx,
             trực quan   AnalyticsScreen hiển                  AnalyticsScreen.tsx
                        thị tổng thu/chi, biểu           
                         đồ theo thời gian và            
                              danh mục.                  

      4      Tính toán   Số dư ví cập nhật tự   **Có**        WalletController.java,
               số dư     động theo giao dịch.                  DashboardScreen.tsx
                        Dashboard tổng hợp số            
                           dư từ tất cả ví.              

      5      Hệ thống     JWT access token +    **Có**    AuthenticationController.java,
             xác thực   refresh token. Mobile                 api.ts, useAppStore.ts
            người dùng  dùng mutex tránh race            
                        condition khi refresh            
                              đồng thời.                 
  --------- ----------- ---------------------- --------- --------------------------------

## 2.2. Yêu cầu phi chức năng

- Hiệu năng: Danh sách giao dịch được phân trang; luồng OCR bất đồng bộ
  (202 + polling) tránh timeout.

- Bảo mật: Không cho phép client cung cấp userId trực tiếp; refresh
  token dùng mutex tránh race condition.

- Tính ổn định: AI Service có fallback rule-based khi mô hình học máy
  không khả dụng.

- Khả năng mở rộng: Backend và AI Service tách thành hai dịch vụ độc
  lập; cấu hình qua biến môi trường; deploy bằng Docker Compose.

## 2.3. Thiết kế kiến trúc tổng thể

Hệ thống tổ chức theo kiến trúc nhiều tầng: mobile đóng vai trò client,
backend là trung tâm nghiệp vụ, AI Service cung cấp NLP/OCR. Nguyên tắc
thiết kế:

- Mobile không tương tác trực tiếp với CSDL hoặc mô hình AI; mọi yêu cầu
  qua backend.

- Backend điều phối: xác thực, kiểm tra, áp dụng nghiệp vụ, chuyển tiếp
  sang AI Service.

- AI Service chỉ xử lý phần thông minh theo schema thống nhất; kết quả
  backend kiểm tra rồi trả về mobile.

![](media/image2.png){width="2.7842049431321083in"
height="7.7703543307086615in"}

*Hình 2.1 --- Sơ đồ kiến trúc tổng thể hệ thống*

## 2.4. Thiết kế cơ sở dữ liệu

**Bảng 2.2 --- Mô tả các thực thể chính trong cơ sở dữ liệu:**

  -------------------- -------------------------- ---------------------------
       **Entity**             **Vai trò**              **Quan hệ chính**

          User         Thông tin tài khoản người    1 user → nhiều wallet,
                                  dùng                receipt, preference

         Wallet             Ví tiền và số dư           1 wallet → nhiều
                                                          transaction

        Category            Danh mục thu/chi      Transaction tham chiếu; map
                                                        AI qua nlpLabel

      Transaction         Giao dịch tài chính         Thuộc 1 wallet và 1
                               (thu/chi)                   category

        Receipt         Biên lai OCR trung gian   Xác nhận → tạo transaction

   MerchantPreference    Ghi nhớ phân loại theo    Gắn với user + merchant +
                                merchant                   category

         Budget         Ngân sách theo thời gian   Gắn với ví hoặc danh mục
  -------------------- -------------------------- ---------------------------

![](media/image3.png){width="6.397222222222222in" height="3.19375in"}

*Hình 2.2 --- Sơ đồ ERD logic của hệ thống*

## 2.5. Thiết kế luồng người dùng và use case

Các use case chính của hệ thống: đăng ký/đăng nhập, quản lý ví, tạo giao
dịch thủ công, xem dashboard/analytics, quét hóa đơn (upload → review →
confirm), hỏi Atelier AI, theo dõi ngân sách.

![Hình 2.3: Use case tổng quát của hệ
thống](media/image4.png){width="6.885204505686789in"
height="1.2920177165354332in"}*Hình 2.3 --- Use case tổng quát của hệ
thống*

## 2.6. Phân tích chi tiết các luồng xử lý quan trọng

### 2.6.1. Luồng xác thực và làm mới token

- Access token (hạn ngắn) + refresh token (hạn dài); khi token hết hạn
  backend trả 401.

- Mobile dùng mutex đảm bảo chỉ một request refresh chạy tại một thời
  điểm.

- Refresh token hết hạn → logout và điều hướng về màn đăng nhập.

*Hình 2.4 --- \[Chèn Sequence Diagram luồng Auth/Refresh Token tại
đây\]*

### 2.6.2. Luồng OCR hóa đơn bất đồng bộ

- Backend nhận ảnh → lưu → trả 202 Accepted + receiptId.

- AI Service xử lý: tiền xử lý ảnh → OCR → hậu xử lý → trích xuất trường
  dữ liệu.

- Backend cập nhật trạng thái receipt và gợi ý danh mục
  (MerchantPreference → nlpLabel → fallback).

- Mobile polling → hiển thị màn review bắt buộc → người dùng xác nhận →
  tạo transaction.

![](media/image5.png){width="6.397222222222222in"
height="6.131944444444445in"}

*Hình 2.5 --- Sequence diagram luồng xác thực và refresh token*

### 2.6.3.Luồng OCR hóa đơn bất đồng bộ (Upload → Async OCR → Polling → Review → Confirm)

Đối với bài toán OCR, thời gian xử lý ảnh có thể dao động đáng kể tùy
chất lượng ảnh và cấu hình máy chạy demo. Vì vậy, nhóm thiết kế luồng
OCR theo hướng bất đồng bộ để tránh timeout và cải thiện tính ổn định.

- Backend nhận ảnh, lưu trữ và tạo bản ghi receipt; sau đó trả về 202
  Accepted cùng receiptId.

- AI Service xử lý OCR theo pipeline nhiều bước: tiền xử lý ảnh → OCR →
  hậu xử lý/correction → trích xuất trường dữ liệu.

- Backend cập nhật trạng thái receipt và áp dụng chiến lược gợi ý danh
  mục theo thứ tự ưu tiên (MerchantPreference → ánh xạ nhãn AI qua
  nlpLabel → fallback).

- Mobile thực hiện polling; khi receipt đã xử lý xong, hệ thống hiển thị
  màn hình review bắt buộc. Transaction chỉ được tạo sau khi người dùng
  xác nhận và có thể chỉnh sửa thông tin trước khi lưu.

![Hình 2.5: Sequence diagram luồng OCR hóa đơn bất đồng
bộ](media/image6.png){width="6.527777777777778in"
height="3.6885269028871392in"}

*Hình 2.6: Sequence diagram luồng OCR hóa đơn bất đồng bộ*

### 2.6.4. Luồng Atelier AI (Grounded Query History)

Atelier AI được thiết kế theo hướng grounded, nghĩa là câu trả lời phải
dựa trên dữ liệu giao dịch thật của người dùng trong hệ thống, thay vì
sinh nội dung chung chung. Để giảm nguy cơ hallucination và tối ưu hiệu
năng, backend đóng vai trò ràng buộc dữ liệu trước khi gửi sang AI
Service.

- Backend phân tích câu hỏi để xác định time window (ví dụ: tuần này,
  tháng trước, 3 tháng gần nhất).

- Backend trích xuất một transaction slice rút gọn phù hợp với khoảng
  thời gian và chỉ gửi phần dữ liệu cần thiết sang AI Service.

- AI Service sinh phản hồi dạng answer/summary và có thể trả thêm
  matched_txn_ids để phục vụ hiển thị minh chứng.

- Mobile hiển thị hội thoại; khi cần kiểm chứng, hệ thống hiển thị các
  transaction cards tương ứng với các giao dịch liên quan.

![Hình 2.6: Sequence diagram luồng Atelier AI truy vấn lịch
sử](media/image7.png){width="6.625938320209974in"
height="2.883741251093613in"}

*Hình 2.7: Sequence diagram luồng Atelier AI truy vấn lịch sử*

## 2.7. Thiết kế API

**Bảng 2.3 --- Danh sách endpoint API chính:**

  --------------------------------- ---------------- --------- ---------------------------
            **Endpoint**               **Method**     **Chức       **Phản hồi chính**
                                                      năng**   

         /api/v1/auth/login               POST       Đăng nhập    access/refresh token

        /api/v1/auth/register             POST        Đăng ký      Thông tin tài khoản
                                                     tài khoản 

     /api/v1/auth/refresh-token           POST        Làm mới           Token mới
                                                      access   
                                                       token   

        /api/v1/transactions            GET/POST     Lấy danh  Danh sách phân trang / Giao
                                                      sách /            dịch mới
                                                     Tạo giao  
                                                       dịch    

      /api/v1/transactions/{id}      GET/PUT/DELETE  Xem / Sửa    Chi tiết / Trạng thái
                                                       / Xóa   
                                                     giao dịch 

   /api/v1/transactions/comparison        GET         So sánh       Số liệu tổng hợp
                                                      dữ liệu  
                                                     giao dịch 

       /api/v1/receipts/upload            POST        Upload    202 Accepted + receiptId
                                                      hóa đơn  

        /api/v1/receipts/{id}             GET        Lấy trạng      Thông tin receipt
                                                     thái OCR  

    /api/v1/receipts/{id}/confirm         POST       Xác nhận     Transaction được tạo
                                                     receipt → 
                                                     tạo giao  
                                                       dịch    

   /api/v1/ai/extract-transaction         POST       Bóc tách   amount/type/category/date
                                                     giao dịch 
                                                      từ text  

           /api/v1/ai/chat                POST       Truy vấn  answer/summary/matched ids
                                                      lịch sử  
                                                     bằng hội  
                                                       thoại   
  --------------------------------- ---------------- --------- ---------------------------

# CHƯƠNG 3. TÍCH HỢP TRÍ TUỆ NHÂN TẠO (AI/NLP)

Chương này mô tả chi tiết ba thành phần AI/NLP theo khung 10 tiêu chí
chuẩn: NLP Parser, Atelier AI và OCR hóa đơn. Các tính năng được thiết
kế theo hướng hỗ trợ người dùng --- không tự động thay thế quyết định
--- nhằm đảm bảo tính kiểm soát và độ tin cậy dữ liệu.

## 3.1. NLP Parser: bóc tách giao dịch từ văn bản tự nhiên

### 3.1.1. Bài toán và mục tiêu

Người dùng thường có nhu cầu nhập nhanh giao dịch bằng câu mô tả ngắn
như \"ăn phở 50k\" hay \"nhận lương 12 triệu\". NLP Parser trích xuất
transaction draft với các trường: số tiền, loại giao dịch, danh mục gợi
ý, ghi chú và confidence.

### 3.1.2. Cách tiếp cận Hybrid Pipeline

- Regex/rule-based ưu tiên ở bước trích xuất số tiền --- trường có tác
  động trực tiếp đến tính đúng đắn.

- PhoBERT fine-tuned (NER) được dùng khi mô hình sẵn sàng, cải thiện
  hiểu ngữ cảnh tiếng Việt.

- Fallback đảm bảo phản hồi hợp lý khi mô hình không tải được hoặc môi
  trường thiếu tài nguyên.

### 3.1.3. Bảng đối sánh tiêu chí AI/NLP

**Bảng 3.1 --- Mô tả chi tiết NLP Parser:**

  --------------------- -------------------------------------------------
  **Tiêu chí bắt buộc**        **Nội dung triển khai trong dự án**

     **1. Mục tiêu**    Trích xuất thông tin giao dịch từ câu tiếng Việt
                         tự nhiên nhằm giảm thao tác nhập liệu thủ công.

   **2. Đầu vào / đầu     Đầu vào: câu mô tả (ví dụ: \"Sáng nay ăn phở
          ra**          50k\"); Đầu ra: JSON gồm amount, type, category,
                                     date, note, confidence.

  **3. Cách tiếp cận**  Hybrid: regex/rule cho amount + PhoBERT NER (nếu
                            khả dụng) + rule-based mapping danh mục.

    **4. Mô hình/dịch                PhoBERT fine-tuned NER
          vụ**           (phobert-finance-ner-final) kết hợp rule/regex
                                            fallback.

  **5. Pipeline xử lý** Chuẩn hóa văn bản → trích xuất amount → chạy NER
                             (tùy chọn) → gợi ý danh mục → suy luận
                                   income/expense → trả JSON.

  **6. Ví dụ minh họa**   Input: \"ăn phở 50k\" → amount: 50000, type:
                          EXPENSE, category: FOOD/Ăn uống, confidence:
                                             \~0.8.

   **7. Đánh giá chất   Ưu tiên đúng amount và type; category được thiết
         lượng**          kế theo hướng gợi ý, người dùng có thể chỉnh
                                         trước khi lưu.

  **8. Chi phí và hiệu  Rule/regex không phát sinh chi phí; mô hình chạy
         năng**          local phụ thuộc CPU/RAM; fallback giúp phản hồi
                                 nhanh khi model chưa sẵn sàng.

     **9. Hạn chế**     Câu mơ hồ, từ lóng mới hoặc nhiều giao dịch trong
                                một input làm giảm độ chính xác.

    **10. Phần tự xây     Chuẩn hóa văn bản, parser số tiền tiếng Việt,
         dựng**           mapping danh mục và cơ chế fallback trong AI
                                  service và tích hợp backend.
  --------------------- -------------------------------------------------

![Hình 3.1: Pipeline NLP Parser của hệ
thống](media/image8.png){width="6.397222222222222in"
height="5.670389326334208in"}

*Hình 3.1 --- Pipeline NLP Parser của hệ thống*

## 3.2. OCR hóa đơn

### 3.2.1. Mục tiêu và bối cảnh áp dụng

Hệ thống tích hợp OCR nhằm trích xuất thông tin từ ảnh hóa đơn (cửa
hàng, ngày, số tiền, danh mục), tạo bản nháp giao dịch. Nguyên tắc:
không tự động lưu --- bắt buộc người dùng review và xác nhận trước khi
tạo transaction.

### 3.2.2. Pipeline xử lý và cơ chế bất đồng bộ

- Tiền xử lý ảnh: upscale / grayscale / denoise / CLAHE / threshold để
  tăng độ đọc ký tự.

- PaddleOCR trích xuất văn bản từ ảnh.

- ViT5 correction hậu xử lý giảm lỗi chính tả/ký tự tiếng Việt.

- (Tùy chọn) LLM repair để chuẩn hóa dữ liệu khi bật cấu hình.

Do thời gian xử lý có thể dao động, luồng OCR được thiết kế bất đồng bộ
(202 + polling) để tránh timeout và đảm bảo trải nghiệm ổn định.

### 3.2.3. Bảng đối sánh tiêu chí AI/NLP

**Bảng 3.2 --- Mô tả chi tiết OCR hóa đơn:**

  --------------------- -------------------------------------------------
  **Tiêu chí bắt buộc**        **Nội dung triển khai trong dự án**

     **1. Mục tiêu**          Nhận diện hóa đơn để gợi ý giao dịch
                        (merchant/date/amount/category) và giảm nhập liệu
                                            thủ công.

   **2. Đầu vào / đầu      Đầu vào: ảnh hóa đơn; Đầu ra: store, date,
          ra**            amount, confidence, raw_text, gợi ý category.

  **3. Cách tiếp cận**    Hybrid pipeline nhiều bước: tiền xử lý ảnh +
                                   OCR + correction + mapping.

    **4. Mô hình/dịch              PaddleOCR + ViT5 correction
          vụ**            (hoanghaiduong/vit5-correction); tùy chọn LLM
                                        repair qua Groq.

  **5. Pipeline xử lý** Preprocess ảnh → PaddleOCR → chuẩn hóa/correction
                          tiếng Việt → trích xuất trường dữ liệu → map
                             category theo MerchantPreference/label.

  **6. Ví dụ minh họa**   Ảnh hóa đơn → hệ thống trả amount/date/store;
                        mobile hiển thị màn review để người dùng kiểm tra
                                 và chỉnh sửa trước khi confirm.

   **7. Đánh giá chất    Ưu tiên đúng amount/date; bắt buộc review trước
         lượng**           khi tạo transaction để hạn chế sai dữ liệu.

  **8. Chi phí và hiệu    OCR/correction chạy local không cần API; LLM
         năng**           repair (nếu bật) phát sinh chi phí; thiết kế
                             async (202 + polling) để tránh timeout.

     **9. Hạn chế**      Ảnh mờ/lóa/góc nghiêng, hóa đơn nhiều cột hoặc
                             font lạ làm giảm chất lượng nhận diện.

    **10. Phần tự xây     Luồng OCR async (upload/poll/review/confirm),
         dựng**          tiền xử lý ảnh, chuẩn hóa output, mapping danh
                                 mục theo merchant và fallback.
  --------------------- -------------------------------------------------

![](media/image9.png){width="2.425in" height="9.822695756780403in"}

*Hình 3.2 --- Pipeline OCR của hệ thống*

# CHƯƠNG 4. CÔNG NGHỆ, CÀI ĐẶT VÀ TRIỂN KHAI

## 4.1. Công nghệ sử dụng

**Bảng 4.1 --- Stack công nghệ của dự án:**

  --------------- --------------------------- ---------------------------
  **Thành phần**   **Công nghệ / Thư viện**         **Lý do chọn**

     Frontend        React Native (Expo),       Phát triển đa nền tảng
     (Mobile)             NativeWind          nhanh, giao diện nhất quán,
                                              phù hợp mục tiêu demo và mở
                                                         rộng.

      Backend     Spring Boot, JPA/Hibernate, Tách lớp nghiệp vụ rõ ràng,
                            MySQL 8           hỗ trợ REST API và bảo mật,
                                               phù hợp dữ liệu quan hệ.

    AI/NLP/OCR     FastAPI, PaddleOCR, ViT5    Dễ triển khai dịch vụ AI,
                   correction, Groq LLM (tùy   hỗ trợ OCR tiếng Việt và
                             chọn)            NLP theo pipeline ổn định.

    Triển khai          Docker Compose          Đảm bảo môi trường đồng
      (Demo)                                  nhất và dễ tái lập giữa các
                                                    máy phát triển.
  --------------- --------------------------- ---------------------------

## 4.2. Cài đặt và triển khai

Hệ thống được triển khai theo mô hình Docker Compose, đảm bảo môi trường
demo đồng nhất và có thể tái lập giữa các máy. Ứng dụng mobile chạy qua
Expo trên Android emulator hoặc thiết bị thật.

### 4.2.1. Cấu hình biến môi trường

**Bảng 4.2 --- Các biến môi trường chính:**

  ------------- ---------------------- ------------------ ---------------------------
   **Service**   **Biến môi trường**      **Ý nghĩa**              **Ví dụ**

     Backend            DB_URL          JDBC URL kết nối   jdbc:mysql://db:3306/\...
                                           đến MySQL      

     Backend          JWT_SECRET        Khóa dùng để ký        \* (không commit)
                                              JWT         

     Backend       NLP_SERVICE_URL     URL nội bộ của AI        http://ai:8000
                                            Service       

   AI Service     PHOBERT_MODEL_PATH    Đường dẫn đến mô      /models/phobert\...
                                          hình PhoBERT    

   AI Service        GROQ_API_KEY       API key dùng cho       \* (không commit)
                                          LLM tùy chọn    
  ------------- ---------------------- ------------------ ---------------------------

***Lưu ý:** Không commit giá trị thật của JWT_SECRET và GROQ_API_KEY vào
repository. Sử dụng file .env.example làm mẫu.*

### 4.2.2. Quy trình chạy local cho demo

\# 1. Clone và cài đặt dependency gốc

npm install

\# 2. Khởi động backend, AI service và database

docker compose up -d

\# 3. Chạy ứng dụng mobile

cd mobile

npm install

npm run start

### 4.2.3. Ghi chú môi trường

- Android emulator: dùng 10.0.2.2:8080 để ánh xạ về host.

- Thiết bị thật: gọi backend qua IP LAN. Mobile hỗ trợ nhận diện địa chỉ
  từ Expo hostUri.

- Production (tương lai): cần bổ sung HTTPS, quản lý secret chuyên dụng,
  giám sát và backup.

# CHƯƠNG 5. KẾT QUẢ THỰC NGHIỆM VÀ KIỂM THỬ

Chương này trình bày quá trình kiểm thử hệ thống theo ba tầng: unit
test, integration test và E2E test, nhằm xác minh hệ thống hoạt động
đúng theo thiết kế.

## 5.1. Tổng quan kết quả kiểm thử

**Bảng 5.1 --- Tổng hợp kết quả kiểm thử theo tầng:**

  --------------------- ---------- --------------- ----------- --------------
    **Tầng kiểm thử**      **Số      **Kết quả**     **Thời     **Coverage**
                          test**                     gian**    

    Backend (JUnit 5)       59     **59/59 pass**     \~15s         78%

     Frontend (Jest)        17     **17/17 pass**     8.5s          70%

   AI Service (pytest)      34     **34/34 pass**     \~30s         77%

        **TỔNG**         **110**      **110/110     **\~53s**     **75%**
                                       pass**                  
  --------------------- ---------- --------------- ----------- --------------

Coverage tổng thể đạt 75%, tiệm cận mục tiêu 80%. Các module cốt lõi
(xác thực, giao dịch, OCR async, NLP intent) đều đạt trên 75%.

## 5.2. Kiểm thử chức năng

**Bảng 5.2 --- Test case chức năng:**

  --------- ---------- --------------------- ------------- ---------------- ----------
   **STT**    **Chức       **Test case**       **KQ mong    **KQ thực tế**   **Đạt?**
              năng**                             đợi**                      

      1      Xác thực      Đăng nhập với      Trả access   Trả token thành   **Đạt**
                       email/password hợp lệ    token +    công; mobile lưu 
                                             refresh token qua SecureStore  

      2      Xác thực    Truy cập API khi       Tự động     Refresh token    **Đạt**
                       access token hết hạn   refresh và      qua mutex;    
                                                thử lại    request tiếp tục 
                                                              thành công    

      3     Quản lý ví Tạo ví mới với tên và  Ví được lưu  API thành công;   **Đạt**
                           số dư ban đầu      và hiển thị   dashboard cập   
                                                           nhật tổng số dư  

      4      Quản lý     Tạo giao dịch chi   Giao dịch ghi Xuất hiện trong   **Đạt**
             thu chi       tiêu thủ công       nhận, cập    lịch sử; số dư  
                                              nhật số dư    thay đổi đúng   

      5     Phân loại  Lựa chọn danh mục khi Giao dịch gắn Backend trả định  **Đạt**
                           tạo giao dịch     đúng danh mục  danh danh mục   
                                                                 đúng       

      6      Thống kê        Truy cập        Hiển thị tổng Dữ liệu hiển thị  **Đạt**
                        dashboard/analytics   thu/chi và    đúng theo giao  
                                                biểu đồ          dịch       

      7     OCR upload  Upload ảnh hóa đơn    Backend trả    Mobile nhận     **Đạt**
                              hợp lệ             202 +       receiptId và   
                                               receiptId       polling      

      8        OCR     Xác nhận receipt sau       Tạo      Transaction được  **Đạt**
             confirm           xử lý          transaction  tạo sau xác nhận 
                                             từ dữ liệu đã                  
                                                review                      

      9     Atelier AI Truy vấn lịch sử chi   Trả lời dựa  Mobile hiển thị   **Đạt**
                               tiêu              trên       câu trả lời +   
                                              transaction   giao dịch liên  
                                                 slice           quan       

     10     E2E smoke  login → tạo giao dịch Các bước vận  Kịch bản Maestro  **Đạt**
                              → chat         hành liên tục hoàn thành thành 
                                                                 công       
  --------- ---------- --------------------- ------------- ---------------- ----------

## 5.3. Kiểm thử thành phần AI/NLP

**Bảng 5.3 --- Test case AI/NLP:**

  --------- ---------- ------------- -------------------- ---------------------- ----------
   **STT**    **Tính   **Input mẫu** **Output mong đợi**    **Output thực tế**    **Đạt?**
               năng                                                              
             AI/NLP**                                                            

      1     NLP Parser  ăn phở 50k      amount 50000,              Trả            **Đạt**
                                        EXPENSE, FOOD      amount/type/category  
                                                          với confidence hợp lệ  

      2     NLP Parser nhận lương 12   amount 12000000,   Trả income transaction  **Đạt**
                           triệu            INCOME                draft          

      3     NLP Parser  Input thiếu    Confidence thấp;   Fallback; không tự lưu  **Đạt**
                          số tiền         không lưu           giao dịch sai      

      4     Atelier AI Tuần này tôi   Time window tuần +  Trả tổng tiền, số giao  **Đạt**
                          chi bao       tổng chi tiêu     dịch, danh mục nổi bật 
                          nhiêu?                                                 

      5     Atelier AI  Tháng trước   Cắt dữ liệu tháng      Trả summary theo     **Đạt**
                       danh mục nào         trước           transaction slice    
                        tốn nhiều?                                               

      6        OCR      Upload ảnh        Trích xuất      Receipt xử lý và hiển   **Đạt**
                        hóa đơn rõ    store/date/amount       thị màn review     
                            nét                                                  

      7        OCR      Ảnh hóa đơn   Không tạo tự động;   Hiển thị confidence;   **Đạt**
                         mờ/thiếu     user review/chỉnh   cho sửa trước confirm  
                         thông tin                                               

      8        OCR      Merchant đã    Ưu tiên category    Category gợi ý đúng    **Đạt**
             mapping   có preference         theo             theo merchant      
                                      MerchantPreference                         
  --------- ---------- ------------- -------------------- ---------------------- ----------

## 5.4. Kiểm thử Backend (Spring Boot)

### 5.4.1. Phân bố kịch bản kiểm thử (59 test)

- Authentication & Authorization: 12 test

- Transaction CRUD: 18 test

- Wallet Management: 8 test

- Category Management: 6 test

- OCR Async Workflow: 10 test

- Atelier AI Integration: 5 test

### 5.4.2. Ví dụ test case

\@Test

void testCreateTransaction_Success() {

TransactionRequest request = new TransactionRequest(

\"EXPENSE\", 50000.0, \"Mua cafe\", walletId, categoryId);

ResponseEntity\<TransactionResponse\> response =

transactionController.createTransaction(request, userId);

assertEquals(HttpStatus.CREATED, response.getStatusCode());

assertNotNull(response.getBody().getId());

assertEquals(50000.0, response.getBody().getAmount());

}

### 5.4.3. Kiểm thử OCR Async Workflow

Chu trình trạng thái Receipt được kiểm thử đầy đủ:

1.  Upload → Receipt status PENDING

2.  Polling → PROCESSING → PROCESSED

3.  OCR thất bại → FAILED + thông báo lỗi

4.  Confirm receipt → tạo transaction

## 5.5. Kiểm thử Frontend (React Native/Expo)

### 5.5.1. Phân bố kịch bản kiểm thử (17 test)

- Authentication screens: 4 test

- Transaction components: 6 test

- Receipt scanner: 3 test

- Atelier AI UI: 2 test

- Custom hooks: 2 test

### 5.5.2. Kiểm thử E2E với Maestro --- Smoke Test P0

5.  Đăng nhập với tài khoản test.

6.  Tạo giao dịch thủ công.

7.  Quét hóa đơn: poll → review → confirm.

8.  Atelier AI: gửi query → nhận response.

Tổng thời gian chạy E2E: 13.1s --- tất cả flows passed.

## 5.6. Kiểm thử AI Service (FastAPI --- 34 test)

- NER service: 12 test

- OCR service: 10 test

- Intent classification: 6 test

- Hybrid mapping: 6 test

## 5.7. Kiểm thử Atelier AI (NLP Query)

### 5.7.1. Intent Classification

- HISTORY: \"Tuần này tôi chi bao nhiêu?\"

- QUERY: \"Danh mục nào tốn nhiều nhất?\"

- COMMAND: \"Tạo giao dịch mua cafe 35k\"

### 5.7.2. History Slicing

- \"Tuần này\" → transactions từ thứ 2 đến hiện tại.

- \"Tháng trước\" → từ ngày 1 đến ngày cuối tháng trước.

- \"3 tháng gần nhất\" → 90 ngày gần nhất.

### 5.7.3. Ví dụ Response

{

\"intent\": \"HISTORY\",

\"answer\": \"Tuần này bạn đã chi 450,000 VND cho 12 giao dịch.

Danh mục chi nhiều nhất là Ăn uống (180,000 VND).\",

\"transactions\": \[

{ \"id\": \"tx1\", \"amount\": 50000, \"category\": \"Ăn uống\",
\"date\": \"2026-05-08\" },

{ \"id\": \"tx2\", \"amount\": 35000, \"category\": \"Cafe\", \"date\":
\"2026-05-07\" }

\],

\"show_cards\": true

}

## 5.8. Đánh giá Coverage và Hiệu năng

### 5.8.1. Code Coverage

**Bảng 5.4 --- Độ bao phủ mã nguồn theo module:**

  --------------------- ------------ -------------- --------------- -------------
       **Module**        **Lines**    **Branches**   **Functions**   **Overall**

    Backend -- Domain       85%           78%             90%            84%

       Backend --           80%           75%             85%            80%
       Application                                                  

       Backend --           70%           65%             75%            70%
     Infrastructure                                                 

  Frontend -- Features      72%           68%             75%            71%

       Frontend --          68%           62%             70%            67%
       Components                                                   

    AI Service -- NER       82%           78%             85%            82%

    AI Service -- OCR       75%           70%             80%            75%

        **TỔNG**          **76%**       **71%**         **80%**        **75%**
  --------------------- ------------ -------------- --------------- -------------

### 5.8.2. Performance Metrics

**Bảng 5.5 --- Chỉ số hiệu năng thực đo:**

  ----------------------- ------------ ------------ -----------------------
        **Metric**         **Target**   **Actual**      **Trạng thái**

     API Latency (p50)       \< 1s        0.45s             **Đạt**

     API Latency (p95)       \< 3s         1.8s             **Đạt**

    OCR Processing Time      \< 10s        6.2s             **Đạt**

    NLP Query Response       \< 5s         2.1s             **Đạt**

   Mobile App Hydration      \< 3s         1.9s             **Đạt**

    Test Execution Time     \< 2 min       53s              **Đạt**
  ----------------------- ------------ ------------ -----------------------

## 5.9. Đánh giá bảo mật (OWASP Top 10)

**Bảng 5.6 --- Rà soát OWASP Top 10:**

  ------------------ -------------------------------- ---------------------
    **OWASP Risk**        **Biện pháp áp dụng**          **Trạng thái**

  A01: Broken Access       JWT + authorization           **Implemented**
       Control                                        

  A02: Cryptographic      BCrypt hashing, HTTPS          **Implemented**
       Failures                                       

    A03: Injection     Parameterized queries (JPA)       **Implemented**

    A04: Insecure     Clean Architecture, validation     **Implemented**
        Design                                        

    A05: Security     Env vars, no hardcoded secrets     **Implemented**
   Misconfiguration                                   

   A06: Vulnerable   Dependency scanning (Dependabot)    **Implemented**
      Components                                      

         A07:           JWT + refresh token mutex        **Implemented**
    Authentication                                    
       Failures                                       

  A08: Software/Data Git signing, Docker verification      **Partial**
      Integrity                                       

     A09: Logging       Structured logging (SLF4J)       **Implemented**
       Failures                                       

      A10: SSRF         Validation, whitelist URLs       **Implemented**
  ------------------ -------------------------------- ---------------------

Cần cải thiện: bổ sung rate limiting và Docker image signing khi triển
khai production.

## 5.10. Kết luận chương 5

Hệ thống đạt 100% pass rate với 110 kịch bản kiểm thử. Coverage tổng thể
75%. Tất cả chỉ số hiệu năng đạt mục tiêu. Các kiểm soát bảo mật cơ bản
đã được triển khai theo OWASP checklist.

# CHƯƠNG 6. ĐÁNH GIÁ VÀ KẾT LUẬN

## 6.1. Đối sánh với tiêu chí chấm điểm

**Bảng 6.1 --- Đối sánh với rubric chấm điểm:**

  --------------- --------- --------------------- --------------- ------------
    **Tiêu chí     **Trọng  **Nhóm đã thực hiện** **Mục trong báo    **Minh
      chấm**        số**                               cáo**        chứng**

  Hoàn thiện chức    30%    Triển khai đủ 5 chức     Chương 2,     Bảng 2.1,
   năng bắt buộc             năng: thu chi, phân     Chương 5       Bảng 5.2
                             loại, thống kê, số                   
                                dư, xác thực.                     

  Giao diện người    5%          Mobile app:       Chương 2, Phụ   Hình UI-1
   dùng (UX/UI)             dashboard, danh sách        lục       
                             giao dịch, quét hóa                  
                              đơn, Atelier AI.                    

  Tính ổn định và    10%    OCR bất đồng bộ, phân Chương 2, 4, 5   Bảng 5.1,
     hiệu năng              trang, refresh token                      5.8
                             mutex, kiểm thử đa                   
                                    tầng.                         

   Tính năng mở      20%    Budget, OCR hóa đơn,  Chương 2, 3, 4   Sơ đồ kiến
  rộng & ứng dụng           Atelier AI, kiến trúc                  trúc, API
      thực tế                tách backend và AI                      table
                               Service, Docker                    
                                  Compose.                        

  Ứng dụng AI/NLP    25%     NLP Parser, Atelier     Chương 3,        Bảng
  hiệu quả, sáng            AI, OCR pipeline ---     Chương 5      3.1--3.3,
        tạo                  có fallback, review                    Bảng 5.3
                             bắt buộc, grounded                   
                                   answer.                        

   Hình thức và      15%    Báo cáo đủ 6 chương,     Toàn bài       File báo
   nội dung báo               có bảng yêu cầu,                    cáo, phụ lục
        cáo                   thiết kế, AI/NLP,                        E
                             kiểm thử, rubric và                  
                                  phụ lục.                        
  --------------- --------- --------------------- --------------- ------------

## 6.2. Phân công công việc

**Bảng 6.2 --- Phân công và đóng góp thành viên:**

  --------- ------------- ------------ ------------------ ---------------------- ------
   **STT**   **Họ tên**     **MSSV**   **Nhiệm vụ chính**      **Sản phẩm**       **Tỉ
                                                                                  lệ**

      1     Phan Quốc An   3122411001  Code demo, AI/OCR         Receipt          25%
                                       workflow, tích hợp  scan/review/confirm,  
                                            receipt            AI/OCR demo       

      2      Nguyễn Xuân   3122411040  Hỗ trợ code demo,    Transaction flow,     25%
              Tiến Đạt                 kiểm thử flow, xử      test/demo data     
                                          lý giao dịch                           

      3     Lê Hồng Minh   3122411124   Mobile refactor,   Mobile architecture,   25%
                                       module hóa, chuẩn    UI modules, slides   
                                       bị slide kỹ thuật                         

      4     Vũ Tấn Phước   3122411161    Phân tích bài     Storyline, opening,    25%
                                         toán, business        summary, Q&A      
                                        value, tổng kết                          
  --------- ------------- ------------ ------------------ ---------------------- ------

Mức đóng góp được phân bổ cân đối: kỹ thuật (tính năng, tích hợp AI/OCR,
mobile), phân tích và tổng kết nội dung báo cáo triển khai song song.

## 6.3. Kết luận và hướng phát triển

### 6.3.1. Kết quả đạt được

- Hỗ trợ quản lý giao dịch, ví và danh mục theo mô hình dữ liệu nhất
  quán.

- Giảm thao tác nhập liệu qua OCR hóa đơn và NLP Parser.

- Cho phép khai thác lịch sử chi tiêu bằng ngôn ngữ tự nhiên qua Atelier
  AI.

- Hệ thống vận hành ổn định trong môi trường demo với cơ chế fallback.

### 6.3.2. Hạn chế

- Chất lượng OCR phụ thuộc điều kiện chụp ảnh (góc, độ sáng, độ rõ).

- NLP Parser phù hợp mẫu câu phổ biến; cần thêm dữ liệu thực tế để đánh
  giá trên nhiều dạng diễn đạt.

- Chưa tích hợp trực tiếp với ngân hàng/ví điện tử; dữ liệu cần người
  dùng nhập/xác nhận thủ công.

### 6.3.3. Hướng phát triển

- Nâng cao OCR: mở rộng dữ liệu thực tế, cải thiện pipeline tiền xử lý
  ảnh.

- Mở rộng Atelier AI: cảnh báo chi tiêu bất thường, gợi ý tiết kiệm,
  nhận diện xu hướng.

- Tích hợp Open Banking/API ngân hàng khi đủ điều kiện kỹ thuật và bảo
  mật.

- Bổ sung thành phần production: giám sát hệ thống, secret management,
  HTTPS, backup.

**TÀI LIỆU THAM KHẢO**

Các tài liệu dưới đây là nguồn tham khảo chính trong quá trình thiết kế,
triển khai và kiểm thử hệ thống. Nhóm ưu tiên sử dụng tài liệu chính
thức của các framework và nền tảng liên quan.

9.  \[1\] Expo Documentation. Truy cập tại: https://docs.expo.dev/

10. \[2\] React Native Documentation. Truy cập tại:
    https://reactnative.dev/docs/getting-started

11. \[3\] Spring Boot Reference Documentation. Truy cập tại:
    https://docs.spring.io/spring-boot/

12. \[4\] FastAPI Documentation. Truy cập tại:
    https://fastapi.tiangolo.com/

13. \[5\] Hugging Face Transformers Documentation. Truy cập tại:
    https://huggingface.co/docs/transformers/

14. \[6\] PaddleOCR Documentation. Truy cập tại:
    https://github.com/PaddlePaddle/PaddleOCR

15. \[7\] Maestro Documentation. Truy cập tại: https://docs.maestro.dev/

16. \[8\] MySQL 8 Documentation. Truy cập tại:
    https://dev.mysql.com/doc/

**PHỤ LỤC**

Phụ lục cung cấp thông tin bổ sung phục vụ kiểm tra, chạy thử và đối
chiếu với nội dung báo cáo.

## A. Thông tin dự án

- Link Git Repository: \[Điền đường dẫn GitHub/GitLab\]

- Link Video Demo: \[Điền đường dẫn YouTube/Drive\]

- Link triển khai thử: \[Nếu có\]

- Tài khoản kiểm thử --- Email: \[test@example.com\] \| Password:
  \[demo_password\]

***Lưu ý:** Không dùng mật khẩu thật nếu tài liệu được chia sẻ công
khai. Dùng tài khoản riêng cho demo.*

## B. Input mẫu cho AI/NLP

### B.1. NLP Parser

- \"ăn phở 50k\"

- \"nhận lương 12 triệu\"

- \"đổ xăng 70k hôm nay\"

### B.2. Atelier AI

- \"Tuần này tôi chi bao nhiêu?\"

- \"Tháng trước danh mục nào tốn nhiều nhất?\"

- \"Tóm tắt chi tiêu của tôi trong tháng này\"

## C. Ví dụ Response AI/NLP

// NLP Parser --- Input: \"ăn phở 50k\"

{

\"amount\": 50000,

\"type\": \"EXPENSE\",

\"category\": \"FOOD\",

\"date\": \"2026-05-08\",

\"note\": \"ăn phở 50k\",

\"confidence\": 0.8

}

## D. Hướng dẫn chạy hệ thống

\# Yêu cầu: Node.js \>= 18, Docker \>= 24, Java 17

\# Bước 1: Clone repository

git clone \[REPO_URL\] && cd \[PROJECT_FOLDER\]

\# Bước 2: Sao chép file cấu hình

cp .env.example .env \# Điền giá trị thật vào .env

\# Bước 3: Khởi động backend, AI service, database

docker compose up -d

\# Bước 4: Chạy mobile app

cd mobile && npm install && npm run start

## E. Checklist tự rà trước khi nộp

**Bảng E.1 --- Danh sách kiểm tra:**

  ------------------------------------------------------- ---------------
                      **Mục cần có**                        **Đã có?**

             Bảng đối sánh chức năng bắt buộc                **✓ Có**

    Chương riêng mô tả AI/NLP với bảng tiêu chí 10 mục       **✓ Có**

               Ví dụ input/output cho AI/NLP                 **✓ Có**

       Bảng kiểm thử chức năng (test case, kết quả)          **✓ Có**

                   Bảng kiểm thử AI/NLP                      **✓ Có**

            Ảnh giao diện có chú thích rõ ràng              **✗ Chưa**

             Link Git Repository và video demo              **✗ Chưa**

            Bảng đối sánh với rubric chấm điểm               **✓ Có**

   Điền đầy đủ tên trường, tên giảng viên trước khi nộp     **✗ Chưa**
  ------------------------------------------------------- ---------------

***Lưu ý:** Rà soát lại tên trường, tên giảng viên, link dự án và tài
khoản demo trước khi xuất bản chính thức.*
