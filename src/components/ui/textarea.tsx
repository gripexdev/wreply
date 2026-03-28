import * as React from "react";

import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "text-foreground placeholder:text-muted-foreground/80 focus:border-primary/70 focus:ring-primary/20 flex min-h-32 w-full rounded-[22px] border border-white/10 bg-black/10 px-4 py-3 text-sm leading-6 transition outline-none focus:bg-black/20 focus:ring-2",
      className,
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";
