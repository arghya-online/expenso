import { getServerSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { BankAccount } from "@/lib/models/BankAccount";
import { formatINR } from "@/lib/utils/currency";
import { AccountCard } from "@/components/accounts/AccountCard";
import { CreateAccountDialog } from "@/components/accounts/CreateAccountDialog";
import { Landmark, Wallet, ShieldCheck, Banknote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const instant = false;

export default async function AccountsPage() {
  const session = await getServerSession();
  const userId = session?.user?.id;

  await connectToDatabase();

  const accounts = userId
    ? await BankAccount.find({ userId }).sort({ createdAt: -1 }).lean()
    : [];

  const activeAccounts = accounts.filter((a) => a.status === "active");
  const archivedAccounts = accounts.filter((a) => a.status === "archived");

  const totalBalanceInPaise = activeAccounts.reduce(
    (sum, a) => sum + (a.currentBalanceInPaise || 0),
    0
  );

  const cashBalanceInPaise = activeAccounts
    .filter((a) => a.accountType === "cash" || a.accountType === "wallet")
    .reduce((sum, a) => sum + (a.currentBalanceInPaise || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
            Bank Accounts & Balances
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Track balances across your savings, current, cash, and wallet accounts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CreateAccountDialog />
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#E2E8F0] shadow-2xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Total Tracked Balance
            </CardTitle>
            <div className="p-2 rounded-lg bg-[#CCFBF1] text-[#0F766E]">
              <Wallet className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F172A] tracking-tight">
              {formatINR(totalBalanceInPaise)}
            </div>
            <p className="text-xs text-[#64748B] mt-1">Across all active accounts</p>
          </CardContent>
        </Card>

        <Card className="border-[#E2E8F0] shadow-2xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Active Accounts
            </CardTitle>
            <div className="p-2 rounded-lg bg-teal-50 text-[#0F766E]">
              <Landmark className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F172A] tracking-tight">
              {activeAccounts.length}
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              {archivedAccounts.length} archived
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#E2E8F0] shadow-2xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Cash & Liquid Funds
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-50 text-[#16A34A]">
              <Banknote className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#16A34A] tracking-tight">
              {formatINR(cashBalanceInPaise)}
            </div>
            <p className="text-xs text-[#64748B] mt-1">Physical cash & digital wallets</p>
          </CardContent>
        </Card>
      </div>

      {/* Account Funds Distribution Bar */}
      {activeAccounts.length > 0 && totalBalanceInPaise > 0 && (
        <Card className="border-[#E2E8F0] shadow-2xs bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[#0F172A]">
              Funds Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Multi-colored proportion bar */}
            <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-100">
              {activeAccounts.map((a) => {
                const pct = Math.max(
                  0,
                  Math.round(((a.currentBalanceInPaise || 0) / totalBalanceInPaise) * 100)
                );
                if (pct <= 0) return null;
                return (
                  <div
                    key={a._id.toString()}
                    style={{
                      width: `${pct}%`,
                      backgroundColor: a.accountColor,
                    }}
                    title={`${a.name}: ${pct}% (${formatINR(a.currentBalanceInPaise)})`}
                    className="h-full transition-all"
                  />
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
              {activeAccounts.map((a) => {
                const pct = Math.max(
                  0,
                  Math.round(((a.currentBalanceInPaise || 0) / totalBalanceInPaise) * 100)
                );
                return (
                  <div key={a._id.toString()} className="flex items-center gap-1.5">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: a.accountColor }}
                    />
                    <span className="text-[#64748B]">{a.name}:</span>
                    <span className="font-semibold text-[#0F172A]">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Accounts Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-[#0F172A]">
            Active Accounts ({activeAccounts.length})
          </h3>
        </div>

        {activeAccounts.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-dashed border-[#E2E8F0] bg-white">
            <div className="size-12 rounded-xl bg-[#CCFBF1] text-[#0F766E] flex items-center justify-center mx-auto mb-3">
              <Landmark className="size-6" />
            </div>
            <h4 className="text-base font-semibold text-[#0F172A]">No bank accounts yet</h4>
            <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
              Add your savings account, current account, or cash wallet to begin tracking your financial positions.
            </p>
            <div className="mt-4">
              <CreateAccountDialog />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeAccounts.map((account) => (
              <AccountCard
                key={account._id.toString()}
                account={{
                  _id: account._id.toString(),
                  name: account.name,
                  accountType: account.accountType,
                  accountColor: account.accountColor,
                  nickname: account.nickname,
                  maskedIdentifier: account.maskedIdentifier,
                  openingBalanceInPaise: account.openingBalanceInPaise,
                  currentBalanceInPaise: account.currentBalanceInPaise,
                  isPrimary: !!account.isPrimary,
                  status: account.status,
                  notes: account.notes,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Archived Accounts Section (if any) */}
      {archivedAccounts.length > 0 && (
        <div className="pt-6 border-t border-[#E2E8F0]">
          <h3 className="text-sm font-semibold text-[#64748B] uppercase tracking-wider mb-3">
            Archived Accounts ({archivedAccounts.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {archivedAccounts.map((account) => (
              <AccountCard
                key={account._id.toString()}
                account={{
                  _id: account._id.toString(),
                  name: account.name,
                  accountType: account.accountType,
                  accountColor: account.accountColor,
                  nickname: account.nickname,
                  maskedIdentifier: account.maskedIdentifier,
                  openingBalanceInPaise: account.openingBalanceInPaise,
                  currentBalanceInPaise: account.currentBalanceInPaise,
                  status: account.status,
                  notes: account.notes,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Manual Tracking Notice */}
      <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200/60 flex items-start gap-3">
        <ShieldCheck className="size-5 shrink-0 text-[#0F766E] mt-0.5" />
        <div className="text-xs space-y-0.5 text-teal-950">
          <span className="font-semibold block">Self-Managed Account Balances</span>
          <p className="text-teal-900/80 leading-relaxed">
            Expenso does not connect to bank APIs or require login credentials. You are in total control of your data: update opening balances, record balance changes with audit trails, and maintain accurate records without sharing banking access.
          </p>
        </div>
      </div>
    </div>
  );
}
