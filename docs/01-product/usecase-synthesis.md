# Tổng hợp Yêu cầu Nghiệp vụ và Use Case Diagrams (Use Case Synthesis)

Dựa trên tài liệu yêu cầu ban đầu (`requirement.md`, `usecase-specifications.md`) và mã nguồn Clean Architecture thực tế đã được lập trình ở thư mục `application/usecase`, hệ thống Smart Personal Finance Management được chia thành **4 luồng nghiệp vụ cốt lõi**. 

Dưới đây là phần tổng hợp phân rã các Use Case kèm theo Sơ đồ Use Case (dùng cú pháp Flowchart của Mermaid) cho từng nhóm nghiệp vụ.

---

## 1. Nghiệp vụ Quản lý Tài khoản (User & Authentication)

Nghiệp vụ này đóng vai trò bảo mật và phân quyền cho người dùng truy cập ứng dụng.

**Các Use Cases:**
- Đăng nhập (`LoginUseCase`)
- Đăng ký tài khoản (`RegisterUserUseCase`)
- Quản lý Profile (Bổ sung CCCD, SĐT, Avatar)

```mermaid
flowchart LR
    U([Người dùng])
    
    subgraph AuthModule [User & Auth Module]
        direction TB
        UC1([Đăng ký tài khoản])
        UC2([Đăng nhập hệ thống])
        UC3([Xác thực JWT Token])
        UC4([Cập nhật Hồ sơ cá nhân])
    end
    
    U --> UC1
    U --> UC2
    UC2 -. include .-> UC3
    U --> UC4
```

---

## 2. Nghiệp vụ Quản lý Nguồn tiền (Wallet & Bank Account)

Người dùng không chỉ ghi nhận thu chi trên một "Sổ tổng" mà quản lý dòng tiền chi tiết qua nhiều nguồn: Ví tiền mặt/điện tử và Tài khoản ngân hàng.

**Các Use Cases (Đã implement code):**
- Thêm/Sửa/Xóa Ví (`CreateWallet`, `UpdateWallet`, `DeleteWallet`)
- Xem và Lấy chi tiết Ví (`GetWalletsByUserId`, `GetWalletById`)
- Thêm/Sửa/Xóa Tài khoản Ngân hàng (`CreateBankAccount`, `UpdateBankAccount`, `DeleteBankAccount`)
- Xem danh sách TK Ngân hàng (`GetBankAccountsByUserId`, `GetBankAccountById`)

```mermaid
flowchart LR
    U([Người dùng])
    
    subgraph FinancialModule [Financial Ecosystem Module]
        direction TB
        W_CRUD([Quản lý Ví / Wallet])
        W_C([Tạo Ví mới])
        W_R([Xem danh sách Ví])
        W_UD([Cập nhật hoặc Xóa Ví])
        
        B_CRUD([Quản lý Tài khoản Ngân hàng])
        B_C([Liên kết TK Ngân hàng])
        B_UD([Quản lý thông tin TK])
    end
    
    U --> W_CRUD
    W_CRUD --- W_C
    W_CRUD --- W_R
    W_CRUD --- W_UD
    
    U --> B_CRUD
    B_CRUD --- B_C
    B_CRUD --- B_UD
```

---

## 3. Nghiệp vụ Quản lý Giao dịch cốt lõi (Transaction Management)

Hệ thống cho phép người dùng tự tay khai báo các giao dịch thu/chi hoặc chuyển tiền giữa các Ví/Tài khoản.

**Các Use Cases (Đã implement code):**
- Thêm giao dịch (`CreateTransactionUseCase`)
- Cập nhật, chỉnh sửa giao dịch (`UpdateTransactionUseCase`)
- Xóa giao dịch do nhập sai (`DeleteTransactionUseCase`)
- Truy xuất Lịch sử giao dịch theo số Ví (`GetTransactionsByWalletIdUseCase`)
- Xem chi tiết 1 giao dịch (`GetTransactionByIdUseCase`)
- Thống kê Số dư (Tính toán dựa trên `amount` và `type`)

```mermaid
flowchart LR
    U([Người dùng])
    
    subgraph TxModule [Transaction Module]
        direction TB
        Tx_C([Tạo Giao dịch Thủ công])
        Tx_UD([Sửa/Xóa Giao dịch])
        Tx_R([Xem Lịch sử giao dịch])
        
        Tx_W([Chọn Ví / Nguồn tiền])
        Tx_Cat([Chọn Danh mục])
        Tx_Bal([Tính toán lại Số dư])
    end
    
    U --> Tx_C
    U --> Tx_UD
    U --> Tx_R
    
    Tx_C -. include .-> Tx_W
    Tx_C -. include .-> Tx_Cat
    Tx_C -. include .-> Tx_Bal
    Tx_UD -. include .-> Tx_Bal
    Tx_R -. include .-> Tx_W
```

---

## 4. Nghiệp vụ Thông minh & AI (Smart NLP / AI Module)

Đây là giá trị cốt lõi tạo nên sự khác biệt ("Smart") của hệ thống, giúp người dùng lười cũng có thể quản lý tài chính hiệu quả. Nhóm này đại diện cho UC-02 đến UC-05 trong đặc tả.

**Các Use Cases:**
- Nhập liệu bằng Ngôn ngữ Tự nhiên (NLP Input / Speech to Text)
- Quét Hóa đơn (OCR/Image AI)
- Truy vấn tài chính qua Trợ lý ảo (Chatbot Assistant)
- Tự động Phân tích & Cảnh báo chi tiêu (Anomaly Alert - Tác nhân là Hệ thống)

```mermaid
flowchart LR
    U([Người dùng])
    Sys([Hệ Thống Scheduler])
    LLM([OpenAI / LLM API])
    
    subgraph AIModule [Smart AI Ecosystem Module]
        direction TB
        AI_Chat([Trò chuyện với Chatbot])
        AI_Query([Truy vấn Thống kê bằng NLP])
        
        AI_Tx([Ghi nhận giao dịch NLP])
        AI_Extract([Bóc tách Entity])
        
        AI_Img([Quét Hóa đơn OCR])
        
        AI_Analyze([Phân tích Thói quen Chi tiêu])
        AI_Alert([Cảnh báo Vượt giới hạn])
    end
    
    U --> AI_Chat
    AI_Chat -. extend .-> AI_Query
    LLM -. text to SQL .-> AI_Query
    
    U --> AI_Tx
    AI_Tx -. include .-> AI_Extract
    LLM -. NER extract .-> AI_Extract
    
    U --> AI_Img
    AI_Img -. include .-> AI_Extract
    
    Sys --> AI_Analyze
    AI_Analyze -. include .-> AI_Alert
    AI_Alert -. gửi Notification .-> U
```

---

## Tổng kết (Summary of Actors)

1. **Người dùng (End-User):** Chủ thể khởi tạo toàn bộ các nghiệp vụ liên quan đến tài sản của mình, với thao tác từ đăng nhập, tạo ví, nhập giao dịch cho đến chat với AI.
2. **Hệ Thống Phân Tích (System Job):** Chạy ngầm định kỳ nhằm đánh giá `transactions` và `budgets` để đẩy ra các cảnh báo (`AI_Alert`) phù hợp.
3. **OpenAI / AI Engine (External Actor):** Đảm nhiệm các tác vụ phức tạp liên quan tới NLP (Text-to-JSON, Intent Classification) và OCR mà hệ thống nội bộ không tự xử lý logic tĩnh.
