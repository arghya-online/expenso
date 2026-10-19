"use client";

import { ReactNode } from "react";
import { motion } from "motion/react";
import { ShieldCheck, TrendingUp, Sparkles, Lock, ArrowUpRight } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#0A0F1D] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 selection:bg-[#0F766E] selection:text-white">
      {/* Dynamic Animated Ambient Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Deep Teal Orb */}
        <motion.div
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -50, 20, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-40 -left-20 w-[550px] h-[550px] rounded-full bg-gradient-to-br from-[#0F766E]/30 to-[#14B8A6]/10 blur-[120px]"
        />

        {/* Indigo / Cyan Orb */}
        <motion.div
          animate={{
            x: [0, -40, 50, 0],
            y: [0, 60, -30, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-40 -right-20 w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-[#0369A1]/25 via-[#0F766E]/20 to-transparent blur-[130px]"
        />

        {/* Center subtle glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#0F766E]/10 blur-[150px] -z-10" />

        {/* Subtle Geometric Dot Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Floating Interactive Fintech Badges (Visible on larger screens) */}
      <div className="absolute inset-0 pointer-events-none max-w-6xl mx-auto hidden lg:block">
        {/* Top-Left Floating Badge: Salary Credited */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: [0, -12, 0],
          }}
          transition={{
            opacity: { duration: 0.8, delay: 0.2 },
            y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute top-28 left-8 xl:left-4 backdrop-blur-md bg-white/[0.04] border border-white/[0.08] rounded-2xl p-3.5 shadow-2xl flex items-center gap-3 w-64"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <ArrowUpRight className="size-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Income Credited</div>
            <div className="text-sm font-bold text-white tracking-tight">+₹85,000.00</div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Verified Transaction
            </div>
          </div>
        </motion.div>

        {/* Bottom-Left Floating Badge: Integer Paise Math */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{
            opacity: 1,
            y: [0, 10, 0],
          }}
          transition={{
            opacity: { duration: 0.8, delay: 0.4 },
            y: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 },
          }}
          className="absolute bottom-24 left-12 xl:left-8 backdrop-blur-md bg-white/[0.04] border border-white/[0.08] rounded-2xl p-3.5 shadow-2xl flex items-center gap-3 w-60"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
            <Sparkles className="size-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Precision Ledger</div>
            <div className="text-xs font-bold text-white">Integer Paise Accuracy</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Zero floating point errors</div>
          </div>
        </motion.div>

        {/* Top-Right Floating Badge: Portfolio Growth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: [0, -10, 0],
          }}
          transition={{
            opacity: { duration: 0.8, delay: 0.3 },
            y: { duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
          }}
          className="absolute top-28 right-8 xl:right-4 backdrop-blur-md bg-white/[0.04] border border-white/[0.08] rounded-2xl p-3.5 shadow-2xl flex items-center gap-3 w-64"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
            <TrendingUp className="size-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Portfolio Growth</div>
            <div className="text-sm font-bold text-white tracking-tight">₹14.82 Lakhs</div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
              <span>+18.4% All-Time Gain</span>
            </div>
          </div>
        </motion.div>

        {/* Bottom-Right Floating Badge: Privacy */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{
            opacity: 1,
            y: [0, 12, 0],
          }}
          transition={{
            opacity: { duration: 0.8, delay: 0.5 },
            y: { duration: 7.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 },
          }}
          className="absolute bottom-24 right-12 xl:right-8 backdrop-blur-md bg-white/[0.04] border border-white/[0.08] rounded-2xl p-3.5 shadow-2xl flex items-center gap-3 w-60"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <Lock className="size-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Security Standard</div>
            <div className="text-xs font-bold text-white">100% Private Ledger</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Zero 3rd-party scrapers</div>
          </div>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-md relative z-10">{children}</div>

      {/* Subtle Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 text-center text-xs text-slate-500 flex items-center gap-2 relative z-10"
      >
        <ShieldCheck className="size-3.5 text-teal-500" />
        <span>Expenso -Secure, Private & Precision Personal Finance Ledger</span>
      </motion.div>
    </div>
  );
}
