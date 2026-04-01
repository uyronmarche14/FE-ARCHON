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
        success: "border-success/20 bg-success/10 text-success",
        warning: "border-warning/20 bg-warning/10 text-warning",
        danger: "border-danger/20 bg-danger/10 text-danger",
        todo: "border-todo/20 bg-todo/10 text-todo",
        progress: "border-in-progress/20 bg-in-progress/10 text-in-progress",
        done: "border-done/20 bg-done/10 text-done",
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
