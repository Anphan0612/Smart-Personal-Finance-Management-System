<div align="center">
  <img src="https://img.icons8.com/?size=512&id=v9hN3B54ZEMg&format=png" alt="Logo" width="120" />
  <h1>Smart Personal Finance Management System</h1>
  <p><i>Trợ lý tài chính cá nhân đa nền tảng tích hợp AI (PhoBERT & OCR)</i></p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Backend](https://img.shields.io/badge/Backend-Spring%20Boot%203-brightgreen)](https://spring.io/projects/spring-boot)
  [![Mobile](https://img.shields.io/badge/Mobile-React%20Native%20%2B%20Expo-blue)](https://reactnative.dev/)
  [![AI Service](https://img.shields.io/badge/AI-FastAPI%20%2B%20HuggingFace-orange)](https://huggingface.co/)
</div>

---

Nền tảng quản lý tài chính cá nhân đa nền tảng, kết hợp **mobile app**, **backend API** và **AI service** để tự động ghi nhận giao dịch, phân tích chi tiêu và đưa ra gợi ý tài chính theo ngữ cảnh người dùng.

## 🎯 Mục tiêu dự án

Dự án hướng đến việc biến quản lý tài chính cá nhân thành trải nghiệm đơn giản và thông minh hơn thông qua:

- **Giảm thiểu nhập liệu:** Tự động trích xuất thông tin từ hóa đơn (OCR) hoặc văn bản thô.
- **Phân loại thông minh:** Sử dụng mô hình PhoBERT fine-tuned để chuẩn hóa và gán nhãn danh mục chi tiêu tự động.
- **Insights cá nhân hóa:** Cung cấp góc nhìn tổng quan về dòng tiền và đưa ra lời khuyên bằng AI (Groq LLM).

---

## 🏗 Tổng quan kiến trúc

Hệ thống được thiết kế theo mô hình Microservices-lite, phân tách rõ ràng trách nhiệm của từng thành phần:

- **Mobile App (`mobile/`)**: Ứng dụng React Native (Expo) cho trải nghiệm người dùng mượt mà trên cả iOS và Android.
- **Backend API (`backend/`)**: Spring Boot chịu trách nhiệm nghiệp vụ lõi, bảo mật (JWT) và thao tác với Database.
- **AI Service (`ai-service/`)**: FastAPI xử lý các tác vụ nặng về Machine Learning (NER bằng PhoBERT, OCR bằng PaddleOCR) và tương tác với Groq LLM.

### Sơ đồ tương tác hệ thống

```mermaid
graph TD
    User([Người dùng]) -->|Mở App| Mobile[Mobile App<br/>React Native]
    
    subgraph Core System
        Mobile <-->|REST API / JWT| Backend[Backend API<br/>Spring Boot]
        Backend <-->|Read/Write| DB[(MySQL<br/>Database)]
    end
    
    subgraph AI Pipeline
        Backend -->|Forward Text/Image| AI[AI Service<br/>FastAPI]
        AI -->|Download Model<br/>(One-time)| HF((Hugging Face<br/>Anphan612/phobert))
        AI <-->|LLM Context/Repair| Groq((Groq API<br/>Llama3))
    end
    
    classDef mobile fill:#61dafb,stroke:#000,stroke-width:1px,color:#000;
    classDef backend fill:#6db33f,stroke:#000,stroke-width:1px,color:#fff;
    classDef database fill:#4479a1,stroke:#000,stroke-width:1px,color:#fff;
    classDef ai fill:#009688,stroke:#000,stroke-width:1px,color:#fff;
    classDef cloud fill:#f9a825,stroke:#000,stroke-width:1px,color:#000;

    class Mobile mobile;
    class Backend backend;
    class DB database;
    class AI ai;
    class HF,Groq cloud;
```

---

## ✨ Tính năng nổi bật

- 🧠 **AI NER (Nhận dạng thực thể):** Bóc tách chính xác Số tiền, Mục đích, Hạng mục từ câu văn tự nhiên bằng mô hình PhoBERT được huấn luyện riêng (`Anphan612/phobert-finance-ner`).
- 📸 **Quét hóa đơn (OCR):** Chụp ảnh hóa đơn, hệ thống tự động nhận diện chữ (PaddleOCR) và sửa lỗi OCR (ViT5) để trích xuất số tiền.
- 💬 **Trợ lý Tài chính (Chat):** Trò chuyện trực tiếp với AI để hỏi về tình hình chi tiêu, nhận lời khuyên tối ưu ngân sách.
- 🔐 **Bảo mật & Cấu trúc tốt:** Hệ thống mã hóa mật khẩu bcrypt, xác thực qua JWT Token, phân quyền chặt chẽ.
- 🚀 **Triển khai 1-Click:** Đóng gói hoàn hảo với Docker, tự động đồng bộ môi trường và tải AI models.

---

## 💻 Công nghệ chính

| Thành phần | Công nghệ / Thư viện |
| :--- | :--- |
| **Mobile Front-end** | React Native, Expo Router, NativeWind (Tailwind), React Query, Zustand |
| **Core Backend** | Java 17, Spring Boot 3, Spring Security, Spring Data JPA, Hibernate |
| **AI Service** | Python 3.10, FastAPI, HuggingFace Transformers, PyTorch, Groq SDK |
| **Database & DevOps** | MySQL 8.0, Docker, Docker Compose, PowerShell |

---

## 🚀 Quick Start (Hướng dẫn chạy dự án)

Nhờ kiến trúc Docker, việc chạy toàn bộ hệ thống cực kỳ đơn giản trên mọi máy tính.

### 1. Yêu cầu môi trường
- **Docker Desktop** (Bắt buộc để chạy Backend + DB + AI Service).
- **Node.js 22.x** (Bắt buộc để chạy Frontend Mobile).
- **Groq API Key** (Dùng cho tính năng Chat AI).

### 2. Cài đặt & Chuẩn bị
Mở Terminal ở thư mục gốc của dự án và chạy:
```bash
npm run setup
```
*(Lệnh này sẽ tự động cài các gói cần thiết cho cả dự án và tạo sẵn file `.env.develop`)*

**Lưu ý quan trọng:** Hãy mở file `infrastructure/envs/.env.develop` và dán **GROQ_API_KEY** của bạn vào.

### 3. Khởi động Máy chủ (Backend + AI + Database)
```bash
npm run dev:docker
```
*(Hệ thống sẽ tự động build image, tạo database mẫu. Ở lần chạy đầu tiên, AI Service sẽ tự động tải model PhoBERT từ Hugging Face về cache).*

### 4. Khởi động Ứng dụng Mobile
Mở thêm một tab Terminal mới:
```bash
cd mobile
npm run start
```
Quét mã QR bằng ứng dụng **Expo Go** trên điện thoại (hoặc nhấn `a` để chạy máy ảo Android, `i` để chạy iOS Simulator).

---

## 🛠 Cấu trúc thư mục mã nguồn

```text
/
├── ai-service/          # 🧠 Dịch vụ phân tích ngôn ngữ (FastAPI, Transformers)
├── backend/             # ⚙️ REST API, Logic lõi và Bảo mật (Spring Boot)
├── mobile/              # 📱 Mã nguồn App đa nền tảng (React Native)
├── infrastructure/      # 🏗 Cấu hình Docker, DB init SQL, Scripts môi trường
├── docs/                # 📚 Tài liệu dự án, phân tích use case
├── docker-compose.yml   # 🐳 Cấu hình khởi tạo toàn hệ thống
└── package.json         # 📦 Script quản lý chung (npm run dev:docker, ...)
```

---

## 👨‍💻 Tình huống sử dụng phù hợp
- Người dùng cá nhân quá bận rộn để nhập liệu chi tiêu bằng tay mỗi ngày.
- Muốn theo dõi sức khỏe tài chính bằng biểu đồ và báo cáo chi tiết.
- Cần một "Trợ lý ảo" am hiểu thói quen chi tiêu để tư vấn cách tiết kiệm tiền.

---

> Phát triển bởi nhóm sinh viên đam mê công nghệ. Hệ thống được đóng gói tối ưu, loại bỏ hoàn toàn model weights tĩnh, sẵn sàng hoạt động ở môi trường Production.
> **Giấy phép: MIT License**
