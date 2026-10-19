export const instant = false;

import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Investment, IInvestment, AssetType } from "@/lib/models/Investment";
import { formatINR } from "@/lib/utils/currency";
import { CreateInvestmentDialog } from "@/components/investments/CreateInvestmentDialog";
import { AssetAllocationBar, AssetAllocationItem } from "@/components/investments/AssetAllocationBar";
import { InvestmentList, SerializedInvestment } from "@/components/investments/InvestmentList";
import { TrendingUp, TrendingDown, PiggyBank, Briefcase, Sparkles } from "lucide-react";

export default async function InvestmentsPage() {
  const session = await requireAuth();
  await connectToDatabase();

  const rawInvestments = (await Investment.find({ userId: session.user.id })
    .sort({ currentValueInPaise: -1 })
    .lean()) as unknown as IInvestment[];

  const investments: SerializedInvestment[] = rawInvestments.map((inv) => ({
    id: inv._id.toString(),
    name: inv.name,
    assetType: inv.assetType,
    institution: inv.institution,
    investedAmountInPaise: inv.investedAmountInPaise,
    currentValueInPaise: inv.currentValueInPaise,
    lastValuationDate: inv.lastValuationDate.toISOString(),
    notes: inv.notes,
    createdAt: inv.createdAt.toISOString(),
  }));

  // Aggregations
  let totalCurrentValuePaise = 0;
  let totalInvestedPaise = 0;
  const allocationMap = new Map<AssetType, { totalValuePaise: number; count: number }>();

  investments.forEach((inv) => {
    totalCurrentValuePaise += inv.currentValueInPaise;
    totalInvestedPaise += inv.investedAmountInPaise;

    const current = allocationMap.get(inv.assetType) || { totalValuePaise: 0, count: 0 };
    allocationMap.set(inv.assetType, {
      totalValuePaise: current.totalValuePaise + inv.currentValueInPaise,
      count: current.count + 1,
    });
  });

  const totalReturnsPaise = totalCurrentValuePaise - totalInvestedPaise;
  const isPositiveReturns = totalReturnsPaise > 0;
  const isNegativeReturns = totalReturnsPaise < 0;

  const returnPercentage =
    totalInvestedPaise > 0
      ? (totalReturnsPaise / totalInvestedPaise) * 100
      : 0;

  const allocations: AssetAllocationItem[] = Array.from(allocationMap.entries()).map(
    ([assetType, data]) => ({
      assetType,
      totalValuePaise: data.totalValuePaise,
      count: data.count,
    })
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            Investment Portfolio
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Track mutual funds, equity holdings, fixed deposits, gold, and calculate total asset valuations.
          </p>
        </div>
        <CreateInvestmentDialog />
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Portfolio Value */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4.5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">Portfolio Value</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center">
              <PiggyBank className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
            {formatINR(totalCurrentValuePaise)}
          </div>
          <p className="text-[11px] text-[#64748B]">Current mark-to-market worth</p>
        </div>

        {/* Total Invested */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4.5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">Total Invested</span>
            <div className="w-7 h-7 rounded-lg bg-slate-50 text-slate-700 flex items-center justify-center">
              <Briefcase className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
            {formatINR(totalInvestedPaise)}
          </div>
          <p className="text-[11px] text-[#64748B]">Principal capital committed</p>
        </div>

        {/* Overall Returns / P&L */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4.5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">Total Returns (P&L)</span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                isPositiveReturns
                  ? "bg-emerald-50 text-emerald-600"
                  : isNegativeReturns
                  ? "bg-rose-50 text-rose-600"
                  : "bg-slate-50 text-slate-600"
              }`}
            >
              {isPositiveReturns ? (
                <TrendingUp className="size-4" />
              ) : isNegativeReturns ? (
                <TrendingDown className="size-4" />
              ) : (
                <Sparkles className="size-4" />
              )}
            </div>
          </div>
          <div
            className={`text-2xl font-extrabold tracking-tight ${
              isPositiveReturns
                ? "text-emerald-600"
                : isNegativeReturns
                ? "text-rose-600"
                : "text-slate-600"
            }`}
          >
            {isPositiveReturns ? "+" : ""}
            {formatINR(totalReturnsPaise)}
          </div>
          <p className="text-[11px] text-[#64748B]">
            {isPositiveReturns ? "+" : ""}
            {returnPercentage.toFixed(2)}% overall return
          </p>
        </div>

        {/* Total Assets / Holdings Count */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4.5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">Holdings Count</span>
            <div className="w-7 h-7 rounded-lg bg-[#CCFBF1] text-[#0F766E] flex items-center justify-center">
              <Sparkles className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
            {investments.length}
          </div>
          <p className="text-[11px] text-[#64748B]">Active investment instruments</p>
        </div>
      </div>

      {/* Asset Allocation Breakdown */}
      <AssetAllocationBar
        allocations={allocations}
        totalPortfolioPaise={totalCurrentValuePaise}
      />

      {/* Assets List */}
      <InvestmentList initialInvestments={investments} />
    </div>
  );
}
