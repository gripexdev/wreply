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
        "text-foreground focus:border-primary/70 focus:ring-primary/20 h-12 w-full appearance-none rounded-2xl border border-white/10 bg-black/10 px-4 pr-12 text-sm transition outline-none focus:bg-black/20 focus:ring-2",
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2" />
  </div>
));

Select.displayName = "Select";
