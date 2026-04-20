# 📋 PLAN: Repository Cleanup & Standardized Organization

## 🎯 Overview
Dự án hiện tại đang có quy mô lớn với nhiều service (`mobile`, `backend`, `ai-service`, `ml-models`) nhưng cấu trúc thư mục root đang bị phân tán. Kế hoạch này nhằm mục đích tập trung hóa các cấu hình môi trường, dọn dẹp tài liệu cũ và chuẩn hóa các thư mục tạm thời.

## ⚠️ CRITICAL IMPLEMENTATION NOTES
1. **Docker Compose**: Khi di chuyển các file `.env` vào `infrastructure/envs/`, **BẮT BUỘC** cập nhật đường dẫn `env_file` trong `docker-compose.yml` để tránh container crash.
2. **Automation Scripts**: Cập nhật `sync-env.ps1` để trỏ đúng vào folder env mới, đảm bảo luồng automation không bị gãy.
3. **Git Tracking**: Đối với các folder cache đã lỡ bị track (`.idea`, `.pytest_cache`, v.v.), cần chạy `git rm -r --cached <folder>` sau khi cập nhật `.gitignore` để xóa chúng khỏi Git index.

## ✅ Success Criteria
- [ ] Thư mục root chỉ chứa các folder service chính và các config file thiết yếu.
- [ ] Tất cả tài liệu kế hoạch cũ được lưu trữ vào `docs/archive/`.
- [ ] Hệ thống biến môi trường được rút gọn (chỉ còn `.env.example` làm mẫu).
- [ ] Các thư mục cache/temp (`.idea`, `.pytest_cache`, `target`, `scratch`) được loại bỏ hoàn toàn khỏi Git tracker.
- [ ] File `docs/SITEMAP.md` được tạo để hướng dẫn cấu trúc repo mới.

---

## 🏗️ Tech Stack & Standard
- **Environment**: Node.js v22 (LTS) - Đồng bộ trên toàn project.
- **Organization Rule**: 
    - `infrastructure/`: Chứa các script deploy, docker config nâng cao và env templates.
    - `docs/`: Chứa tài liệu sống (Active Docs).
    - `docs/archive/`: Chứa lịch sử thực hiện (Completed Plans).

---

## 📋 Task Breakdown

### Phase 1: Infrastructure & Environment Consolidation
| ID | Task | Agent | Priority |
| :--- | :--- | :--- | :--- |
| 1.1 | Tạo thư mục `infrastructure/envs/` và di chuyển các file `.env.staging`, `.env.develop` vào đó (hoặc lưu trữ chúng dưới dạng tài liệu). | `orchestrator` | P1 |
| 1.2 | Cập nhật `sync-env.ps1` để phản ánh đúng cấu trúc folder môi trường mới. | `orchestrator` | P2 |
| 1.3 | Giữ lại duy nhất `.env.example` tại root với các biến chung nhất. | `orchestrator` | P1 |

### Phase 2: Documentation Centralization
| ID | Task | Agent | Priority |
| :--- | :--- | :--- | :--- |
| 2.1 | Di chuyển `IMPLEMENTATION_PLAN.md`, `DATA_FLOW_E2E.md` và các file `PLAN-*` đã cũ vào `docs/archive/`. | `orchestrator` | P1 |
| 2.2 | Tạo file `docs/SITEMAP.md` mô tả cấu trúc các module và vị trí các tài liệu quan trọng. | `orchestrator` | P1 |
| 2.3 | Tinh gọn `README.md` ở root, chỉ để lại Overview và link dẫn tới Dashboard của các service. | `orchestrator` | P2 |

### Phase 3: Root Debris Removal
| ID | Task | Agent | Priority |
| :--- | :--- | :--- | :--- |
| 3.1 | Kiểm tra và cập nhật `.gitignore` để bao quát toàn bộ các folder cache: `.idea`, `.pytest_cache`, `target`, `scratch`, `uploads/`. | `orchestrator` | P0 |
| 3.2 | Xóa bỏ các folder cache này khỏi filesystem local. | `orchestrator` | P1 |
| 3.3 | Kiểm tra và xóa bỏ các file lock hoặc file tạm không cần thiết ở root. | `orchestrator` | P2 |

### Phase 4: Environment Synchronization (Node v22)
| ID | Task | Agent | Priority |
| :--- | :--- | :--- | :--- |
| 4.1 | Cập nhật `.nvmrc` lên `v22`. | `orchestrator` | P1 |
| 4.2 | Cập nhật `engines` trong `package.json` (root) và đồng bộ với các project con. | `orchestrator` | P1 |

---

## 🧪 Phase X: Final Verification
- [ ] Chạy `ls -a` để kiểm tra cấu trúc thư mục mới.
- [ ] Kiểm tra các đường dẫn trong Docker Compose xem có bị break không.
- [ ] Đảm bảo các script automation vẫn hoạt động bình thường với cấu trúc folder mới.
- [ ] Kiểm tra tính đúng đắn của các link trong `docs/SITEMAP.md`.

---

## 👥 Agent Assignments
- **@orchestrator**: Thực hiện chính việc cấu trúc lại file, di chuyển docs và quản lý env.
