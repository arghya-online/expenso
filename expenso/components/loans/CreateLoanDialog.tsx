"use client";

import { useState } from "react";
import { createLoanDebt } from "@/lib/actions/loans";
import { Plus, Loader2 } from "lucide-react";
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

export function CreateLoanDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [personName, setPersonName] = useState("");
  const [type, setType] = useState<"lent" | "borrowed">("lent");
  const [amountRupees, setAmountRupees] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amountRupees);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please provide a valid amount in ₹ (greater than 0)");
      return;
    }

    setLoading(true);

    try {
      const res = await createLoanDebt({
        personName,
        type,
        amountRupees: parsedAmount,
        dueDate: dueDate || undefined,
        notes: notes.trim() || undefined,
      });

      if (res.success) {
        setOpen(false);
        setPersonName("");
        setAmountRupees("");
        setDueDate("");
        setNotes("");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to record loan/debt";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" className="bg-[#0F766E] hover:bg-[#0d655e] text-white gap-1.5 h-9 font-medium shadow-sm">
            <Plus className="size-4" />
            <span>Add Record</span>
          </Button>
        }
      />

      <DialogContent className="sm:max-w-md bg-white border-[#E2E8F0]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#0F172A]">
            Record Lending or Borrowing
          </DialogTitle>
          <DialogDescription className="text-xs text-[#64748B]">
            Track money lent to friends or borrowed from loans and individuals.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Type Toggle: Lent vs Borrowed */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[#0F172A]">Type of Record *</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("lent")}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                  type === "lent"
                    ? "bg-[#CCFBF1] text-[#0F766E] border-[#0F766E]"
                    : "bg-slate-50 text-slate-600 border-[#E2E8F0] hover:bg-slate-100"
                }`}
              >
                Money Lent (I gave money)
              </button>
              <button
                type="button"
                onClick={() => setType("borrowed")}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                  type === "borrowed"
                    ? "bg-amber-50 text-amber-700 border-amber-500"
                    : "bg-slate-50 text-slate-600 border-[#E2E8F0] hover:bg-slate-100"
                }`}
              >
                Money Borrowed (I owe)
              </button>
            </div>
          </div>

          {/* Person / Entity Name */}
          <div className="space-y-1.5">
            <Label htmlFor="person-name" className="text-xs font-semibold text-[#0F172A]">
              Person or Institution Name *
            </Label>
            <Input
              id="person-name"
              placeholder="e.g. Rahul Sharma, HDFC Personal Loan, Cousin Anand"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              required
              className="h-9 text-sm border-[#E2E8F0] focus-visible:ring-1 focus-visible:ring-[#0F766E]"
            />
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="loan-amount" className="text-xs font-semibold text-[#0F172A]">
              Amount (₹) *
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#64748B] font-medium">
                ₹
              </span>
              <Input
                id="loan-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="10000"
                value={amountRupees}
                onChange={(e) => setAmountRupees(e.target.value)}
                required
                className="h-9 pl-7 text-sm font-semibold border-[#E2E8F0] focus-visible:ring-1 focus-visible:ring-[#0F766E]"
              />
            </div>
          </div>

          {/* Expected Due Date */}
          <div className="space-y-1.5">
            <Label htmlFor="due-date" className="text-xs font-semibold text-[#0F172A]">
              Expected Due / Return Date (Optional)
            </Label>
            <Input
              id="due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="h-9 text-sm border-[#E2E8F0] focus-visible:ring-1 focus-visible:ring-[#0F766E]"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="loan-notes" className="text-xs font-semibold text-[#0F172A]">
              Notes / Purpose (Optional)
            </Label>
            <Input
              id="loan-notes"
              placeholder="e.g. For festival shopping, 6 months tenure"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-9 text-sm border-[#E2E8F0] focus-visible:ring-1 focus-visible:ring-[#0F766E]"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="h-9 text-xs border-[#E2E8F0]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="h-9 text-xs bg-[#0F766E] hover:bg-[#0d655e] text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : (
                "Save Record"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
