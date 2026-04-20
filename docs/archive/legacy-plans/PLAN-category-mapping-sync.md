# PLAN-category-mapping-sync: Thống nhất & Nâng cấp Category Mapping

Hệ thống cần một cơ chế ánh xạ hạng mục (Category) nhất quán từ khâu nhận diện AI, lưu trữ Backend cho đến hiển thị Frontend, đồng thời nâng cao trải nghiệm thị giác (Visual UX) thông qua màu sắc và icon chuẩn hóa.

---

## 🎯 Mục tiêu
1. **Chính xác**: AI phân biệt được Ăn ngoài (`DINING_OUT`) và Đi chợ (`GROCERIES_FOOD`).
2. **Đầy đủ**: Nhận diện thêm các loại chi tiêu hiện đại như `SUBSCRIPTION`, `INSURANCE`.
3. **Thẩm mỹ**: Tích hợp màu sắc (`color`) vào Category để FE vẽ biểu đồ Analytics chuyên nghiệp.
4. **Nhất quán**: Icon name trong DB khớp hoàn toàn với thư viện UI Mobile.

---

## 🛠 Phân rã nhiệm vụ

### Giai đoạn 1: Backend & Database (Foundation)
- [ ] **DB Migration**: 
    - Thêm cột `color` (VARCHAR 7) vào bảng `categories`.
    - Thiết lập **Unique Constraint** cho cột `nlp_label` để tránh xung đột lookup.
    - Cập nhật nhãn `nlp_label`: `cat-exp-001` -> `DINING_OUT`, `cat-exp-011` -> `GROCERIES_FOOD`.
- [ ] **Domain Update**:
    - Cập nhật Enum `MaterialSymbol.java`: Thêm icon mới (`SUBSCRIPTIONS`, `SHIELD`, `VOLUNTEER_ACTIVISM`).
    - Cập nhật Entity `Category.java`: Thêm trường `color`.
- [ ] **DTO Update**:
    - Cập nhật `TransactionResponse` thêm trường `idAiSuggested` (Boolean) để FE hiển thị trạng thái chờ xác nhận.
- [ ] **Standard Color Palette**: Thiết lập bộ màu chuẩn (Base on user guidelines):
    - `DINING_OUT`: `#E67E22`, `GROCERIES_FOOD`: `#FF5733`, `SALARY`: `#2ECC71`, `HEALTH_CARE`: `#E74C3C`, `SUBSCRIPTION`: `#607D8B`.

### Giai đoạn 2: AI Service Synchronization (Intelligence)
- [ ] **LLM Logic**: Cập nhật `_ALLOWED_CATEGORIES` trong `llm_service.py` với bộ nhãn mới.
- [ ] **Fallback Mechanism**: 
    - Implement logic: Nếu nhãn trả về không nằm trong DB, tự động gán về `cat-exp-012` (`OTHER_EXPENSE`).
    - Đánh dấu flag `is_ai_suggested = true` cho các giao dịch được tạo/gợi ý bởi AI.
- [ ] **NER Keywords**: Tách biệt từ khóa "ăn phở, buffet" (`DINING_OUT`) và "mua rau, đi chợ" (`GROCERIES_FOOD`).

### Giai đoạn 3: Frontend Alignment (Visual UX)
- [ ] **API & Types**: Cập nhật interface `TransactionResponse` để nhận `color` và `isAiSuggested`.
- [ ] **Cache Invalidation**: 
    - Cấu hình `staleTime: 0` hoặc thực hiện `queryClient.invalidateQueries(['categories'])` ngay khi App khởi động để đảm bảo lấy màu sắc/icon mới nhất.
- [ ] **UI Confirmation**: Hiển thị một badge nhỏ (VD: chấm vàng hoặc text "AI Gợi ý") trên các transaction chưa được người dùng confirm category.

---

## 🧪 Kiểm thử & Xác nhận (Verification)
1. **AI Output**: Test câu lệnh "Ăn phở 50k" -> Phải ra label `DINING_OUT`. "Mua rau 20k" -> Phải ra label `GROCERIES_FOOD`.
2. **Data Consistency**: Kiểm tra API `/api/v1/categories` có trả về đủ `id`, `name`, `iconName`, `color` và `nlp_label` không.
3. **UI Display**: Màn hình Budget và Transactions phải hiển thị đúng Icon và Màu sắc tương ứng.

---

## 👥 Phân công
- **Backend Specialist**: Thực hiện Giai đoạn 1 & DTO.
- **AI Specialist**: Thực hiện Giai đoạn 2.
- **Frontend Specialist**: Thực hiện Giai đoạn 3.
