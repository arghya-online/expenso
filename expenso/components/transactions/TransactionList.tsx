"use client";

import { useState } from "react";
import { formatINR } from "@/lib/utils/currency";
import { deleteTransaction } from "@/lib/actions/transactions";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Search,
  Trash2,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export interface TransactionItem {
  _id: string;
  type: "income" | "expense" | "transfer";
  amountInPaise: number;
  date: string;
  category: string;
  subcategory?: string;
  description: string;
  merchant?: string;
  paymentMethod: string;
  accountId: {
    _id: string;
    name: string;
    accountColor: string;
  };
  destinationAccountId?: {
    _id: string;
    name: string;
    accountColor: string;
  };
}

interface TransactionListProps {
  initialTransactions: TransactionItem[];
  accounts: Array<{ _id: string; name: string }>;
}

export function TransactionList({
  initialTransactions,
  accounts,
}: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction? The account balance will be automatically adjusted.")) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteTransaction(id);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  // Filter transactions
  const filtered = initialTransactions.filter((tx) => {
    // Search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchDesc = tx.description.toLowerCase().includes(q);
      const matchMerchant = tx.merchant ? tx.merchant.toLowerCase().includes(q) : false;
      const matchCat = tx.category.toLowerCase().includes(q);
      if (!matchDesc && !matchMerchant && !matchCat) return false;
    }

    // Type
    if (selectedType !== "all" && tx.type !== selectedType) {
      return false;
    }

    // Account
    if (selectedAccount !== "all") {
      const isSource = tx.accountId?._id === selectedAccount;
      const isDest = tx.destinationAccountId?._id === selectedAccount;
      if (!isSource && !isDest) return false;
    }

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="size-4 absolute left-3 top-2.5 text-[#64748B]" />
          <Input
            placeholder="Search description, merchant, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs sm:text-sm border-[#E2E8F0] bg-white"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <Filter className="size-3.5" />
            <span className="hidden sm:inline">Filters:</span>
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-9 rounded-md border border-[#E2E8F0] bg-white px-2.5 text-xs text-[#0F172A] focus:outline-hidden focus:ring-1 focus:ring-[#0F766E]"
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
            <option value="transfer">Transfers</option>
          </select>

          {/* Account Filter */}
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="h-9 rounded-md border border-[#E2E8F0] bg-white px-2.5 text-xs text-[#0F172A] focus:outline-hidden focus:ring-1 focus:ring-[#0F766E]"
          >
            <option value="all">All Accounts</option>
            {accounts.map((acc) => (
              <option key={acc._id} value={acc._id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transaction Records List */}
      {filtered.length === 0 ? (
        <div className="p-10 text-center rounded-xl border border-dashed border-[#E2E8F0] bg-white">
          <p className="text-sm font-semibold text-[#0F172A]">No matching transactions</p>
          <p className="text-xs text-[#64748B] mt-1">
            Try adjusting your search filters or record a new transaction above.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-2xs divide-y divide-[#E2E8F0]">
          {filtered.map((tx) => {
            const formattedDate = new Intl.DateTimeFormat("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }).format(new Date(tx.date));

            const isIncome = tx.type === "income";
            const isExpense = tx.type === "expense";
            const isTransfer = tx.type === "transfer";

            return (
              <div
                key={tx._id}
                className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-[#F8FAFC] transition-colors"
              >
                {/* Left icon & Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isIncome
                        ? "bg-emerald-50 text-[#16A34A]"
                        : isExpense
                        ? "bg-rose-50 text-[#E11D48]"
                        : "bg-[#CCFBF1] text-[#0F766E]"
                    }`}
                  >
                    {isIncome && <ArrowDownLeft className="size-4.5" />}
                    {isExpense && <ArrowUpRight className="size-4.5" />}
                    {isTransfer && <ArrowLeftRight className="size-4.5" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs sm:text-sm text-[#0F172A] truncate">
                        {tx.description}
                      </span>
                      {tx.merchant && (
                        <span className="text-[11px] text-[#64748B] font-medium hidden sm:inline">
                          • {tx.merchant}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#64748B] flex-wrap">
                      <span>{formattedDate}</span>
                      <span>•</span>
                      <span className="font-medium text-[#0F172A]">{tx.category}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: tx.accountId?.accountColor || "#0F766E" }}
                        />
                        <span>{tx.accountId?.name || "Account"}</span>
                        {isTransfer && tx.destinationAccountId && (
                          <>
                            <span>→</span>
                            <span
                              className="size-2 rounded-full"
                              style={{ backgroundColor: tx.destinationAccountId?.accountColor || "#0F766E" }}
                            />
                            <span>{tx.destinationAccountId?.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Amount & Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div
                      className={`text-sm sm:text-base font-bold tracking-tight ${
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
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[9px] uppercase px-1.5 py-0 border-[#E2E8F0] text-[#64748B]"
                    >
                      {tx.paymentMethod}
                    </Badge>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleDelete(tx._id)}
                    disabled={deletingId === tx._id}
                    title="Delete transaction"
                    className="text-[#64748B] hover:text-[#E11D48] hover:bg-rose-50"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
