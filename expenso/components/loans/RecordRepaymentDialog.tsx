"use client";

import { useState } from "react";
import { recordLoanRepayment } from "@/lib/actions/loans";
import { formatINR, toRupees } from "@/lib/utils/currency";
import { Loader2, Coins } from "lucide-react";
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
  id: string;
  name: string;
  balanceInPaise: number;
}

interface RecordRepaymentDialogProps {
  loanId: string;
  personName: string;
  type: "lent" | "borrowed";
  remainingAmountInPaise: number;
  accounts: AccountOption[];
}

export function RecordRepaymentDialog({
  loanId,
  personName,
  type,
  remainingAmountInPaise,
  accounts,
}: RecordRepaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [amountRupees, setAmountRupees] = useState<string>(
    toRupees(remainingAmountInPaise).toString()
  );
  const [accountId, setAccountId] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const maxRupees = toRupees(remainingAmountInPaise);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = parseFloat(amountRupees);
    if (isNaN(parsed) || parsed <= 0) {
      setError("Please provide a valid repayment amount");
      return;
    }

    if (parsed > maxRupees) {
      setError(`Repayment cannot exceed the remaining balance of ${formatINR(remainingAmountInPaise)}`);
      return;
    }

    setLoading(true);

    try {
      const res = await recordLoanRepayment({
        loanId,
        amountRupees: parsed,
        accountId: accountId || undefined,
        note: note.trim() || undefined,
      });

      if (res.success) {
        setOpen(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to record repayment";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs font-medium gap-1 text-[#0F766E] border-[#CCFBF1] hover:bg-[#CCFBF1]/30 hover:border-[#0F766E]"
          >
            <Coins className="size-3.5" />
            <span>Record Payment</span>
          </Button>
        }
      />

      <DialogContent className="sm:max-w-md bg-white border-[#E2E8F0]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#0F172A]">
            Record Repayment
          </DialogTitle>
          <DialogDescription className="text-xs text-[#64748B]">
            {type === "lent"
              ? `Record money received from ${personName}.`
              : `Record payment made to ${personName}.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <div className="p-3 rounded-lg bg-slate-50 border border-[#E2E8F0] flex items-center justify-between">
            <span className="text-xs text-[#64748B] font-medium">Remaining Balance:</span>
            <span className="text-sm font-bold text-[#0F172A]">
              {formatINR(remainingAmountInPaise)}
            </span>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="repay-amount" className="text-xs font-semibold text-[#0F172A]">
                Repayment Amount (₹) *
              </Label>
              <button
                type="button"
                onClick={() => setAmountRupees(maxRupees.toString())}
                className="text-[11px] font-medium text-[#0F766E] hover:underline"
              >
                Pay Full Amount
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#64748B] font-medium">
                ₹
              </span>
              <Input
                id="repay-amount"
                type="number"
                step="0.01"
                min="0.01"
                max={maxRupees}
                value={amountRupees}
                onChange={(e) => setAmountRupees(e.target.value)}
                required
                className="h-9 pl-7 text-sm font-semibold border-[#E2E8F0] focus-visible:ring-1 focus-visible:ring-[#0F766E]"
              />
            </div>
          </div>

          {/* Optional Bank Account Link */}
          <div className="space-y-1.5">
            <Label htmlFor="repay-account" className="text-xs font-semibold text-[#0F172A]">
              {type === "lent"
                ? "Deposit Into Account (Optional)"
                : "Deduct From Account (Optional)"}
            </Label>
            <select
              id="repay-account"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-[#E2E8F0] bg-white text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
            >
              <option value="">Do not adjust any bank account balance</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({formatINR(acc.balanceInPaise)})
                </option>
              ))}
            </select>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label htmlFor="repay-note" className="text-xs font-semibold text-[#0F172A]">
              Payment Note (Optional)
            </Label>
            <Input
              id="repay-note"
              placeholder="e.g. Paid via Google Pay / UPI"
              value={note}
              onChange={(e) => setNote(e.target.value)}
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
                  Recording...
                </>
              ) : (
                "Confirm Payment"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
