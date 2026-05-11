# Automated Test Flow Report

- Run at: 2026-05-10T09:40:00.000Z
- Strict mode: OFF
- Environments: Backend (Java/Spring), AI Service (Python/FastAPI), Mobile (React Native/Expo)
- Final status: **PASS**

## Pipeline Results

| Module | Step / Framework | Passed | Failed | Status | Note |
|---|---|---|---|---|---|
| **Backend** | Maven / JUnit 5 | 53 | 0 | **PASS** | `mvnw test` executed successfully. All UseCases, Controllers, and Repositories verified. |
| **AI Service** | Pytest | 34 | 0 | **PASS** | `pytest` executed successfully. OCR, NLP, and Agent endpoints verified. |
| **Mobile** | Jest | 17 | 0 | **PASS** | `jest` executed successfully. Core components and hooks verified. |
| **Mobile env**| expo-doctor | N/A | N/A | **PASS** | Dependency checks passed |

## Scenario Automation Matrix

| Scenario ID | Priority | Automation Coverage | Methods |
|---|---|---|---|
| UJ-01 | P0 | full | Backend tests, API Auth, Mobile Jest |
| UJ-02 | P0 | full | Backend UseCase tests, Mobile Jest |
| UJ-03 | P0 | partial | AI-Service Pytest (OCR endpoints) |
| UJ-04 | P0 | full | Backend UseCase tests, AI-Service NLP |
| UJ-05 | P1 | partial | Backend API, Manual QA required |
| UJ-06 | P0 | partial | API Auth tests |
| UJ-07 | P1 | full | Backend UseCase tests |
| UJ-08 | P1 | partial | Backend Budget API |
| UJ-09 | P1 | none | Manual QA required |
| UJ-10 | P1 | none | Manual QA required |
| UJ-11 | P2 | partial | API Connectivity Probe |

## Raw Command Summary

### Backend (`mvnw test`)
```
[INFO] Tests run: 53, Failures: 0, Errors: 0, Skipped: 0
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
```

### AI Service (`pytest`)
```
====================== 34 passed, 102 warnings in 55.07s ======================
Exit code: 0
```

### Mobile (`jest`)
```
Test Suites: 4 passed, 4 total
Tests:       17 passed, 17 total
Snapshots:   0 total
Time:        4.715 s, estimated 8 s
Ran all test suites.
Exit code: 0
```
