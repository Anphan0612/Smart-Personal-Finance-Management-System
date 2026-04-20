# PLAN: Improve Manual Transaction Entry UI

## 1. Overview
This project aims to refactor the `ManualTransactionModal` in the mobile app to provide a more premium, efficient, and user-friendly experience. We will move away from the system keyboard for amount entry, implement quick-select categories, and optimize the layout for one-handed use, all while adhering to the "The Financial Atelier" design system.

**Project Type:** MOBILE (React Native + Expo)

## 2. Success Criteria
- [x] **Custom Keypad**: Integrated numeric keypad for amount entry (calculator-style).
- [x] **Quick Selection**: Category selection using icons/chips instead of just a hidden picker.
- [x] **Thumb Zone Optimization**: Primary actions (Amount, Save) positioned for easy one-handed reach.
- [x] **Design Excellence**: Adherence to "No-Line" rule, glassmorphism, and "The Financial Atelier" typography.
- [x] **Fluid Interactions**: 60fps animations using Moti and tactile feedback via Haptics.

## 3. Tech Stack
- **Framework**: React Native with Expo
- **Styling**: NativeWind (Tailwind CSS)
- **Animations**: Moti (Reanimated 2)
- **Icons**: Lucide React Native
- **Haptics**: Expo Haptics

## 4. Proposed File Changes

| File Path | Action | Description |
|-----------|--------|-------------|
| `mobile/src/features/transactions/components/CustomKeypad.tsx` | **Create** | Integrated numeric keypad component. |
| `mobile/src/features/transactions/components/QuickCategorySelect.tsx` | **Create** | Horizontal scrollable or grid-based category selection chips. |
| `mobile/src/features/transactions/ManualTransactionModal.tsx` | **Modify** | Major layout refactor to integrate new components and styling. |

---

## 5. Task Breakdown

### Phase 1: Foundation & Components

#### [TASK-01] Create Custom Keypad Component ✅

- **Agent**: `mobile-developer`
- **Description**: Build a 3x4 or 4x4 keypad for amount entry. Include numbers, backspace, and a "Done" or "Calc" function.
- **Input**: `amount` state and `setAmount` function.
- **Output**: `CustomKeypad` component with haptic feedback on every tap.
- **Verify**: Tap numbers → amount updates. Tap backspace → last digit removed.
- **Status**: ✅ COMPLETED

#### [TASK-02] Create Quick Category Select Component ✅

- **Agent**: `mobile-developer`
- **Description**: A visual component that lists top/all categories with their icons. Use tonal backgrounds (No-Line rule).
- **Input**: `categories` array from store.
- **Output**: `QuickCategorySelect` component.
- **Verify**: Component renders icons/labels. Tapping a category selects it.
- **Status**: ✅ COMPLETED

### Phase 2: Integration

#### [TASK-03] Refactor ManualTransactionModal Layout ✅

- **Agent**: `mobile-developer`
- **Description**: Reorganize the modal. Top: Transaction Type (Segmented). Middle: Selected Category & Account info. Bottom: Large Amount Display & Custom Keypad. Fixed Bottom: "Lưu giao dịch" (Save) button.
- **Input**: Existing Modal code.
- **Output**: Refactored `ManualTransactionModal`.
- **Verify**: UI matches "Financial Atelier" aesthetic (no lines, high tonal depth).
- **Status**: ✅ COMPLETED

#### [TASK-04] Interaction & Animation Polish ✅

- **Agent**: `mobile-developer`
- **Description**: Fine-tune Moti transitions and Haptics. Ensure the modal entry/exit is snappy.
- **Input**: Refactored modal.
- **Output**: High-polish UI.
- **Verify**: 60fps performance check. All touch targets ≥ 48px.
- **Status**: ✅ COMPLETED

---

## 6. Phase X: Verification Checklist

### Mandatory Audits
- [ ] **UX Audit**: `python .agent/skills/mobile-design/scripts/mobile_audit.py mobile/`
- [ ] **A11y Check**: Touch targets ≥ 48dp?
- [ ] **Design Review**: No 1px borders? Purple Ban respected?
- [ ] **Build Check**: `npx expo export` (Check for errors).

### Final Verification Result
- [ ] **Lint**: [ ] Pass
- [ ] **Performance**: 60fps stable? [ ] Yes
- [ ] **Build**: [ ] Success
