"use client";

import { useState } from "react";
import { createAccount } from "@/lib/actions/accounts";
import { ACCOUNT_COLORS, ACCOUNT_TYPES } from "@/lib/constants/accounts";
import { Plus, Loader2, Check } from "lucide-react";
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

export function CreateAccountDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState<"savings" | "current" | "cash" | "wallet" | "credit" | "other">("savings");
  const [accountColor, setAccountColor] = useState<string>(ACCOUNT_COLORS[0].hex);
  const [openingBalance, setOpeningBalance] = useState<string>("0");
  const [nickname, setNickname] = useState("");
  const [maskedIdentifier, setMaskedIdentifier] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedBalance = parseFloat(openingBalance);
    if (isNaN(parsedBalance) || parsedBalance < 0) {
      setError("Please provide a valid non-negative opening balance");
      return;
    }

    setLoading(true);

    try {
      const res = await createAccount({
        name,
        accountType,
        accountColor,
        openingBalanceRupees: parsedBalance,
        nickname: nickname.trim() || undefined,
        maskedIdentifier: maskedIdentifier.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (res.success) {
        setOpen(false);
        // Reset form
        setName("");
        setOpeningBalance("0");
        setNickname("");
        setMaskedIdentifier("");
        setNotes("");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create account";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" className="bg-[#0F766E] hover:bg-[#0d655e] text-white gap-1.5 h-9">
            <Plus className="size-4" />
            <span>Add Account</span>
          </Button>
        }
      />

      <DialogContent className="sm:max-w-md bg-white border-[#E2E8F0]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#0F172A]">
            Add Bank or Cash Account
          </DialogTitle>
          <DialogDescription className="text-xs text-[#64748B]">
            Set up an account to manually track and reconcile your balances.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Account Name */}
          <div className="space-y-1.5">
            <Label htmlFor="account-name" className="text-xs font-semibold text-[#0F172A]">
              Account / Bank Name *
            </Label>
            <Input
              id="account-name"
              placeholder="e.g. HDFC Salary Account, Physical Cash"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="h-9 text-sm border-[#E2E8F0]"
            />
          </div>

          {/* Account Type & Initial Balance */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="account-type" className="text-xs font-semibold text-[#0F172A]">
                Account Type
              </Label>
              <select
                id="account-type"
                value={accountType}
                onChange={(e) => setAccountType(e.target.value as typeof accountType)}
                disabled={loading}
                className="w-full h-9 rounded-md border border-[#E2E8F0] bg-white px-2.5 text-xs text-[#0F172A] focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
              >
                {ACCOUNT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="opening-balance" className="text-xs font-semibold text-[#0F172A]">
                Opening Balance (₹)
              </Label>
              <Input
                id="opening-balance"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                required
                disabled={loading}
                className="h-9 text-sm border-[#E2E8F0]"
              />
            </div>
          </div>

          {/* Color Picker */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[#0F172A]">
              Account Tag Color
            </Label>
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {ACCOUNT_COLORS.map((c) => {
                const isSelected = accountColor === c.hex;
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setAccountColor(c.hex)}
                    title={c.name}
                    className={`size-7 rounded-full flex items-center justify-center transition-all ${
                      isSelected ? "ring-2 ring-offset-2 ring-[#0F766E] scale-110" : "hover:opacity-85"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {isSelected && <Check className="size-3.5 text-white stroke-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nickname & Masked Identifier */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="account-nickname" className="text-xs font-semibold text-[#0F172A]">
                Nickname (Optional)
              </Label>
              <Input
                id="account-nickname"
                placeholder="e.g. Primary, Emergency"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                disabled={loading}
                className="h-9 text-sm border-[#E2E8F0]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="account-mask" className="text-xs font-semibold text-[#0F172A]">
                Identifier / Last 4
              </Label>
              <Input
                id="account-mask"
                placeholder="e.g. ••4921"
                value={maskedIdentifier}
                onChange={(e) => setMaskedIdentifier(e.target.value)}
                disabled={loading}
                className="h-9 text-sm border-[#E2E8F0]"
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
                  Creating...
                </>
              ) : (
                "Save Account"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
