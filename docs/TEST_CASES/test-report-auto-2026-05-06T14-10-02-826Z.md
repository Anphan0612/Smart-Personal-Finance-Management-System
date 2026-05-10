# Automated Test Flow Report

- Run at: 2026-05-06T14:10:02.826Z
- Strict mode: OFF
- API URL: http://10.0.2.2:8080/api/v1
- Final status: **PASS**

## Pipeline Results

| Step | Status | Note |
|---|---|---|
| expo-doctor | PASS | Dependency checks passed |
| jest | PASS | Unit/integration tests passed |
| api-probe | PASS | Connectivity OK (401) (auth check skipped: set AUTOMATION_EMAIL/AUTOMATION_PASSWORD to enable) |

## Scenario Automation Matrix

| Scenario ID | Priority | Automation Coverage | Methods |
|---|---|---|---|
| UJ-01 | P0 | partial | api_auth_login, api_wallets_smoke |
| UJ-02 | P0 | partial | unit_tests |
| UJ-03 | P0 | none | none |
| UJ-04 | P0 | partial | unit_tests |
| UJ-05 | P1 | none | none |
| UJ-06 | P0 | partial | api_auth_login |
| UJ-07 | P1 | partial | unit_tests |
| UJ-08 | P1 | none | none |
| UJ-09 | P1 | none | none |
| UJ-10 | P1 | none | none |
| UJ-11 | P2 | partial | api_connectivity_probe |

## Strict-Mode Gate

- PASS: Strict gate satisfied or strict mode disabled.

## Raw Command Output (truncated)

### expo-doctor
```
env: load .env
env: export EXPO_PUBLIC_API_URL
Running 17 checks on your project...
17/17 checks passed. No issues detected!

```

### jest
```

> mobile@1.0.0 test
> jest --runInBand


```
