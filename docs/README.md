# 📑 Smart Personal Finance - Documentation Hub

Chào mừng bạn đến với trung tâm tài liệu của dự án **Smart Personal Finance Management System**. Hệ thống tài liệu được tổ chức theo cấu trúc phân lớp giúp dễ dàng tra cứu từ mức độ sản phẩm đến chi tiết kỹ thuật.

---

## 📂 Danh mục Tài liệu

### [🚀 01. Product & Requirements](./01-product/)

*Tập trung vào "Cái gì" và "Tại sao" của sản phẩm.*

- [Yêu cầu dự án (Requirements)](./01-product/requirement.md)
- [Đặc tả Use Cases](./01-product/usecase-specifications.md)
- [Tổng hợp Use Case](./01-product/usecase-synthesis.md)
- [Định nghĩa Hoàn thành (Definition of Done)](./01-product/definition-of-done.md)

### [📐 02. System Design](./02-design/)

*Kiến trúc hạ tầng và các luồng xử lý dữ liệu.*

- [Sơ đồ Kiến trúc & Business Flows](./02-design/system-design-diagrams.md)
- [Thiết kế Cơ sở dữ liệu (Database)](./02-design/database-design.md)
- [Mô tả chi tiết luồng nghiệp vụ](./02-design/business-flows-diagrams.md)
- [Tài liệu phản hồi lỗi API](./02-design/api-error-documentation.md)

### [🤖 03. AI & NLP Strategy](./03-ai-nlp/)

*Các tài liệu đặc thù về xử lý ngôn ngữ tự nhiên.*

- [Kế hoạch Hybrid AI (Option C)](./03-ai-nlp/PLAN-ai-hybrid-option-c.md)
- [Chiến lược mô hình NLP tùy chỉnh](./03-ai-nlp/custom-nlp-model-strategy.md)
- [Bộ dữ liệu Benchmark NLP v1](./03-ai-nlp/nlp-benchmark-dataset-v1.csv)
- [Giao thức Benchmark](./03-ai-nlp/nlp-benchmark-protocol.md)
- [Danh mục Ý định (Intent Catalog)](./03-ai-nlp/nlp-query-intent-catalog.md)

### [📋 04. Project Management](./04-management/)

*Quản lý quy trình Agile và tình trạng dự án.*

- [Product Backlog & Roadmap](./04-management/product-backlog-and-roadmap.md)
- [Phạm vi & Chuẩn docs](./04-management/documentation-scope.md)
- [Template tài liệu chuẩn](./04-management/documentation-template.md)
- [Rollout/rollback labels & milestones](./04-management/labels-milestones-rollout-commands.md)
- [GitHub CLI Progress Tracking](./04-management/github-cli-progress-tracking.md)
- [Development Plan](./04-management/development-plan.md)
- [Hướng dẫn Demo (Runbook)](./04-management/sprint-demo-runbook.md)

### [🏃 05. Sprints](./05-sprints/)

*Theo dõi tiến độ theo từng giai đoạn thực thi.*

- [Sprint 1: Tracking & Issues](./05-sprints/sprint-1-tracker.md)
- [Sprint Issues Mapping (Mobile-first)](./05-sprints/sprint-2-issues.md)
- [Sprint Backlog](./04-management/sprint-backlog.md)
- [Sprint Capacity Plan](./04-management/sprint-capacity-plan.md)
- [GitHub Issues Setup - Sprint 1](./05-sprints/github-issues-sprint-1.md)
- [Home Dashboard v1 Plan (Draft)](./PLAN-home-dashboard.md)
- [Sprint Docs Standard](./05-sprints/sprint-doc-standard.md)
- [Phân rã task Mobile](./05-sprints/sprint-2-task-breakdown-mobile.md)

---

## 🛠️ Quy tắc Quản lý Tài liệu

1. **Priority Mermaid**: Luôn ưu tiên vẽ sơ đồ bằng Mermaid code để dễ dàng cập nhật và tracking qua Git.
2. **Single Source of Truth**: Mọi thay đổi về logic nghiệp vụ phải được cập nhận vào `01-product` trước khi code.
3. **Internal Links**: Khi tạo trang mới, hãy cập nhật liên kết vào `README.md` này.

---
*Dự án được phát triển bởi Team Antigravity.*
