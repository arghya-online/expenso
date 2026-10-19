import { ReactNode, Suspense } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { PageTransition } from "./PageTransition";
import { RouteProgressBar } from "./RouteProgressBar";

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
      {/* Dynamic Route Progress Bar */}
      <Suspense fallback={null}>
        <RouteProgressBar />
      </Suspense>

      {/* Desktop Sidebar */}
      <Sidebar user={user} />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header user={user} />
        <main className="flex-1 p-4 lg:p-8 pb-20 lg:pb-8 max-w-7xl w-full mx-auto">
          <PageTransition>{children}</PageTransition>
        </main>
        {/* Mobile Bottom Nav */}
        <MobileNav />
      </div>
    </div>
  );
}
