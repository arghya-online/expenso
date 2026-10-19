"use client";

import { useState } from "react";
import { createInvestment } from "@/lib/actions/investments";
import { ASSET_TYPES } from "@/lib/constants/investments";
import { AssetType } from "@/lib/models/Investment";
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

export function CreateInvestmentDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [assetType, setAssetType] = useState<AssetType>("mutual_funds");
  const [institution, setInstitution] = useState("");
  const [investedAmount, setInvestedAmount] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedInvested = parseFloat(investedAmount);
    if (isNaN(parsedInvested) || parsedInvested < 0) {
      setError("Please provide a valid non-negative invested amount in ₹");
      return;
    }

    const parsedCurrent = currentValue.trim()
      ? parseFloat(currentValue)
      : parsedInvested;

    if (isNaN(parsedCurrent) || parsedCurrent < 0) {
      setError("Please provide a valid non-negative current valuation in ₹");
      return;
    }

    setLoading(true);

    try {
      const res = await createInvestment({
        name,
        assetType,
        institution: institution.trim() || undefined,
        investedAmountRupees: parsedInvested,
        currentValueRupees: parsedCurrent,
        notes: notes.trim() || undefined,
      });

      if (res.success) {
        setOpen(false);
        setName("");
        setInstitution("");
        setInvestedAmount("");
        setCurrentValue("");
        setNotes("");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to record investment";
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
            <span>Add Asset</span>
          </Button>
        }
      />

      <DialogContent className="sm:max-w-md bg-white border-[#E2E8F0]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#0F172A]">
            Add Investment Asset
          </DialogTitle>
          <DialogDescription className="text-xs text-[#64748B]">
            Record stocks, mutual funds, gold, fixed deposits, and other assets.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Asset Name */}
          <div className="space-y-1.5">
            <Label htmlFor="asset-name" className="text-xs font-semibold text-[#0F172A]">
              Asset / Instrument Name *
            </Label>
            <Input
              id="asset-name"
              placeholder="e.g. Parag Parikh Flexi Cap, Reliance Industries, SBI 1-Yr FD"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-9 text-sm border-[#E2E8F0] focus-visible:ring-1 focus-visible:ring-[#0F766E]"
            />
          </div>

          {/* Asset Type */}
          <div className="space-y-1.5">
            <Label htmlFor="asset-type" className="text-xs font-semibold text-[#0F172A]">
              Asset Category *
            </Label>
            <select
              id="asset-type"
              value={assetType}
              onChange={(e) => setAssetType(e.target.value as AssetType)}
              className="w-full h-9 px-3 rounded-md border border-[#E2E8F0] bg-white text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
            >
              {Object.entries(ASSET_TYPES).map(([typeKey, cfg]) => (
                <option key={typeKey} value={typeKey}>
                  {cfg.label}
                </option>
              ))}
            </select>
          </div>

          {/* Platform / Broker / Bank */}
          <div className="space-y-1.5">
            <Label htmlFor="asset-institution" className="text-xs font-semibold text-[#0F172A]">
              Broker / Platform / Bank (Optional)
            </Label>
            <Input
              id="asset-institution"
              placeholder="e.g. Zerodha, Groww, HDFC Bank, Physical Locker"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="h-9 text-sm border-[#E2E8F0] focus-visible:ring-1 focus-visible:ring-[#0F766E]"
            />
          </div>

          {/* Invested Amount & Current Valuation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="invested-amount" className="text-xs font-semibold text-[#0F172A]">
                Invested Amount (₹) *
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#64748B] font-medium">
                  ₹
                </span>
                <Input
                  id="invested-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="50000"
                  value={investedAmount}
                  onChange={(e) => setInvestedAmount(e.target.value)}
                  required
                  className="h-9 pl-7 text-sm font-semibold border-[#E2E8F0] focus-visible:ring-1 focus-visible:ring-[#0F766E]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="current-value" className="text-xs font-semibold text-[#0F172A]">
                Current Value (₹)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#64748B] font-medium">
                  ₹
                </span>
                <Input
                  id="current-value"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Defaults to invested"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  className="h-9 pl-7 text-sm font-semibold border-[#E2E8F0] focus-visible:ring-1 focus-visible:ring-[#0F766E]"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="asset-notes" className="text-xs font-semibold text-[#0F172A]">
              Notes / Folio / Strategy (Optional)
            </Label>
            <Input
              id="asset-notes"
              placeholder="e.g. SIP ₹5,000 monthly, Goal: Retirement"
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
                "Save Asset"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
