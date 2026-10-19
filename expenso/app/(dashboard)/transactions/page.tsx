import { getServerSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Transaction } from "@/lib/models/Transaction";
import { BankAccount } from "@/lib/models/BankAccount";
import { formatINR } from "@/lib/utils/currency";
import { CreateTransactionDialog } from "@/components/transactions/CreateTransactionDialog";
import { TransactionList, TransactionItem } from "@/components/transactions/TransactionList";
import { ArrowDownLeft, ArrowUpRight, TrendingUp, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const instant = false;

export default async function TransactionsPage() {
  const session = await getServerSession();
  const userId = session?.user?.id;

  await connectToDatabase();

  const accounts = userId
    ? await BankAccount.find({ userId, status: "active" }).lean()
    : [];

  const rawTransactions = userId
    ? await Transaction.find({ userId })
        .populate("accountId", "name accountColor")
        .populate("destinationAccountId", "name accountColor")
        .sort({ date: -1, createdAt: -1 })
        .lean()
    : [];

  const transactions: TransactionItem[] = (
    rawTransactions as Array<{
      _id: { toString(): string };
      type: "income" | "expense" | "transfer";
      amountInPaise: number;
      date: Date;
      category: string;
      subcategory?: string;
      description: string;
      merchant?: string;
      paymentMethod: string;
      accountId?: { _id?: { toString(): string }; name?: string; accountColor?: string };
      destinationAccountId?: { _id?: { toString(): string }; name?: string; accountColor?: string };
    }>
  ).map((tx) => ({
    _id: tx._id.toString(),
    type: tx.type,
    amountInPaise: tx.amountInPaise,
    date: tx.date.toISOString(),
    category: tx.category,
    subcategory: tx.subcategory,
    description: tx.description,
    merchant: tx.merchant,
    paymentMethod: tx.paymentMethod,
    accountId: {
      _id: tx.accountId?._id?.toString() || "",
      name: tx.accountId?.name || "Deleted Account",
      accountColor: tx.accountId?.accountColor || "#0F766E",
    },
    destinationAccountId:
      tx.destinationAccountId && tx.destinationAccountId._id
        ? {
            _id: tx.destinationAccountId._id.toString(),
            name: tx.destinationAccountId.name || "Account",
            accountColor: tx.destinationAccountId.accountColor || "#0F766E",
          }
        : undefined,
  }));

  // Calculations for current month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  let monthlyIncomeInPaise = 0;
  let monthlyExpenseInPaise = 0;

  for (const tx of transactions) {
    const txDate = new Date(tx.date);
    if (txDate >= startOfMonth) {
      if (tx.type === "income") {
        monthlyIncomeInPaise += tx.amountInPaise;
      } else if (tx.type === "expense") {
        monthlyExpenseInPaise += tx.amountInPaise;
      }
    }
  }

  const netCashFlowInPaise = monthlyIncomeInPaise - monthlyExpenseInPaise;

  const selectableAccounts = accounts.map((a) => ({
    _id: a._id.toString(),
    name: a.name,
    accountColor: a.accountColor,
    currentBalanceInPaise: a.currentBalanceInPaise,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
            Transactions & Ledger
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Record and review your daily incomes, expenses, and inter-account transfers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CreateTransactionDialog accounts={selectableAccounts} />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monthly Expense */}
        <Card className="border-[#E2E8F0] shadow-2xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              This Month&apos;s Expenses
            </CardTitle>
            <div className="p-2 rounded-lg bg-rose-50 text-[#E11D48]">
              <ArrowUpRight className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#E11D48] tracking-tight">
              {formatINR(monthlyExpenseInPaise)}
            </div>
            <p className="text-xs text-[#64748B] mt-1">Current calendar month</p>
          </CardContent>
        </Card>

        {/* Monthly Income */}
        <Card className="border-[#E2E8F0] shadow-2xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              This Month&apos;s Income
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-50 text-[#16A34A]">
              <ArrowDownLeft className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#16A34A] tracking-tight">
              {formatINR(monthlyIncomeInPaise)}
            </div>
            <p className="text-xs text-[#64748B] mt-1">Total credited earnings</p>
          </CardContent>
        </Card>

        {/* Net Flow */}
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

        {/* Total Records */}
        <Card className="border-[#E2E8F0] shadow-2xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Total Records
            </CardTitle>
            <div className="p-2 rounded-lg bg-[#CCFBF1] text-[#0F766E]">
              <Receipt className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F172A] tracking-tight">
              {transactions.length}
            </div>
            <p className="text-xs text-[#64748B] mt-1">Recorded ledger transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List Table */}
      <TransactionList
        initialTransactions={transactions}
        accounts={accounts.map((a) => ({ _id: a._id.toString(), name: a.name }))}
      />
    </div>
  );
}
