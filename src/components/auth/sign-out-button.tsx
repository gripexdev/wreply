"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      variant="ghost"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="justify-start rounded-2xl border border-white/10 bg-white/5 px-4"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  );
}
