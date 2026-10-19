import { getServerSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { BankAccount } from "@/lib/models/BankAccount";
import { Transaction } from "@/lib/models/Transaction";
import { Investment } from "@/lib/models/Investment";
import { LoanDebt } from "@/lib/models/LoanDebt";
import { formatINR } from "@/lib/utils/currency";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Plus,
  Landmark,
  ArrowLeftRight,
  ShieldAlert,
  Scale,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { CreateTransactionDialog } from "@/components/transactions/CreateTransactionDialog";
import { DateRangeSelector } from "@/components/dashboard/DateRangeSelector";
import { CategoryBreakdown, CategoryStat } from "@/components/dashboard/CategoryBreakdown";
import { SpendingTrend, TrendPoint } from "@/components/dashboard/SpendingTrend";
import { QuickAccountBalances } from "@/components/dashboard/QuickAccountBalances";

export const instant = false;

interface PageProps {
  searchParams: Promise<{ range?: string }>;
}

function getDateRangeBounds(range: string) {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;
  let label = "This Month";

  if (range === "last_month") {
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    label = "Last Month";
  } else if (range === "30d") {
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    label = "Last 30 Days";
  } else if (range === "90d") {
    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    label = "Last 90 Days";
  } else if (range === "this_year") {
    startDate = new Date(now.getFullYear(), 0, 1);
    label = "This Year";
  } else if (range === "all") {
    startDate = new Date(0);
    label = "All Time";
  } else {
    // default: this_month
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    label = "This Month";
  }

  return { startDate, endDate, label };
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const currentRange = resolvedParams.range || "this_month";
  const { startDate, endDate, label: dateRangeLabel } = getDateRangeBounds(currentRange);

  const session = await getServerSession();
  const user = session?.user;

  let totalBalanceInPaise = 0;
  let periodIncomeInPaise = 0;
  let periodExpenseInPaise = 0;
  let accountsCount = 0;
  let totalInvestmentsInPaise = 0;
  let totalLentInPaise = 0;
  let totalBorrowedInPaise = 0;
  let userAccounts: Array<{
    _id: { toString(): string };
    name: string;
    accountType: string;
    accountColor: string;
    maskedIdentifier?: string;
    currentBalanceInPaise: number;
    isPrimary?: boolean;
  }> = [];

  let recentTransactions: Array<{
    _id: string;
    type: "income" | "expense" | "transfer";
    amountInPaise: number;
    date: string;
    category: string;
    description: string;
    accountName: string;
    accountColor: string;
    destName?: string;
  }> = [];

  const categoryMap: Record<string, { total: number; count: number }> = {};
  const trendPoints: TrendPoint[] = [];

  try {
    await connectToDatabase();
    if (user?.id) {
      // 1. All Active Bank Accounts (Primary first, then highest balance)
      const accounts = await BankAccount.find({
        userId: user.id,
        status: "active",
      }).sort({ isPrimary: -1, currentBalanceInPaise: -1 }).lean();

      userAccounts = accounts.map((acc) => ({
        _id: acc._id,
        name: acc.name,
        accountType: acc.accountType,
        accountColor: acc.accountColor,
        maskedIdentifier: acc.maskedIdentifier,
        currentBalanceInPaise: acc.currentBalanceInPaise,
        isPrimary: !!acc.isPrimary,
      }));

      accountsCount = accounts.length;
      totalBalanceInPaise = accounts.reduce(
        (acc, curr) => acc + (curr.currentBalanceInPaise || 0),
        0
      );

      // 2. Transactions within Selected Date Range
      const periodTransactions = await Transaction.find({
        userId: user.id,
        date: { $gte: startDate, $lte: endDate },
      }).lean();

      for (const t of periodTransactions) {
        if (t.type === "income") {
          periodIncomeInPaise += t.amountInPaise || 0;
        } else if (t.type === "expense") {
          const amt = t.amountInPaise || 0;
          periodExpenseInPaise += amt;

          // Aggregate category stats
          const cat = t.category || "Other";
          if (!categoryMap[cat]) {
            categoryMap[cat] = { total: 0, count: 0 };
          }
          categoryMap[cat].total += amt;
          categoryMap[cat].count += 1;
        }
      }

      // 3. Compute Spending Trend Points (7 equal chronological intervals)
      const numPoints = 7;
      const startMs = startDate.getTime();
      const endMs = endDate.getTime();
      const intervalMs = Math.max(1, (endMs - startMs) / numPoints);

      for (let i = 0; i < numPoints; i++) {
        const pStart = new Date(startMs + i * intervalMs);
        const pEnd = new Date(startMs + (i + 1) * intervalMs);

        const sumForInterval = periodTransactions
          .filter((t) => {
            if (t.type !== "expense") return false;
            const d = new Date(t.date).getTime();
            return d >= pStart.getTime() && d < pEnd.getTime();
          })
          .reduce((sum, t) => sum + (t.amountInPaise || 0), 0);

        const pointLabel = new Intl.DateTimeFormat("en-IN", {
          day: "numeric",
          month: "short",
        }).format(pStart);

        trendPoints.push({
          label: pointLabel,
          amountInPaise: sumForInterval,
        });
      }

      // 4. Query 5 Most Recent Transactions
      const recentDocs = await Transaction.find({ userId: user.id })
        .populate("accountId", "name accountColor")
        .populate("destinationAccountId", "name accountColor")
        .sort({ date: -1, createdAt: -1 })
        .limit(5)
        .lean();

      recentTransactions = (recentDocs as Array<{
        _id: { toString(): string };
        type: "income" | "expense" | "transfer";
        amountInPaise: number;
        date: Date;
        category: string;
        description: string;
        accountId?: { name?: string; accountColor?: string };
        destinationAccountId?: { name?: string };
      }>).map((tx) => ({
        _id: tx._id.toString(),
        type: tx.type,
        amountInPaise: tx.amountInPaise,
        date: tx.date.toISOString(),
        category: tx.category,
        description: tx.description,
        accountName: tx.accountId?.name || "Account",
        accountColor: tx.accountId?.accountColor || "#0F766E",
        destName: tx.destinationAccountId?.name,
      }));

      // 4. Investments & Lending Ledger for Complete Net Worth
      const [investments, activeLoans] = await Promise.all([
        Investment.find({ userId: user.id }).lean(),
        LoanDebt.find({ userId: user.id, status: "active" }).lean(),
      ]);

      totalInvestmentsInPaise = investments.reduce(
        (sum, inv) => sum + (inv.currentValueInPaise || 0),
        0
      );

      activeLoans.forEach((loan) => {
        if (loan.type === "lent") {
          totalLentInPaise += loan.remainingAmountInPaise || 0;
        } else {
          totalBorrowedInPaise += loan.remainingAmountInPaise || 0;
        }
      });
    }
  } catch (err) {
    console.error("Dashboard data fetch error:", err);
  }

  const netCashFlowInPaise = periodIncomeInPaise - periodExpenseInPaise;
  const netWorthInPaise =
    totalBalanceInPaise + totalInvestmentsInPaise + totalLentInPaise - totalBorrowedInPaise;

  // Convert categoryMap into sorted CategoryStat[]
  const categoryStats: CategoryStat[] = Object.entries(categoryMap)
    .map(([category, stat]) => ({
      category,
      totalInPaise: stat.total,
      count: stat.count,
      percentage:
        periodExpenseInPaise > 0
          ? Math.round((stat.total / periodExpenseInPaise) * 100)
          : 0,
    }))
    .sort((a, b) => b.totalInPaise - a.totalInPaise);

  const selectableAccounts = userAccounts.map((a) => ({
    _id: a._id.toString(),
    name: a.name,
    accountColor: a.accountColor,
    currentBalanceInPaise: a.currentBalanceInPaise,
  }));

  const quickAccounts = userAccounts.map((a) => ({
    _id: a._id.toString(),
    name: a.name,
    accountType: a.accountType,
    accountColor: a.accountColor,
    maskedIdentifier: a.maskedIdentifier,
    currentBalanceInPaise: a.currentBalanceInPaise,
    isPrimary: a.isPrimary,
  }));

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
            Financial Overview
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Real-time financial positions, cash flow, and category analytics.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Date Range Selector */}
          <DateRangeSelector currentRange={currentRange} />

          {/* Quick Record Action */}
          {selectableAccounts.length > 0 ? (
            <CreateTransactionDialog accounts={selectableAccounts} />
          ) : (
            <Link href="/accounts">
              <Button size="sm" className="bg-[#0F766E] hover:bg-[#0d655e] text-white gap-1.5 h-9">
                <Plus className="size-4" />
                <span>Record Transaction</span>
              </Button>
            </Link>
          )}

          <Link href="/accounts">
            <Button size="sm" variant="outline" className="border-[#E2E8F0] text-[#0F172A] gap-1.5 h-9">
              <Landmark className="size-4" />
              <span>Add Account</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Comprehensive Net Worth Banner */}
      <div className="bg-gradient-to-r from-[#0d4f4a] via-[#0F766E] to-[#115E59] text-white rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-wider text-teal-200">
            Total Net Worth
          </span>
          <div className="text-3xl font-extrabold tracking-tight mt-0.5">
            {formatINR(netWorthInPaise)}
          </div>
          <p className="text-xs text-teal-100/80 mt-1">
            Aggregated across bank balances, investment holdings, and net debt receivables.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link
            href="/accounts"
            className="bg-white/10 hover:bg-white/20 transition-colors px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 border border-white/10"
          >
            <Wallet className="size-3.5 text-teal-300" />
            <span>Bank: {formatINR(totalBalanceInPaise)}</span>
          </Link>
          <Link
            href="/investments"
            className="bg-white/10 hover:bg-white/20 transition-colors px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 border border-white/10"
          >
            <TrendingUp className="size-3.5 text-teal-300" />
            <span>Investments: {formatINR(totalInvestmentsInPaise)}</span>
          </Link>
          <Link
            href="/loans"
            className="bg-white/10 hover:bg-white/20 transition-colors px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 border border-white/10"
          >
            <Scale className="size-3.5 text-teal-300" />
            <span>
              Net Debt: {totalLentInPaise >= totalBorrowedInPaise ? "+" : "-"}
              {formatINR(Math.abs(totalLentInPaise - totalBorrowedInPaise))}
            </span>
          </Link>
        </div>
      </div>

      {/* Primary & Secondary Account Balances with Privacy Show/Hide & Bottom Total */}
      <QuickAccountBalances
        accounts={quickAccounts}
        totalBalanceInPaise={totalBalanceInPaise}
      />

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tracked Balance */}
        <Card className="border-[#E2E8F0] shadow-2xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Total Tracked Balance
            </CardTitle>
            <div className="p-2 rounded-lg bg-[#CCFBF1] text-[#0F766E]">
              <Wallet className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F172A] tracking-tight">
              {formatINR(totalBalanceInPaise)}
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Across {accountsCount} active {accountsCount === 1 ? "account" : "accounts"}
            </p>
          </CardContent>
        </Card>

        {/* Period Income */}
        <Card className="border-[#E2E8F0] shadow-2xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Income ({dateRangeLabel})
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-50 text-[#16A34A]">
              <ArrowDownLeft className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#16A34A] tracking-tight">
              {formatINR(periodIncomeInPaise)}
            </div>
            <p className="text-xs text-[#64748B] mt-1">Total credited in period</p>
          </CardContent>
        </Card>

        {/* Period Expenses */}
        <Card className="border-[#E2E8F0] shadow-2xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Expenses ({dateRangeLabel})
            </CardTitle>
            <div className="p-2 rounded-lg bg-rose-50 text-[#E11D48]">
              <ArrowUpRight className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#E11D48] tracking-tight">
              {formatINR(periodExpenseInPaise)}
            </div>
            <p className="text-xs text-[#64748B] mt-1">Total spent in period</p>
          </CardContent>
        </Card>

        {/* Net Cash Flow */}
        <Card className="border-[#E2E8F0] shadow-2xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Net Cash Flow
            </CardTitle>
            <div className="p-2 rounded-lg bg-slate-100 text-[#0F172A]">
              <TrendingUp className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold tracking-tight ${
                netCashFlowInPaise >= 0 ? "text-[#16A34A]" : "text-[#E11D48]"
              }`}
            >
              {formatINR(netCashFlowInPaise, { showSign: true })}
            </div>
            <p className="text-xs text-[#64748B] mt-1">Income minus expenses</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Row: Category Breakdown + Spending Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryBreakdown
          categories={categoryStats}
          totalExpenseInPaise={periodExpenseInPaise}
          dateRangeLabel={dateRangeLabel}
        />

        <SpendingTrend points={trendPoints} dateRangeLabel={dateRangeLabel} />
      </div>

      {/* Main Content Grid: Accounts + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accounts Snapshot */}
        <Card className="lg:col-span-1 border-[#E2E8F0] shadow-2xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold text-[#0F172A]">Bank Accounts</CardTitle>
              <CardDescription className="text-xs text-[#64748B]">
                Tracked balances
              </CardDescription>
            </div>
            <Link href="/accounts">
              <Button variant="ghost" size="xs" className="text-xs text-[#0F766E] hover:bg-[#CCFBF1]/40">
                Manage
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {accountsCount === 0 ? (
              <div className="p-6 text-center rounded-lg border border-dashed border-[#E2E8F0] bg-[#F8FAFC]">
                <Landmark className="size-8 mx-auto text-[#64748B] mb-2 stroke-1" />
                <h4 className="text-xs font-semibold text-[#0F172A]">No accounts yet</h4>
                <p className="text-[11px] text-[#64748B] mt-1 max-w-[200px] mx-auto">
                  Add your primary bank, wallet, or cash balance to start.
                </p>
                <Link href="/accounts">
                  <Button size="xs" className="mt-3 bg-[#0F766E] hover:bg-[#0d655e] text-white">
                    Add Bank Account
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {userAccounts.slice(0, 4).map((acc) => (
                  <div
                    key={acc._id.toString()}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]/50 hover:bg-[#F8FAFC] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="size-3 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: acc.accountColor }}
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-[#0F172A] block truncate">
                          {acc.name}
                        </span>
                        <span className="text-[10px] text-[#64748B] capitalize block truncate">
                          {acc.accountType} {acc.maskedIdentifier ? `• ${acc.maskedIdentifier}` : ""}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-[#0F172A] block">
                        {formatINR(acc.currentBalanceInPaise)}
                      </span>
                    </div>
                  </div>
                ))}

                {userAccounts.length > 4 && (
                  <div className="text-center pt-1">
                    <Link
                      href="/accounts"
                      className="text-xs text-[#0F766E] font-medium hover:underline"
                    >
                      + {userAccounts.length - 4} more accounts
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-[#E2E8F0] shadow-2xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold text-[#0F172A]">Recent Activity</CardTitle>
              <CardDescription className="text-xs text-[#64748B]">
                Latest income, expense, and transfers
              </CardDescription>
            </div>
            <Link href="/transactions">
              <Button variant="ghost" size="xs" className="text-xs text-[#0F766E] hover:bg-[#CCFBF1]/40">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="p-8 text-center rounded-lg border border-dashed border-[#E2E8F0] bg-[#F8FAFC]">
                <ArrowLeftRight className="size-8 mx-auto text-[#64748B] mb-2 stroke-1" />
                <h4 className="text-xs font-semibold text-[#0F172A]">No transactions recorded yet</h4>
                <p className="text-[11px] text-[#64748B] mt-1 max-w-sm mx-auto">
                  Every transaction updates your account balances in real time with integer paise precision.
                </p>
                <Link href="/transactions">
                  <Button size="xs" className="mt-3 bg-[#0F766E] hover:bg-[#0d655e] text-white">
                    Record First Transaction
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentTransactions.map((tx) => {
                  const isIncome = tx.type === "income";
                  const isExpense = tx.type === "expense";
                  const formattedDate = new Intl.DateTimeFormat("en-IN", {
                    day: "numeric",
                    month: "short",
                  }).format(new Date(tx.date));

                  return (
                    <div
                      key={tx._id}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]/50 hover:bg-[#F8FAFC] transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`size-7 rounded-md flex items-center justify-center shrink-0 ${
                            isIncome
                              ? "bg-emerald-50 text-[#16A34A]"
                              : isExpense
                              ? "bg-rose-50 text-[#E11D48]"
                              : "bg-[#CCFBF1] text-[#0F766E]"
                          }`}
                        >
                          {isIncome && <ArrowDownLeft className="size-3.5" />}
                          {isExpense && <ArrowUpRight className="size-3.5" />}
                          {!isIncome && !isExpense && <ArrowLeftRight className="size-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-[#0F172A] block truncate">
                            {tx.description}
                          </span>
                          <span className="text-[10px] text-[#64748B] block truncate">
                            {formattedDate} • {tx.category} • {tx.accountName}
                            {tx.destName ? ` → ${tx.destName}` : ""}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-xs font-bold block ${
                            isIncome
                              ? "text-[#16A34A]"
                              : isExpense
                              ? "text-[#E11D48]"
                              : "text-[#0F766E]"
                          }`}
                        >
                          {isIncome
                            ? `+${formatINR(tx.amountInPaise)}`
                            : isExpense
                            ? `-${formatINR(tx.amountInPaise)}`
                            : formatINR(tx.amountInPaise)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial Safety Notice */}
      <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-3 text-amber-900">
        <ShieldAlert className="size-5 shrink-0 text-amber-600 mt-0.5" />
        <div className="text-xs space-y-0.5">
          <span className="font-semibold block">Privacy & Security Notice</span>
          <p className="text-amber-800 leading-relaxed">
            Expenso is a strictly private, self-managed ledger. We do not connect to external banking credentials or read your SMS. All financial records are stored securely in your MongoDB database and are linked exclusively to your account.
          </p>
        </div>
      </div>
    </div>
  );
}
