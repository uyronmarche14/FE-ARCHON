"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type AccordionType = "single" | "multiple";

type AccordionContextValue = {
  openValues: string[];
  toggleValue: (value: string) => void;
};

const AccordionContext = React.createContext<AccordionContextValue | null>(null);
const AccordionItemContext = React.createContext<{ value: string } | null>(null);

type AccordionProps = React.HTMLAttributes<HTMLDivElement> & {
  defaultValue?: string | string[];
  type?: AccordionType;
};

function normalizeAccordionValue(
  value: AccordionProps["defaultValue"],
  type: AccordionType,
) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string" && value.length > 0) {
    return [value];
  }

  return type === "single" ? [] : [];
}

function Accordion({
  children,
  className,
  defaultValue,
  type = "single",
  ...props
}: AccordionProps) {
  const [openValues, setOpenValues] = React.useState<string[]>(() =>
    normalizeAccordionValue(defaultValue, type),
  );

  const value = React.useMemo<AccordionContextValue>(
    () => ({
      openValues,
      toggleValue(nextValue: string) {
        setOpenValues((currentValues) => {
          const isOpen = currentValues.includes(nextValue);

          if (type === "single") {
            return isOpen ? [] : [nextValue];
          }

          if (isOpen) {
            return currentValues.filter((value) => value !== nextValue);
          }

          return [...currentValues, nextValue];
        });
      },
    }),
    [openValues, type],
  );

  return (
    <AccordionContext.Provider value={value}>
      <div className={className} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

type AccordionItemProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string;
};

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ children, className, value, ...props }, ref) => (
    <AccordionItemContext.Provider value={{ value }}>
      <div
        ref={ref}
        className={cn(
          "overflow-hidden rounded-[1rem] border border-border/45 bg-card/72",
          className,
        )}
        data-value={value}
        {...props}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  ),
);

AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, className, onClick, type, ...props }, ref) => {
  const accordion = React.useContext(AccordionContext);
  const item = React.useContext(AccordionItemContext);

  if (!accordion || !item) {
    throw new Error("AccordionTrigger must be used within Accordion and AccordionItem.");
  }

  const isOpen = accordion.openValues.includes(item.value);

  return (
    <div className="flex">
      <button
        ref={ref}
        type={type ?? "button"}
        className={cn(
          "group/accordion flex flex-1 items-center justify-between gap-3 px-3.5 py-3 text-left transition-colors hover:bg-surface-subtle/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
          className,
        )}
        data-state={isOpen ? "open" : "closed"}
        aria-expanded={isOpen}
        onClick={(event) => {
          accordion.toggleValue(item.value);
          onClick?.(event);
        }}
        {...props}
      >
        <span className="min-w-0 flex-1">{children}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>
    </div>
  );
});

AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  const accordion = React.useContext(AccordionContext);
  const item = React.useContext(AccordionItemContext);

  if (!accordion || !item) {
    throw new Error("AccordionContent must be used within Accordion and AccordionItem.");
  }

  const isOpen = accordion.openValues.includes(item.value);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn("overflow-hidden border-t border-border/45", className)}
      data-state="open"
      {...props}
    >
      <div className="px-3.5 py-3">{children}</div>
    </div>
  );
});

AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
