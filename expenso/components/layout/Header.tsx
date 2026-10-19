"use client";

import { Wallet, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const currentDate = new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-xs border-b border-[#E2E8F0] px-4 lg:px-8 flex items-center justify-between">
      {/* Mobile brand mark (Desktop brand mark is in Sidebar) */}
      <div className="flex lg:hidden items-center gap-2.5">
        <div className="size-8 rounded-lg bg-[#0F766E] flex items-center justify-center text-white">
          <Wallet className="size-4.5" />
        </div>
        <span className="font-semibold text-base text-[#0F172A] tracking-tight">Expenso</span>
      </div>

      {/* Desktop view info */}
      <div className="hidden lg:flex items-center gap-3">
        <h1 className="text-base font-semibold text-[#0F172A]">Financial Overview</h1>
        <span className="text-xs text-[#64748B] bg-[#F1F5F9] px-2.5 py-1 rounded-md font-medium">
          {currentDate}
        </span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-[#CCFBF1] text-[#0F766E] font-medium text-xs flex items-center justify-center shrink-0">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : "U"}
          </div>
          <span className="hidden sm:inline text-xs font-medium text-[#0F172A]">
            {user?.name || "User"}
          </span>
        </div>

        {/* Mobile sign out */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleSignOut}
          className="lg:hidden text-[#64748B] hover:text-[#E11D48]"
          title="Sign out"
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  );
}
