"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SignOutButton({
  className,
}: Readonly<{
  className?: string;
}>) {
  return (
    <Button
      variant="secondary"
      onClick={() => signOut({ callbackUrl: "/" })}
      className={cn("justify-start rounded-[20px] px-4", className)}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  );
}
