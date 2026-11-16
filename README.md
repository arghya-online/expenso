# Expenso

**Personal finance, built for clarity.**

Expenso is a personal finance dashboard for tracking balances, transactions,
investments, loans, and spending trends in one place. It is designed to give
you a practical view of your money without bank scraping or third-party
trackers.

## Live app

[Open Expenso](https://expenso.arghyalogs.in)

[View the source code](https://github.com/arghya-online/expenso)

## What Expenso does

- **Dashboard:** See total balance, income, expenses, investments, lending,
  borrowing, category breakdowns, spending trends, and recent activity.
- **Accounts:** Create and organize savings, current, cash, wallet, credit,
  and other accounts. Set a primary account, adjust balances, archive
  accounts, and keep masked identifiers and notes.
- **Transactions:** Record income, expenses, and transfers. Filter activity by
  account, type, and search terms while keeping account balances in sync.
- **Investments:** Track investments and their current values as part of your
  overall financial picture.
- **Loans and debts:** Record money lent or borrowed, follow repayments, and
  mark settled balances.
- **Reports and exports:** Review yearly financial activity and export
  transactions, accounts, loans, and investments as CSV files.
- **Authentication and settings:** Use individual accounts with protected
  sessions, review recent audit activity, and sign out securely.

## Product principles

- **Private by design:** Expenso does not depend on live account scrapers or
  third-party trackers.
- **User-controlled data:** Financial records are stored in MongoDB that you
  configure and control.
- **Accurate money handling:** Amounts use integer paise precision to avoid
  floating-point rounding errors.
- **INR-first experience:** The interface uses Indian Rupee formatting and
  Indian numbering conventions.

## Built with

- Next.js and React
- TypeScript
- MongoDB with Mongoose
- Better Auth
- Tailwind CSS
- Lucide React

## Run locally

The application lives in the [`expenso/`](./expenso) directory.

```bash
cd expenso
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For a configured deployment, set these environment variables:

```env
MONGODB_URI=mongodb://localhost:27017/expenso
BETTER_AUTH_SECRET=replace-with-a-long-random-secret
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Useful commands:

```bash
npm run lint
npm run build
npm run start
```

## Project structure

```text
expenso/
├── app/         # Routes, pages, authentication, and API endpoints
├── components/  # Dashboard and reusable UI components
├── lib/actions/ # Server actions for financial workflows
├── lib/models/  # MongoDB and Mongoose data models
└── public/      # Static assets
```

## Status

Expenso is an actively developed showcase project. The live deployment is
available at the link above, and the repository contains the complete source
for running it locally.
