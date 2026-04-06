# 💸 Smart Personal Finance Management System

> Một hệ thống quản lý tài chính cá nhân thông minh kết hợp trí tuệ nhân tạo (AI/NLP) để tự động hóa việc theo dõi chi tiêu và lập kế hoạch tài chính.

---

## 🌟 Tính năng Nổi bật

- **AI-Powered Extraction**: Parsing văn bản tự nhiên (Natural Language Parsing) để tự động ghi lại giao dịch.
- **Clean Architecture**: Backend Java Spring Boot tuân thủ nguyên tắc Clean Architecture.
- **Modern Mobile UI**: React Native (Expo) với trải nghiệm người dùng tối ưu.
- **AI Insights**: Phân tích biểu đồ và đưa ra lời khuyên tài chính cá nhân.

---

## 🏗️ Cấu trúc Dự án

```text
├── backend/          #  Spring Boot API (Java 17+)
├── ai-service/       #  FastAPI NLP/ML Service (Python)
├── mobile/           #  React Native Mobile App (Expo)
├── ml-models/        #  PhoBERT trained models (not in Git)
├── docs/             #  Documentation Hub
└── tools/            #  Postman collections, scripts
```

| Thư mục | Mô tả | Công nghệ |
|---------|--------|-----------|
| **[backend/](./backend/)** | API lõi xử lý nghiệp vụ, xác thực, CRUD | Java 17+, Spring Boot 4, Spring Security, JPA, MySQL |
| **[ai-service/](./ai-service/)** | NLP trích xuất giao dịch từ text tiếng Việt | Python 3.11+, FastAPI, PhoBERT, Groq LLM |
| **[mobile/](./mobile/)** | Ứng dụng di động (iOS/Android) | React Native, Expo SDK 54, TypeScript |
| **[docs/](./docs/)** | Documentation Hub | Markdown, Mermaid diagrams |
| **[tools/](./tools/)** | Postman API collections, dev scripts | JSON, Shell |

---

## 📂 Tài liệu Dự án (Documentation)

👉 **[Hệ thống Tài liệu (Docs Hub)](./docs/README.md)**

1. `01-product`: Yêu cầu & Use Cases.
2. `02-design`: Kiến trúc & Database.
3. `03-ai-nlp`: Chiến lược AI & NLP.
4. `04-management`: Quy trình Agile & Roadmap.
5. `05-sprints`: Theo dõi tiến độ Sprint & Issues.

---

## 🚀 Bắt đầu

### Prerequisites

- Java 17+, Maven
- Python 3.11+
- Node.js 18+, Expo CLI
- MySQL 8+

### 1. Backend (Spring Boot)

```bash
cd backend
./mvnw spring-boot:run
# API: http://localhost:8080
```

### 2. AI Service (FastAPI)

#### Setup Virtual Environment (One-time)
```bash
python -m venv .venv
# Windows:
.venv\Scripts\activate
# MacOS/Linux:
source .venv/bin/activate
pip install -r ai-service/requirements.txt
```

#### Run Service
- **Windows (Recommended)**:
  ```powershell
  cd ai-service
  .\start-ai.ps1
  ```
- **Manual (Any OS)**:
  ```bash
  # Ensure venv is activated first!
  cd ai-service
  uvicorn main:app --reload --port 8000
  ```
- **API Check**: [http://localhost:8000/health](http://localhost:8000/health)
- **Interactive Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Mobile App (Expo)
```bash
cd mobile
npm install
npx expo start
# Scan QR code with Expo Go app
```

---

## 🏛️ Kiến trúc Hệ thống

```
Mobile App ──(HTTPS/JWT)──► Spring Boot ──(HTTP)──► FastAPI (NLP)
                                │                        │
                                └────── MySQL ◄──────────┘
                                        (DB)        (reads model)
```

- **Mobile → Backend**: HTTPS + JWT Bearer Token (mọi request)
- **Backend → AI Service**: HTTP nội bộ (không auth, chỉ local)
- **Mobile → AI Service**: ❌ KHÔNG BAO GIỜ gọi trực tiếp

---
*© 2026 Smart Personal Finance Project.*
