import * as React from "react";

import { cn } from "@/lib/utils";

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "panel-sheen group/card bg-card relative overflow-hidden rounded-[30px] border border-white/[0.08] shadow-[0_32px_90px_-52px_rgba(0,0,0,0.96),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-2xl transition duration-300 ease-out hover:-translate-y-[2px] hover:border-white/[0.12] hover:shadow-[0_38px_110px_-56px_rgba(0,0,0,0.98),0_12px_48px_-38px_rgba(68,216,180,0.25)]",
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
        "text-muted-foreground text-[0.95rem] leading-6",
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
