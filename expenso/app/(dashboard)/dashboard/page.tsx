import { getServerSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { BankAccount } from "@/lib/models/BankAccount";
import { Transaction } from "@/lib/models/Transaction";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { CreateTransactionDialog } from "@/components/transactions/CreateTransactionDialog";

export const instant = false;

export default async function DashboardPage() {
  const session = await getServerSession();
  const user = session?.user;

  let totalBalanceInPaise = 0;
  let totalIncomeInPaise = 0;
  let totalExpenseInPaise = 0;
  let accountsCount = 0;
  let userAccounts: Array<{
    _id: { toString(): string };
    name: string;
    accountType: string;
    accountColor: string;
    maskedIdentifier?: string;
    currentBalanceInPaise: number;
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

  try {
    await connectToDatabase();
    if (user?.id) {
      // Aggregate accounts balance
      const accounts = await BankAccount.find({
        userId: user.id,
        status: "active",
      }).sort({ currentBalanceInPaise: -1 }).lean();

      userAccounts = accounts.map((acc) => ({
        _id: acc._id,
        name: acc.name,
        accountType: acc.accountType,
        accountColor: acc.accountColor,
        maskedIdentifier: acc.maskedIdentifier,
        currentBalanceInPaise: acc.currentBalanceInPaise,
      }));
      accountsCount = accounts.length;
      totalBalanceInPaise = accounts.reduce(
        (acc, curr) => acc + (curr.currentBalanceInPaise || 0),
        0
      );

      // Current month range for income & expense
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const monthlyTransactions = await Transaction.find({
        userId: user.id,
        date: { $gte: startOfMonth },
      }).lean();

      for (const t of monthlyTransactions) {
        if (t.type === "income") {
          totalIncomeInPaise += t.amountInPaise || 0;
        } else if (t.type === "expense") {
          totalExpenseInPaise += t.amountInPaise || 0;
        }
      }

      // Query recent transactions
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
    }
  } catch (err) {
    console.error("Dashboard data fetch error:", err);
  }

  const netCashFlowInPaise = totalIncomeInPaise - totalExpenseInPaise;

  const selectableAccounts = userAccounts.map((a) => ({
    _id: a._id.toString(),
    name: a.name,
    accountColor: a.accountColor,
    currentBalanceInPaise: a.currentBalanceInPaise,
  }));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
            Hello, {user?.name ? user.name.split(" ")[0] : "there"} 👋
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Here is your financial summary across all tracked bank accounts.
          </p>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance */}
        <Card className="border-[#E2E8F0] shadow-2xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Tracked Balance
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

        {/* Monthly Income */}
        <Card className="border-[#E2E8F0] shadow-2xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Monthly Income
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-50 text-[#16A34A]">
              <ArrowDownLeft className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#16A34A] tracking-tight">
              {formatINR(totalIncomeInPaise)}
            </div>
            <p className="text-xs text-[#64748B] mt-1">Total credited this month</p>
          </CardContent>
        </Card>

        {/* Monthly Expenses */}
        <Card className="border-[#E2E8F0] shadow-2xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Monthly Expenses
            </CardTitle>
            <div className="p-2 rounded-lg bg-rose-50 text-[#E11D48]">
              <ArrowUpRight className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#E11D48] tracking-tight">
              {formatINR(totalExpenseInPaise)}
            </div>
            <p className="text-xs text-[#64748B] mt-1">Total spent this month</p>
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

      {/* Main Content Grid (Account Snapshot + Recent Transactions) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accounts Section */}
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

        {/* Recent Transactions Section */}
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
