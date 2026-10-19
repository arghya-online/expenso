"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Calendar } from "lucide-react";

export const DATE_RANGES = [
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "this_year", label: "This Year" },
  { value: "all", label: "All Time" },
] as const;

export type DateRangeValue = (typeof DATE_RANGES)[number]["value"];

export function DateRangeSelector({ currentRange }: { currentRange: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleRangeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-1.5 bg-white border border-[#E2E8F0] rounded-lg px-2.5 py-1 shadow-2xs">
      <Calendar className="size-3.5 text-[#64748B] shrink-0" />
      <select
        value={currentRange}
        onChange={(e) => handleRangeChange(e.target.value)}
        className="text-xs font-semibold text-[#0F172A] bg-transparent focus:outline-hidden cursor-pointer"
      >
        {DATE_RANGES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
    </div>
  );
}
