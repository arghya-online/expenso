export const instant = false;

import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { AuditLog, IAuditLog } from "@/lib/models/AuditLog";
import { SignOutButton } from "@/components/settings/SignOutButton";
import {
  User,
  Shield,
  Coins,
  Database,
  History,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  const session = await requireAuth();
  await connectToDatabase();

  const auditLogs = (await AuditLog.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean()) as unknown as IAuditLog[];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
          Account & Preferences
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          Manage your account profile, financial standards, database storage, and security logs.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 space-y-4 shadow-2xs">
        <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
          <User className="size-4 text-[#0F766E]" />
          <h2 className="text-sm font-bold text-[#0F172A]">User Profile</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-[#64748B] uppercase">Full Name</span>
            <div className="text-sm font-bold text-[#0F172A]">{session.user.name || "User"}</div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-[#64748B] uppercase">Email Address</span>
            <div className="text-sm font-bold text-[#0F172A]">{session.user.email}</div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-[#64748B] uppercase">Account Type</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md max-w-fit">
              <CheckCircle2 className="size-3" />
              <span>Personal Ledger (Active)</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-[#64748B] uppercase">Security Engine</span>
            <div className="text-xs font-medium text-[#0F172A]">
              Better Auth Session Cookie (HTTP-Only)
            </div>
          </div>
        </div>
      </div>

      {/* Currency & Financial Standards */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 space-y-4 shadow-2xs">
        <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
          <Coins className="size-4 text-[#0F766E]" />
          <h2 className="text-sm font-bold text-[#0F172A]">Financial & Currency Precision</h2>
        </div>

        <div className="space-y-3 text-xs text-[#0F172A]">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
            <div>
              <span className="font-bold text-[#0F172A] block">Currency Standard</span>
              <span className="text-[#64748B] text-[11px]">
                Indian Rupee (INR -₹) with Indian numbering format (₹1,23,456.78)
              </span>
            </div>
            <span className="px-2.5 py-1 bg-teal-50 text-[#0F766E] rounded-md font-bold text-xs">
              ₹ INR
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
            <div>
              <span className="font-bold text-[#0F172A] block">Ledger Math Engine</span>
              <span className="text-[#64748B] text-[11px]">
                Paise-level integer precision (100 paise = ₹1.00) prevents floating-point inaccuracies
              </span>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md font-bold text-xs">
              Integer Precision Safe
            </span>
          </div>
        </div>
      </div>

      {/* Data Storage & Export Center */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 space-y-4 shadow-2xs">
        <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
          <Database className="size-4 text-[#0F766E]" />
          <h2 className="text-sm font-bold text-[#0F172A]">Data Ownership & Export</h2>
        </div>

        <p className="text-xs text-[#64748B]">
          Expenso stores all ledger records in your self-hosted MongoDB database without third-party
          trackers or live account scrapers. You retain 100% control of your personal finance data.
        </p>

        <div className="flex items-center gap-3 pt-1">
          <Link href="/reports">
            <Button size="sm" className="bg-[#0F766E] hover:bg-[#0d655e] text-white text-xs gap-1.5 h-9">
              <FileSpreadsheet className="size-3.5" />
              <span>Go to Export Center (CSV)</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Security Audit Trail */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 space-y-4 shadow-2xs">
        <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
          <History className="size-4 text-[#0F766E]" />
          <h2 className="text-sm font-bold text-[#0F172A]">Recent Security & Audit Logs</h2>
        </div>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-[#64748B] py-2">No balance adjustments or audit records logged yet.</p>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs.map((log) => (
              <div key={log._id.toString()} className="py-2.5 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#0F172A] capitalize">
                      {log.action.replace("_", " ")}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-[#64748B] px-1.5 py-0.5 bg-slate-100 rounded">
                      {log.entityType.replace("_", " ")}
                    </span>
                  </div>
                  {log.reason && (
                    <p className="text-[11px] text-slate-500">{log.reason}</p>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">
                  {new Date(log.createdAt).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger Zone / Session */}
      <div className="bg-white rounded-xl border border-rose-200 p-5 space-y-3 shadow-2xs">
        <div className="flex items-center gap-2 border-b border-rose-100 pb-2">
          <Shield className="size-4 text-rose-600" />
          <h2 className="text-sm font-bold text-rose-900">Session & Authentication</h2>
        </div>
        <p className="text-xs text-[#64748B]">
          Terminate your current active session on this device.
        </p>
        <div className="pt-1">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
