"use client";

import * as React from "react";
import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const Sheet = Dialog.Root;
const SheetTrigger = Dialog.Trigger;
const SheetClose = Dialog.Close;
const SheetPortal = Dialog.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof Dialog.Overlay>,
  React.ComponentPropsWithoutRef<typeof Dialog.Overlay>
>(({ className, ...props }, ref) => (
  <Dialog.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-foreground/20 backdrop-blur-md",
      className,
    )}
    {...props}
  />
));

SheetOverlay.displayName = "SheetOverlay";

const sheetVariants = cva(
  "fixed z-50 flex flex-col gap-4 border border-border/80 bg-card/98 p-5 shadow-[0_28px_100px_rgba(15,23,42,0.15)] transition ease-out outline-none ring-1 ring-black/4 supports-[backdrop-filter]:bg-card/95 sm:p-6",
  {
    variants: {
      side: {
        top: "inset-x-4 top-4 rounded-[1.35rem]",
        bottom: "inset-x-4 bottom-4 rounded-[1.35rem]",
        left: "inset-y-4 left-4 h-[calc(100%-2rem)] w-[min(92vw,26rem)] rounded-[1.35rem]",
        right:
          "inset-y-4 right-4 h-[calc(100%-2rem)] w-[min(92vw,26rem)] rounded-[1.35rem]",
      },
    },
    defaultVariants: {
      side: "right",
    },
  },
);

type SheetContentProps = React.ComponentPropsWithoutRef<typeof Dialog.Content> &
  VariantProps<typeof sheetVariants>;

const SheetContent = React.forwardRef<
  React.ElementRef<typeof Dialog.Content>,
  SheetContentProps
>(({ className, children, side = "right", ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <Dialog.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      {children}
      <SheetClose
        className="absolute top-3.5 right-3.5 inline-flex size-8 items-center justify-center rounded-full border border-border/60 bg-background/85 text-muted-foreground shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
        aria-label="Close panel"
      >
        <X className="size-4" />
      </SheetClose>
    </Dialog.Content>
  </SheetPortal>
));

SheetContent.displayName = "SheetContent";

function SheetHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-2.5 text-left", className)}
      {...props}
    />
  );
}

function SheetFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mt-auto flex flex-col-reverse gap-2 border-t border-border/60 pt-4 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof Dialog.Title>,
  React.ComponentPropsWithoutRef<typeof Dialog.Title>
>(({ className, ...props }, ref) => (
  <Dialog.Title
    ref={ref}
    className={cn("pr-10 text-xl font-semibold tracking-tight", className)}
    {...props}
  />
));

SheetTitle.displayName = "SheetTitle";

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof Dialog.Description>,
  React.ComponentPropsWithoutRef<typeof Dialog.Description>
>(({ className, ...props }, ref) => (
  <Dialog.Description
    ref={ref}
    className={cn("max-w-2xl text-sm leading-6 text-muted-foreground", className)}
    {...props}
  />
));

SheetDescription.displayName = "SheetDescription";

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};
