import { Wallet } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
      <div className="relative">
        {/* Glowing pulse ring */}
        <div className="absolute -inset-2 bg-gradient-to-tr from-[#0F766E] to-[#2DD4BF] rounded-2xl blur-md opacity-40 animate-pulse" />

        {/* Center Logo Icon */}
        <div className="relative size-14 rounded-2xl bg-[#0F766E] text-white flex items-center justify-center shadow-lg shadow-[#0F766E]/30 animate-bounce">
          <Wallet className="size-7" />
        </div>
      </div>

      <div className="mt-5 text-center space-y-1">
        <h3 className="text-sm font-bold text-[#0F172A] tracking-tight">
          Expenso
        </h3>
        <p className="text-xs text-[#64748B] animate-pulse">
          Loading financial ledger...
        </p>
      </div>
    </div>
  );
}
