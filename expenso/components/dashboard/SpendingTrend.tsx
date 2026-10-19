import { formatINR } from "@/lib/utils/currency";
import { TrendingUp, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export interface TrendPoint {
  label: string;
  amountInPaise: number;
}

interface SpendingTrendProps {
  points: TrendPoint[];
  dateRangeLabel: string;
}

export function SpendingTrend({ points, dateRangeLabel }: SpendingTrendProps) {
  const maxAmount = Math.max(...points.map((p) => p.amountInPaise), 1);
  const totalInPeriod = points.reduce((sum, p) => sum + p.amountInPaise, 0);
  const activePoints = points.filter((p) => p.amountInPaise > 0);
  const avgAmount = activePoints.length > 0 ? Math.round(totalInPeriod / activePoints.length) : 0;

  return (
    <Card className="border-[#E2E8F0] shadow-2xs bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-[#0F172A]">
              Spending Trends
            </CardTitle>
            <CardDescription className="text-xs text-[#64748B]">
              Outflow timeline for {dateRangeLabel}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#64748B] bg-slate-50 border border-[#E2E8F0] px-2 py-0.5 rounded-md">
            <TrendingUp className="size-3 text-[#0F766E]" />
            <span>Avg: {formatINR(avgAmount)}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {points.length === 0 || totalInPeriod === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC]">
            <BarChart3 className="size-8 mx-auto text-[#64748B] mb-2 stroke-1" />
            <p className="text-xs font-semibold text-[#0F172A]">No timeline data</p>
            <p className="text-[11px] text-[#64748B] mt-1">
              Add transactions over time to see your daily spending trend.
            </p>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {/* Bar Chart Container */}
            <div className="h-40 flex items-end gap-1.5 sm:gap-2 pt-6 px-1 border-b border-[#E2E8F0]">
              {points.map((pt, idx) => {
                const heightPercent = Math.max(4, Math.round((pt.amountInPaise / maxAmount) * 100));
                const isMax = pt.amountInPaise === maxAmount && pt.amountInPaise > 0;
                return (
                  <div
                    key={`${pt.label}-${idx}`}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative"
                  >
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-[#0F172A] text-white text-[10px] py-1 px-2 rounded-md whitespace-nowrap z-20 pointer-events-none shadow-md">
                      {pt.label}: {formatINR(pt.amountInPaise)}
                    </div>

                    {/* Bar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-sm transition-all duration-300 ${
                        isMax
                          ? "bg-[#E11D48]"
                          : pt.amountInPaise > 0
                          ? "bg-[#0F766E] group-hover:bg-[#0d655e]"
                          : "bg-slate-100"
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Labels under chart */}
            <div className="flex items-center justify-between text-[10px] text-[#64748B] px-1 font-medium">
              <span>{points[0]?.label}</span>
              <span>{points[Math.floor(points.length / 2)]?.label}</span>
              <span>{points[points.length - 1]?.label}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
