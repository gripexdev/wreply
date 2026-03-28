import Link from "next/link";

import { analyticsRangeOptions } from "@/config/analytics";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AnalyticsDateRange } from "@/types/analytics";

export function AnalyticsRangeSelector({
  activeRange,
}: Readonly<{
  activeRange: AnalyticsDateRange;
}>) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {analyticsRangeOptions.map((option) => (
        <Link
          key={option.value}
          href={
            option.value === "30d"
              ? "/dashboard/analytics"
              : `/dashboard/analytics?range=${option.value}`
          }
          className={buttonStyles({
            variant: activeRange === option.value ? "primary" : "secondary",
            className: cn(
              "h-10 px-4 text-sm",
              activeRange === option.value
                ? "shadow-[0_18px_45px_-20px_rgba(30,181,142,0.95)]"
                : "",
            ),
          })}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}
