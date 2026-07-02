import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-md border border-nori-border-strong bg-nori-input px-3 py-1 text-[13px] text-nori-text placeholder:text-nori-text-dim outline-none transition-colors focus-visible:border-nori-terracota/60 focus-visible:ring-1 focus-visible:ring-nori-terracota/40 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Input };
