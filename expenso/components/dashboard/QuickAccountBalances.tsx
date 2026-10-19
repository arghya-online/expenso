"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/utils/currency";
import { setPrimaryAccount } from "@/lib/actions/accounts";
import {
  Wallet,
  Eye,
  EyeOff,
  Landmark,
  ShieldCheck,
  Star,
  ArrowRight,
  PlusCircle,
  CreditCard,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface AccountItem {
  _id: string;
  name: string;
  accountType: string;
  accountColor: string;
  maskedIdentifier?: string;
  currentBalanceInPaise: number;
  isPrimary?: boolean;
}

interface QuickAccountBalancesProps {
  accounts: AccountItem[];
  totalBalanceInPaise: number;
}

export function QuickAccountBalances({
  accounts,
  totalBalanceInPaise,
}: QuickAccountBalancesProps) {
  const [showAllBalances, setShowAllBalances] = useState(true);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();

  // Load user privacy preference from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("expenso_show_balances");
      if (stored !== null) {
        setShowAllBalances(stored === "true");
      }
    } catch {
      // Local storage may be restricted in some environments
    }
  }, []);

  const toggleGlobalVisibility = () => {
    const nextState = !showAllBalances;
    setShowAllBalances(nextState);
    setRevealedIds({});
    try {
      localStorage.setItem("expenso_show_balances", String(nextState));
    } catch {
      // ignore
    }
  };

  const toggleSingleAccount = (id: string) => {
    setRevealedIds((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? !showAllBalances : !prev[id],
    }));
  };

  const isBalanceVisible = (id: string) => {
    if (revealedIds[id] !== undefined) {
      return revealedIds[id];
    }
    return showAllBalances;
  };

  const handleMakePrimary = (accountId: string) => {
    startTransition(async () => {
      try {
        await setPrimaryAccount(accountId);
      } catch (err) {
        console.error("Failed to update primary account:", err);
      }
    });
  };

  // Determine Primary & Secondary accounts
  // If an account is explicitly isPrimary, use it. Otherwise, highest balance is Primary.
  const primaryAccount =
    accounts.find((a) => a.isPrimary) || (accounts.length > 0 ? accounts[0] : null);

  const secondaryAccounts = accounts.filter(
    (a) => a._id !== primaryAccount?._id
  );
  const secondaryAccount = secondaryAccounts.length > 0 ? secondaryAccounts[0] : null;
  const otherAccounts = secondaryAccounts.slice(1);

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden transition-all">
      {/* Widget Header with Visibility Controls */}
      <div className="p-4 sm:p-5 border-b border-[#E2E8F0] bg-gradient-to-b from-[#F8FAFC] to-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0F766E] shadow-2xs">
            <Landmark className="size-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-[#0F172A] tracking-tight">
                Account Balances & Liquidity
              </h3>
              <Badge variant="outline" className="text-[10px] font-semibold text-teal-800 bg-teal-50 border-teal-200">
                Live Status
              </Badge>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Instant balance glance for your Primary and Secondary operational accounts.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Always show user option to show / hide balance */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleGlobalVisibility}
            className="h-8 text-xs font-medium gap-1.5 border-[#E2E8F0] hover:bg-slate-50 text-[#334155] shadow-2xs"
            title={showAllBalances ? "Hide balances for privacy" : "Reveal balances"}
          >
            {showAllBalances ? (
              <>
                <EyeOff className="size-3.5 text-[#64748B]" />
                <span>Hide Balance</span>
              </>
            ) : (
              <>
                <Eye className="size-3.5 text-[#0F766E]" />
                <span className="text-[#0F766E] font-semibold">Show Balance</span>
              </>
            )}
          </Button>

          <Link href="/accounts">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-[#0F766E] hover:text-[#0c5c56] hover:bg-teal-50 gap-1 px-2.5"
            >
              <span>Manage All</span>
              <ArrowRight className="size-3" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Account Cards Container */}
      <div className="p-4 sm:p-5">
        {accounts.length === 0 ? (
          <div className="py-8 text-center bg-slate-50/60 rounded-xl border border-dashed border-[#E2E8F0]">
            <Wallet className="size-8 text-[#94A3B8] mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-[#0F172A]">No bank accounts linked</h4>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1 mb-3">
              Add your primary bank account or cash wallet to monitor real-time liquidity on your home screen.
            </p>
            <Link href="/accounts">
              <Button size="sm" className="bg-[#0F766E] hover:bg-[#0c5c56] text-white text-xs gap-1.5 h-8">
                <PlusCircle className="size-3.5" />
                <span>Add Primary Account</span>
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. PRIMARY ACCOUNT CARD */}
            {primaryAccount && (
              <div
                className="relative rounded-xl border-2 border-teal-500/40 bg-gradient-to-br from-teal-50/30 via-white to-white p-4 sm:p-5 shadow-2xs transition-all hover:shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="size-3.5 rounded-full shrink-0 shadow-xs ring-2 ring-white"
                        style={{ backgroundColor: primaryAccount.accountColor }}
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-[#0F172A] tracking-tight">
                            {primaryAccount.name}
                          </h4>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100/90 border border-teal-300 px-2 py-0.5 rounded-full shadow-2xs">
                            <Star className="size-2.5 fill-teal-700 text-teal-700" />
                            Primary
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-medium text-[#64748B] capitalize">
                            {primaryAccount.accountType}
                          </span>
                          {primaryAccount.maskedIdentifier && (
                            <span className="text-[11px] font-mono text-[#64748B] bg-slate-100 px-1.5 py-0.2 rounded">
                              {primaryAccount.maskedIdentifier}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Single Account Eye Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleSingleAccount(primaryAccount._id)}
                      className="text-[#94A3B8] hover:text-[#0F172A] p-1 rounded-md hover:bg-slate-100 transition-colors"
                      title={isBalanceVisible(primaryAccount._id) ? "Hide this balance" : "Show this balance"}
                    >
                      {isBalanceVisible(primaryAccount._id) ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4 text-teal-600" />
                      )}
                    </button>
                  </div>

                  {/* Primary Account Balance */}
                  <div className="mt-4 pt-3 border-t border-teal-100/60">
                    <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                      Primary Available Balance
                    </span>
                    <div className="mt-1 flex items-baseline justify-between gap-2">
                      <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                        {isBalanceVisible(primaryAccount._id) ? (
                          formatINR(primaryAccount.currentBalanceInPaise)
                        ) : (
                          <span className="tracking-widest font-mono text-slate-400 text-xl sm:text-2xl">
                            ₹ • • • • • •
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                  <span className="text-[#0F766E] font-medium flex items-center gap-1">
                    <CheckCircle2 className="size-3.5 text-teal-600" />
                    Default for new expenses
                  </span>
                  <Link
                    href="/accounts"
                    className="text-[#64748B] hover:text-[#0F172A] font-medium transition-colors"
                  >
                    View ledger
                  </Link>
                </div>
              </div>
            )}

            {/* 2. SECONDARY ACCOUNT CARD */}
            {secondaryAccount ? (
              <div
                className="relative rounded-xl border border-[#E2E8F0] bg-white p-4 sm:p-5 shadow-2xs transition-all hover:shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="size-3.5 rounded-full shrink-0 shadow-xs ring-2 ring-white"
                        style={{ backgroundColor: secondaryAccount.accountColor }}
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-[#0F172A] tracking-tight">
                            {secondaryAccount.name}
                          </h4>
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                            <CreditCard className="size-2.5 text-slate-500" />
                            Secondary
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-medium text-[#64748B] capitalize">
                            {secondaryAccount.accountType}
                          </span>
                          {secondaryAccount.maskedIdentifier && (
                            <span className="text-[11px] font-mono text-[#64748B] bg-slate-100 px-1.5 py-0.2 rounded">
                              {secondaryAccount.maskedIdentifier}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Single Account Eye Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleSingleAccount(secondaryAccount._id)}
                      className="text-[#94A3B8] hover:text-[#0F172A] p-1 rounded-md hover:bg-slate-100 transition-colors"
                      title={isBalanceVisible(secondaryAccount._id) ? "Hide this balance" : "Show this balance"}
                    >
                      {isBalanceVisible(secondaryAccount._id) ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4 text-teal-600" />
                      )}
                    </button>
                  </div>

                  {/* Secondary Account Balance */}
                  <div className="mt-4 pt-3 border-t border-[#F1F5F9]">
                    <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                      Secondary Available Balance
                    </span>
                    <div className="mt-1 flex items-baseline justify-between gap-2">
                      <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                        {isBalanceVisible(secondaryAccount._id) ? (
                          formatINR(secondaryAccount.currentBalanceInPaise)
                        ) : (
                          <span className="tracking-widest font-mono text-slate-400 text-xl sm:text-2xl">
                            ₹ • • • • • •
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleMakePrimary(secondaryAccount._id)}
                    className="text-xs text-[#0F766E] hover:underline font-medium disabled:opacity-50"
                  >
                    Switch to Primary
                  </button>
                  <Link
                    href="/accounts"
                    className="text-[#64748B] hover:text-[#0F172A] font-medium transition-colors"
                  >
                    View ledger
                  </Link>
                </div>
              </div>
            ) : (
              /* If user has only 1 account, invite them to add a secondary account */
              <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-slate-50/50 p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <CreditCard className="size-4 text-[#64748B]" />
                    <h4 className="font-semibold text-sm text-[#0F172A]">Secondary Reserve Account</h4>
                  </div>
                  <p className="text-xs text-[#64748B] mt-2">
                    Add a secondary bank account, wallet, or cash reserve to separate emergency savings from daily expense operations.
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-xs text-[#94A3B8]">Recommended for financial clarity</span>
                  <Link href="/accounts">
                    <Button size="sm" variant="outline" className="h-8 text-xs font-semibold gap-1.5 border-[#CBD5E1] text-[#0F172A]">
                      <PlusCircle className="size-3.5 text-[#0F766E]" />
                      <span>Add Secondary</span>
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. ADDITIONAL ACCOUNTS (3rd or more) - Compact pill list if available */}
        {otherAccounts.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[#F1F5F9]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                Other Active Accounts ({otherAccounts.length})
              </span>
              <Link href="/accounts" className="text-xs text-[#0F766E] hover:underline">
                View all in accounts page
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {otherAccounts.map((acc) => (
                <div
                  key={acc._id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-[#E2E8F0] bg-slate-50/40 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="size-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: acc.accountColor }}
                    />
                    <div className="min-w-0">
                      <span className="font-medium text-[#0F172A] block truncate">
                        {acc.name}
                      </span>
                      <span className="text-[10px] text-[#64748B] capitalize">
                        {acc.accountType} {acc.maskedIdentifier && `(${acc.maskedIdentifier})`}
                      </span>
                    </div>
                  </div>
                  <span className="font-semibold text-[#0F172A] shrink-0 ml-2">
                    {isBalanceVisible(acc._id) ? (
                      formatINR(acc.currentBalanceInPaise)
                    ) : (
                      "₹ •••••"
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. VERY BOTTOM: TOTAL COMBINED BALANCE ACROSS ALL ACCOUNTS */}
      {/* Alert strip so the user is always alert of their current total liquid accounts */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0F172A] to-[#1E293B] text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-800">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 shrink-0">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                Total Combined Balance (All Accounts)
              </span>
              <span className="bg-white/10 text-slate-200 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/10">
                {accounts.length} {accounts.length === 1 ? "Account" : "Accounts"} Active
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Cumulative liquid cash position ready for immediate debit, transfers, and daily expenses.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
          <div className="text-left sm:text-right">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {showAllBalances ? (
                formatINR(totalBalanceInPaise)
              ) : (
                <span className="tracking-widest font-mono text-slate-400 text-xl sm:text-2xl">
                  ₹ • • • • • •
                </span>
              )}
            </div>
            <span className="text-[10px] text-teal-400 font-medium">
              Verified across ledger
            </span>
          </div>

          <Link href="/accounts">
            <Button
              size="sm"
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 h-9 text-xs font-semibold px-3 shadow-xs"
            >
              <span>Manage</span>
              <ArrowRight className="size-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
