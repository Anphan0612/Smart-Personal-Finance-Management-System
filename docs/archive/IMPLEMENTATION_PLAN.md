# Implementation Plan: Post-Refactor Stabilization & Enhancement

This document outlines the remaining tasks to fully stabilize and enhance the Smart Personal Finance Management System after the successful merger of `BankAccount` into `Wallet`.

---

## 🗺️ Execution Roadmap

### Phase 1: Foundation & Backend Expansion
**Goal:** Finalize schema enhancements for Categories and Transactions to support advanced UI features.

| Task | Description | Status |
| :--- | :--- | :--- |
| **P1.1: Dependency Sync** | Run `mvn clean install` to verify `backend/pom.xml` integrity. | ⏳ Pending |
| **P1.2: Schema Migration** | Apply `migration-add-color-and-update-nlp.sql` to add `color` and `icon` metadata. | ⏳ Pending |
| **P1.3: DTO Alignment** | Ensure `CategoryResponse` and `TransactionResponse` include new visual metadata. | ⏳ Pending |

**Definition of Done (DoD):**
- [ ] Backend build returns `BUILD SUCCESS`.
- [ ] Database schema updated without data loss.
- [ ] API endpoints return correct `color` and `iconName` values.

---

### Phase 2: Mobile Architectural Migration (Modular Transition)
**Goal:** Complete the move from legacy `mobile/app/` to structured `mobile/src/app`.

| Task | Description | Status |
| :--- | :--- | :--- |
| **P2.1: Router Restoration** | Re-implement `_layout.tsx` and tab structures in `mobile/src/app`. | ⏳ Pending |
| **P2.2: Path Reconciliation** | Update all relative imports `@/...` to match the new modular structure. | ⏳ Pending |
| **P2.3: Legacy Cleanup** | Delete all remaining files in `mobile/app/` to prevent Metro Bundler confusion. | ⏳ Pending |

**Definition of Done (DoD):**
- [ ] Mobile app boots successfully on Emulator without "Module not found" errors.
- [ ] Navigation tabs work correctly.
- [ ] Zero dead code remaining in the legacy directory.

---

### Phase 3: Premium UI/UX Implementation
**Goal:** Deliver the "Financial Atelier" high-fidelity experience.

| Task | Description | Status |
| :--- | :--- | :--- |
| **P3.1: Custom Keypad** | Fully integrate `CustomKeypad.tsx` into `ManualTransactionModal`. | ⏳ Pending |
| **P3.2: Quick Category Select** | Implement the horizontal scrollable and searchable category selector. | ⏳ Pending |
| **P3.3: Visual Polish** | Apply dynamic colors (from P1) to transaction cards and dashboard charts. | ⏳ Pending |

**Definition of Done (DoD):**
- [ ] Manual transaction entry feels fluid with haptic feedback and animations.
- [ ] Categories look identical to design tokens (color/icon accuracy).

---

### Phase 4: OCR & AI Service Optimization
**Goal:** Improve accuracy and robustness of AI-driven features.

| Task | Description | Status |
| :--- | :--- | :--- |
| **P4.1: NER Tuning** | Update `llm_service.py` to handle edge cases in Vietnamese receipt formats. | ⏳ Pending |
| **P4.2: Label Syncing** | Align `ner_service.py` labels with the production Category database. | ⏳ Pending |
| **P4.3: Proactive Testing** | Verify `AtelierAI` generates correct insights based on unified Wallet data. | ⏳ Pending |

**Definition of Done (DoD):**
- [ ] AI extraction accuracy reaches >90% for typical receipts.
- [ ] Proactive insights successfully use cross-wallet transaction data.

---

## 🛡️ Stability & Security Checklist

- [ ] **Data Integrity**: Verify no transactions were orphaned after BankAccount deletion.
- [ ] **Auth Flow**: Ensure modular migration didn't break JWT persistence in `AsyncStorage`.
- [ ] **Performance**: Dashboard interactive time < 500ms.

---

## 📈 Final Milestone
**Full System Stabilization**: A user can take a photo of a receipt, see it processed by AI, and recorded into a specific Bank Wallet with a color-coded Category, all within a unified, modular architecture.
