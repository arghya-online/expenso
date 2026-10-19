export const instant = false;

import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { LoanDebt, ILoanDebt } from "@/lib/models/LoanDebt";
import { BankAccount, IBankAccount } from "@/lib/models/BankAccount";
import { formatINR } from "@/lib/utils/currency";
import { CreateLoanDialog } from "@/components/loans/CreateLoanDialog";
import { LoanList, SerializedLoan } from "@/components/loans/LoanList";
import { HandCoins, ArrowUpRight, ArrowDownLeft, Scale } from "lucide-react";

export default async function LoansPage() {
  const session = await requireAuth();
  await connectToDatabase();

  const [rawLoans, rawAccounts] = await Promise.all([
    LoanDebt.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean() as unknown as Promise<ILoanDebt[]>,
    BankAccount.find({ userId: session.user.id, status: "active" })
      .sort({ name: 1 })
      .lean() as unknown as Promise<IBankAccount[]>,
  ]);

  const loans: SerializedLoan[] = rawLoans.map((l) => ({
    id: l._id.toString(),
    personName: l.personName,
    type: l.type,
    originalAmountInPaise: l.originalAmountInPaise,
    remainingAmountInPaise: l.remainingAmountInPaise,
    dueDate: l.dueDate ? l.dueDate.toISOString() : undefined,
    status: l.status,
    repayments: (l.repayments || []).map((r) => ({
      amountInPaise: r.amountInPaise,
      date: new Date(r.date).toISOString(),
      note: r.note,
    })),
    notes: l.notes,
    createdAt: l.createdAt.toISOString(),
  }));

  const accounts = rawAccounts.map((a) => ({
    id: a._id.toString(),
    name: a.name,
    balanceInPaise: a.currentBalanceInPaise,
  }));

  // Calculate metrics
  let totalLentPaise = 0;
  let totalBorrowedPaise = 0;
  let activeLoansCount = 0;

  loans.forEach((loan) => {
    if (loan.status === "active") {
      activeLoansCount++;
      if (loan.type === "lent") {
        totalLentPaise += loan.remainingAmountInPaise;
      } else {
        totalBorrowedPaise += loan.remainingAmountInPaise;
      }
    }
  });

  const netBalancePaise = totalLentPaise - totalBorrowedPaise;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            Lending & Debt Ledger
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Track money given to others, personal debts, settlements, and repayment timelines.
          </p>
        </div>
        <CreateLoanDialog />
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Lent (You are owed) */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4.5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">Money Lent (Receivables)</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center">
              <ArrowUpRight className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#0F766E] tracking-tight">
            {formatINR(totalLentPaise)}
          </div>
          <p className="text-[11px] text-[#64748B]">Expected to be returned to you</p>
        </div>

        {/* Total Borrowed (You owe) */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4.5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">Money Borrowed (Payables)</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ArrowDownLeft className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600 tracking-tight">
            {formatINR(totalBorrowedPaise)}
          </div>
          <p className="text-[11px] text-[#64748B]">Liabilities you need to repay</p>
        </div>

        {/* Net Lending Balance */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4.5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">Net Debt Position</span>
            <div className="w-7 h-7 rounded-lg bg-slate-50 text-[#0F172A] flex items-center justify-center">
              <Scale className="size-4" />
            </div>
          </div>
          <div
            className={`text-2xl font-extrabold tracking-tight ${
              netBalancePaise >= 0 ? "text-[#0F766E]" : "text-amber-600"
            }`}
          >
            {formatINR(Math.abs(netBalancePaise))}
          </div>
          <p className="text-[11px] text-[#64748B]">
            {netBalancePaise >= 0 ? "Net surplus receivable" : "Net outstanding obligation"}
          </p>
        </div>

        {/* Active Ledger Count */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4.5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">Active Records</span>
            <div className="w-7 h-7 rounded-lg bg-[#CCFBF1] text-[#0F766E] flex items-center justify-center">
              <HandCoins className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
            {activeLoansCount}
          </div>
          <p className="text-[11px] text-[#64748B]">Open lending / borrowing entries</p>
        </div>
      </div>

      {/* Main Loan List */}
      <LoanList initialLoans={loans} accounts={accounts} />
    </div>
  );
}
