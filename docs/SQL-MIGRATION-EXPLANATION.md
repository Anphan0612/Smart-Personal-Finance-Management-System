# Giải thích chi tiết 2 file SQL Migration

## 📄 File 1: `migration-add-color-and-update-nlp.sql`

### 🎯 Mục đích chính
Đồng bộ hóa hệ thống phân loại giao dịch (Category Mapping) giữa AI Service, Backend và Frontend để:
- AI nhận diện chính xác hơn (phân biệt "ăn ngoài" vs "đi chợ")
- Backend lưu trữ đầy đủ thông tin màu sắc và nhãn NLP
- Frontend hiển thị đẹp mắt với màu sắc chuẩn hóa

### 📋 Các bước thực hiện

#### **Bước 1: Thêm cột `color`**
```sql
ALTER TABLE categories ADD COLUMN color VARCHAR(7);
```
- **Công dụng**: Lưu mã màu hex (VD: `#E67E22`) cho mỗi category
- **Tại sao cần**: Frontend sẽ dùng màu này để vẽ biểu đồ Analytics, Budget charts
- **Ví dụ**: Category "Dining Out" có màu cam `#E67E22`, "Groceries" có màu đỏ cam `#FF5733`

#### **Bước 2: Thêm unique constraint cho `nlp_label`**
```sql
ALTER TABLE categories ADD CONSTRAINT unique_nlp_label UNIQUE (nlp_label);
```
- **Công dụng**: Đảm bảo mỗi nhãn NLP chỉ xuất hiện 1 lần trong database
- **Tại sao cần**: AI Service trả về nhãn như `DINING_OUT`, Backend phải lookup chính xác 1 category duy nhất
- **Tránh lỗi**: Nếu có 2 category cùng nhãn `DINING_OUT`, hệ thống sẽ bị nhầm lẫn

#### **Bước 3: Cập nhật nhãn NLP cho chính xác**
```sql
UPDATE categories SET nlp_label = 'DINING_OUT' WHERE id = 'cat-exp-001';
UPDATE categories SET nlp_label = 'GROCERIES_FOOD' WHERE id = 'cat-exp-005';
```
- **Trước đây**: 
  - `cat-exp-001` có nhãn `DINING` (mơ hồ)
  - `cat-exp-005` có nhãn `GROCERIES` (chung chung)
- **Bây giờ**:
  - `DINING_OUT` = Ăn ngoài (phở, cafe, nhà hàng, buffet)
  - `GROCERIES_FOOD` = Đi chợ (mua rau, thịt, siêu thị)
- **Lợi ích**: AI phân biệt rõ ràng "Ăn phở 50k" (DINING_OUT) vs "Mua rau 20k" (GROCERIES_FOOD)

#### **Bước 4: Gán màu sắc chuẩn hóa**
```sql
-- Thu nhập: Tông xanh lá
UPDATE categories SET color = '#2ECC71' WHERE id = 'cat-inc-001'; -- Salary
UPDATE categories SET color = '#27AE60' WHERE id = 'cat-inc-002'; -- Freelance

-- Chi tiêu: Màu đa dạng để phân biệt
UPDATE categories SET color = '#E67E22' WHERE id = 'cat-exp-001'; -- Dining Out (Cam)
UPDATE categories SET color = '#FF5733' WHERE id = 'cat-exp-005'; -- Groceries (Đỏ cam)
UPDATE categories SET color = '#3498DB' WHERE id = 'cat-exp-002'; -- Rent (Xanh dương)
```
- **Công dụng**: Mỗi category có màu riêng biệt
- **Ứng dụng**:
  - **Budget Screen**: Thanh progress bar hiển thị màu category
  - **Analytics Charts**: Biểu đồ tròn (Pie chart) dùng màu này
  - **Transaction List**: Icon category có thể tô màu tương ứng

#### **Bước 5: Thêm 3 category hiện đại**
```sql
INSERT INTO categories (id, name, type, nlp_label, icon_name, color, created_at)
SELECT 'cat-exp-014', 'Subscription', 'EXPENSE', 'SUBSCRIPTION', 'SUBSCRIPTIONS', '#607D8B', NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE id = 'cat-exp-014');
```
- **3 category mới**:
  1. **Subscription** (`#607D8B` - Xám xanh): Netflix, Spotify, YouTube Premium
  2. **Insurance** (`#5D4037` - Nâu): Bảo hiểm y tế, xe, nhân thọ
  3. **Charity** (`#E91E63` - Hồng): Từ thiện, quyên góp
- **Tại sao cần**: Đây là các loại chi tiêu phổ biến trong thời đại hiện đại
- **Cơ chế an toàn**: Dùng `WHERE NOT EXISTS` để tránh insert trùng nếu chạy lại script

---

## 📄 File 2: `migration-add-is-ai-suggested.sql`

### 🎯 Mục đích chính
Đánh dấu các giao dịch được AI tạo ra hoặc gợi ý để người dùng có thể xác nhận trước khi chấp nhận.

### 📋 Các bước thực hiện

