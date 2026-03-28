import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "text-foreground placeholder:text-muted-foreground/80 focus:border-primary/70 focus:ring-primary/20 flex h-12 w-full rounded-2xl border border-white/10 bg-black/10 px-4 text-sm transition outline-none focus:bg-black/20 focus:ring-2",
      className,
    )}
    {...props}
  />
));

Input.displayName = "Input";
