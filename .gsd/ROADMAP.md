---
milestone: v1.0
version: 1.0.0
updated: 2026-10-19T20:00:00+05:30
---

# Roadmap

> **Current Milestone:** v1.0 — Expenso MVP
> **Current Phase:** Phase 1 - Foundation and Authentication
> **Status:** Executing

## Must-Haves (from SPEC)

- [ ] Complete Better Auth authentication (sign-up, sign-in, sign-out, session protection)
- [ ] Precision-safe integer paise financial calculations and Indian currency formatting
- [ ] Responsive financial application shell (desktop persistent sidebar + mobile bottom nav)
- [ ] Bank accounts and balances module with opening/current balance tracking
- [ ] Full transaction engine (incomes, expenses, transfers with balance updates)
- [ ] Comprehensive dashboard with accurate computed metrics and category analytics
- [ ] Lending and borrowing module with settlement tracking
- [ ] Manual investments tracking portfolio
- [ ] Export, reports, and user preferences

---

## Phases

### Phase 1: Foundation and Authentication
**Status:** ✅ Complete
**Objective:** Establish application structure, design tokens, responsive layout shell (desktop sidebar & mobile bottom bar), MongoDB integration, Better Auth setup with credentials, auth pages, and initial protected dashboard layout.

**Plans:**
- [x] Plan 1.1: Environment, dependencies, design system tokens in `globals.css`
- [x] Plan 1.2: Database connection (MongoDB/Mongoose) & Better Auth backend configuration
- [x] Plan 1.3: Responsive shell (Sidebar, Header, Mobile Bottom Nav) & Auth UI (Sign In / Sign Up)
- [x] Plan 1.4: Protected route validation, initial dashboard placeholder, and verification

---

### Phase 2: Bank Accounts and Balances
**Status:** ✅ Complete
**Objective:** Support multiple bank accounts, cash/wallet tracking, opening vs tracked balance, account color picking, adjustments, and reconciliation.
**Depends on:** Phase 1

**Plans:**
- [x] Plan 2.1: Server actions for accounts & balance adjustments with AuditLog records
- [x] Plan 2.2: Modal dialogs (CreateAccountDialog, AdjustBalanceDialog, EditAccountDialog)
- [x] Plan 2.3: Accounts overview page (`/accounts`) with funds distribution bar & active/archived sections
- [x] Plan 2.4: Dashboard accounts integration with live balance queries

---

### Phase 3: Transactions, Expenses, and Income
**Status:** ⬜ Not Started
**Objective:** Complete manual transaction management, categories, income/expense recording, internal account transfers, and ledger balance updates.
**Depends on:** Phase 2

---

### Phase 4: Dashboard and Financial Insights
**Status:** ⬜ Not Started
**Objective:** Live financial dashboard calculating net worth, monthly cash flow, category breakdowns, and spending trends from real database records.
**Depends on:** Phase 3

---

### Phase 5: Lending, Borrowing, and Investments
**Status:** ⬜ Not Started
**Objective:** Track money lent/borrowed with partial repayments, plus manual investment asset tracking (mutual funds, stocks, FDs, gold).
**Depends on:** Phase 4

---

### Phase 6: Reports, Settings, and Data Management
**Status:** ⬜ Not Started
**Objective:** Monthly/yearly financial summaries, CSV exports, custom categories, account archival, and security settings.
**Depends on:** Phase 5

---

## Progress Summary

| Phase | Status | Plans | Complete |
|-------|--------|-------|----------|
| 1: Foundation & Auth | 🔄 | 0/4 | 0% |
| 2: Accounts & Balances | ⬜ | 0/3 | 0% |
| 3: Transactions & Income | ⬜ | 0/4 | 0% |
| 4: Dashboard & Insights | ⬜ | 0/3 | 0% |
| 5: Lending & Investments | ⬜ | 0/3 | 0% |
| 6: Reports & Settings | ⬜ | 0/3 | 0% |
