---
milestone: v1.0
version: 1.0.0
updated: 2026-10-19T20:00:00+05:30
---

# Roadmap

> **Current Milestone:** v1.0 -Expenso MVP
> **Current Milestone:** v1.0 -Expenso MVP  
> **Current Phase:** Milestone Complete  
> **Status:** ✅ Complete  

## Must-Haves (from SPEC)

- [x] Complete Better Auth authentication (sign-up, sign-in, sign-out, session protection)
- [x] Precision-safe integer paise financial calculations and Indian currency formatting
- [x] Responsive financial application shell (desktop persistent sidebar + mobile bottom nav)
- [x] Bank accounts and balances module with opening/current balance tracking
- [x] Full transaction engine (incomes, expenses, transfers with balance updates)
- [x] Comprehensive dashboard with accurate computed metrics and category analytics
- [x] Lending and borrowing module with settlement tracking
- [x] Manual investments tracking portfolio
- [x] Export, reports, and user preferences

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
**Status:** ✅ Complete
**Objective:** Complete manual transaction management, categories, income/expense recording, internal account transfers, and ledger balance updates.
**Depends on:** Phase 2

**Plans:**
- [x] Plan 3.1: Transaction categories and payment methods constants
- [x] Plan 3.2: Transaction server actions (create, delete with balance reversal and audit logs)
- [x] Plan 3.3: CreateTransactionDialog with income/expense/transfer tabs & account selection
- [x] Plan 3.4: Interactive TransactionList with search, type/account filters, and delete action
- [x] Plan 3.5: Transactions management page (`/transactions`) with KPI cards & dashboard integration

---

### Phase 4: Dashboard and Financial Insights
**Status:** ✅ Complete
**Objective:** Live financial dashboard calculating net worth, monthly cash flow, category breakdowns, and spending trends from real database records.
**Depends on:** Phase 3

**Plans:**
- [x] Plan 4.1: Date range selector component with presets (This Month, Last Month, Last 90 Days, All Time)
- [x] Plan 4.2: Visual Category breakdown with percentage shares and color-coded progress bars
- [x] Plan 4.3: Spending trend bar chart visualization for time periods
- [x] Plan 4.4: Main dashboard page integration with live database aggregation and recent transactions

---

### Phase 5: Lending, Borrowing, and Investments
**Status:** ✅ Complete
**Objective:** Track money lent/borrowed with partial repayments, plus manual investment asset tracking (mutual funds, stocks, FDs, gold).
**Depends on:** Phase 4

**Plans:**
- [x] Plan 5.1: Lending and borrowing data model (`LoanDebt`), server actions, and settlement calculations
- [x] Plan 5.2: Investment portfolio data model (`Investment`), server actions, and profit/loss valuation calculations
- [x] Plan 5.3: Lending & Borrowing UI (`/loans`) with person tracking, settlement modal, and status indicators
- [x] Plan 5.4: Investment Portfolio UI (`/investments`) with asset allocation breakdown and current valuation updates

---

### Phase 6: Reports, Settings, and Data Management
**Status:** ✅ Complete
**Objective:** Monthly/yearly financial summaries, CSV exports, custom categories, account archival, and security settings.
**Depends on:** Phase 5

**Plans:**
- [x] Plan 6.1: Financial reports page (`/reports`) with monthly/annual ledger statements and breakdown exports
- [x] Plan 6.2: CSV data export utilities for transactions, accounts, and lending data
- [x] Plan 6.3: User settings page (`/settings`) with profile management, preferences, and data reset options

---

## Progress Summary

| Phase | Status | Plans | Complete |
|-------|--------|-------|----------|
| 1: Foundation & Auth | ✅ | 4/4 | 100% |
| 2: Accounts & Balances | ✅ | 4/4 | 100% |
| 3: Transactions & Income | ✅ | 5/5 | 100% |
| 4: Dashboard & Insights | ✅ | 4/4 | 100% |
| 5: Lending & Investments | ✅ | 4/4 | 100% |
| 6: Reports & Settings | ✅ | 3/3 | 100% |
