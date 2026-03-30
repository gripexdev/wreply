import * as React from "react";

import { cn } from "@/lib/utils";

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "panel-sheen aurora-panel group/card bg-card relative overflow-hidden rounded-[30px] border border-white/[0.08] shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_22px_72px_-54px_rgba(0,0,0,0.88)] backdrop-blur-2xl transition duration-300 ease-out hover:-translate-y-[1px] hover:scale-[1.005] hover:border-white/[0.12] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_32px_90px_-58px_rgba(0,0,0,0.92),0_0_36px_-22px_rgba(34,211,238,0.16),0_0_44px_-26px_rgba(168,85,247,0.14)]",
      className,
    )}
    {...props}
  />
));

Card.displayName = "Card";

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-2 p-6 sm:p-7", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "font-display text-[1.35rem] font-semibold tracking-[-0.03em] text-white",
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-muted-foreground text-[0.82rem] leading-5",
        className,
      )}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 pt-0 sm:p-7 sm:pt-0", className)} {...props} />
  );
}
