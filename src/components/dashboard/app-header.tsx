"use client";

import { Menu } from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AppSessionUser } from "@/types/auth";

function getRoleLabel(role: AppSessionUser["role"]) {
  switch (role) {
    case "OWNER":
      return "Owner";
    case "ADMIN":
      return "Admin";
    default:
      return "Member";
  }
}

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
      <div className="panel-sheen flex items-center justify-between rounded-[30px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(10,15,27,0.9),rgba(8,11,19,0.94))] px-4 py-4 backdrop-blur-2xl sm:px-6">
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
            <p className="text-[0.64rem] tracking-[0.22em] text-white/34 uppercase">
              Business
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h1 className="font-display text-[1.45rem] font-semibold tracking-[-0.04em] text-white">
                {workspaceName}
              </h1>
              <Badge className="border-white/[0.08] bg-white/[0.035] text-white/62">
                {getRoleLabel(user.role)}
              </Badge>
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.025] px-4 py-2.5 text-right">
            <p className="text-sm font-semibold tracking-[-0.01em] text-white">
              {user.name}
            </p>
            <p className="mt-1 text-[0.68rem] tracking-[0.2em] text-white/34 uppercase">
              {user.email}
            </p>
          </div>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
