"use client";

import * as React from "react";
import { Slot } from "radix-ui";
import { Menu, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SidebarMode = "mobile" | "tablet" | "desktop";

type SidebarContextValue = {
  mode: SidebarMode;
  open: boolean;
  mobileOpen: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
  closeMobileSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider.");
  }

  return context;
}

function SidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setMode] = React.useState<SidebarMode>("desktop");
  const [open, setOpen] = React.useState(true);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const previousModeRef = React.useRef<SidebarMode>("desktop");

  React.useEffect(() => {
    const tabletQuery = window.matchMedia("(min-width: 768px)");
    const desktopQuery = window.matchMedia("(min-width: 1024px)");

    const syncMode = () => {
      const nextMode = desktopQuery.matches
        ? "desktop"
        : tabletQuery.matches
          ? "tablet"
          : "mobile";

      setMode(nextMode);

      if (previousModeRef.current !== nextMode) {
        setMobileOpen(false);
        setOpen(nextMode === "desktop");
        previousModeRef.current = nextMode;
      }
    };

    syncMode();

    tabletQuery.addEventListener("change", syncMode);
    desktopQuery.addEventListener("change", syncMode);

    return () => {
      tabletQuery.removeEventListener("change", syncMode);
      desktopQuery.removeEventListener("change", syncMode);
    };
  }, []);

  const toggleSidebar = React.useCallback(() => {
    if (mode === "mobile") {
      setMobileOpen((currentValue) => !currentValue);
      return;
    }

    setOpen((currentValue) => !currentValue);
  }, [mode]);

  const closeMobileSidebar = React.useCallback(() => {
    setMobileOpen(false);
  }, []);

  const contextValue = React.useMemo(
    () => ({
      mode,
      open,
      mobileOpen,
      setOpen,
      setMobileOpen,
      toggleSidebar,
      closeMobileSidebar,
    }),
    [closeMobileSidebar, mobileOpen, mode, open, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
}

function Sidebar({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"aside">) {
  const { closeMobileSidebar, mode, mobileOpen, open } = useSidebar();
  const state = open ? "expanded" : "collapsed";

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-foreground/35 backdrop-blur-sm md:hidden"
          onClick={closeMobileSidebar}
        />
      ) : null}

      <div
        className={cn(
          "relative hidden shrink-0 md:block",
          open ? "md:w-[16rem]" : "md:w-[4rem]",
        )}
      />

      <aside
        data-slot="sidebar"
        data-mode={mode}
        data-state={mode === "mobile" ? "expanded" : state}
        className={cn(
          "group/sidebar fixed inset-y-0 left-0 z-50 flex w-[76vw] max-w-[16rem] flex-col border-r border-sidebar-border bg-linear-to-b from-sidebar via-sidebar to-background text-sidebar-foreground transition-[transform,width] duration-200 ease-out md:max-w-none md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          open ? "md:w-[16rem]" : "md:w-[4rem]",
          className,
        )}
        {...props}
      >
        {children}
      </aside>
    </>
  );
}

function SidebarHeader({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn(
        "flex flex-col gap-3 px-4 py-4 group-data-[state=collapsed]/sidebar:px-2",
        className,
      )}
      {...props}
    />
  );
}

function SidebarContent({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-2 group-data-[state=collapsed]/sidebar:px-2",
        className,
      )}
      {...props}
    />
  );
}

function SidebarFooter({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn(
        "mt-auto px-4 py-4 group-data-[state=collapsed]/sidebar:px-2",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroup({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      className={cn("space-y-1", className)}
      {...props}
    />
  );
}

function SidebarGroupLabel({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"p">) {
  return (
    <p
      data-slot="sidebar-group-label"
      className={cn(
        "mb-2 px-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase group-data-[state=collapsed]/sidebar:hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenu({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      className={cn("space-y-0.5", className)}
      {...props}
    />
  );
}

function SidebarMenuItem({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      className={cn("list-none", className)}
      {...props}
    />
  );
}

type SidebarMenuButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string;
};

function SidebarMenuButton({
  asChild = false,
  className,
  isActive = false,
  tooltip,
  ...props
}: SidebarMenuButtonProps) {
  const { mode, open } = useSidebar();
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="sidebar-menu-button"
      data-active={isActive}
      title={!open && mode !== "mobile" ? tooltip : undefined}
      className={cn(
        "flex w-full items-center gap-3 rounded-[0.95rem] border border-transparent px-3 py-2 text-left text-[14px] font-medium text-muted-foreground transition-all duration-200 hover:border-border/60 hover:bg-background/90 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[active=true]:border-primary/10 data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:font-semibold data-[active=true]:shadow-[0_1px_2px_rgba(15,23,42,0.04)] group-data-[state=collapsed]/sidebar:mx-auto group-data-[state=collapsed]/sidebar:size-10 group-data-[state=collapsed]/sidebar:justify-center group-data-[state=collapsed]/sidebar:rounded-[0.95rem] group-data-[state=collapsed]/sidebar:px-0 [&_svg]:shrink-0 [&_svg]:size-[1.1rem]",
        className,
      )}
      {...props}
    />
  );
}

function SidebarInset({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="sidebar-inset"
      className={cn(
        "flex min-h-screen min-w-0 flex-1 flex-col bg-linear-to-b from-shell-inset via-background to-background",
        className,
      )}
      {...props}
    />
  );
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { mode, open, toggleSidebar } = useSidebar();

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      className={cn("rounded-[0.95rem] bg-card/85 shadow-none", className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      aria-label={
        mode === "mobile"
          ? "Toggle navigation"
          : open
            ? "Collapse navigation"
            : "Expand navigation"
      }
      {...props}
    >
      {mode === "mobile" ? (
        <Menu className="size-4" />
      ) : (
        <PanelLeft className="size-4" />
      )}
    </Button>
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
};
