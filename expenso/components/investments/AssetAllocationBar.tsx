"use client";

import { ASSET_TYPES } from "@/lib/constants/investments";
import { AssetType } from "@/lib/models/Investment";
import { formatINR } from "@/lib/utils/currency";

export interface AssetAllocationItem {
  assetType: AssetType;
  totalValuePaise: number;
  count: number;
}

interface AssetAllocationBarProps {
  allocations: AssetAllocationItem[];
  totalPortfolioPaise: number;
}

export function AssetAllocationBar({
  allocations,
  totalPortfolioPaise,
}: AssetAllocationBarProps) {
  if (totalPortfolioPaise <= 0 || allocations.length === 0) {
    return null;
  }

  // Sort by highest value
  const sorted = [...allocations].sort(
    (a, b) => b.totalValuePaise - a.totalValuePaise
  );

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-4.5 space-y-3.5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#0F172A]">Asset Allocation</h3>
        <span className="text-xs text-[#64748B] font-medium">
          Portfolio Total: <strong className="text-[#0F172A]">{formatINR(totalPortfolioPaise)}</strong>
        </span>
      </div>

      {/* Multi-segment distribution bar */}
      <div className="w-full h-3 rounded-full bg-slate-100 flex overflow-hidden p-0.5 gap-0.5">
        {sorted.map((item) => {
          const percent = (item.totalValuePaise / totalPortfolioPaise) * 100;
          if (percent < 0.5) return null;
          const config = ASSET_TYPES[item.assetType] || ASSET_TYPES.other;

          return (
            <div
              key={item.assetType}
              className="h-full rounded-sm transition-all duration-300 first:rounded-l-full last:rounded-r-full"
              style={{
                width: `${percent}%`,
                backgroundColor: config.color,
              }}
              title={`${config.label}: ${formatINR(item.totalValuePaise)} (${percent.toFixed(1)}%)`}
            />
          );
        })}
      </div>

      {/* Legend chips */}
      <div className="flex flex-wrap gap-2 pt-1">
        {sorted.map((item) => {
          const percent = ((item.totalValuePaise / totalPortfolioPaise) * 100).toFixed(1);
          const config = ASSET_TYPES[item.assetType] || ASSET_TYPES.other;

          return (
            <div
              key={item.assetType}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-100 text-[11px]"
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: config.color }}
              />
              <span className="font-semibold text-[#0F172A]">{config.label}</span>
              <span className="text-slate-400 font-medium">({percent}%)</span>
              <span className="text-[#64748B] font-medium ml-1">
                {formatINR(item.totalValuePaise)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
