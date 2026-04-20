# Quick Start Checklist: Immediate Actions
**Date:** 2026-04-14  
**Priority:** CRITICAL SECURITY + COMPLIANCE

---

## 🔴 CRITICAL: Do These TODAY (4-6 hours)

### ✅ Task 1: Secure API Keys (2 hours)

**Step-by-step:**

```bash
# 1. Navigate to project root
cd c:\Smart-Personal-Finance-Management-System

# 2. Create .env.example from current .env
cp .env .env.example

# 3. Edit .env.example - replace real values with placeholders
# Use any text editor to change:
GROQ_API_KEY=your_groq_api_key_here
DB_PASSWORD=your_database_password
JWT_SECRET=your_jwt_secret_at_least_256_bits_long

# 4. Remove .env from git tracking
git rm --cached .env

# 5. Add .env to .gitignore (if not already there)
echo "" >> .gitignore
echo "# Environment variables" >> .gitignore
echo ".env" >> .gitignore

# 6. Commit the security fix
git add .env.example .gitignore
git commit -m "security: remove exposed credentials, add .env.example template"

# 7. IMPORTANT: Rotate the exposed Groq API key
# Go to: https://console.groq.com/keys
# Delete old key: your_groq_api_key_here
# Generate new key and update your local .env file
```

**Verification:**
```bash
# Check that .env is not tracked
git status | grep ".env"
# Should show: nothing (or only .env.example)

# Check that .env.example has no real keys
cat .env.example | grep "gsk_"
# Should show: nothing (only placeholder text)
```

**Status:** [ ] DONE

---

### ✅ Task 2: Create Setup Documentation (1 hour)

**Create:** `docs/SETUP.md`

**Required content:**
```markdown
# Development Setup Guide

## Prerequisites
- Java 17+
- Node.js 18+
- Python 3.10+
- MySQL 8.0+

## Step 1: Clone Repository
git clone <repo-url>
cd Smart-Personal-Finance-Management-System

## Step 2: Environment Configuration
cp .env.example .env
# Edit .env and fill in:
# - GROQ_API_KEY (get from https://console.groq.com)
# - DB_PASSWORD (your MySQL password)
# - JWT_SECRET (generate random 256-bit string)

## Step 3: Database Setup
mysql -u root -p
CREATE DATABASE smart_money_tracking;
exit;

## Step 4: Backend Setup
cd backend
mvn clean install
mvn spring-boot:run
# Backend runs on http://localhost:8080

## Step 5: AI Service Setup
cd ai-service
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# AI service runs on http://localhost:8000

## Step 6: Mobile App Setup
cd mobile
npm install
npm start
# Follow Expo instructions to run on device/emulator
```

**Status:** [ ] DONE

---

### ✅ Task 3: Document Current Uncommitted Changes (30 min)

**You have uncommitted changes on `feature/ocr-v1-stable`:**

