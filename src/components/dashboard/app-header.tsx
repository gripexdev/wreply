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
    <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6 sm:pt-5 lg:px-8">
      <div className="panel-sheen flex items-center justify-between rounded-[30px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(11,17,31,0.88),rgba(8,12,21,0.92))] px-4 py-4 shadow-[0_24px_70px_-46px_rgba(0,0,0,0.95)] backdrop-blur-2xl sm:px-6">
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
            <p className="text-[0.72rem] tracking-[0.22em] text-white/38 uppercase">
              Workspace overview
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="font-display text-[1.35rem] font-semibold tracking-[-0.03em] text-white">
                {workspaceName}
              </h1>
              <Badge className="border-white/[0.08] bg-white/[0.04] text-white/72">
                Protected app
              </Badge>
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <p className="text-sm font-semibold tracking-[-0.01em] text-white">
              {user.name}
            </p>
            <p className="mt-1 text-[0.68rem] tracking-[0.2em] text-white/42 uppercase">
              {user.role}
            </p>
          </div>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
