# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2026-04-27

### Added

#### Mobile App
- **Atelier AI Chat Interface**: Feature-based architecture with optimized performance
  - Proactive insights and AI-powered financial recommendations
  - Voice visualizer and interactive chat components
  - Custom hooks: `useAtelierChat`, `useChatScroll`, `useProactiveInsights`
- **Receipt Scanner Enhancements**: 
  - OCR polling with exponential backoff
  - Proper resource cleanup and memory leak prevention
  - Custom hooks: `useReceiptUpload`, `useOcrPolling`
- **Transaction Management**:
  - Edit transaction sheet with full CRUD operations
  - Category creation modal
  - Enhanced transaction detail view
  - Domain-driven design with entities, repositories, and use cases
- **Dashboard Improvements**:
  - Spending summary cards
  - Insight charts with visual analytics
  - Anomaly detection alerts
- **Authentication**:
  - Change password functionality
  - Biometric authentication support
  - Welcome and onboarding screens
- **UI Components**:
  - Atelier design system tokens
  - Glass morphism effects
  - Abstract wave animations
  - Skeleton loading states

#### Backend API
- **Atelier AI Chat Integration**:
  - Intent-based chat handlers (history, default)
  - NLP query processing with Groq LLM
  - Chat use case implementation
- **Security Enhancements**:
  - JWT authentication entry point refinements
  - Change password endpoint
  - Enhanced security configuration
- **Dashboard & Analytics**:
  - Optimized dashboard use case with performance improvements
  - Transaction comparison by period
  - Budget summary with BigDecimal precision
- **Testing**:
  - 53 backend tests (unit + integration)
  - Concurrency tests for transaction creation
  - Security integration tests
  - Repository integration tests with H2

#### Infrastructure
- **CI/CD Pipelines**:
  - Backend CI: compile, unit tests, integration tests, Docker smoke
  - Mobile CI: lint, typecheck, Jest tests, Expo export smoke
  - AI Service CI: validation workflow
  - CD: Docker image publishing workflow
- **Docker Compose**:
  - Multi-service orchestration (db, backend, ai-service)
  - Database initialization scripts
  - Environment configuration sync
- **Documentation**:
  - Architecture analysis (ARCHITECTURE_ANALYSIS.md)
  - Feature specifications (FEATURES.md)
  - Use cases documentation (USE_CASES.md)
  - Workflows documentation (WORKFLOWS.md)
  - Testing gates (TESTING_GATES.md)
  - Mobile refactor reports

### Changed

#### Mobile App
- **Architecture Migration**:
  - Migrated to Expo Dev Client (SDK 54)
  - Feature-based folder structure
  - Modular component organization
- **Build System**:
  - Kotlin 1.9.24 → 2.0.21 (KSP compatibility fix)
  - Dynamic app configuration with `app.config.ts`
  - Android build optimization
- **Performance**:
  - React.memo optimizations for chat components
  - Input state isolation (no full re-renders on keystroke)
  - Proper cleanup of timers and subscriptions
- **State Management**:
  - Enhanced Zustand stores with better type safety
  - Separated concerns (auth, finance, app state)

#### Backend
- **Code Quality**:
  - Clean Architecture enforcement
  - Domain-driven design patterns
  - Improved error handling and logging
- **API Responses**:
  - Unified response structure
  - Consistent error codes
  - Enhanced validation messages

### Fixed

#### Mobile App
- Unresolved imports and lint errors
- Memory leaks in receipt scanner
- Input lag in chat interface
- Category picker state management
- Transaction detail modal rendering

#### Backend
- JWT authentication edge cases
- Transaction concurrency issues
- Budget calculation precision (BigDecimal)
- Security configuration conflicts

### Testing

#### Backend
- **53 tests passing** (0 failures)
  - Unit tests: Use cases, entities, services
  - Integration tests: Controllers, repositories
  - Performance tests: Dashboard optimization
  - Security tests: Authentication, authorization

#### Mobile
- **17 tests passing** (4 test suites)
  - Unit tests: Hooks, components
  - Integration tests: Login flow
  - Coverage: Critical paths

### Documentation
- Added comprehensive architecture documentation
- Updated README with Quick Start guide
- Created testing gates documentation
- Added mobile refactor final report
- Documented all features and use cases

---

## Release Notes

This release represents a major milestone with **50 commits** focusing on:

1. **Production-Ready Mobile App**: Expo Dev Client migration with feature-based architecture
2. **AI-Powered Features**: Atelier AI chat with proactive insights
3. **Robust Testing**: 70+ tests across backend and mobile
4. **CI/CD Automation**: Full pipeline with quality gates
5. **Clean Architecture**: Domain-driven design throughout the stack

### Breaking Changes
None - this is the first production-ready release.

### Migration Guide
For new deployments:
1. Run `npm run sync-env` to set up environment files
2. Configure `GROQ_API_KEY` in `.env`
3. Run `npm run dev:docker` for full stack deployment
4. Mobile app: `cd mobile && npm install && npm run start`

### Known Issues
- Root-level lint configuration needs alignment with ESLint v9
- Some mobile lint warnings remain (non-blocking)
- E2E tests with Maestro not yet implemented

### Contributors
- Development: Anphan0612

---

[Unreleased]: https://github.com/Anphan0612/Smart-Personal-Finance-Management-System/compare/main...develop
