import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border border-transparent font-medium leading-none tracking-normal whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        default:
          "bg-primary/[0.08] text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]",
        muted:
          "bg-muted/80 text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]",
        outline:
          "border-border/80 bg-background/90 text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        success:
          "bg-success/[0.12] text-success shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
        warning:
          "bg-warning/[0.12] text-warning shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
        danger:
          "bg-danger/[0.11] text-danger shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
        todo:
          "bg-todo/[0.12] text-todo shadow-[inset_0_1px_0_rgba(255,255,255,0.66)]",
        progress:
          "bg-in-progress/[0.12] text-in-progress shadow-[inset_0_1px_0_rgba(255,255,255,0.66)]",
        done:
          "bg-done/[0.12] text-done shadow-[inset_0_1px_0_rgba(255,255,255,0.66)]",
      },
      size: {
        xs: "min-h-5 px-2 py-0.5 text-[10px] [&_svg:not([class*='size-'])]:size-3",
        sm: "min-h-6 px-2.5 py-1 text-[11px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  },
);

function Badge({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
