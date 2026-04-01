"use client";

import * as React from "react";
import { HoverCard } from "radix-ui";
import { cn } from "@/lib/utils";

const HoverCardRoot = HoverCard.Root;
const HoverCardTrigger = HoverCard.Trigger;

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCard.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCard.Content>
>(({ className, align = "start", sideOffset = 12, ...props }, ref) => (
  <HoverCard.Portal>
    <HoverCard.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-80 rounded-2xl border border-border/70 bg-card p-4 text-card-foreground shadow-[0_18px_50px_rgba(15,23,42,0.14)] outline-none",
        className,
      )}
      {...props}
    />
  </HoverCard.Portal>
));

HoverCardContent.displayName = "HoverCardContent";

export {
  HoverCardContent,
  HoverCardRoot as HoverCard,
  HoverCardTrigger,
};
