import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/AppShell";

export const instant = false;

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();

  if (!session || !session.user) {
    redirect("/login");
  }

  return <AppShell user={session.user}>{children}</AppShell>;
}
