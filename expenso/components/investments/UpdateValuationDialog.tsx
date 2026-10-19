"use client";

import { useState } from "react";
import { updateInvestmentValuation } from "@/lib/actions/investments";
import { formatINR, toRupees } from "@/lib/utils/currency";
import { Loader2, RefreshCw } from "lucide-react";
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

interface UpdateValuationDialogProps {
  investmentId: string;
  name: string;
  currentValueInPaise: number;
}

export function UpdateValuationDialog({
  investmentId,
  name,
  currentValueInPaise,
}: UpdateValuationDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [valueRupees, setValueRupees] = useState<string>(
    toRupees(currentValueInPaise).toString()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = parseFloat(valueRupees);
    if (isNaN(parsed) || parsed < 0) {
      setError("Please provide a valid non-negative valuation");
      return;
    }

    setLoading(true);

    try {
      const res = await updateInvestmentValuation({
        investmentId,
        currentValueRupees: parsed,
      });

      if (res.success) {
        setOpen(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update valuation";
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
            <RefreshCw className="size-3" />
            <span>Update Value</span>
          </Button>
        }
      />

      <DialogContent className="sm:max-w-md bg-white border-[#E2E8F0]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#0F172A]">
            Update Asset Valuation
          </DialogTitle>
          <DialogDescription className="text-xs text-[#64748B]">
            Record latest market valuation for &quot;{name}&quot;.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <div className="p-3 rounded-lg bg-slate-50 border border-[#E2E8F0] flex items-center justify-between">
            <span className="text-xs text-[#64748B] font-medium">Previous Valuation:</span>
            <span className="text-sm font-bold text-[#0F172A]">
              {formatINR(currentValueInPaise)}
            </span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new-valuation" className="text-xs font-semibold text-[#0F172A]">
              Current Market Value (₹) *
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#64748B] font-medium">
                ₹
              </span>
              <Input
                id="new-valuation"
                type="number"
                step="0.01"
                min="0"
                value={valueRupees}
                onChange={(e) => setValueRupees(e.target.value)}
                required
                className="h-9 pl-7 text-sm font-semibold border-[#E2E8F0] focus-visible:ring-1 focus-visible:ring-[#0F766E]"
              />
            </div>
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
                  Updating...
                </>
              ) : (
                "Update Valuation"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
