import { ChevronDown } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        "focus:border-primary/45 focus:ring-primary/10 h-12 w-full appearance-none rounded-[20px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(19,27,44,0.88),rgba(10,15,25,0.94))] px-4 pr-12 text-[0.95rem] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-200 outline-none hover:border-white/[0.12] focus:bg-[linear-gradient(180deg,rgba(21,31,50,0.94),rgba(12,18,30,0.98))] focus:ring-4 disabled:cursor-not-allowed disabled:opacity-55",
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-white/42" />
  </div>
));

Select.displayName = "Select";
