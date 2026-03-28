"use client";

import { X } from "lucide-react";

import { AppHeader } from "@/components/dashboard/app-header";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Button } from "@/components/ui/button";
import { useMobileNav } from "@/hooks/use-mobile-nav";
import { cn } from "@/lib/utils";
import type { AppSessionUser } from "@/types/auth";

export function DashboardShell({
  user,
  workspace,
  children,
}: Readonly<{
  user: AppSessionUser;
  workspace: { name: string; slug: string } | null;
  children: React.ReactNode;
}>) {
  const mobileNav = useMobileNav();
  const workspaceName = workspace?.name ?? "Workspace";

  return (
    <div className="bg-background min-h-screen">
      <div className="relative mx-auto flex w-full max-w-[1600px] gap-4 lg:px-4">
        <div
          className={cn(
            "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition lg:hidden",
            mobileNav.isOpen ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          onClick={mobileNav.close}
        />
        <div
          className={cn(
            "fixed inset-y-4 left-4 z-50 w-[calc(100vw-2rem)] max-w-sm transition lg:hidden",
            mobileNav.isOpen
              ? "translate-x-0 opacity-100"
              : "-translate-x-[110%] opacity-0",
          )}
        >
          <div className="mb-3 flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={mobileNav.close}
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <AppSidebar
            user={user}
            workspaceName={workspaceName}
            onNavigate={mobileNav.close}
            className="h-[calc(100%-3.5rem)]"
          />
        </div>
        <div className="sticky top-4 hidden h-[calc(100vh-2rem)] w-80 shrink-0 lg:block">
          <AppSidebar
            user={user}
            workspaceName={workspaceName}
            className="h-full"
          />
        </div>
        <div className="flex min-h-screen flex-1 flex-col">
          <AppHeader
            user={user}
            workspaceName={workspaceName}
            onOpenMobileNav={mobileNav.open}
          />
          <main className="flex-1 px-4 pt-6 pb-10 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
