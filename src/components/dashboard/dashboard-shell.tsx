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
    <div className="bg-background relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.15),transparent_58%)]" />
      <div className="pointer-events-none absolute top-20 right-[-10rem] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.12),transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-10rem] left-[-8rem] h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.12),transparent_72%)] blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1560px] gap-6 px-4 py-4 sm:px-6 lg:px-7">
        <div
          className={cn(
            "fixed inset-0 z-40 bg-[rgba(2,4,12,0.78)] backdrop-blur-md transition lg:hidden",
            mobileNav.isOpen ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          onClick={mobileNav.close}
        />

        <div
          className={cn(
            "fixed inset-y-4 left-4 z-50 w-[calc(100vw-2rem)] max-w-[21rem] transition lg:hidden",
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

        <div className="sticky top-4 hidden h-[calc(100vh-2rem)] w-[17.5rem] shrink-0 lg:block">
          <AppSidebar
            user={user}
            workspaceName={workspaceName}
            className="h-full"
          />
        </div>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <AppHeader
            user={user}
            workspaceName={workspaceName}
            onOpenMobileNav={mobileNav.open}
          />
          <main className="mx-auto flex w-full max-w-[1280px] flex-1 px-4 pt-10 pb-14 sm:px-6 lg:px-8">
            <div className="w-full">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
