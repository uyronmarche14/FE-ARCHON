import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase transition-colors",
  {
    variants: {
      variant: {
        default: "border-primary/15 bg-primary/10 text-primary",
        muted: "border-border bg-muted text-muted-foreground",
        outline: "border-border bg-background text-foreground",
        success: "border-emerald-200 bg-emerald-50 text-emerald-700",
        warning: "border-amber-200 bg-amber-50 text-amber-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
