"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth/client";
import { motion, AnimatePresence } from "motion/react";
import {
  Wallet,
  Loader2,
  ArrowRight,
  AlertCircle,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const result = await signUp.email({
        name,
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Could not complete registration");
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
      <div className="text-center space-y-2 pb-5">
        <motion.div
          whileHover={{ scale: 1.05, rotate: -3 }}
          whileTap={{ scale: 0.95 }}
          className="size-14 rounded-2xl bg-gradient-to-tr from-[#0F766E] to-[#2DD4BF] text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#0F766E]/40 border border-white/20"
        >
          <Wallet className="size-7" />
        </motion.div>

        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          Create Expenso Account
        </h1>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          Start managing your multi-bank accounts, cash flows, and investments with precision.
        </p>

        {/* Auth mode toggle tabs */}
        <div className="flex items-center justify-center gap-1.5 p-1 bg-white/[0.05] rounded-xl max-w-xs mx-auto mt-4 border border-white/[0.06]">
          <Link
            href="/login"
            className="flex-1 py-1.5 text-xs font-semibold rounded-lg text-slate-400 hover:text-white transition-all text-center"
          >
            Sign In
          </Link>
          <button
            type="button"
            className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-teal-500/20 text-[#2DD4BF] border border-teal-500/30 transition-all shadow-xs"
          >
            Create Account
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
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

        {/* Full Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-medium text-slate-300">
            Full Name
          </Label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
            <Input
              id="name"
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="h-10.5 pl-10 bg-slate-950/60 border-white/[0.1] text-white placeholder:text-slate-500 rounded-xl text-sm focus-visible:ring-1 focus-visible:ring-[#2DD4BF] focus-visible:border-[#2DD4BF] transition-all"
            />
          </div>
        </div>

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
              className="h-10.5 pl-10 bg-slate-950/60 border-white/[0.1] text-white placeholder:text-slate-500 rounded-xl text-sm focus-visible:ring-1 focus-visible:ring-[#2DD4BF] focus-visible:border-[#2DD4BF] transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-medium text-slate-300">
            Password (min. 8 characters)
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="h-10.5 pl-10 pr-10 bg-slate-950/60 border-white/[0.1] text-white placeholder:text-slate-500 rounded-xl text-sm focus-visible:ring-1 focus-visible:ring-[#2DD4BF] focus-visible:border-[#2DD4BF] transition-all"
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

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <Label htmlFor="confirm-password" className="text-xs font-medium text-slate-300">
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
            <Input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              className="h-10.5 pl-10 bg-slate-950/60 border-white/[0.1] text-white placeholder:text-slate-500 rounded-xl text-sm focus-visible:ring-1 focus-visible:ring-[#2DD4BF] focus-visible:border-[#2DD4BF] transition-all"
            />
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </motion.div>
        </div>

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-400 pt-1">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#2DD4BF] font-semibold hover:text-[#5EEAD4] transition-colors"
          >
            Sign in
          </Link>
        </div>
      </form>
    </motion.div>
  );
}
