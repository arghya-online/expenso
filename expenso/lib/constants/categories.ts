export interface CategoryItem {
  id: string;
  name: string;
  type: "income" | "expense";
  iconName: string;
  color: string;
}

export const EXPENSE_CATEGORIES: CategoryItem[] = [
  { id: "food", name: "Food & Dining", type: "expense", iconName: "Utensils", color: "#F97316" },
  { id: "transport", name: "Transport & Fuel", type: "expense", iconName: "Car", color: "#3B82F6" },
  { id: "shopping", name: "Shopping & Groceries", type: "expense", iconName: "ShoppingBag", color: "#EC4899" },
  { id: "bills", name: "Bills & Utilities", type: "expense", iconName: "Receipt", color: "#8B5CF6" },
  { id: "housing", name: "Rent & Housing", type: "expense", iconName: "Home", color: "#0D9488" },
  { id: "health", name: "Healthcare & Medicine", type: "expense", iconName: "HeartPulse", color: "#E11D48" },
  { id: "education", name: "Education & Learning", type: "expense", iconName: "GraduationCap", color: "#6366F1" },
  { id: "entertainment", name: "Entertainment & Leisure", type: "expense", iconName: "Film", color: "#F59E0B" },
  { id: "travel", name: "Travel & Vacations", type: "expense", iconName: "Plane", color: "#14B8A6" },
  { id: "other_expense", name: "Other Expense", type: "expense", iconName: "CircleDollarSign", color: "#64748B" },
];

export const INCOME_CATEGORIES: CategoryItem[] = [
  { id: "salary", name: "Salary", type: "income", iconName: "Briefcase", color: "#16A34A" },
  { id: "freelance", name: "Freelance / Consulting", type: "income", iconName: "Laptop", color: "#059669" },
  { id: "business", name: "Business Revenue", type: "income", iconName: "Building2", color: "#0F766E" },
  { id: "investments", name: "Dividends & Returns", type: "income", iconName: "TrendingUp", color: "#10B981" },
  { id: "interest", name: "Interest Earned", type: "income", iconName: "Percent", color: "#84CC16" },
  { id: "gifts", name: "Gifts & Grants", type: "income", iconName: "Gift", color: "#EAB308" },
  { id: "other_income", name: "Other Income", type: "income", iconName: "CircleDollarSign", color: "#64748B" },
];

export const PAYMENT_METHODS = [
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card (Debit/Credit)" },
  { value: "netbanking", label: "Net Banking" },
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
  { value: "other", label: "Other" },
] as const;
