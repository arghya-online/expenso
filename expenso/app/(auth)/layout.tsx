import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">{children}</div>
      <div className="mt-8 text-center text-xs text-[#64748B]">
        Expenso — Secure & Private Personal Finance Manager
      </div>
    </div>
  );
}
