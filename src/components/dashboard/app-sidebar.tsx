"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Brand } from "@/components/common/brand";
import { dashboardNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils";
import type { AppSessionUser } from "@/types/auth";

export function AppSidebar({
  user,
  workspaceName,
  onNavigate,
  className,
}: Readonly<{
  user: AppSessionUser;
  workspaceName: string;
  onNavigate?: () => void;
  className?: string;
}>) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "surface-glow relative flex h-full flex-col rounded-[34px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(10,15,27,0.96),rgba(7,11,20,0.94))] p-4 shadow-[0_40px_120px_-64px_rgba(0,0,0,0.92)] backdrop-blur-2xl",
        className,
      )}
    >
      <Brand />

      <div className="mt-6 rounded-[28px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(17,24,40,0.9),rgba(10,15,26,0.94))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[0.68rem] tracking-[0.24em] text-white/42 uppercase">
            Active workspace
          </p>
          <span className="border-primary/15 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[0.62rem] font-semibold tracking-[0.18em] uppercase">
            <span className="bg-primary h-1.5 w-1.5 rounded-full" />
            Secure
          </span>
        </div>
        <p className="font-display mt-3 text-[1.35rem] font-semibold tracking-[-0.03em] text-white">
          {workspaceName}
        </p>
        <p className="mt-2 text-sm text-white/46">{user.email}</p>
      </div>

      <nav className="mt-6 space-y-1.5">
        {dashboardNavigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              pathname.startsWith(`${item.href}/`));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-[22px] border px-3 py-3.5 transition-all duration-200",
                isActive
                  ? "border-white/[0.1] bg-[linear-gradient(180deg,rgba(17,27,43,0.98),rgba(10,16,28,0.96))] shadow-[0_22px_55px_-40px_rgba(68,216,180,0.7)]"
                  : "border-transparent text-white/66 hover:border-white/[0.08] hover:bg-white/[0.035] hover:text-white",
              )}
            >
              <span
                className={cn(
                  "absolute inset-y-3 left-1 hidden w-px rounded-full bg-[linear-gradient(180deg,rgba(99,232,197,0.15),rgba(47,143,255,0.95),rgba(99,232,197,0.15))] lg:block",
                  isActive ? "opacity-100" : "opacity-0",
                )}
              />
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-[16px] border transition-all duration-200",
                  isActive
                    ? "border-primary/15 bg-primary/10 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                    : "border-white/[0.08] bg-white/[0.03] text-white/60 group-hover:border-white/[0.12] group-hover:text-white/88",
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold tracking-[-0.01em] text-white">
                  {item.title}
                </span>
                <span className="mt-1 block text-xs leading-5 text-white/42">
                  {item.description}
                </span>
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4 pt-4">
        <div className="rounded-[26px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(17,24,40,0.9),rgba(10,15,26,0.94))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="flex items-center gap-3">
            <span className="border-primary/15 bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-[16px] border">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[0.68rem] tracking-[0.22em] text-white/42 uppercase">
                Automation layer
              </p>
              <p className="mt-1 text-sm font-semibold tracking-[-0.01em] text-white">
                Product system is live
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-white/54">
            Shared shell, protected flows, rules, WhatsApp, logs, and analytics
            now sit inside one visual system.
          </p>
        </div>
        <SignOutButton className="w-full" />
      </div>
    </aside>
  );
}
