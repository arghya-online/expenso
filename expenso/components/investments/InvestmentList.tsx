"use client";

import { useState, useTransition } from "react";
import { formatINR } from "@/lib/utils/currency";
import { ASSET_TYPES } from "@/lib/constants/investments";
import { AssetType } from "@/lib/models/Investment";
import { deleteInvestment } from "@/lib/actions/investments";
import { UpdateValuationDialog } from "./UpdateValuationDialog";
import {
  TrendingUp,
  TrendingDown,
  Building2,
  Calendar,
  Trash2,
  Search,
  LineChart,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export interface SerializedInvestment {
  id: string;
  name: string;
  assetType: AssetType;
  institution?: string;
  investedAmountInPaise: number;
  currentValueInPaise: number;
  lastValuationDate: string;
  notes?: string;
  createdAt: string;
}

interface InvestmentListProps {
  initialInvestments: SerializedInvestment[];
}

export function InvestmentList({ initialInvestments }: InvestmentListProps) {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredInvestments = initialInvestments.filter((inv) => {
    // Type filter
    if (selectedType !== "all" && inv.assetType !== selectedType) {
      return false;
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = inv.name.toLowerCase().includes(q);
      const matchesInst = inv.institution?.toLowerCase().includes(q) ?? false;
      const matchesNotes = inv.notes?.toLowerCase().includes(q) ?? false;
      return matchesName || matchesInst || matchesNotes;
    }

    return true;
  });

  const handleDelete = (investmentId: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}" from your portfolio?`)) {
      startTransition(async () => {
        await deleteInvestment(investmentId);
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls: Search & Category selector */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <label htmlFor="filter-asset-type" className="text-xs font-semibold text-[#64748B]">
            Category:
          </label>
          <select
            id="filter-asset-type"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
          >
            <option value="all">All Assets ({initialInvestments.length})</option>
            {Object.entries(ASSET_TYPES).map(([typeKey, cfg]) => {
              const count = initialInvestments.filter((i) => i.assetType === typeKey).length;
              if (count === 0 && selectedType !== typeKey) return null;
              return (
                <option key={typeKey} value={typeKey}>
                  {cfg.label} ({count})
                </option>
              );
            })}
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[#64748B]" />
          <Input
            placeholder="Search asset, broker, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs border-[#E2E8F0] bg-white"
          />
        </div>
      </div>

      {/* Grid of assets */}
      {filteredInvestments.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-[#E2E8F0]">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#CCFBF1]/50 flex items-center justify-center text-[#0F766E] mb-3">
            <LineChart className="size-6" />
          </div>
          <h3 className="text-sm font-bold text-[#0F172A]">No investment assets found</h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1">
            {searchQuery || selectedType !== "all"
              ? "No assets match your search or filter criteria."
              : "Track your mutual funds, equity holdings, fixed deposits, and gold in one place."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInvestments.map((inv) => {
            const config = ASSET_TYPES[inv.assetType] || ASSET_TYPES.other;
            const gainLossPaise = inv.currentValueInPaise - inv.investedAmountInPaise;
            const isPositive = gainLossPaise > 0;
            const isNegative = gainLossPaise < 0;

            const returnPercentage =
              inv.investedAmountInPaise > 0
                ? (gainLossPaise / inv.investedAmountInPaise) * 100
                : 0;

            return (
              <div
                key={inv.id}
                className="bg-white rounded-xl border border-[#E2E8F0] p-4.5 space-y-3.5 flex flex-col justify-between hover:shadow-xs transition-shadow"
              >
                {/* Header */}
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${config.color}15`,
                        color: config.color,
                      }}
                    >
                      {config.label}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDelete(inv.id, inv.name)}
                      disabled={isPending}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                      title="Delete asset"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>

                  <h4 className="text-sm font-bold text-[#0F172A] leading-tight line-clamp-1" title={inv.name}>
                    {inv.name}
                  </h4>

                  {inv.institution && (
                    <div className="flex items-center gap-1 text-[11px] text-[#64748B]">
                      <Building2 className="size-3" />
                      <span>{inv.institution}</span>
                    </div>
                  )}
                </div>

                {/* Values & P&L */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] font-medium text-[#64748B]">Current Value:</span>
                    <span className="text-base font-extrabold text-[#0F172A]">
                      {formatINR(inv.currentValueInPaise)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/60">
                    <span className="text-[#64748B]">Invested:</span>
                    <span className="font-semibold text-[#0F172A]">
                      {formatINR(inv.investedAmountInPaise)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#64748B]">Returns (P&L):</span>
                    <span
                      className={`inline-flex items-center gap-0.5 font-bold ${
                        isPositive
                          ? "text-emerald-600"
                          : isNegative
                          ? "text-rose-600"
                          : "text-slate-500"
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="size-3" />
                      ) : isNegative ? (
                        <TrendingDown className="size-3" />
                      ) : null}
                      {isPositive ? "+" : ""}
                      {formatINR(gainLossPaise)} ({isPositive ? "+" : ""}
                      {returnPercentage.toFixed(2)}%)
                    </span>
                  </div>
                </div>

                {/* Footer notes & quick update */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-[10px] text-[#64748B]">
                    <div className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      <span>
                        Valued: {new Date(inv.lastValuationDate).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                    {inv.notes && (
                      <span className="truncate max-w-[120px] text-slate-500" title={inv.notes}>
                        {inv.notes}
                      </span>
                    )}
                  </div>

                  <UpdateValuationDialog
                    investmentId={inv.id}
                    name={inv.name}
                    currentValueInPaise={inv.currentValueInPaise}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
