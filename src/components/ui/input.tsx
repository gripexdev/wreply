import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "focus:border-primary/45 focus:ring-primary/10 h-12 w-full rounded-[20px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(19,27,44,0.88),rgba(10,15,25,0.94))] px-4 text-[0.95rem] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-200 outline-none placeholder:text-white/38 hover:border-white/[0.12] focus:bg-[linear-gradient(180deg,rgba(21,31,50,0.94),rgba(12,18,30,0.98))] focus:ring-4 disabled:cursor-not-allowed disabled:opacity-55",
      className,
    )}
    {...props}
  />
));

Input.displayName = "Input";
