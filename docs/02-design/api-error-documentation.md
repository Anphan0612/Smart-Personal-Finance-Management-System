# API Error Response Documentation

## Purpose
Chuẩn hóa format error response để frontend (FE) map message/UI thống nhất cho mọi endpoint.

## Scope
Tất cả response lỗi của backend API theo các nhóm (4xx/422/5xx), bao gồm contract errorCode, message, path, traceId và errors[] cho validation.

## Owner
Backend + Frontend Team (Team Antigravity).

## Last updated
2026-03-27

> **Version:** 1.0 | **Last Updated:** 2026-03-27
> **Audience:** Frontend developers

---

## Error Response Format

Tất cả API errors trả về format thống nhất:

```json
{
  "status": 400,
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed",
  "path": "/api/v1/transactions",
  "timestamp": "2026-03-27T22:16:04",
  "traceId": "d4fe3454-31d9-471a-b55a-5ab26a55f7ac",
  "errors": [
    { "field": "amount", "message": "Amount is required" },
    { "field": "walletId", "message": "Wallet ID is required" }
  ]
}
```

| Field | Type | Nullable | Mô tả |
|-------|------|----------|-------|
| `status` | `int` | No | HTTP status code |
| `errorCode` | `string` | No | Error code (dùng để map message/UI) |
| `message` | `string` | No | Mô tả lỗi tổng quát (không hiển thị cho user nếu có `errors`) |
| `path` | `string` | No | API endpoint gây lỗi |
| `timestamp` | `string` | No | ISO 8601 datetime |
| `traceId` | `string` | No | UUID để trace log (gửi kèm bug report) |
| `errors` | `array` | Yes | Danh sách field-level errors (chỉ có khi `VALIDATION_ERROR`) |
| `errors[].field` | `string` | No | Tên field bị lỗi |
| `errors[].message` | `string` | No | Message chi tiết cho field |

> **Lưu ý:** Success response vẫn dùng `CommonApiResponse<T>` (không thay đổi). Chỉ **error responses** dùng format mới này.

---

## Error Codes

### Client Errors (4xx)

| errorCode | HTTP | Message mặc định | Khi nào xảy ra | FE Action |
|-----------|------|-------------------|-----------------|-----------|
| `VALIDATION_ERROR` | 400 | Validation failed | Input không hợp lệ (field rỗng, negative amount, future date...) | Hiển thị `errors[]` cho từng field |
| `JSON_PARSE_ERROR` | 400 | Invalid JSON format | Request body không phải JSON hợp lệ | Hiển thị "Dữ liệu không hợp lệ" |
| `INVALID_CREDENTIALS` | 401 | Invalid credentials | Sai email/password | Hiển thị "Sai thông tin đăng nhập" |
| `UNAUTHORIZED_ACCESS` | 403 | Unauthorized access | Truy cập resource không thuộc về user | Redirect về trang chủ |
| `RESOURCE_NOT_FOUND` | 404 | Resource not found | ID không tồn tại | Hiển thị "Không tìm thấy" |
| `USER_NOT_FOUND` | 404 | User not found | User ID không tồn tại | Hiển thị "Tài khoản không tồn tại" |
| `WALLET_NOT_FOUND` | 404 | Wallet not found | Wallet ID không tồn tại | Hiển thị "Ví không tồn tại" |
| `CATEGORY_NOT_FOUND` | 404 | Category not found | Category ID không tồn tại | Hiển thị "Danh mục không tồn tại" |
| `USER_ALREADY_EXISTS` | 409 | User already exists | Email đã đăng ký | Hiển thị "Email đã được sử dụng" |

### Business Errors (422)

| errorCode | HTTP | Message mặc định | Khi nào xảy ra | FE Action |
|-----------|------|-------------------|-----------------|-----------|
| `BUSINESS_RULE_VIOLATION` | 422 | Business rule violation | Vi phạm quy tắc nghiệp vụ chung | Hiển thị `message` |
| `TRANSACTION_DATE_IN_FUTURE` | 422 | Transaction date cannot be in the future | Ngày giao dịch > hiện tại | Hiển thị "Ngày giao dịch không được ở tương lai" |
| `INSUFFICIENT_BALANCE` | 422 | Insufficient wallet balance | Số dư ví không đủ | Hiển thị "Số dư không đủ" |
| `NLP_EXTRACTION_ERROR` | 422 | NLP extraction failed | AI không thể trích xuất thông tin | Hiển thị "Không nhận diện được, vui lòng nhập thủ công" |

### Server Errors (5xx)

| errorCode | HTTP | Message mặc định | Khi nào xảy ra | FE Action |
|-----------|------|-------------------|-----------------|-----------|
| `INTERNAL_ERROR` | 500 | An unexpected error occurred | Lỗi hệ thống không xác định | Hiển thị "Lỗi hệ thống, vui lòng thử lại" + log `traceId` |

---

## Frontend Integration Guide

### 1. Axios Interceptor (Recommended)

```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { data } = error.response;
    
    switch (data.errorCode) {
      case 'VALIDATION_ERROR':
        // Map field errors vào form
        const fieldErrors = {};
        data.errors?.forEach(e => { fieldErrors[e.field] = e.message; });
        return Promise.reject({ type: 'validation', fields: fieldErrors });
        
      case 'INVALID_CREDENTIALS':
        showToast('Sai thông tin đăng nhập');
        break;
        
      case 'UNAUTHORIZED_ACCESS':
        router.push('/login');
        break;
        
      case 'INSUFFICIENT_BALANCE':
        showToast('Số dư không đủ');
        break;
        
      case 'INTERNAL_ERROR':
        showToast(`Lỗi hệ thống. Mã lỗi: ${data.traceId}`);
        break;
        
      default:
        showToast(data.message);
    }
    
    return Promise.reject(error);
  }
);
```

### 2. Validation Error → Form Display

Khi `errorCode === 'VALIDATION_ERROR'`, dùng `errors[]` để highlight từng field:

```javascript
// errors: [{ field: "amount", message: "Amount must be positive" }]
data.errors.forEach(err => {
  setFieldError(err.field, err.message);
});
```

### 3. TraceId cho Bug Report

Khi gặp `INTERNAL_ERROR` (500), hiển thị `traceId` cho user để gửi support:

```
"Đã xảy ra lỗi. Vui lòng liên hệ hỗ trợ với mã: d4fe3454-31d9"
```

---

## Validation Rules (Transaction API)

| Field | Rules | Error Messages |
|-------|-------|---------------|
| `walletId` | `@NotBlank` | "Wallet ID is required" |
| `amount` | `@NotNull`, `@Positive` | "Amount is required", "Amount must be positive" |
| `type` | `@NotNull` | "Transaction type is required" |
| `transactionDate` | `@NotNull`, `@PastOrPresent` | "Transaction date is required", "Transaction date cannot be in the future" |
| `categoryId` | Optional | Nếu có → phải tồn tại trong DB (422 `CATEGORY_NOT_FOUND`) |
| `description` | Optional | Không validate |
