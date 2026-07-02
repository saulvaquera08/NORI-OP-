import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10.5px] font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-nori-terracota/10 text-nori-terracota border-nori-terracota/25",
        warning: "bg-nori-amber/10 text-nori-amber border-nori-amber/25",
        danger: "bg-nori-red/12 text-nori-red border-transparent",
        neutral: "bg-white/5 text-nori-text-muted border-white/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { Badge, badgeVariants };
