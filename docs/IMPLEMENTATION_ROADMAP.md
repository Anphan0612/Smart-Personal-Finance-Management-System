# Implementation Roadmap: Smart Personal Finance Management System
**Last Updated:** 2026-04-14  
**Current Phase:** Pre-Submission Polish  
**Target Submission:** TBD (University Deadline)

---

## Current State Summary

**Branch:** `feature/ocr-v1-stable`  
**Implementation Level:** 85% Complete  
**Critical Path:** Documentation + Security + Testing

### What's Working
- ✅ Full backend API (Spring Boot)
- ✅ Mobile app with receipt scanning
- ✅ AI/NLP service (Vietnamese)
- ✅ OCR receipt processing
- ✅ Multi-wallet management
- ✅ Budget tracking
- ✅ Dashboard with charts

### What Needs Attention
- 🔴 **CRITICAL:** Exposed API keys in `.env`
- 🔴 **CRITICAL:** Missing cost tracking (university requirement)
- ⚠️ **HIGH:** Test coverage insufficient
- ⚠️ **HIGH:** Documentation incomplete
- ⚠️ **MEDIUM:** Security hardening needed

---

## Phase 1: CRITICAL SECURITY FIX (4-6 hours)

### 1.1 Remove Exposed API Keys
**Priority:** 🔴 IMMEDIATE  
**Estimated Time:** 2 hours

```bash
# Step 1: Create .env.example template
cp .env .env.example

# Step 2: Replace real values with placeholders in .env.example
# Edit .env.example to contain:
GROQ_API_KEY=your_groq_api_key_here
DB_PASSWORD=your_database_password
JWT_SECRET=your_jwt_secret_at_least_256_bits

# Step 3: Remove .env from git history
git rm --cached .env
echo ".env" >> .gitignore

# Step 4: Commit the fix
git add .env.example .gitignore
git commit -m "security: remove exposed credentials and add .env.example template"

# Step 5: Rotate the exposed Groq API key
# Go to Groq dashboard and generate new key
```

**Deliverable:** Clean git history with no exposed credentials

### 1.2 Update Documentation
**Priority:** 🔴 IMMEDIATE  
**Estimated Time:** 1 hour

Create `docs/SETUP.md` with:
- How to create `.env` from `.env.example`
- Where to get API keys (Groq)
- Database setup instructions
- First-time run checklist

**Deliverable:** `docs/SETUP.md`

### 1.3 Security Audit Checklist
**Priority:** 🔴 IMMEDIATE  
**Estimated Time:** 2-3 hours

- [ ] SQL Injection testing on all endpoints
- [ ] JWT token validation (expiry, signature)
- [ ] CORS configuration (restrict origins)
- [ ] Input validation on all DTOs
- [ ] File upload security (receipt images)
- [ ] Rate limiting on AI endpoints

**Deliverable:** Security audit report

---

## Phase 2: COMPLIANCE & COST TRACKING (6-8 hours)

### 2.1 Implement API Cost Tracking
**Priority:** 🔴 CRITICAL (University Requirement)  
**Estimated Time:** 4-5 hours

**Backend Changes:**

1. Create `ApiUsageLog` entity:
```java
@Entity
public class ApiUsageLog {
    @Id
    private String id;
    private String userId;
    private String endpoint; // "extract-transaction", "query-history"
    private Integer tokensUsed;
    private BigDecimal estimatedCost;
    private LocalDateTime timestamp;
}
```

2. Create interceptor to log AI service calls
3. Add dashboard endpoint: `GET /api/v1/usage/summary`
4. Calculate costs based on Groq pricing

**AI Service Changes:**

1. Return token usage in response headers:
```python
response.headers["X-Tokens-Used"] = str(token_count)
```

2. Log all LLM calls with token counts

**Deliverable:** Cost tracking system with user-facing dashboard

### 2.2 Document AI Model Selection
**Priority:** 🔴 CRITICAL (University Requirement)  
**Estimated Time:** 2-3 hours

Create `docs/03-ai-nlp/MODEL_SELECTION_RATIONALE.md`:

**Required Content:**
- Why PhoBERT for Vietnamese NER?
- Why Groq (gpt-oss-120b) vs OpenAI/Claude?
- Why PaddleOCR vs Tesseract/Google Vision?
- Cost comparison table
- Accuracy benchmarks
- Trade-offs analysis

**Deliverable:** `MODEL_SELECTION_RATIONALE.md`

---

## Phase 3: TESTING & QUALITY (2-3 days)

### 3.1 Backend Unit Tests
**Priority:** ⚠️ HIGH  
**Estimated Time:** 1 day

**Target Coverage:** 60% minimum

**Priority Test Files:**
- `ExtractTransactionViaNlpUseCaseTest.java`
- `QueryHistoryViaNlpUseCaseTest.java`
- `TransactionServiceTest.java`
- `BudgetServiceTest.java`
- `WalletServiceTest.java`

**Test Scenarios:**
- Happy path (valid inputs)
- Edge cases (empty strings, null values)
- Error handling (AI service down)
- Business rules (insufficient balance, negative amounts)

