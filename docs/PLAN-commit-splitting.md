# 📋 PLAN: Atomic Commit Splitting & Staging

## 🎯 Overview
Hiện tại repository đang có một lượng lớn thay đổi chưa commit, bao gồm: cấu hình môi trường, tái cấu trúc tài liệu, di chuyển thư mục Expo Router và cập nhật logic UI. Việc chia nhỏ các thay đổi này giúp việc review code dễ dàng hơn và giảm thiểu rủi ro khi cần revert.

## ✅ Success Criteria
- [ ] Chia thành công 5 commit riêng biệt theo đúng logic đã đề xuất.
- [ ] Mọi file đang ở trạng thái `modified` hoặc `untracked` đều được đưa vào đúng commit.
- [ ] Mỗi commit có một message mô tả rõ ràng theo chuẩn `conventional commits`.

---

## 📋 Task Breakdown

### Phase 1: Environment & Tooling Standardization
| ID | Task | Agent | Priority |
| :--- | :--- | :--- | :--- |
| 1.1 | Stage các file cấu hình root: `.nvmrc`, `.eslintrc.json`, `.prettierrc`, `.prettierignore`, `.gitignore`, `package.json`, `package-lock.json`. | `orchestrator` | P1 |
| 1.2 | Commit với message: `chore: standardize development environment and configs`. | `orchestrator` | P1 |

### Phase 2: Documentation Restructuring
| ID | Task | Agent | Priority |
| :--- | :--- | :--- | :--- |
| 2.1 | Stage toàn bộ thư mục `docs/` mới và các file tài liệu cũ cần xóa/thay thế (`README.md`, `DATA_FLOW_E2E.md`, v.v.). | `orchestrator` | P1 |
| 2.2 | Commit với message: `docs: restructure repository documentation and sitemap`. | `orchestrator` | P1 |

### Phase 3: Mobile Router Refactoring
| ID | Task | Agent | Priority |
| :--- | :--- | :--- | :--- |
| 3.1 | Stage các thay đổi liên quan đến việc di chuyển Expo Router từ `mobile/src/app` ra `mobile/app`. Bao gồm cả `app.json`. | `orchestrator` | P1 |
| 3.2 | Commit với message: `refactor(mobile): migrate expo router from src/app to root app directory`. | `orchestrator` | P1 |

### Phase 4: Feature & UI Logic Update
| ID | Task | Agent | Priority |
| :--- | :--- | :--- | :--- |
| 4.1 | Stage các file logic UI và API trong `mobile/src/`: `features/`, `components/`, `hooks/`, `services/`, `types/`. | `orchestrator` | P1 |
| 4.2 | Commit với message: `feat(mobile): enhance transaction UI and data handling`. | `orchestrator` | P1 |

### Phase 5: Infrastructure & Automation Cleanup
| ID | Task | Agent | Priority |
| :--- | :--- | :--- | :--- |
| 5.1 | Stage các file cuối cùng: `sync-env.ps1`, thư mục `infrastructure/`. | `orchestrator` | P2 |
| 5.2 | Commit với message: `chore: update dependencies and automation scripts`. | `orchestrator` | P2 |

---

## 🧪 Phase X: Final Verification
- [ ] Chạy `git status` để đảm bảo không còn file nào chưa commit.
- [ ] Kiểm tra `git log -n 5` để verify các commit vừa tạo.

---

## 👥 Agent Assignments
- **@orchestrator**: Chịu trách nhiệm staging file và thực hiện các lệnh commit.
