# Project Documentation Sitemap

This sitemap maps active docs, archived history, and key module entry points for the Smart Personal Finance repository.

## Repository Modules
- [`backend/`](../backend/) — Spring Boot API service.
- [`ai-service/`](../ai-service/) — FastAPI NLP/AI service.
- [`mobile/`](../mobile/) — Expo/React Native mobile app.
- [`ml-models/`](../ml-models/) — model artifacts (kept out of Git).
- [`tools/`](../tools/) — supporting scripts and integration assets.

## Root Operational Files
- [`README.md`](../README.md) — project overview and quick links.
- [`docker-compose.yml`](../docker-compose.yml) — core multi-service stack.
- [`docker-compose.override.yml`](../docker-compose.override.yml) — local development overrides.
- [`sync-env.ps1`](../sync-env.ps1) — environment-aware docker orchestrator script.
- [`infrastructure/envs/`](../infrastructure/envs/) — non-root environment profiles for compose runs.

## Active Documentation (this folder)
- [`00-START-HERE.md`](./00-START-HERE.md)
- [`README.md`](./README.md)
- [`api-contract-v1.md`](./api-contract-v1.md)
- [`BA_Documentation.md`](./BA_Documentation.md)
- [`EXECUTIVE_SUMMARY.md`](./EXECUTIVE_SUMMARY.md)
- [`FEATURE_TRACKING_MATRIX.md`](./FEATURE_TRACKING_MATRIX.md)
- [`IMPLEMENTATION_ROADMAP.md`](./IMPLEMENTATION_ROADMAP.md)
- [`QUICK_START_CHECKLIST.md`](./QUICK_START_CHECKLIST.md)
- [`SQL-MIGRATION-EXPLANATION.md`](./SQL-MIGRATION-EXPLANATION.md)
- Active plans remain in `docs/` while under execution.

## Structured Doc Areas
- [`01-product/`](./01-product/)
- [`02-design/`](./02-design/)
- [`03-ai-nlp/`](./03-ai-nlp/)
- [`04-agent-system/`](./04-agent-system/)
- [`stitch-assets/`](./stitch-assets/)

## Archive Area
- [`archive/`](./archive/) — completed plans and historical reference material.
- [`archive/legacy-plans/`](./archive/legacy-plans/) — previous execution plans retained for traceability.

## Archive Promotion Rule
Move a plan or report into `docs/archive/` when all of the following are true:
1. The related implementation has been completed and verified.
2. No active team workflow references it as an execution guide.
3. A newer source of truth exists (code, runbook, or updated doc).
