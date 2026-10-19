import { formatINR } from "@/lib/utils/currency";
import { EXPENSE_CATEGORIES } from "@/lib/constants/categories";
import { PieChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export interface CategoryStat {
  category: string;
  totalInPaise: number;
  count: number;
  percentage: number;
}

interface CategoryBreakdownProps {
  categories: CategoryStat[];
  totalExpenseInPaise: number;
  dateRangeLabel: string;
}

const DEFAULT_CATEGORY_COLORS: Record<string, string> = {
  "Food & Dining": "#F97316",
  "Transport & Fuel": "#3B82F6",
  "Shopping & Groceries": "#EC4899",
  "Bills & Utilities": "#8B5CF6",
  "Rent & Housing": "#0D9488",
  "Healthcare & Medicine": "#E11D48",
  "Education & Learning": "#6366F1",
  "Entertainment & Leisure": "#F59E0B",
  "Travel & Vacations": "#14B8A6",
};

export function CategoryBreakdown({
  categories,
  totalExpenseInPaise,
  dateRangeLabel,
}: CategoryBreakdownProps) {
  const getCategoryColor = (name: string, index: number) => {
    if (DEFAULT_CATEGORY_COLORS[name]) {
      return DEFAULT_CATEGORY_COLORS[name];
    }
    const match = EXPENSE_CATEGORIES.find((c) => c.name === name);
    if (match) return match.color;
    const fallbacks = ["#0F766E", "#6366F1", "#EC4899", "#F59E0B", "#10B981", "#64748B"];
    return fallbacks[index % fallbacks.length];
  };

  return (
    <Card className="border-[#E2E8F0] shadow-2xs bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-[#0F172A]">
              Where Your Money Goes
            </CardTitle>
            <CardDescription className="text-xs text-[#64748B]">
              Category breakdown for {dateRangeLabel}
            </CardDescription>
          </div>
          <span className="text-xs font-bold text-[#E11D48] bg-rose-50 px-2 py-0.5 rounded-md">
            {formatINR(totalExpenseInPaise)}
          </span>
        </div>
      </CardHeader>

      <CardContent>
        {categories.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC]">
            <PieChart className="size-8 mx-auto text-[#64748B] mb-2 stroke-1" />
            <p className="text-xs font-semibold text-[#0F172A]">No expense data</p>
            <p className="text-[11px] text-[#64748B] mt-1">
              Record expenses to visualize where your money is spent.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Multi-segmented distribution bar */}
            <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-100 shadow-inner">
              {categories.map((c, i) => {
                if (c.percentage <= 0) return null;
                const color = getCategoryColor(c.category, i);
                return (
                  <div
                    key={c.category}
                    style={{
                      width: `${c.percentage}%`,
                      backgroundColor: color,
                    }}
                    title={`${c.category}: ${c.percentage}% (${formatINR(c.totalInPaise)})`}
                    className="h-full transition-all"
                  />
                );
              })}
            </div>

            {/* Category breakdown item list */}
            <div className="space-y-2.5 pt-1">
              {categories.slice(0, 6).map((c, i) => {
                const color = getCategoryColor(c.category, i);
                return (
                  <div key={c.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="size-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-semibold text-[#0F172A] truncate">
                          {c.category}
                        </span>
                        <span className="text-[10px] text-[#64748B]">
                          ({c.count} {c.count === 1 ? "tx" : "txs"})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-[#0F172A]">
                          {formatINR(c.totalInPaise)}
                        </span>
                        <span className="text-[11px] text-[#64748B] w-9 text-right font-medium">
                          {c.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Progress bar per category */}
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${c.percentage}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
