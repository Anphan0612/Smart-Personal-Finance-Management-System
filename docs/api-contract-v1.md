# API Contract v1

> Version: v1 | Sprint 2 (March 2026) | Active

## 1. Unified Response Envelope

### Success
```json
{ "success": true, "code": 200, "message": "Operation successful", "data": {}, "timestamp": "2026-03-31T03:00:00Z" }
```

### Error
```json
{ "success": false, "code": 400, "errorCode": "VALIDATION_ERROR", "message": "Validation failed", "traceId": "uuid", "path": "/api/v1/wallets", "fieldErrors": [{"field":"name","message":"must not be blank"}], "timestamp": "2026-03-31T03:00:00Z" }
```

## 2. Error Codes

| Error Code | HTTP | Description |
|---|---|---|
| VALIDATION_ERROR | 400 | Request validation failed |
| JSON_PARSE_ERROR | 400 | Malformed JSON |
| INVALID_CREDENTIALS | 401 | Auth failed |
| UNAUTHORIZED_ACCESS | 403 | Insufficient permissions |
| RESOURCE_NOT_FOUND | 404 | Resource not found |
| CATEGORY_NOT_FOUND | 404 | Category not found |
| WALLET_NOT_FOUND | 404 | Wallet not found |
| USER_NOT_FOUND | 404 | User not found |
| USER_ALREADY_EXISTS | 409 | Duplicate user |
| BUSINESS_RULE_VIOLATION | 422 | Business rule error |
| INSUFFICIENT_BALANCE | 422 | Insufficient funds |
| NLP_EXTRACTION_ERROR | 422 | NLP processing failed |
| INTERNAL_ERROR | 500 | Unexpected error |

## 3. FE/Mobile TypeScript Interface

```typescript
interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  timestamp: string;
  data?: T;
  errorCode?: string;
  traceId?: string;
  path?: string;
  fieldErrors?: { field: string; message: string }[];
}
```

## 4. Versioning

- Current: v1 (prefix /api/v1/*)
- Auth: /api/auth/* (migrate to v1 in future sprint)
- Breaking changes require new major version
- Additive changes allowed in current version
