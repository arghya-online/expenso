import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";

interface AppShellProps {
  children: ReactNode;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
}

export function AppShell({ children, user }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Desktop Sidebar */}
      <Sidebar user={user} />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header user={user} />
        <main className="flex-1 p-4 lg:p-8 pb-20 lg:pb-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
        {/* Mobile Bottom Nav */}
        <MobileNav />
      </div>
    </div>
  );
}
