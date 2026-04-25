# Testing Gates

This document defines the mandatory test gates before merge.

## CI Gates

CI is enforced with GitHub Actions:

- Backend: `.github/workflows/ci-backend.yml`
  - Compile gate
  - Unit tests (`*Test`)
  - Integration tests (`*IT`)
  - Docker build smoke
- Mobile: `.github/workflows/ci-mobile.yml`
  - Lint + typecheck
  - Jest unit tests
  - Expo export smoke

## Local Merge Gate (Required)

Run these commands before push/merge:

```bash
# backend
cd backend
./mvnw -B test

# mobile
cd ../mobile
npm run test -- --ci --runInBand
```

## Maestro Local Gate

Run local E2E flows in `mobile`:

```bash
npm run maestro:happy
npm run maestro:negative
npm run maestro:resilience
```

Notes:

- `network-resilience.yaml` requires network fault simulation from the local test environment.
- Ensure test credentials in `mobile/.maestro/config.yaml` are valid for the target environment.

