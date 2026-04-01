"use client";

import * as React from "react";
import { Tooltip } from "radix-ui";
import { cn } from "@/lib/utils";

const TooltipProvider = Tooltip.Provider;
const TooltipRoot = Tooltip.Root;
const TooltipTrigger = Tooltip.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof Tooltip.Content>,
  React.ComponentPropsWithoutRef<typeof Tooltip.Content>
>(({ className, sideOffset = 8, ...props }, ref) => (
  <Tooltip.Portal>
    <Tooltip.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 overflow-hidden rounded-xl border border-border/70 bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-[0_14px_38px_rgba(15,23,42,0.12)]",
        className,
      )}
      {...props}
    />
  </Tooltip.Portal>
));

TooltipContent.displayName = "TooltipContent";

export {
  TooltipContent,
  TooltipProvider,
  TooltipRoot as Tooltip,
  TooltipTrigger,
};
