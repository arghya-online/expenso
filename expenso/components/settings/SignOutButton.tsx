"use client";

import { signOut } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error("Sign out error:", e);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSignOut}
      className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 gap-1.5 h-9"
    >
      <LogOut className="size-3.5" />
      <span>Sign Out of Expenso</span>
    </Button>
  );
}
