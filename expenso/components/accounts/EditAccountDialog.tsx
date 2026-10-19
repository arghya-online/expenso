"use client";

import { useState } from "react";
import { updateAccount } from "@/lib/actions/accounts";
import { ACCOUNT_COLORS, ACCOUNT_TYPES } from "@/lib/constants/accounts";
import { Check, Loader2 } from "lucide-react";
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

interface EditAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: {
    _id: string;
    name: string;
    accountType: "savings" | "current" | "cash" | "wallet" | "credit" | "other";
    accountColor: string;
    nickname?: string;
    maskedIdentifier?: string;
    notes?: string;
  };
}

export function EditAccountDialog({
  open,
  onOpenChange,
  account,
}: EditAccountDialogProps) {
  const [name, setName] = useState(account.name);
  const [accountType, setAccountType] = useState(account.accountType);
  const [accountColor, setAccountColor] = useState(account.accountColor);
  const [nickname, setNickname] = useState(account.nickname || "");
  const [maskedIdentifier, setMaskedIdentifier] = useState(account.maskedIdentifier || "");
  const [notes, setNotes] = useState(account.notes || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await updateAccount({
        accountId: account._id,
        name,
        accountType,
        accountColor,
        nickname: nickname.trim() || undefined,
        maskedIdentifier: maskedIdentifier.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (res.success) {
        onOpenChange(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update account";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white border-[#E2E8F0]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#0F172A]">
            Edit Account Details
          </DialogTitle>
          <DialogDescription className="text-xs text-[#64748B]">
            Update your account tags, nickname, and information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="edit-name" className="text-xs font-semibold text-[#0F172A]">
              Account Name *
            </Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="h-9 text-sm border-[#E2E8F0]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-type" className="text-xs font-semibold text-[#0F172A]">
              Account Type
            </Label>
            <select
              id="edit-type"
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

          {/* Color Picker */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[#0F172A]">
              Tag Color
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-nickname" className="text-xs font-semibold text-[#0F172A]">
                Nickname
              </Label>
              <Input
                id="edit-nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                disabled={loading}
                className="h-9 text-sm border-[#E2E8F0]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-mask" className="text-xs font-semibold text-[#0F172A]">
                Identifier / Last 4
              </Label>
              <Input
                id="edit-mask"
                value={maskedIdentifier}
                onChange={(e) => setMaskedIdentifier(e.target.value)}
                disabled={loading}
                className="h-9 text-sm border-[#E2E8F0]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-notes" className="text-xs font-semibold text-[#0F172A]">
              Notes
            </Label>
            <Input
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
              placeholder="Optional notes or details"
              className="h-9 text-sm border-[#E2E8F0]"
            />
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
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
