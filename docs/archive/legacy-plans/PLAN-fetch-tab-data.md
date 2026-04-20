# Implementation Plan: Optimized Data Fetching Strategy

This plan outlines the steps to implement a high-performance, consistent data fetching strategy for the Smart Personal Finance Management System mobile app, following the 4-tier strategy: Lazy Loading, Query Invalidation, Pre-flight Global Fetch, and Pagination.

## Phase 1: Backend Pagination Support (Spring Boot)
**Goal:** Modify the transaction retrieval API to support paginated results to prevent performance degradation with large datasets.

- [ ] **DTO Update:** Create `PagedResponse<T>` wrapper if not already exists.
- [ ] **Controller Update:** Update `TransactionController.getTransactions` to accept `page` and `size` (using `Pageable`).
- [ ] **UseCase Update:** Update `GetTransactionsByWalletIdUseCase` and repository layer to use `Page<Transaction>`.
- [ ] **Verification:** Test pagination via Postman/cURL ensuring meta-data (totalElements, totalPages) is returned.

## Phase 2: Global Data Strategy (Wallets & Categories)
**Goal:** Reduce redundant requests for data that is used across multiple tabs.

- [ ] **React Query Config:** Set global `staleTime` (e.g., 5-10 mins) for `wallets` and `categories` query keys.
- [ ] **Pre-flight Implementation:** In `app/(tabs)/_layout.tsx`, invoke `useWallets()` and `useCategories()` to ensure data is in cache before sub-tabs mount.
- [ ] **Store Sync:** Ensure `useAppStore` properly reflects the active wallet state derived from these fetches.

## Phase 3: Infinite Scroll & Lazy Loading (Mobile FE)
**Goal:** Implement efficient rendering and loading for performance-sensitive tabs.

- [ ] **Transaction Hook Upgrade:** Migration of `useTransactions` from `useQuery` to `useInfiniteQuery`.
- [ ] **Infinite Scroll UI:** Implement `onEndReached` in `TransactionsScreen.tsx` using `FlashList` or `ScrollView` optimized for large lists.
- [ ] **Lazy Tabs:** Validate that `Analytics` and `Budget` tabs only trigger their respective hooks (`useComparison`, `useBudgets`) upon focus/mount.

## Phase 4: Data Consistency (Invalidation Flow)
**Goal:** Ensure real-time updates across tabs after user actions.

- [ ] **Mutation Updates:** Verify and expand `onSuccess` callbacks in `useAddTransaction` and `useUpdateTransaction` to include:
    - `['transactions']`
    - `['dashboard-summary']`
    - `['comparison']` (for Analytics)
    - `['wallets']` (for balance updates)
- [ ] **Optimistic UI (Optional):** Consider optimistic updates for better UX during network latency.

## Verification Checklist
1. [ ] Transaction list loads first 20 items quickly.
2. [ ] Scrolling to bottom triggers successful load of next page.
3. [ ] Adding a transaction in "Expenses" tab immediately updates the balance on "Dashboard".
4. [ ] Analytics tab only makes network requests when navigated to.
5. [ ] Categories picker loads instantly from cache.
