export const ACCOUNT_COLORS = [
  { name: "Teal", hex: "#0F766E" },
  { name: "Indigo", hex: "#4F46E5" },
  { name: "Blue", hex: "#2563EB" },
  { name: "Emerald", hex: "#059669" },
  { name: "Amber", hex: "#D97706" },
  { name: "Rose", hex: "#E11D48" },
  { name: "Purple", hex: "#7C3AED" },
  { name: "Slate", hex: "#475569" },
] as const;

export const ACCOUNT_TYPES = [
  { value: "savings", label: "Savings Account" },
  { value: "current", label: "Current Account" },
  { value: "cash", label: "Cash in Hand" },
  { value: "wallet", label: "Digital Wallet" },
  { value: "credit", label: "Credit Card" },
  { value: "other", label: "Other Account" },
] as const;
