"use client";

import * as React from "react";
import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const DialogRoot = Dialog.Root;
const DialogTrigger = Dialog.Trigger;
const DialogPortal = Dialog.Portal;
const DialogClose = Dialog.Close;

const DialogOverlay = React.forwardRef<
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

DialogOverlay.displayName = "DialogOverlay";

const DialogContent = React.forwardRef<
  React.ElementRef<typeof Dialog.Content>,
  React.ComponentPropsWithoutRef<typeof Dialog.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <Dialog.Content
      ref={ref}
      className={cn(
        "fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-[1.35rem] border border-border/80 bg-card/98 p-5 shadow-[0_28px_100px_rgba(15,23,42,0.14)] outline-none ring-1 ring-black/4 supports-[backdrop-filter]:bg-card/95 sm:p-6",
        className,
      )}
      {...props}
    >
      {children}
      <DialogClose
        className="absolute top-3.5 right-3.5 inline-flex size-8 items-center justify-center rounded-full border border-border/60 bg-background/85 text-muted-foreground shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
        aria-label="Close dialog"
      >
        <X className="size-4" />
      </DialogClose>
    </Dialog.Content>
  </DialogPortal>
));

DialogContent.displayName = "DialogContent";

function DialogHeader({
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

function DialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 border-t border-border/60 pt-4 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof Dialog.Title>,
  React.ComponentPropsWithoutRef<typeof Dialog.Title>
>(({ className, ...props }, ref) => (
  <Dialog.Title
    ref={ref}
    className={cn("pr-10 text-xl font-semibold tracking-tight", className)}
    {...props}
  />
));

DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof Dialog.Description>,
  React.ComponentPropsWithoutRef<typeof Dialog.Description>
>(({ className, ...props }, ref) => (
  <Dialog.Description
    ref={ref}
    className={cn("max-w-2xl text-sm leading-6 text-muted-foreground", className)}
    {...props}
  />
));

DialogDescription.displayName = "DialogDescription";

export {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogRoot as Dialog,
  DialogTitle,
  DialogTrigger,
};
