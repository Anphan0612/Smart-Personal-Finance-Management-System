# PLAN: Transaction Sheet UX Optimization

> **Goal**: Improve UX by removing intrusive auto-focus and ensuring the modal renders completely before any keyboard interaction.

## 📋 Context
Currently, when a user clicks "Edit", the keyboard pops up immediately via a `setTimeout` focus call. This often covers the modal or forces it to a half-open state on Android, confusing the user. The user has requested that the modal should be fully visible first, and the keyboard should only appear when they manually tap the amount field.

---

## 🛠️ Phase 1: Code Cleanup
- [x] **Identify problematic code**: Found the `useEffect` with `amountInputRef.current?.focus()`.
- [x] **Remove Auto-focus Logic**:
    - Deleted the `useEffect` block.
    - Removed the `amountInputRef` constant and its usage in the `TextInput`.
- [x] **Cleanup References**:
    - Removed `useRef` usage for focus.

## ⌨️ Phase 2: Keyboard Behavior Refinement
- [x] **Adjust BottomSheet Props**:
    - Kept `keyboardBehavior="extend"`.
    - Increased `paddingBottom` to `100` for better reachability.
- [x] **Tag Fix**:
    - Fixed the stray `</BottomSheetView>` tag from previous attempt.

## 🧪 Phase 3: Verification
- [ ] **Manual Audit**:
    - Click "Edit" on a transaction -> Verify modal opens to `90%` WITHOUT keyboard.
    - Tap on Amount -> Verify keyboard opens and modal remains visible/adjustable.
    - Close keyboard -> Verify modal stays at its snap point.

---

## 🎭 Agent Assignments
| Role | Responsibility |
| :--- | :--- |
| **Frontend Specialist** | Implementation of UI changes and gesture refinement. |
| **UX Auditor** | Verifying the interaction flow on Android Emulator. |