```bash
# Review what's changed
git diff --stat

# Create a commit for current work
git add backend/pom.xml
git add backend/src/main/java/com/example/smartmoneytracking/application/service/OcrAsyncService.java
git add backend/src/main/java/com/example/smartmoneytracking/application/service/common/DateUtils.java
git add backend/src/main/java/com/example/smartmoneytracking/domain/entities/budget/Budget.java
git add backend/src/main/java/com/example/smartmoneytracking/domain/entities/receipt/Receipt.java
git add backend/src/main/java/com/example/smartmoneytracking/domain/entities/transaction/Transaction.java
git add backend/src/main/java/com/example/smartmoneytracking/infrastructure/controllers/ReceiptController.java
git add backend/src/main/resources/application.properties
git add backend/src/test/java/com/example/smartmoneytracking/infrastructure/controllers/ApiResponseContractTest.java

# Commit with descriptive message
git commit -m "feat(backend): improve timezone handling and ocr async processing

- Add DateUtils helper for timezone conversions
- Update OcrAsyncService with better error handling
- Adjust entity timestamp handling (Budget, Receipt, Transaction)
- Remove redundant Jackson timezone config
- Add test for API response contract

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

**Status:** [ ] DONE

---

## ⚠️ HIGH PRIORITY: Do This Week (2-3 days)

### ✅ Task 4: Implement Cost Tracking (4-5 hours)

**Backend changes needed:**

1. Create entity: `backend/src/main/java/.../domain/entities/ApiUsageLog.java`
2. Create repository: `backend/src/main/java/.../domain/repositories/ApiUsageLogRepository.java`
3. Create service: `backend/src/main/java/.../application/service/ApiUsageTrackingService.java`
4. Update `NlpExtractionClient.java` to log token usage
5. Create endpoint: `GET /api/v1/usage/summary`

**AI service changes needed:**

1. Update `ai-service/main.py` to return token counts in response
2. Add token counting logic for Groq API calls

**Deliverable:** Working cost tracking visible in mobile app

**Status:** [ ] DONE

---

### ✅ Task 5: Write AI Model Selection Rationale (2-3 hours)

**Create:** `docs/03-ai-nlp/MODEL_SELECTION_RATIONALE.md`

**Required sections:**
1. Why PhoBERT for Vietnamese NER?
2. Why Groq vs OpenAI/Claude?
3. Why PaddleOCR vs alternatives?
4. Cost comparison table
5. Accuracy benchmarks (use existing benchmark data)
6. Trade-offs analysis

**Status:** [ ] DONE

---

### ✅ Task 6: Security Audit (2-3 hours)

**Checklist:**
- [ ] Test SQL injection on all endpoints
- [ ] Verify JWT token expiration works
- [ ] Update CORS to restrict origins (not `allow_origins=["*"]`)
- [ ] Test file upload security (receipt images)
- [ ] Add rate limiting to AI endpoints
- [ ] Verify password hashing (BCrypt)

**Deliverable:** Security audit report in `docs/SECURITY_AUDIT.md`

**Status:** [ ] DONE

---

## 📋 MEDIUM PRIORITY: Next Week (5-7 days)

### ✅ Task 7: Backend Unit Tests (1 day)

**Target:** 60% code coverage

**Priority test files:**
- `ExtractTransactionViaNlpUseCaseTest.java`
- `QueryHistoryViaNlpUseCaseTest.java`
- `TransactionServiceTest.java`
- `BudgetServiceTest.java`

**Status:** [ ] DONE

---

### ✅ Task 8: Architecture Documentation (1 day)

**Create:** `docs/ARCHITECTURE.md`

**Required diagrams:**
1. System architecture (Backend + AI Service + Mobile)
2. Database ERD
3. API flow diagrams
4. Deployment architecture

**Tools:** Draw.io, PlantUML, or Mermaid

**Status:** [ ] DONE

---

### ✅ Task 9: User Manual (Vietnamese) (1 day)

**Create:** `docs/HUONG_DAN_SU_DUNG.md`

**Required content:**
- Hướng dẫn đăng ký/đăng nhập
- Hướng dẫn nhập giao dịch bằng NLP
- Hướng dẫn quét hóa đơn
- Hướng dẫn thiết lập ngân sách
- Hướng dẫn xem thống kê

**Include:** Screenshots from mobile app

**Status:** [ ] DONE

---

### ✅ Task 10: Demo Preparation (1 day)

**Checklist:**
- [ ] Clean database with realistic sample data
- [ ] Test all features on demo device
- [ ] Write demo script (5-10 minutes)
- [ ] Record backup demo video
- [ ] Prepare Q&A responses
- [ ] Test on slow network (simulate real conditions)

**Status:** [ ] DONE

---

## 📊 Progress Tracking

**Overall Completion:** 0/10 tasks

**Critical Path:**
1. Task 1 (Security) → Task 2 (Setup) → Task 3 (Commit)
2. Task 4 (Cost Tracking) → Task 5 (AI Rationale)
3. Task 6 (Security Audit)
4. Task 7-10 (Documentation + Testing)

**Estimated Total Time:** 10-15 working days

---

## 🎯 Success Metrics

**Minimum for Submission:**
- [x] No exposed credentials in git
- [ ] Cost tracking functional
- [ ] AI model selection documented
- [ ] Basic security audit complete
- [ ] User manual in Vietnamese
- [ ] Demo-ready system

**Excellent Submission:**
- [ ] All above +
- [ ] 60%+ test coverage
- [ ] Complete architecture docs
- [ ] Professional project report
- [ ] Polished UI/UX

---

## 📞 Need Help?

**Common Issues:**

1. **Git history cleanup:** If `.env` is already committed multiple times, use:
   ```bash
   git filter-branch --force --index-filter \
   "git rm --cached --ignore-unmatch .env" HEAD
   ```

2. **Groq API key rotation:** 
   - Login to https://console.groq.com
   - Go to API Keys section
   - Delete old key
   - Create new key
   - Update local `.env`

3. **Database connection issues:**
   - Check MySQL is running: `mysql -u root -p`
   - Verify database exists: `SHOW DATABASES;`
   - Check timezone settings in `application.properties`

---

**Last Updated:** 2026-04-14  
**Next Review:** After Task 3 completion
