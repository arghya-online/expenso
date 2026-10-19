"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth/client";
import { motion, AnimatePresence } from "motion/react";
import {
  Wallet,
  Loader2,
  ArrowRight,
  AlertCircle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Invalid email or password");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail("demo@expenso.com");
    setPassword("DemoPass123!");
    setError(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative rounded-3xl bg-slate-900/70 backdrop-blur-2xl border border-white/[0.12] p-7 sm:p-9 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden"
    >
      {/* Top illuminated accent line */}
      <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#2DD4BF] to-transparent opacity-80" />

      {/* Header section with brand mark */}
      <div className="text-center space-y-2 pb-6">
        <motion.div
          whileHover={{ scale: 1.05, rotate: 3 }}
          whileTap={{ scale: 0.95 }}
          className="size-14 rounded-2xl bg-gradient-to-tr from-[#0F766E] to-[#2DD4BF] text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#0F766E]/40 border border-white/20"
        >
          <Wallet className="size-7" />
        </motion.div>

        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          Welcome to Expenso
        </h1>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          Sign in to access your multi-account ledger, investments, and personal debt positions.
        </p>

        {/* Auth mode toggle tabs */}
        <div className="flex items-center justify-center gap-1.5 p-1 bg-white/[0.05] rounded-xl max-w-xs mx-auto mt-4 border border-white/[0.06]">
          <button
            type="button"
            className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-teal-500/20 text-[#2DD4BF] border border-teal-500/30 transition-all shadow-xs"
          >
            Sign In
          </button>
          <Link
            href="/register"
            className="flex-1 py-1.5 text-xs font-semibold rounded-lg text-slate-400 hover:text-white transition-all text-center"
          >
            Create Account
          </Link>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 overflow-hidden"
            >
              <AlertCircle className="size-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email Input */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-medium text-slate-300">
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
              className="h-11 pl-10 bg-slate-950/60 border-white/[0.1] text-white placeholder:text-slate-500 rounded-xl text-sm focus-visible:ring-1 focus-visible:ring-[#2DD4BF] focus-visible:border-[#2DD4BF] transition-all"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-medium text-slate-300">
              Password
            </Label>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[11px] text-[#2DD4BF] hover:text-[#5EEAD4] flex items-center gap-1 font-medium transition-colors"
            >
              <Sparkles className="size-3" />
              <span>Fill Demo Credentials</span>
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
              className="h-11 pl-10 pr-10 bg-slate-950/60 border-white/[0.1] text-white placeholder:text-slate-500 rounded-xl text-sm focus-visible:ring-1 focus-visible:ring-[#2DD4BF] focus-visible:border-[#2DD4BF] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-[#0F766E] to-[#14B8A6] hover:from-[#115E59] hover:to-[#0F766E] text-white font-semibold text-sm rounded-xl shadow-lg shadow-[#0F766E]/30 border border-teal-400/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </motion.div>
        </div>

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-400 pt-2">
          Don&apos;t have an account yet?{" "}
          <Link
            href="/register"
            className="text-[#2DD4BF] font-semibold hover:text-[#5EEAD4] transition-colors"
          >
            Create an account
          </Link>
        </div>
      </form>
    </motion.div>
  );
}