**Deliverable:** Test suite with 60%+ coverage

### 3.2 AI Service Tests
**Priority:** ⚠️ HIGH  
**Estimated Time:** 4-6 hours

**Test Files:**
- `test_ner_service.py` (PhoBERT extraction)
- `test_ocr_service.py` (receipt parsing)
- `test_query_service.py` (intent classification)
- `test_anomaly_service.py` (spending anomalies)

**Test Dataset:**
Use existing `docs/03-ai-nlp/nlp-benchmark-dataset-v1.csv`

**Deliverable:** Python test suite with pytest

### 3.3 Integration Tests
**Priority:** ⚠️ MEDIUM  
**Estimated Time:** 6-8 hours

**Test Scenarios:**
1. End-to-end transaction creation via NLP
2. Receipt upload → OCR → transaction creation
3. Budget alert triggering
4. Dashboard data aggregation
5. Multi-wallet balance updates

**Deliverable:** Integration test suite

---

## Phase 4: DOCUMENTATION (3-4 days)

### 4.1 Technical Documentation
**Priority:** ⚠️ HIGH  
**Estimated Time:** 1.5 days

**Required Documents:**

1. **`docs/ARCHITECTURE.md`** (4-6 hours)
   - System architecture diagram
   - Component interaction flow
   - Database schema (ERD)
   - API architecture
   - Deployment architecture

2. **`docs/API_DOCUMENTATION.md`** (2-3 hours)
   - Export Swagger/OpenAPI spec
   - Add usage examples
   - Authentication flow
   - Error codes reference

3. **`docs/DATABASE_SCHEMA.md`** (2-3 hours)
   - Entity relationship diagram
   - Table descriptions
   - Indexes and constraints
   - Migration strategy

**Deliverable:** Complete technical documentation

### 4.2 User Documentation (Vietnamese)
**Priority:** ⚠️ HIGH  
**Estimated Time:** 1 day

**Required Documents:**

1. **`docs/HUONG_DAN_SU_DUNG.md`** (User Manual)
   - Đăng ký và đăng nhập
   - Quản lý ví và tài khoản ngân hàng
   - Nhập giao dịch bằng ngôn ngữ tự nhiên
   - Quét hóa đơn bằng OCR
   - Thiết lập ngân sách
   - Xem thống kê và báo cáo
   - Truy vấn lịch sử bằng AI

2. **Screenshots and Videos**
   - Mobile app screenshots (all key screens)
   - Demo video (5-10 minutes)

**Deliverable:** Vietnamese user manual with visuals

### 4.3 Project Report (Vietnamese)
**Priority:** 🔴 CRITICAL (University Requirement)  
**Estimated Time:** 2-3 days

**Report Structure (Suggested):**

```
CHƯƠNG 1: GIỚI THIỆU
1.1 Đặt vấn đề
1.2 Mục tiêu đề tài
1.3 Phạm vi nghiên cứu
1.4 Phương pháp thực hiện

CHƯƠNG 2: CƠ SỞ LÝ THUYẾT
2.1 Xử lý ngôn ngữ tự nhiên (NLP)
2.2 Mô hình Transformer và PhoBERT
2.3 Optical Character Recognition (OCR)
2.4 Kiến trúc Microservices

CHƯƠNG 3: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG
3.1 Yêu cầu chức năng
3.2 Yêu cầu phi chức năng
3.3 Thiết kế kiến trúc hệ thống
3.4 Thiết kế cơ sở dữ liệu
3.5 Thiết kế giao diện người dùng

CHƯƠNG 4: TÍCH HỢP AI/NLP
4.1 Lựa chọn mô hình AI
4.2 Xử lý ngôn ngữ tự nhiên tiếng Việt
4.3 Nhận diện ký tự quang học (OCR)
4.4 Phân tích chi tiêu và phát hiện bất thường
4.5 Chi phí sử dụng API

CHƯƠNG 5: TRIỂN KHAI VÀ KIỂM THỬ
5.1 Môi trường triển khai
5.2 Quy trình kiểm thử
5.3 Kết quả kiểm thử
5.4 Đánh giá hiệu năng

CHƯƠNG 6: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN
6.1 Kết quả đạt được
6.2 Hạn chế của hệ thống
6.3 Hướng phát triển tương lai

TÀI LIỆU THAM KHẢO
PHỤ LỤC
```

**Deliverable:** Complete project report (40-60 pages)

---

## Phase 5: DEPLOYMENT & DEMO PREP (1-2 days)

### 5.1 Deployment Documentation
**Priority:** ⚠️ MEDIUM  
**Estimated Time:** 4-6 hours

**Create `docs/DEPLOYMENT.md`:**

1. **Local Development Setup**
   - Prerequisites (Java 17, Node.js, Python 3.10+)
   - Database setup (MySQL)
   - Environment configuration
   - Running all services

2. **Production Deployment** (Optional)
   - Docker containerization
   - Cloud deployment (AWS/GCP/Azure)
   - CI/CD pipeline
   - Monitoring and logging

