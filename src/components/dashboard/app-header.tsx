"use client";

import { Menu } from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AppSessionUser } from "@/types/auth";

export function AppHeader({
  user,
  workspaceName,
  onOpenMobileNav,
}: Readonly<{
  user: AppSessionUser;
  workspaceName: string;
  onOpenMobileNav: () => void;
}>) {
  return (
    <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8">
      <div className="flex items-center justify-between rounded-[28px] border border-white/10 bg-black/20 px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onOpenMobileNav}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <p className="text-muted-foreground text-sm font-medium">
              Workspace
            </p>
            <div className="mt-1 flex items-center gap-3">
              <h1 className="font-display text-xl font-semibold text-white">
                {workspaceName}
              </h1>
              <Badge>Protected app</Badge>
            </div>
          </div>
        </div>
        <div className="hidden items-center gap-4 lg:flex">
          <div className="text-right">
            <p className="text-sm font-medium text-white">{user.name}</p>
            <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">
              {user.role}
            </p>
          </div>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
