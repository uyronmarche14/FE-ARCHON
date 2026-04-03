"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TabsContextValue = {
  activeValue: string;
  baseId: string;
  setActiveValue: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

type TabsProps = React.ComponentPropsWithoutRef<"div"> & {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  value?: string;
};

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, children, defaultValue, onValueChange, value, ...props }, ref) => {
    const generatedId = React.useId();
    const [uncontrolledValue, setUncontrolledValue] = React.useState(
      defaultValue ?? "",
    );
    const activeValue = value ?? uncontrolledValue;

    function setActiveValue(nextValue: string) {
      if (value === undefined) {
        setUncontrolledValue(nextValue);
      }

      onValueChange?.(nextValue);
    }

    return (
      <TabsContext.Provider
        value={{
          activeValue,
          baseId: generatedId,
          setActiveValue,
        }}
      >
        <div ref={ref} className={className} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  },
);

Tabs.displayName = "Tabs";

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="tablist"
    className={cn(
      "inline-flex min-h-10 items-center gap-1 rounded-full border border-border/70 bg-surface-subtle/80 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]",
      className,
    )}
    {...props}
  />
));

TabsList.displayName = "TabsList";

type TabsTriggerProps = React.ComponentPropsWithoutRef<"button"> & {
  value: string;
};

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, onClick, ...props }, ref) => {
    const context = React.useContext(TabsContext);

    if (!context) {
      throw new Error("TabsTrigger must be used within Tabs.");
    }

    const isActive = context.activeValue === value;

    return (
      <button
        ref={ref}
        id={`${context.baseId}-${value}-tab`}
        type="button"
        role="tab"
        aria-controls={`${context.baseId}-${value}-panel`}
        aria-selected={isActive}
        data-state={isActive ? "active" : "inactive"}
        tabIndex={isActive ? 0 : -1}
        className={cn(
          "inline-flex min-h-8 items-center justify-center rounded-full px-3 py-1 text-sm font-medium text-muted-foreground transition-[background-color,color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-[0_1px_2px_rgba(15,23,42,0.08)]",
          className,
        )}
        onClick={(event) => {
          onClick?.(event);

          if (!event.defaultPrevented) {
            context.setActiveValue(value);
          }
        }}
        {...props}
      />
    );
  },
);

TabsTrigger.displayName = "TabsTrigger";

type TabsContentProps = React.ComponentPropsWithoutRef<"div"> & {
  value: string;
};

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const context = React.useContext(TabsContext);

    if (!context) {
      throw new Error("TabsContent must be used within Tabs.");
    }

    const isActive = context.activeValue === value;

    if (!isActive) {
      return null;
    }

    return (
      <div
        ref={ref}
        id={`${context.baseId}-${value}-panel`}
        role="tabpanel"
        aria-labelledby={`${context.baseId}-${value}-tab`}
        data-state="active"
        className={cn("outline-none focus-visible:ring-2 focus-visible:ring-ring/40", className)}
        {...props}
      />
    );
  },
);

TabsContent.displayName = "TabsContent";

export { Tabs, TabsContent, TabsList, TabsTrigger };
