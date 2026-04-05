"use client";

import type { ChangeEventHandler, ReactNode } from "react";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function TaskDetailSection({
  children,
  description,
  eyebrow,
  first = false,
  compact = false,
  title,
}: {
  children: ReactNode;
  description: string;
  eyebrow: string;
  first?: boolean;
  compact?: boolean;
  title: string;
}) {
  return (
    <section
      className={cn(
        compact ? "space-y-2.5" : "space-y-3",
        !first &&
          (compact
            ? "border-t border-border/40 pt-3.5"
            : "border-t border-border/45 pt-4"),
      )}
    >
      <div className="space-y-1">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-muted-foreground/80">
          {eyebrow}
        </p>
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="max-w-2xl text-sm leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      {children}
    </section>
  );
}

export function TaskDetailSurface({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[0.95rem] bg-[linear-gradient(145deg,color-mix(in_oklab,var(--primary)_2%,white),color-mix(in_oklab,var(--background)_93%,white))] px-3 py-2.5 ring-1 ring-border/55 shadow-[0_14px_24px_-26px_rgba(15,23,42,0.34)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TaskCompactRailPanel({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="space-y-2 rounded-[0.95rem] bg-[linear-gradient(180deg,color-mix(in_oklab,var(--primary)_3%,white),color-mix(in_oklab,var(--surface-subtle)_95%,white))] px-3 py-3 ring-1 ring-border/55 shadow-[0_14px_24px_-26px_rgba(15,23,42,0.34)]">
      <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-muted-foreground/80">
        {title}
      </p>
      {children}
    </section>
  );
}

export function TaskRailField({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

export function TaskCompactValue({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[0.9rem] bg-[linear-gradient(145deg,color-mix(in_oklab,var(--primary)_2%,white),color-mix(in_oklab,var(--background)_93%,white))] px-3 py-2.5 ring-1 ring-border/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
      <p className="text-sm text-foreground/88">{children}</p>
    </div>
  );
}

export function CompactTaskSelect({
  ariaLabel,
  children,
  disabled = false,
  onChange,
  value,
}: {
  ariaLabel: string;
  children: ReactNode;
  disabled?: boolean;
  onChange: ChangeEventHandler<HTMLSelectElement>;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <Select
        aria-label={ariaLabel}
        className="h-9 rounded-[0.9rem] border-border/55 bg-[linear-gradient(145deg,color-mix(in_oklab,var(--primary)_2%,white),color-mix(in_oklab,var(--background)_93%,white))] shadow-none"
        value={value}
        onChange={onChange}
        disabled={disabled}
      >
        {children}
      </Select>
    </div>
  );
}
