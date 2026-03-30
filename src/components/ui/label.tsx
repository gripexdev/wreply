import * as React from "react";

import { cn } from "@/lib/utils";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "text-[0.92rem] font-medium tracking-[-0.01em] text-white/88",
        className,
      )}
      {...props}
    />
  );
}
