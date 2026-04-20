# NLP Benchmark Protocol v1

## Mục tiêu

- Đo chất lượng MVP cho `POST /api/ai/extract-transaction`.
- Dùng kết quả benchmark cho Sprint Review và báo cáo đồ án.

## Input benchmark

- Dataset: `./nlp-benchmark-dataset-v1.csv` (100 câu).
- Trường đánh giá chính:
  - `expected_amount`
  - `expected_type`
  - `expected_category`

## Cách chạy benchmark

1. Dùng script hoặc Postman collection để gọi endpoint parse với từng `text`.
2. Lưu raw response theo từng dòng vào file kết quả `benchmark-result-v1.csv`.
3. Tính metric theo công thức bên dưới.

## Metric

- **Amount Exact Accuracy**
  - `so_cau_amount_dung / 100`
- **Type Accuracy**
  - `so_cau_type_dung / 100`
- **Category Accuracy**
  - `so_cau_category_dung / 100`
- **All-fields Accuracy**
  - `so_cau_amount_type_category_dung_dong_thoi / 100`
- **Parse Success Rate**
  - `so_cau_co_response_hop_le / 100`

## Ngưỡng đạt Sprint 2

- Amount Exact Accuracy >= 0.80
- Type Accuracy >= 0.90
- Category Accuracy >= 0.75
- Parse Success Rate >= 0.95

## Quy tắc chấm

- Chấp nhận chuẩn hóa tiền tệ (`45k` -> `45000`).
- So khớp category theo enum chuẩn backend.
- Nếu response thiếu trường bắt buộc -> tính sai cho trường đó.
- Timeout hoặc 5xx -> tính thất bại parse.

## Báo cáo bắt buộc sau mỗi lần chạy

- Bảng metric hiện tại và baseline trước đó.
- Top 10 mẫu câu lỗi nhiều nhất.
- Phân loại lỗi:
  - Nhận diện amount sai
  - Category map sai
  - Thiếu date/type
  - Lỗi hệ thống/timeout

## Lịch chạy đề xuất

- Day 3: dry-run 20 câu.
- Day 7: benchmark đầy đủ 100 câu.
- Day 9: rerun sau fix và chốt số liệu review sprint.
