"use client";

import { useState } from "react";
import { adjustBalance } from "@/lib/actions/accounts";
import { formatINR } from "@/lib/utils/currency";
import { ArrowDownLeft, ArrowUpRight, Scale, Loader2 } from "lucide-react";
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
} from "@/components/ui/dialog";

interface AdjustBalanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: {
    _id: string;
    name: string;
    accountColor: string;
    currentBalanceInPaise: number;
  };
}

export function AdjustBalanceDialog({
  open,
  onOpenChange,
  account,
}: AdjustBalanceDialogProps) {
  const [actionType, setActionType] = useState<"deposit" | "withdrawal" | "reconcile">("deposit");
  const [amountRupees, setAmountRupees] = useState("");
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amountRupees);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      setError("Please provide a valid non-negative amount");
      return;
    }

    if (!purpose.trim()) {
      setError("Please specify the purpose or reason for this balance change");
      return;
    }

    setLoading(true);

    try {
      const res = await adjustBalance({
        accountId: account._id,
        actionType,
        amountRupees: parsedAmount,
        purpose: purpose.trim(),
      });

      if (res.success) {
        onOpenChange(false);
        setAmountRupees("");
        setPurpose("");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to adjust balance";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Compute preview balance
  const parsedAmt = parseFloat(amountRupees) || 0;
  const currentRs = account.currentBalanceInPaise / 100;
  let previewRs = currentRs;
  if (actionType === "deposit") previewRs = currentRs + parsedAmt;
  else if (actionType === "withdrawal") previewRs = currentRs - parsedAmt;
  else if (actionType === "reconcile") previewRs = parsedAmt;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white border-[#E2E8F0]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="size-3 rounded-full"
              style={{ backgroundColor: account.accountColor }}
            />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              {account.name}
            </span>
          </div>
          <DialogTitle className="text-lg font-bold text-[#0F172A]">
            Adjust Account Balance
          </DialogTitle>
          <DialogDescription className="text-xs text-[#64748B]">
            Current tracked balance:{" "}
            <span className="font-semibold text-[#0F172A]">
              {formatINR(account.currentBalanceInPaise)}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Action Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F1F5F9] rounded-lg">
            <button
              type="button"
              onClick={() => setActionType("deposit")}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                actionType === "deposit"
                  ? "bg-white text-[#16A34A] shadow-xs"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <ArrowDownLeft className="size-3.5" />
              <span>Add Money</span>
            </button>

            <button
              type="button"
              onClick={() => setActionType("withdrawal")}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                actionType === "withdrawal"
                  ? "bg-white text-[#E11D48] shadow-xs"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <ArrowUpRight className="size-3.5" />
              <span>Withdraw</span>
            </button>

            <button
              type="button"
              onClick={() => setActionType("reconcile")}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                actionType === "reconcile"
                  ? "bg-white text-[#0F766E] shadow-xs"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <Scale className="size-3.5" />
              <span>Reconcile</span>
            </button>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <Label htmlFor="adj-amount" className="text-xs font-semibold text-[#0F172A]">
              {actionType === "reconcile" ? "New Actual Balance (₹) *" : "Adjustment Amount (₹) *"}
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm text-[#64748B] font-medium">₹</span>
              <Input
                id="adj-amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amountRupees}
                onChange={(e) => setAmountRupees(e.target.value)}
                required
                disabled={loading}
                className="pl-7 h-9 text-sm border-[#E2E8F0]"
              />
            </div>
          </div>

          {/* Purpose / Reason */}
          <div className="space-y-1.5">
            <Label htmlFor="adj-purpose" className="text-xs font-semibold text-[#0F172A]">
              Purpose / Reason *
            </Label>
            <Input
              id="adj-purpose"
              placeholder="e.g. ATM withdrawal, Bank statement check, Gift money"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
              disabled={loading}
              className="h-9 text-sm border-[#E2E8F0]"
            />
          </div>

          {/* Result Preview Callout */}
          <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
            <span className="text-[#64748B]">New Estimated Balance:</span>
            <span className="font-bold text-[#0F172A] text-sm">
              {formatINR(Math.round(previewRs * 100))}
            </span>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
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
                  Updating...
                </>
              ) : (
                "Confirm Adjustment"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
