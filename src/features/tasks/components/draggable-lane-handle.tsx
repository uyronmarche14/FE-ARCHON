"use client";

import type { ButtonHTMLAttributes } from "react";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

type DraggableLaneHandleProps = {
  ariaLabel: string;
  dataTestId?: string;
  dragButtonProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  isDragging?: boolean;
};

export function DraggableLaneHandle({
  ariaLabel,
  dataTestId,
  dragButtonProps,
  isDragging = false,
}: DraggableLaneHandleProps) {
  const { onPointerDownCapture, ...buttonProps } = dragButtonProps ?? {};

  return (
    <span className={cn("inline-flex", isDragging && "z-20")}>
      <button
        {...buttonProps}
        type="button"
        aria-label={ariaLabel}
        data-testid={dataTestId}
        className={cn(
          "inline-flex size-6 items-center justify-center rounded-lg border border-border/60 bg-background/90 text-muted-foreground shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors",
          "hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
          isDragging && "border-primary/20 text-primary",
        )}
        onPointerDownCapture={(event) => {
          event.stopPropagation();
          onPointerDownCapture?.(event);
        }}
      >
        <GripVertical className="size-3.5" />
      </button>
    </span>
  );
}
