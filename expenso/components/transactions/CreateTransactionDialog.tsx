"use client";

import { useState } from "react";
import { createTransaction } from "@/lib/actions/transactions";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from "@/lib/constants/categories";
import { Plus, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AccountOption {
  _id: string;
  name: string;
  accountColor: string;
  currentBalanceInPaise: number;
}

interface CreateTransactionDialogProps {
  accounts: AccountOption[];
}

export function CreateTransactionDialog({ accounts }: CreateTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState<"expense" | "income" | "transfer">("expense");
  const [amountRupees, setAmountRupees] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [accountId, setAccountId] = useState(accounts[0]?._id || "");
  const [destinationAccountId, setDestinationAccountId] = useState(accounts[1]?._id || "");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].name);
  const [merchant, setMerchant] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking" | "cash" | "cheque" | "other">("upi");
  const [notes, setNotes] = useState("");

  const handleTypeChange = (newType: "expense" | "income" | "transfer") => {
    setType(newType);
    if (newType === "expense") {
      setCategory(EXPENSE_CATEGORIES[0].name);
    } else if (newType === "income") {
      setCategory(INCOME_CATEGORIES[0].name);
    } else {
      setCategory("Transfer");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amountRupees);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount greater than ₹0");
      return;
    }

    if (!accountId) {
      setError("Please select a bank account");
      return;
    }

    if (type === "transfer" && accountId === destinationAccountId) {
      setError("Source and destination accounts must be different");
      return;
    }

    setLoading(true);

    try {
      const res = await createTransaction({
        type,
        amountRupees: parsedAmount,
        date,
        accountId,
        destinationAccountId: type === "transfer" ? destinationAccountId : undefined,
        category,
        description: description.trim(),
        merchant: merchant.trim() || undefined,
        paymentMethod,
        tags: [],
        notes: notes.trim() || undefined,
      });

      if (res.success) {
        setOpen(false);
        setAmountRupees("");
        setDescription("");
        setMerchant("");
        setNotes("");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to record transaction";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" className="bg-[#0F766E] hover:bg-[#0d655e] text-white gap-1.5 h-9">
            <Plus className="size-4" />
            <span>Record Transaction</span>
          </Button>
        }
      />

      <DialogContent className="sm:max-w-lg bg-white border-[#E2E8F0] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#0F172A]">
            Record Transaction
          </DialogTitle>
          <DialogDescription className="text-xs text-[#64748B]">
            Add an income, expense, or transfer between your tracked accounts.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Type Selector Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F1F5F9] rounded-lg">
            <button
              type="button"
              onClick={() => handleTypeChange("expense")}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold transition-all ${
                type === "expense"
                  ? "bg-white text-[#E11D48] shadow-xs"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <ArrowUpRight className="size-3.5" />
              <span>Expense</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange("income")}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold transition-all ${
                type === "income"
                  ? "bg-white text-[#16A34A] shadow-xs"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <ArrowDownLeft className="size-3.5" />
              <span>Income</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange("transfer")}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold transition-all ${
                type === "transfer"
                  ? "bg-white text-[#0F766E] shadow-xs"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <ArrowLeftRight className="size-3.5" />
              <span>Transfer</span>
            </button>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="tx-amount" className="text-xs font-semibold text-[#0F172A]">
                Amount (₹) *
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-[#64748B] font-medium">₹</span>
                <Input
                  id="tx-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amountRupees}
                  onChange={(e) => setAmountRupees(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-7 h-9 text-sm border-[#E2E8F0] font-semibold text-[#0F172A]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tx-date" className="text-xs font-semibold text-[#0F172A]">
                Date *
              </Label>
              <Input
                id="tx-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                disabled={loading}
                className="h-9 text-sm border-[#E2E8F0]"
              />
            </div>
          </div>

          {/* Source Account & Destination Account (if transfer) */}
          <div className={`grid ${type === "transfer" ? "grid-cols-2" : "grid-cols-1"} gap-3`}>
            <div className="space-y-1.5">
              <Label htmlFor="tx-source" className="text-xs font-semibold text-[#0F172A]">
                {type === "transfer" ? "From Account *" : "Bank Account *"}
              </Label>
              <select
                id="tx-source"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                required
                disabled={loading}
                className="w-full h-9 rounded-md border border-[#E2E8F0] bg-white px-2.5 text-xs text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
              >
                {accounts.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            {type === "transfer" && (
              <div className="space-y-1.5">
                <Label htmlFor="tx-dest" className="text-xs font-semibold text-[#0F172A]">
                  To Account *
                </Label>
                <select
                  id="tx-dest"
                  value={destinationAccountId}
                  onChange={(e) => setDestinationAccountId(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full h-9 rounded-md border border-[#E2E8F0] bg-white px-2.5 text-xs text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                >
                  {accounts.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Category & Payment Method */}
          {type !== "transfer" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tx-category" className="text-xs font-semibold text-[#0F172A]">
                  Category
                </Label>
                <select
                  id="tx-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={loading}
                  className="w-full h-9 rounded-md border border-[#E2E8F0] bg-white px-2.5 text-xs text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tx-method" className="text-xs font-semibold text-[#0F172A]">
                  Payment Method
                </Label>
                <select
                  id="tx-method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
                  disabled={loading}
                  className="w-full h-9 rounded-md border border-[#E2E8F0] bg-white px-2.5 text-xs text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Description & Merchant */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="tx-desc" className="text-xs font-semibold text-[#0F172A]">
                Description / Purpose *
              </Label>
              <Input
                id="tx-desc"
                placeholder={type === "transfer" ? "e.g. Savings allocation" : "e.g. Grocery restock, Dinner"}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                disabled={loading}
                className="h-9 text-sm border-[#E2E8F0]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tx-merchant" className="text-xs font-semibold text-[#0F172A]">
                Merchant / Payee
              </Label>
              <Input
                id="tx-merchant"
                placeholder="e.g. Swiggy, Amazon, Client"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                disabled={loading}
                className="h-9 text-sm border-[#E2E8F0]"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="tx-notes" className="text-xs font-semibold text-[#0F172A]">
              Notes (Optional)
            </Label>
            <Input
              id="tx-notes"
              placeholder="Additional tags or reference info"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
              className="h-9 text-sm border-[#E2E8F0]"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="border-[#E2E8F0]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="bg-[#0F766E] hover:bg-[#0d655e] text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : (
                "Save Transaction"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
