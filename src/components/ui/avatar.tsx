"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

function Avatar({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar"
      className={cn(
        "relative inline-flex size-10 shrink-0 overflow-hidden rounded-2xl border border-border/70 bg-surface-subtle text-foreground",
        className,
      )}
      {...props}
    />
  );
}

type AvatarImageProps = Omit<React.ComponentProps<typeof Image>, "fill" | "alt"> & {
  alt?: string;
};

function AvatarImage({
  alt = "",
  className,
  sizes = "40px",
  ...props
}: AvatarImageProps) {
  return (
    <Image
      data-slot="avatar-image"
      alt={alt}
      fill
      sizes={sizes}
      className={cn("object-cover", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-fallback"
      className={cn(
        "grid h-full w-full place-items-center bg-primary/10 text-sm font-semibold text-primary",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarFallback, AvatarImage };
