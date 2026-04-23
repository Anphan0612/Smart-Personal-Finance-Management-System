# PLAN: Standard Documentation Architecture

Kế hoạch xây dựng bộ tài liệu nghiệp vụ chuẩn (Features, Use Cases, Workflows) cho dự án Smart Personal Finance Management System.

---

## 1. Giai đoạn 1: Discovery & Baseline (Đã hoàn thành)
- Xác định các thực thể chính (Users, Wallets, Transactions, Categories, Receipts).
- Liệt kê danh sách API endpoints hiện có (`/api/v1/*`).
- Thiết lập cấu trúc thư mục `docs/`.

## 2. Giai đoạn 2: Đặc tả Tính năng (FEATURES.md)
- Phân nhóm tính năng theo module (Auth, Wallet, Transaction, AI, OCR).
- Định nghĩa Input/Output và các ràng buộc nghiệp vụ (Constraints).
- Gắn kết ID tính năng (`F-01`, `F-02`,...) với API tương ứng.

## 3. Giai đoạn 3: Kịch bản Sử dụng (USE_CASES.md)
- Xây dựng kịch bản cho người dùng (UC-01 đến UC-08).
- Mô tả luồng chính (Main flow) và luồng rẽ nhánh (Alternate flow).
- Đảm bảo tính liên kết (Traceability) với các tính năng.

## 4. Giai đoạn 4: Trực quan hóa Luồng (WORKFLOWS.md)
- Sử dụng Mermaid Chart cho mọi sơ đồ.
- Bao gồm:
  - ERD (Sơ đồ thực thể).
  - Sequence Diagram (Auth, OCR async).
  - State Diagram (Receipt, Transaction).
  - Flowchart (AI Error Handling & Processing).

## 5. Giai đoạn 5: Chuẩn hóa & Traceability Matrix
- Xây dựng bảng đối chiếu chéo (UC ↔ Feature ↔ Workflow ↔ API).
- Kiểm tra tính khép kín của nghiệp vụ.
- "Beautify" tài liệu theo chuẩn Markdown Lint.

---

## Ghi chú kỹ thuật
- **Công cụ:** Mermaid (render trên GitHub/VSCode).
- **Ngôn ngữ:** Tiếng Việt cho nghiệp vụ, Tiếng Anh cho kỹ thuật.
- **Traceability:** Mỗi Use Case phải có ít nhất một Feature và một Workflow tương ứng.
