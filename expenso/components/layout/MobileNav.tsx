"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MOBILE_BOTTOM_NAV_ITEMS } from "@/lib/constants/navigation";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] z-30 px-2 py-1.5 safe-area-bottom shadow-lg">
      <div className="flex items-center justify-around">
        {MOBILE_BOTTOM_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.title}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-center transition-colors ${
                isActive
                  ? "text-[#0F766E] font-medium"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <div
                className={`p-1 rounded-md transition-colors ${
                  isActive ? "bg-[#CCFBF1]" : ""
                }`}
              >
                <Icon className="size-4.5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
