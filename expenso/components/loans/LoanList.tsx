"use client";

import { useState, useTransition } from "react";
import { formatINR } from "@/lib/utils/currency";
import { deleteLoanDebt, toggleLoanSettled } from "@/lib/actions/loans";
import { RecordRepaymentDialog } from "./RecordRepaymentDialog";
import {
  HandCoins,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CheckCircle2,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface SerializedLoan {
  id: string;
  personName: string;
  type: "lent" | "borrowed";
  originalAmountInPaise: number;
  remainingAmountInPaise: number;
  dueDate?: string;
  status: "active" | "settled" | "defaulted";
  repayments: Array<{
    amountInPaise: number;
    date: string;
    note?: string;
  }>;
  notes?: string;
  createdAt: string;
}

interface AccountOption {
  id: string;
  name: string;
  balanceInPaise: number;
}

interface LoanListProps {
  initialLoans: SerializedLoan[];
  accounts: AccountOption[];
}

export function LoanList({ initialLoans, accounts }: LoanListProps) {
  const [activeTab, setActiveTab] = useState<"all" | "lent" | "borrowed" | "settled">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedLoanId, setExpandedLoanId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredLoans = initialLoans.filter((loan) => {
    // Tab filter
    if (activeTab === "lent" && (loan.type !== "lent" || loan.status === "settled")) return false;
    if (activeTab === "borrowed" && (loan.type !== "borrowed" || loan.status === "settled")) return false;
    if (activeTab === "settled" && loan.status !== "settled") return false;
    if (activeTab === "all" && loan.status === "settled") return false; // Show active primarily in all

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = loan.personName.toLowerCase().includes(q);
      const matchesNotes = loan.notes?.toLowerCase().includes(q) ?? false;
      return matchesName || matchesNotes;
    }

    return true;
  });

  const activeLentCount = initialLoans.filter((l) => l.type === "lent" && l.status === "active").length;
  const activeBorrowedCount = initialLoans.filter((l) => l.type === "borrowed" && l.status === "active").length;
  const settledCount = initialLoans.filter((l) => l.status === "settled").length;
  const activeAllCount = activeLentCount + activeBorrowedCount;

  const handleDelete = (loanId: string, name: string) => {
    if (confirm(`Are you sure you want to delete the record for ${name}?`)) {
      startTransition(async () => {
        await deleteLoanDebt(loanId);
      });
    }
  };

  const handleToggleSettled = (loanId: string) => {
    startTransition(async () => {
      await toggleLoanSettled(loanId);
    });
  };

  return (
    <div className="space-y-4">
      {/* Controls: Search & Tabs */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg max-w-fit overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === "all"
                ? "bg-white text-[#0F172A] shadow-xs"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            Active ({activeAllCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("lent")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === "lent"
                ? "bg-white text-[#0F766E] shadow-xs"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            Lent ({activeLentCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("borrowed")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === "borrowed"
                ? "bg-white text-amber-700 shadow-xs"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            Borrowed ({activeBorrowedCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("settled")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === "settled"
                ? "bg-white text-emerald-700 shadow-xs"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            Settled ({settledCount})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[#64748B]" />
          <Input
            placeholder="Search person or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs border-[#E2E8F0] bg-white"
          />
        </div>
      </div>

      {/* List */}
      {filteredLoans.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-[#E2E8F0]">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#CCFBF1]/50 flex items-center justify-center text-[#0F766E] mb-3">
            <HandCoins className="size-6" />
          </div>
          <h3 className="text-sm font-bold text-[#0F172A]">No records found</h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1">
            {searchQuery
              ? "No records matched your search query."
              : "Track personal loans, money lent to friends, or debt repayments with clarity."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLoans.map((loan) => {
            const repaidPaise = loan.originalAmountInPaise - loan.remainingAmountInPaise;
            const progressPercent = Math.min(
              100,
              Math.round((repaidPaise / loan.originalAmountInPaise) * 100)
            );
            const isSettled = loan.status === "settled" || loan.remainingAmountInPaise === 0;
            const isOverdue =
              !isSettled &&
              loan.dueDate &&
              new Date(loan.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

            const isExpanded = expandedLoanId === loan.id;

            return (
              <div
                key={loan.id}
                className="bg-white rounded-xl border border-[#E2E8F0] p-4.5 space-y-3.5 hover:shadow-xs transition-shadow"
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase ${
                        loan.type === "lent"
                          ? "bg-teal-50 text-[#0F766E] border border-teal-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {loan.personName.slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#0F172A] leading-tight">
                        {loan.personName}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                            loan.type === "lent"
                              ? "bg-teal-50 text-[#0F766E]"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {loan.type === "lent" ? (
                            <>
                              <ArrowUpRight className="size-2.5" />
                              Lent (Receivable)
                            </>
                          ) : (
                            <>
                              <ArrowDownLeft className="size-2.5" />
                              Borrowed (Payable)
                            </>
                          )}
                        </span>

                        {isSettled ? (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                            <CheckCircle2 className="size-2.5" />
                            Settled
                          </span>
                        ) : isOverdue ? (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-full">
                            <AlertCircle className="size-2.5" />
                            Overdue
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Remaining Amount */}
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                      {isSettled ? "Settled Total" : "Remaining"}
                    </span>
                    <span
                      className={`text-base font-extrabold ${
                        isSettled
                          ? "text-slate-400 line-through"
                          : loan.type === "lent"
                          ? "text-[#0F766E]"
                          : "text-amber-600"
                      }`}
                    >
                      {formatINR(loan.remainingAmountInPaise)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                    <span>
                      Repaid: <strong>{formatINR(repaidPaise)}</strong> of {formatINR(loan.originalAmountInPaise)}
                    </span>
                    <span className="font-semibold text-[#0F172A]">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isSettled
                          ? "bg-emerald-500"
                          : loan.type === "lent"
                          ? "bg-[#0F766E]"
                          : "bg-amber-500"
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Metadata & Due Date */}
                <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-0.5 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    {loan.dueDate ? (
                      <>
                        <Calendar className="size-3" />
                        <span>Due: {new Date(loan.dueDate).toLocaleDateString("en-IN")}</span>
                      </>
                    ) : (
                      <span>No due date set</span>
                    )}
                  </div>
                  {loan.notes && (
                    <span className="truncate max-w-[150px] text-slate-500" title={loan.notes}>
                      {loan.notes}
                    </span>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    {!isSettled && (
                      <RecordRepaymentDialog
                        loanId={loan.id}
                        personName={loan.personName}
                        type={loan.type}
                        remainingAmountInPaise={loan.remainingAmountInPaise}
                        accounts={accounts}
                      />
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleSettled(loan.id)}
                      disabled={isPending}
                      className="h-8 text-[11px] text-[#64748B] hover:text-[#0F172A] px-2"
                    >
                      {isSettled ? "Mark Active" : "Mark Settled"}
                    </Button>
                  </div>

                  <div className="flex items-center gap-1">
                    {loan.repayments.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setExpandedLoanId(isExpanded ? null : loan.id)}
                        className="p-1.5 text-xs text-[#64748B] hover:text-[#0F172A] rounded-md hover:bg-slate-50"
                        title="View payment history"
                      >
                        {isExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(loan.id, loan.personName)}
                      disabled={isPending}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Repayments History */}
                {isExpanded && loan.repayments.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-[#64748B] tracking-wider">
                      Payment History
                    </span>
                    <div className="space-y-1">
                      {loan.repayments.map((rep, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-[11px] p-1.5 rounded bg-slate-50"
                        >
                          <div>
                            <span className="font-semibold text-[#0F172A]">
                              {formatINR(rep.amountInPaise)}
                            </span>
                            {rep.note && <span className="text-slate-500 ml-1.5">({rep.note})</span>}
                          </div>
                          <span className="text-slate-400">
                            {new Date(rep.date).toLocaleDateString("en-IN")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
