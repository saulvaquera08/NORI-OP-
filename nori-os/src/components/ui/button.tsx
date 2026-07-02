import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-[12.5px] font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-nori-terracota/60",
  {
    variants: {
      variant: {
        default: "bg-nori-terracota text-nori-terracota-deep hover:bg-nori-terracota-light",
        outline:
          "bg-nori-card text-nori-text border border-nori-border-strong hover:bg-white/5",
        ghost: "text-nori-text-muted hover:text-nori-text hover:bg-white/5",
        subtle:
          "bg-nori-terracota/10 text-nori-terracota border border-nori-terracota/25 hover:bg-nori-terracota/15",
        destructive: "bg-nori-red/15 text-nori-red border border-nori-red/30 hover:bg-nori-red/20",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-5",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