#### **Bước 1: Thêm cột `is_ai_suggested`**
```sql
ALTER TABLE transactions ADD COLUMN is_ai_suggested BOOLEAN DEFAULT FALSE;
```
- **Công dụng**: Đánh dấu giao dịch có phải do AI tạo không
- **Giá trị**:
  - `TRUE`: Giao dịch được AI tạo từ OCR hoặc NLP (cần xác nhận)
  - `FALSE`: Giao dịch do người dùng nhập tay (đã xác nhận)

#### **Bước 2: Cập nhật dữ liệu cũ**
```sql
UPDATE transactions SET is_ai_suggested = FALSE WHERE is_ai_suggested IS NULL;
```
- **Công dụng**: Đánh dấu tất cả giao dịch cũ là "không phải AI"
- **Tại sao**: Các giao dịch trước khi có tính năng AI đều do người dùng tạo thủ công

### 🎨 Ứng dụng trong UI

#### **Kịch bản 1: OCR Receipt (Quét hóa đơn)**
```
User chụp ảnh hóa đơn → AI OCR đọc được:
- Số tiền: 150,000đ
- Mô tả: "Highlands Coffee"
- Category: DINING_OUT (AI gợi ý)

→ Backend lưu transaction với is_ai_suggested = TRUE
→ Frontend hiển thị:
  ┌─────────────────────────────────┐
  │ 🤖 AI Suggestion                │
  │ Highlands Coffee                │
  │ 150,000đ - Dining Out           │
  │ [✓ Confirm] [✏️ Edit] [✗ Delete]│
  └─────────────────────────────────┘
```

#### **Kịch bản 2: NLP Text Input**
```
User nhập: "Ăn phở 50k"
→ AI NER phân tích:
  - Amount: 50,000
  - Category: DINING_OUT
  - Type: EXPENSE

→ Backend lưu với is_ai_suggested = TRUE
→ Frontend hiển thị badge "AI Gợi ý" để user xác nhận
```

#### **Kịch bản 3: Manual Entry**
```
User tự nhập đầy đủ:
- Amount: 100,000
- Category: Transport
- Description: "Grab về nhà"

→ Backend lưu với is_ai_suggested = FALSE
→ Frontend không hiển thị badge, lưu luôn
```

---

## 🔄 Luồng hoạt động tổng thể

### **Trước khi có 2 file migration này:**
```
User: "Ăn phở 50k"
  ↓
AI Service: category = "FOOD" (mơ hồ, không rõ ăn ngoài hay đi chợ)
  ↓
Backend: Lưu vào category "Food & Dining" (không có màu sắc)
  ↓
Frontend: Hiển thị icon xám, không có màu trong chart
```

### **Sau khi có 2 file migration này:**
```
User: "Ăn phở 50k"
  ↓
AI Service: category = "DINING_OUT" (rõ ràng: ăn ngoài)
  ↓
Backend: 
  - Lookup category với nlp_label = "DINING_OUT"
  - Tìm thấy: id=cat-exp-001, name="Dining Out", color="#E67E22"
  - Lưu transaction với is_ai_suggested = TRUE
  ↓
Frontend:
  - Hiển thị icon RESTAURANT màu cam #E67E22
  - Hiển thị badge "🤖 AI Gợi ý"
  - User có thể confirm hoặc edit
  - Sau khi confirm: is_ai_suggested = FALSE
```

---

## ✅ Lợi ích tổng thể

### **1. Độ chính xác AI tăng**
- Phân biệt rõ "ăn ngoài" vs "đi chợ"
- Nhận diện thêm Subscription, Insurance, Charity

### **2. Trải nghiệm người dùng tốt hơn**
- Màu sắc đẹp mắt trong biểu đồ Analytics
- Biết được giao dịch nào do AI tạo (có thể sai)
- Có cơ hội xác nhận/sửa trước khi lưu vĩnh viễn

### **3. Dữ liệu nhất quán**
- AI, Backend, Frontend đều dùng chung bộ nhãn
- Không còn tình trạng AI trả về nhãn không tồn tại trong DB
- Unique constraint đảm bảo không bị trùng lặp

---

## 🚀 Cách chạy migration

```bash
# Kết nối vào MySQL
mysql -u root -p smart_money_tracking

# Chạy file 1 (thêm color và cập nhật nlp_label)
source backend/src/main/resources/db/migration-add-color-and-update-nlp.sql

# Chạy file 2 (thêm is_ai_suggested)
source backend/src/main/resources/db/migration-add-is-ai-suggested.sql

# Kiểm tra kết quả
SELECT id, name, nlp_label, color FROM categories;
DESCRIBE transactions;
```

---

## 🔍 Kiểm tra sau khi chạy

```sql
-- Kiểm tra categories có màu chưa
SELECT id, name, nlp_label, color, icon_name FROM categories;

-- Kết quả mong đợi:
-- cat-exp-001 | Dining Out | DINING_OUT | #E67E22 | RESTAURANT
-- cat-exp-005 | Groceries  | GROCERIES_FOOD | #FF5733 | GROCERY
-- cat-exp-014 | Subscription | SUBSCRIPTION | #607D8B | SUBSCRIPTIONS

-- Kiểm tra transactions có cột is_ai_suggested chưa
DESCRIBE transactions;

-- Kết quả mong đợi:
-- is_ai_suggested | tinyint(1) | YES | | 0 |
```
