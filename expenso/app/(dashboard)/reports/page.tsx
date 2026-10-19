export const instant = false;

import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Transaction } from "@/lib/models/Transaction";
import { formatINR } from "@/lib/utils/currency";
import {
  Download,
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  Percent,
  FileSpreadsheet,
  Building,
  HandCoins,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ReportTransaction {
  date: Date;
  type: "income" | "expense" | "transfer";
  amountInPaise: number;
  category?: string;
}

interface PageProps {
  searchParams: Promise<{ year?: string }>;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default async function ReportsPage({ searchParams }: PageProps) {
  const session = await requireAuth();
  await connectToDatabase();

  const resolvedParams = await searchParams;
  const currentYear = new Date().getFullYear();
  const selectedYear = parseInt(resolvedParams.year || String(currentYear), 10);

  const startOfYear = new Date(selectedYear, 0, 1);
  const endOfYear = new Date(selectedYear, 11, 31, 23, 59, 59, 999);

  // Fetch all transactions for the selected year
  const transactions = await Transaction.find({
    userId: session.user.id,
    date: { $gte: startOfYear, $lte: endOfYear },
  }).lean();

  // Monthly buckets: 12 months
  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    monthIndex: i,
    monthName: MONTH_NAMES[i],
    incomeInPaise: 0,
    expenseInPaise: 0,
    txCount: 0,
  }));

  const categoryTotals: Record<string, number> = {};

  let annualIncomePaise = 0;
  let annualExpensePaise = 0;

  (transactions as unknown as ReportTransaction[]).forEach((tx) => {
    const txDate = new Date(tx.date);
    const m = txDate.getMonth();

    if (tx.type === "income") {
      const amt = tx.amountInPaise || 0;
      monthlyData[m].incomeInPaise += amt;
      annualIncomePaise += amt;
      monthlyData[m].txCount++;
    } else if (tx.type === "expense") {
      const amt = tx.amountInPaise || 0;
      monthlyData[m].expenseInPaise += amt;
      annualExpensePaise += amt;
      monthlyData[m].txCount++;

      const cat = tx.category || "Other";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
    }
  });

  const annualSavingsPaise = annualIncomePaise - annualExpensePaise;
  const annualSavingsRate =
    annualIncomePaise > 0
      ? Math.max(0, Math.round((annualSavingsPaise / annualIncomePaise) * 100))
      : 0;

  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amountInPaise]) => ({
      category,
      amountInPaise,
      percentage:
        annualExpensePaise > 0
          ? Math.round((amountInPaise / annualExpensePaise) * 100)
          : 0,
    }));

  const availableYears = [currentYear, currentYear - 1, currentYear - 2];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Year Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            Financial Statements & Reports
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Month-by-month cashflow analysis, annual savings rates, and complete data exports.
          </p>
        </div>

        {/* Year Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg max-w-fit">
          {availableYears.map((yr) => (
            <Link
              key={yr}
              href={`/reports?year=${yr}`}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                selectedYear === yr
                  ? "bg-white text-[#0F766E] shadow-xs"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              {yr}
            </Link>
          ))}
        </div>
      </div>

      {/* Annual Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4.5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">Annual Income ({selectedYear})</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 tracking-tight">
            {formatINR(annualIncomePaise)}
          </div>
          <p className="text-[11px] text-[#64748B]">Total credited in {selectedYear}</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4.5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">Annual Expenses ({selectedYear})</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600 tracking-tight">
            {formatINR(annualExpensePaise)}
          </div>
          <p className="text-[11px] text-[#64748B]">Total spent in {selectedYear}</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4.5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">Net Savings</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center">
              <PiggyBank className="size-4" />
            </div>
          </div>
          <div
            className={`text-2xl font-extrabold tracking-tight ${
              annualSavingsPaise >= 0 ? "text-[#0F766E]" : "text-rose-600"
            }`}
          >
            {formatINR(annualSavingsPaise)}
          </div>
          <p className="text-[11px] text-[#64748B]">Income minus expenses</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4.5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">Savings Rate</span>
            <div className="w-7 h-7 rounded-lg bg-[#CCFBF1] text-[#0F766E] flex items-center justify-center">
              <Percent className="size-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
            {annualSavingsRate}%
          </div>
          <p className="text-[11px] text-[#64748B]">Of annual earned income saved</p>
        </div>
      </div>

      {/* Monthly Cash Flow Ledger Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-2xs">
        <div className="p-4.5 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">
              Monthly Cash Flow Breakdown -{selectedYear}
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Structured month-by-month financial statement.
            </p>
          </div>
          <a
            href="/api/export/transactions"
            download
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F766E] hover:underline"
          >
            <Download className="size-3.5" />
            <span>Export CSV</span>
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[#64748B] font-semibold uppercase tracking-wider border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">Month</th>
                <th className="py-3 px-4">Income</th>
                <th className="py-3 px-4">Expenses</th>
                <th className="py-3 px-4">Net Savings</th>
                <th className="py-3 px-4 text-right">Savings Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {monthlyData.map((row) => {
                const net = row.incomeInPaise - row.expenseInPaise;
                const rate =
                  row.incomeInPaise > 0
                    ? Math.max(0, Math.round((net / row.incomeInPaise) * 100))
                    : 0;

                const hasData = row.incomeInPaise > 0 || row.expenseInPaise > 0;

                return (
                  <tr
                    key={row.monthIndex}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      !hasData ? "text-slate-400" : "text-[#0F172A]"
                    }`}
                  >
                    <td className="py-3 px-4 font-semibold text-[#0F172A]">
                      {row.monthName}
                    </td>
                    <td className="py-3 px-4 text-emerald-600 font-semibold">
                      {formatINR(row.incomeInPaise)}
                    </td>
                    <td className="py-3 px-4 text-rose-600 font-semibold">
                      {formatINR(row.expenseInPaise)}
                    </td>
                    <td
                      className={`py-3 px-4 font-bold ${
                        net >= 0 ? "text-[#0F766E]" : "text-rose-600"
                      }`}
                    >
                      {formatINR(net)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          rate >= 30
                            ? "bg-teal-50 text-[#0F766E]"
                            : rate > 0
                            ? "bg-slate-100 text-slate-700"
                            : "bg-slate-50 text-slate-400"
                        }`}
                      >
                        {rate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Expense Distribution for Year */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4.5 space-y-4 shadow-2xs">
        <div>
          <h3 className="text-sm font-bold text-[#0F172A]">
            Expense Distribution by Category -{selectedYear}
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Where your money went across all spending categories.
          </p>
        </div>

        {sortedCategories.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#64748B]">
            No recorded expenses for {selectedYear}.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {sortedCategories.map((cat) => (
              <div
                key={cat.category}
                className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0F172A]">{cat.category}</span>
                  <span className="text-xs font-semibold text-[#64748B]">
                    {cat.percentage}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-[#0F766E] rounded-full"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
                <div className="text-[11px] text-[#64748B] font-medium">
                  {formatINR(cat.amountInPaise)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export Center Cards */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4.5 space-y-4 shadow-2xs">
        <div>
          <h3 className="text-sm font-bold text-[#0F172A]">Data Export Center</h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Download your financial data in spreadsheet-compatible CSV format anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Export Transactions */}
          <div className="p-4 rounded-xl border border-[#E2E8F0] bg-slate-50/50 flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center">
                <FileSpreadsheet className="size-4" />
              </div>
              <h4 className="text-xs font-bold text-[#0F172A] pt-1">Transactions Ledger</h4>
              <p className="text-[11px] text-[#64748B]">
                Full historical income, expenses, and transfer records.
              </p>
            </div>
            <a href="/api/export/transactions" download>
              <Button
                size="sm"
                variant="outline"
                className="w-full h-8 text-xs font-semibold text-[#0F766E] border-[#CCFBF1] hover:bg-[#CCFBF1]/30"
              >
                <Download className="size-3 mr-1.5" />
                Download CSV
              </Button>
            </a>
          </div>

          {/* Export Accounts */}
          <div className="p-4 rounded-xl border border-[#E2E8F0] bg-slate-50/50 flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building className="size-4" />
              </div>
              <h4 className="text-xs font-bold text-[#0F172A] pt-1">Bank Accounts Statement</h4>
              <p className="text-[11px] text-[#64748B]">
                Balances, account identifiers, and statuses.
              </p>
            </div>
            <a href="/api/export/accounts" download>
              <Button
                size="sm"
                variant="outline"
                className="w-full h-8 text-xs font-semibold text-blue-600 border-blue-100 hover:bg-blue-50"
              >
                <Download className="size-3 mr-1.5" />
                Download CSV
              </Button>
            </a>
          </div>

          {/* Export Lending & Debt */}
          <div className="p-4 rounded-xl border border-[#E2E8F0] bg-slate-50/50 flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <HandCoins className="size-4" />
              </div>
              <h4 className="text-xs font-bold text-[#0F172A] pt-1">Lending & Debt Ledger</h4>
              <p className="text-[11px] text-[#64748B]">
                Active loans, receivables, and repayment records.
              </p>
            </div>
            <a href="/api/export/loans" download>
              <Button
                size="sm"
                variant="outline"
                className="w-full h-8 text-xs font-semibold text-amber-600 border-amber-100 hover:bg-amber-50"
              >
                <Download className="size-3 mr-1.5" />
                Download CSV
              </Button>
            </a>
          </div>

          {/* Export Investments */}
          <div className="p-4 rounded-xl border border-[#E2E8F0] bg-slate-50/50 flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <TrendingUp className="size-4" />
              </div>
              <h4 className="text-xs font-bold text-[#0F172A] pt-1">Investment Portfolio</h4>
              <p className="text-[11px] text-[#64748B]">
                Holdings, valuations, and unrealized returns.
              </p>
            </div>
            <a href="/api/export/investments" download>
              <Button
                size="sm"
                variant="outline"
                className="w-full h-8 text-xs font-semibold text-purple-600 border-purple-100 hover:bg-purple-50"
              >
                <Download className="size-3 mr-1.5" />
                Download CSV
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
