import { AssetType } from "@/lib/models/Investment";

export interface AssetTypeConfig {
  label: string;
  color: string; // Hex color for charts & badges
  bgLight: string;
  textLight: string;
}

export const ASSET_TYPES: Record<AssetType, AssetTypeConfig> = {
  mutual_funds: {
    label: "Mutual Funds",
    color: "#0F766E", // Deep Teal
    bgLight: "bg-teal-50",
    textLight: "text-[#0F766E]",
  },
  stocks: {
    label: "Stocks / Equity",
    color: "#2563EB", // Blue
    bgLight: "bg-blue-50",
    textLight: "text-blue-700",
  },
  fixed_deposit: {
    label: "Fixed / Recurring Deposit",
    color: "#7C3AED", // Violet
    bgLight: "bg-purple-50",
    textLight: "text-purple-700",
  },
  gold: {
    label: "Gold / SGB",
    color: "#D97706", // Amber / Gold
    bgLight: "bg-amber-50",
    textLight: "text-amber-700",
  },
  provident_fund: {
    label: "EPF / PPF / NPS",
    color: "#059669", // Emerald
    bgLight: "bg-emerald-50",
    textLight: "text-emerald-700",
  },
  crypto: {
    label: "Crypto & Digital",
    color: "#EA580C", // Orange
    bgLight: "bg-orange-50",
    textLight: "text-orange-700",
  },
  real_estate: {
    label: "Real Estate",
    color: "#475569", // Slate
    bgLight: "bg-slate-100",
    textLight: "text-slate-800",
  },
  other: {
    label: "Other Assets",
    color: "#6B7280", // Gray
    bgLight: "bg-gray-100",
    textLight: "text-gray-700",
  },
};
