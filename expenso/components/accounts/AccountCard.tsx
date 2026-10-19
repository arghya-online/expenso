"use client";

import { useState } from "react";
import { formatINR } from "@/lib/utils/currency";
import { toggleArchiveAccount, deleteAccount, setPrimaryAccount } from "@/lib/actions/accounts";
import { AdjustBalanceDialog } from "./AdjustBalanceDialog";
import { EditAccountDialog } from "./EditAccountDialog";
import {
  MoreVertical,
  SlidersHorizontal,
  Edit2,
  Archive,
  ArchiveRestore,
  ShieldCheck,
  Trash2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AccountCardProps {
  account: {
    _id: string;
    name: string;
    accountType: "savings" | "current" | "cash" | "wallet" | "credit" | "other";
    accountColor: string;
    nickname?: string;
    maskedIdentifier?: string;
    openingBalanceInPaise: number;
    currentBalanceInPaise: number;
    isPrimary?: boolean;
    status: "active" | "archived";
    notes?: string;
  };
}

export function AccountCard({ account }: AccountCardProps) {
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggleArchive = async () => {
    setLoading(true);
    try {
      await toggleArchiveAccount(account._id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrimary = async () => {
    setLoading(true);
    try {
      await setPrimaryAccount(account._id);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to set as primary account");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      confirm(
        `Are you sure you want to permanently delete "${account.name}"? All associated transactions and balance history will also be cleared.`
      )
    ) {
      setLoading(true);
      try {
        await deleteAccount(account._id);
      } catch (err) {
        console.error(err);
        alert(err instanceof Error ? err.message : "Failed to delete account");
      } finally {
        setLoading(false);
      }
    }
  };

  const isArchived = account.status === "archived";

  return (
    <>
      <div
        className={`relative bg-white rounded-xl border ${
          account.isPrimary ? "border-teal-500/60 shadow-xs" : "border-[#E2E8F0]"
        } p-5 shadow-2xs transition-all hover:shadow-xs flex flex-col justify-between ${
          isArchived ? "opacity-60 bg-slate-50/50" : ""
        }`}
      >
        {/* Top Header */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="size-3.5 rounded-full shrink-0 shadow-xs"
                style={{ backgroundColor: account.accountColor }}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-semibold text-sm text-[#0F172A] truncate">
                    {account.name}
                  </h3>
                  {account.isPrimary && (
                    <Badge className="bg-teal-50 text-[#0F766E] border-teal-200 text-[10px] font-semibold px-1.5 py-0">
                      ★ Primary
                    </Badge>
                  )}
                </div>
                {account.nickname && (
                  <span className="text-[11px] text-[#64748B] block truncate">
                    {account.nickname}
                  </span>
                )}
              </div>
            </div>

            {/* Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon-xs" className="text-[#64748B]">
                    <MoreVertical className="size-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-48 bg-white border-[#E2E8F0]">
                {!account.isPrimary && !isArchived && (
                  <>
                    <DropdownMenuItem
                      onClick={handleSetPrimary}
                      disabled={loading}
                      className="text-xs cursor-pointer gap-2 text-teal-700 font-medium"
                    >
                      <Star className="size-3.5 text-teal-600 fill-teal-100" />
                      <span>Set as Primary Account</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#E2E8F0]" />
                  </>
                )}
                <DropdownMenuItem
                  onClick={() => setEditOpen(true)}
                  className="text-xs cursor-pointer gap-2"
                >
                  <Edit2 className="size-3.5" />
                  <span>Edit & Change Money</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#E2E8F0]" />
                <DropdownMenuItem
                  onClick={handleToggleArchive}
                  disabled={loading}
                  className="text-xs cursor-pointer gap-2 text-[#64748B]"
                >
                  {isArchived ? (
                    <>
                      <ArchiveRestore className="size-3.5" />
                      <span>Restore Account</span>
                    </>
                  ) : (
                    <>
                      <Archive className="size-3.5" />
                      <span>Archive Account</span>
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#E2E8F0]" />
                <DropdownMenuItem
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="text-xs cursor-pointer gap-2 text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                >
                  <Trash2 className="size-3.5" />
                  <span>Delete Account</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Account Meta Badges */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Badge
              variant="outline"
              className="text-[10px] font-medium capitalize border-[#E2E8F0] text-[#0F172A] bg-[#F8FAFC]"
            >
              {account.accountType}
            </Badge>

            {account.maskedIdentifier && (
              <span className="text-[11px] font-mono text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-md">
                {account.maskedIdentifier}
              </span>
            )}

            {isArchived && (
              <Badge variant="destructive" className="text-[10px] py-0 px-1.5">
                Archived
              </Badge>
            )}
          </div>
        </div>

        {/* Balance Display & Action */}
        <div className="mt-5 pt-4 border-t border-[#E2E8F0]">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <span className="text-[11px] font-medium text-[#64748B] block uppercase tracking-wider">
                Current Balance
              </span>
              <div className="text-xl font-bold tracking-tight text-[#0F172A] mt-0.5">
                {formatINR(account.currentBalanceInPaise)}
              </div>
            </div>

            <Button
              size="xs"
              variant="outline"
              onClick={() => setAdjustOpen(true)}
              className="border-[#0F766E]/30 text-[#0F766E] hover:bg-[#CCFBF1]/40 gap-1.5 h-7.5 px-2.5"
            >
              <SlidersHorizontal className="size-3" />
              <span>Adjust</span>
            </Button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-2.5">
            <span>Opening: {formatINR(account.openingBalanceInPaise)}</span>
            <span className="flex items-center gap-1 text-[10px] text-[#64748B]">
              <ShieldCheck className="size-3 text-[#0F766E]" />
              Manual
            </span>
          </div>
        </div>
      </div>

      <AdjustBalanceDialog
        open={adjustOpen}
        onOpenChange={setAdjustOpen}
        account={{
          _id: account._id,
          name: account.name,
          accountColor: account.accountColor,
          currentBalanceInPaise: account.currentBalanceInPaise,
        }}
      />

      <EditAccountDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        account={{
          _id: account._id,
          name: account.name,
          accountType: account.accountType,
          accountColor: account.accountColor,
          nickname: account.nickname,
          maskedIdentifier: account.maskedIdentifier,
          currentBalanceInPaise: account.currentBalanceInPaise,
          notes: account.notes,
        }}
      />
    </>
  );
}
