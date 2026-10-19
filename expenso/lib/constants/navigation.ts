import {
  LayoutDashboard,
  Landmark,
  ArrowLeftRight,
  TrendingUp,
  HandCoins,
  PieChart,
  Settings,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: string;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Accounts",
    href: "/accounts",
    icon: Landmark,
  },
  {
    title: "Transactions",
    href: "/transactions",
    icon: ArrowLeftRight,
  },
  {
    title: "Investments",
    href: "/investments",
    icon: TrendingUp,
  },
  {
    title: "Lending & Debt",
    href: "/loans",
    icon: HandCoins,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: PieChart,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

// 5 primary items for the compact mobile bottom bar
export const MOBILE_BOTTOM_NAV_ITEMS: NavItem[] = [
  {
    title: "Home",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Accounts",
    href: "/accounts",
    icon: Landmark,
  },
  {
    title: "Transactions",
    href: "/transactions",
    icon: ArrowLeftRight,
  },
  {
    title: "Invest",
    href: "/investments",
    icon: TrendingUp,
  },
  {
    title: "More",
    href: "/settings",
    icon: Settings,
  },
];
