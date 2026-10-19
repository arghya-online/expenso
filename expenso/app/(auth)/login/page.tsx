"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth/client";
import { Wallet, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <Card className="border-[#E2E8F0] shadow-sm bg-white">
      <CardHeader className="space-y-2 text-center pb-6">
        <div className="size-12 rounded-xl bg-[#0F766E] text-white flex items-center justify-center mx-auto mb-2 shadow-xs">
          <Wallet className="size-6" />
        </div>
        <CardTitle className="text-xl font-bold tracking-tight text-[#0F172A]">
          Welcome back to Expenso
        </CardTitle>
        <CardDescription className="text-xs text-[#64748B]">
          Enter your credentials to manage your accounts & transactions
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-[#0F172A]">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
              className="h-10 text-sm border-[#E2E8F0] focus-visible:ring-[#0F766E]"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-semibold text-[#0F172A]">
                Password
              </Label>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
              className="h-10 text-sm border-[#E2E8F0] focus-visible:ring-[#0F766E]"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-2">
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-[#0F766E] hover:bg-[#0d655e] text-white font-medium text-sm transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="size-4 ml-2" />
              </>
            )}
          </Button>

          <div className="text-center text-xs text-[#64748B]">
            Don&apos;t have an account yet?{" "}
            <Link
              href="/register"
              className="text-[#0F766E] font-semibold hover:underline"
            >
              Create account
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
