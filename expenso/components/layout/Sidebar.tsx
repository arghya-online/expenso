"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MAIN_NAV_ITEMS } from "@/lib/constants/navigation";
import { signOut } from "@/lib/auth/client";
import { LogOut, ShieldCheck, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 bg-white border-r border-[#E2E8F0] z-30">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-[#E2E8F0]">
        <div className="size-9 rounded-lg bg-[#0F766E] flex items-center justify-center text-white shadow-xs">
          <Wallet className="size-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-base tracking-tight text-[#0F172A]">Expenso</span>
          <span className="text-[11px] text-[#64748B] font-medium uppercase tracking-wider">
            Finance OS
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
          Menu
        </div>
        {MAIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#CCFBF1] text-[#0F766E]"
                  : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
              }`}
            >
              <Icon className={`size-4.5 ${isActive ? "text-[#0F766E]" : "text-[#64748B]"}`} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>

      {/* Manual Tracking Notice Badge */}
      <div className="px-4 py-3 mx-3 mb-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
        <div className="flex items-center gap-2 text-xs font-medium text-[#0F766E]">
          <ShieldCheck className="size-4 shrink-0" />
          <span>Manual Ledger Mode</span>
        </div>
        <p className="text-[11px] text-[#64748B] mt-1 leading-snug">
          Balances are managed manually by you. No third-party bank access required.
        </p>
      </div>

      {/* User Footer Profile & Sign Out */}
      <div className="p-3 border-t border-[#E2E8F0] flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <div className="size-8 rounded-full bg-[#CCFBF1] text-[#0F766E] font-medium text-xs flex items-center justify-center shrink-0">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : "EX"}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-[#0F172A] truncate">
              {user?.name || "Account"}
            </span>
            <span className="text-[11px] text-[#64748B] truncate">
              {user?.email || "user@expenso.app"}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleSignOut}
          title="Sign out"
          className="text-[#64748B] hover:text-[#E11D48] hover:bg-rose-50"
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </aside>
  );
}