**Deliverable:** Deployment guide

### 5.2 Demo Preparation
**Priority:** ⚠️ HIGH  
**Estimated Time:** 1 day

**Demo Checklist:**
- [ ] Clean database with sample data
- [ ] Test all features on demo device
- [ ] Prepare demo script (5-10 minutes)
- [ ] Record backup demo video
- [ ] Prepare Q&A responses
- [ ] Test on university network (if applicable)

**Demo Flow (Suggested):**
1. User registration and login (30 sec)
2. Manual transaction entry (30 sec)
3. NLP transaction entry: "Chi 50k ăn phở" (1 min)
4. Receipt scanning with OCR (1.5 min)
5. Budget setup and tracking (1 min)
6. Dashboard and statistics (1 min)
7. AI query: "Chi bao nhiêu cho ăn uống tuần này?" (1 min)
8. Multi-wallet management (1 min)
9. Q&A (2-3 min)

**Deliverable:** Demo-ready system + video backup

---

## Phase 6: FINAL POLISH (2-3 days)

### 6.1 Code Quality
**Priority:** ⚠️ MEDIUM  
**Estimated Time:** 1 day

- [ ] Remove commented-out code
- [ ] Fix all compiler warnings
- [ ] Consistent code formatting
- [ ] Add missing JavaDoc/docstrings
- [ ] Remove debug print statements
- [ ] Update all TODO comments

**Deliverable:** Clean, production-ready code

### 6.2 UI/UX Polish
**Priority:** ⚠️ MEDIUM  
**Estimated Time:** 1 day

- [ ] Fix any UI glitches
- [ ] Consistent Vietnamese translations
- [ ] Loading states for all async operations
- [ ] Error messages user-friendly
- [ ] Accessibility improvements
- [ ] Dark mode consistency (if implemented)

**Deliverable:** Polished mobile app

### 6.3 Performance Optimization
**Priority:** ⚠️ LOW  
**Estimated Time:** 4-6 hours

- [ ] Database query optimization
- [ ] API response time < 500ms (95th percentile)
- [ ] Mobile app bundle size optimization
- [ ] AI service response time < 2s
- [ ] Image compression for receipts

**Deliverable:** Performance benchmark report

---

## Timeline Summary

| Phase | Priority | Duration | Dependencies |
|-------|----------|----------|--------------|
| **Phase 1: Security** | 🔴 CRITICAL | 4-6 hours | None |
| **Phase 2: Compliance** | 🔴 CRITICAL | 6-8 hours | Phase 1 |
| **Phase 3: Testing** | ⚠️ HIGH | 2-3 days | Phase 1 |
| **Phase 4: Documentation** | ⚠️ HIGH | 3-4 days | Phase 2, 3 |
| **Phase 5: Deployment** | ⚠️ MEDIUM | 1-2 days | Phase 1, 4 |
| **Phase 6: Polish** | ⚠️ MEDIUM | 2-3 days | All above |

**Total Estimated Time:** 10-15 working days (2-3 weeks)

---

## Risk Management

### High-Risk Items
1. **API Key Exposure:** Could lead to unauthorized usage charges
   - **Mitigation:** Immediate key rotation + git history cleanup
   
2. **Missing Cost Tracking:** Fails university requirement
   - **Mitigation:** Prioritize Phase 2.1 implementation

3. **Insufficient Testing:** System instability during demo
   - **Mitigation:** Allocate full 2-3 days for Phase 3

### Medium-Risk Items
1. **Documentation Delay:** Incomplete submission
   - **Mitigation:** Start Phase 4 in parallel with Phase 3

2. **Demo Failure:** Technical issues during presentation
   - **Mitigation:** Record backup video, test on demo device

### Low-Risk Items
1. **Performance Issues:** Slow response times
   - **Mitigation:** Phase 6.3 optimization (optional)

---

## Success Criteria

### Minimum Viable Submission
- ✅ All mandatory features working
- ✅ AI/NLP integration functional
- ✅ No exposed credentials
- ✅ Cost tracking implemented
- ✅ Basic documentation complete
- ✅ Demo-ready system

### Excellent Submission
- ✅ All above +
- ✅ 60%+ test coverage
- ✅ Complete technical documentation
- ✅ Professional project report
- ✅ Polished UI/UX
- ✅ Performance optimized
- ✅ Security hardened

---

## Next Actions (Immediate)

**Today (2026-04-14):**
1. ⚠️ Remove exposed API keys from `.env`
2. ⚠️ Create `.env.example` template
3. ⚠️ Rotate Groq API key
4. ⚠️ Commit security fix

**This Week:**
1. Implement cost tracking system
2. Write AI model selection rationale
3. Start backend unit tests
4. Begin architecture documentation

**Next Week:**
1. Complete testing phase
2. Write user manual (Vietnamese)
3. Start project report
4. Prepare demo

---

**Document Status:** ACTIVE ROADMAP  
**Owner:** Development Team  
**Review Frequency:** Weekly
