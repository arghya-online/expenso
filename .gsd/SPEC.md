# SPEC.md — Expenso Specification

> **Status**: `FINALIZED`
>
> ⚠️ **Planning Lock**: Requirements are finalized and agreed upon.

---

## 1. Vision

Build **Expenso**, a clean, professional, full-stack personal finance management application for individuals who want to track their money across multiple bank accounts, record daily expenses and income, manage investments, track lending and borrowing, and understand their overall financial position.

The goal is to make personal finance management simple, transparent, and organized. The application takes inspiration from the clarity, restrained visual design, and excellent UX of Razorpay's dashboard and mobile experience (without copying branding/layout directly).

---

## 2. Core Goals

1. **Multi-Account Balance Tracking**: Support multiple bank, cash, and wallet accounts with manual balance updates and reconciliation.
2. **Precision Financial Ledger**: Accurate manual transaction recording (income, expense, transfers) with integer paise representation for zero-floating-point-error arithmetic.
3. **Actionable Insights & Dashboard**: Real-time calculated metrics for total balance, cashflow, category breakdowns, and trends.
4. **Lending & Borrowing Ledger**: Track money lent/borrowed, due dates, partial repayments, and settled states.
5. **Investment Portfolio Tracking**: Manual portfolio valuations across mutual funds, stocks, FDs, gold, and other asset classes.
6. **Mobile-First Professional Experience**: Clean, compact desktop sidebar + mobile bottom navigation, zero clutter, accessible and fast.

---

## 3. Technology Stack & Constraints

- **Framework**: Next.js 16+ (App Router, Turbopack, React 19).
- **Language**: TypeScript with strict typing.
- **Styling**: Tailwind CSS v4 with curated design tokens.
- **UI Components**: shadcn/ui (`@base-ui/react` primitives).
- **Authentication**: Better Auth (supporting email/password, session cookies).
- **Database**: MongoDB with Mongoose for structured schema validation and audit integrity.
- **Icons**: Lucide React.
- **Forms & Validation**: Zod + React Hook Form (or server action validation).
- **Charts**: Lightweight accessible charting (Recharts or custom SVG).
- **Monetary Representation**: Integer paise (`100 paise = ₹1.00`) everywhere in storage and calculation.

---

## 4. Design System & Tokens

- **Primary**: `#0F766E` (Deep Teal)
- **Primary Tint**: `#CCFBF1` (Soft Teal)
- **Background**: `#F8FAFC` (Slate 50)
- **Cards & Surfaces**: `#FFFFFF`
- **Borders**: `#E2E8F0`
- **Primary Text**: `#0F172A` (Slate 900)
- **Secondary Text**: `#64748B` (Slate 500)
- **Income / Positive**: `#16A34A` (Emerald 600)
- **Expenses / Negative**: `#E11D48` (Rose 600)
- **Warnings / Pending**: `#F59E0B` (Amber 500)
- **Currency**: Indian Rupee (INR — `₹`) formatted with standard Indian grouping (`₹1,23,456.78`).

---

## 5. Non-Goals (Out of Scope for v1)

- Live bank API scraping/aggregators (balances are explicitly manually tracked).
- Real-time stock market price feeds (investments are manually tracked).
- Competing auth systems (OAuth / SMS OTP out of initial scope; Better Auth email/password first).
- Multi-currency conversion engines (INR native focus).

---

## 6. Milestones & Phases

- **Phase 1: Foundation and Authentication** — Project structure, design tokens, responsive shell (sidebar/bottom nav), MongoDB connection, Better Auth integration, auth pages (login/signup), protected routes, initial dashboard frame.
- **Phase 2: Bank Accounts and Balances** — Account CRUD, color coding, opening/current balances, manual adjustments, audit logs.
- **Phase 3: Transactions, Expenses, and Income** — Transaction CRUD, categories/subcategories, transfers, balance reconciliation.
- **Phase 4: Dashboard and Financial Insights** — Live computed metrics, cash flow, category breakdowns, recent history.
- **Phase 5: Lending, Borrowing, and Investments** — Debt tracker, partial settlements, manual investment tracking.
- **Phase 6: Reports, Settings, and Data Management** — Monthly/yearly statements, CSV export, preferences, archival.

---

## 7. Financial Invariants & Rules

1. **Paise Precision**: All amounts stored as integers representing paise (`amountInPaise >= 0`).
2. **Transfer Invariance**: Transfers debit source and credit destination equally without affecting net income/expense calculations.
3. **Strict Ownership**: Every document queries `userId` filtered strictly from the verified session. Client-supplied userIds are never trusted.
4. **Audit Trail**: Every balance mutation produces a verifiable ledger entry.

---

*Last updated: 2026-10-19*
