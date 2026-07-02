import * as React from "react";

import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "rounded-[14px] border border-nori-border bg-nori-card",
        className
      )}
      {...props}
    />
  );
}

export { Card };
