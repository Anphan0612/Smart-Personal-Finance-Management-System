# Smart Personal Finance Management System

Monorepo for a personal finance platform with three primary services:
- `backend/` — Spring Boot API.
- `ai-service/` — FastAPI NLP/AI support service.
- `mobile/` — Expo/React Native app.

## Service Dashboards
- Backend API: [http://localhost:8080](http://localhost:8080)
- AI Service Health: [http://localhost:8000/health](http://localhost:8000/health)
- AI Service Swagger: [http://localhost:8000/docs](http://localhost:8000/docs)
- Expo Dev Server: `http://localhost:8081` (after starting mobile)

## Environment and Orchestration
- Node.js baseline: `v22` (`.nvmrc`, root and mobile `package.json` engines).
- Compose environment profiles are stored at `infrastructure/envs/`.
- Use `sync-env.ps1` to run the stack with a selected profile.

Example:

```powershell
./sync-env.ps1 -Env develop -Up
```

## Documentation
- Primary docs index: [`docs/README.md`](./docs/README.md)
- Full sitemap: [`docs/SITEMAP.md`](./docs/SITEMAP.md)
- Active execution plan: [`docs/PLAN-repo-cleanup.md`](./docs/PLAN-repo-cleanup.md)

## Repository Map

```text
backend/
ai-service/
mobile/
docs/
infrastructure/
ml-models/
tools/
```

© 2026 Smart Personal Finance Project.
