import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

type MockChildrenProps = {
  children?: import("react").ReactNode;
  className?: string;
  [key: string]: unknown;
};

type MockTriggerProps = MockChildrenProps & {
  asChild?: boolean;
};

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches:
      query === "(min-width: 768px)" || query === "(min-width: 1024px)",
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: ResizeObserverMock,
});

Object.defineProperty(window, "PointerEvent", {
  writable: true,
  value: MouseEvent,
});

Element.prototype.scrollIntoView = vi.fn();

vi.mock("@/components/ui/scroll-area", async () => {
  const React = await import("react");

  function ScrollArea({ children, ...props }: MockChildrenProps) {
    return React.createElement("div", props, children);
  }

  function ScrollBar(props: MockChildrenProps) {
    return React.createElement("div", props);
  }

  return {
    ScrollArea,
    ScrollBar,
  };
});

vi.mock("@/components/ui/tooltip", async () => {
  const React = await import("react");

  function TooltipProvider({ children }: MockChildrenProps) {
    return React.createElement(React.Fragment, null, children);
  }

  function Tooltip({ children }: MockChildrenProps) {
    return React.createElement(React.Fragment, null, children);
  }

  function TooltipTrigger({ asChild, children }: MockTriggerProps) {
    if (asChild && React.isValidElement(children)) {
      return children;
    }

    return React.createElement("button", { type: "button" }, children);
  }

  function TooltipContent({ children, ...props }: MockChildrenProps) {
    return React.createElement("div", props, children);
  }

  return {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  };
});

vi.mock("@/components/ui/dropdown-menu", async () => {
  const React = await import("react");

  function DropdownMenu({ children }: MockChildrenProps) {
    return React.createElement(React.Fragment, null, children);
  }

  function DropdownMenuTrigger({ asChild, children }: MockTriggerProps) {
    if (asChild && React.isValidElement(children)) {
      return children;
    }

    return React.createElement("button", { type: "button" }, children);
  }

  function DropdownMenuContent({ children, ...props }: MockChildrenProps) {
    return React.createElement("div", props, children);
  }

  function DropdownMenuItem({
    children,
    onSelect,
    ...props
  }: MockChildrenProps & {
    onSelect?: (event: { preventDefault: () => void }) => void;
  }) {
    return React.createElement(
      "button",
      {
        type: "button",
        onClick: () => onSelect?.({ preventDefault() {} }),
        ...props,
      },
      children,
    );
  }

  function DropdownMenuLabel({ children, ...props }: MockChildrenProps) {
    return React.createElement("div", props, children);
  }

  function DropdownMenuSeparator(props: MockChildrenProps) {
    return React.createElement("hr", props);
  }

  return {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup: DropdownMenu,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal: DropdownMenu,
    DropdownMenuRadioGroup: DropdownMenu,
    DropdownMenuRadioItem: DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut: ({ children, ...props }: MockChildrenProps) =>
      React.createElement("span", props, children),
    DropdownMenuSub: DropdownMenu,
    DropdownMenuSubContent: DropdownMenuContent,
    DropdownMenuSubTrigger: DropdownMenuTrigger,
    DropdownMenuTrigger,
  };
});

vi.mock("@/components/ui/sheet", async () => {
  const React = await import("react");

  type SheetContextValue = {
    descriptionId: string;
    onOpenChange?: (open: boolean) => void;
    open: boolean;
    titleId: string;
  };

  const SheetContext = React.createContext<SheetContextValue | null>(null);

  function Sheet({
    children,
    onOpenChange,
    open = false,
  }: MockChildrenProps & {
    onOpenChange?: (open: boolean) => void;
    open?: boolean;
  }) {
    const titleId = React.useId();
    const descriptionId = React.useId();

    return React.createElement(
      SheetContext.Provider,
      {
        value: {
          descriptionId,
          onOpenChange,
          open,
          titleId,
        },
      },
      children,
    );
  }

  function SheetTrigger({ asChild, children }: MockTriggerProps) {
    const context = React.useContext(SheetContext);

    if (asChild && React.isValidElement(children)) {
      const childElement = children as import("react").ReactElement<{
        onClick?: () => void;
      }>;

      return React.cloneElement(childElement, {
        onClick: () => {
          childElement.props.onClick?.();
          context?.onOpenChange?.(true);
        },
      });
    }

    return React.createElement(
      "button",
      {
        type: "button",
        onClick: () => context?.onOpenChange?.(true),
      },
      children,
    );
  }

  function SheetContent({ children, ...props }: MockChildrenProps) {
    const context = React.useContext(SheetContext);

    if (!context?.open) {
      return null;
    }

    return React.createElement(
      "div",
      {
        role: "dialog",
        "aria-describedby": context.descriptionId,
        "aria-labelledby": context.titleId,
        "aria-modal": "true",
        ...props,
      },
      children,
    );
  }

  function SheetHeader({ children, ...props }: MockChildrenProps) {
    return React.createElement("div", props, children);
  }

  function SheetFooter({ children, ...props }: MockChildrenProps) {
    return React.createElement("div", props, children);
  }

  function SheetTitle({ children, ...props }: MockChildrenProps) {
    const context = React.useContext(SheetContext);

    return React.createElement(
      "h2",
      {
        id: context?.titleId,
        ...props,
      },
      children,
    );
  }

  function SheetDescription({ children, ...props }: MockChildrenProps) {
    const context = React.useContext(SheetContext);

    return React.createElement(
      "p",
      {
        id: context?.descriptionId,
        ...props,
      },
      children,
    );
  }

  function SheetClose({ children, ...props }: MockChildrenProps) {
    const context = React.useContext(SheetContext);

    return React.createElement(
      "button",
      {
        type: "button",
        onClick: () => context?.onOpenChange?.(false),
        ...props,
      },
      children,
    );
  }

  return {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetOverlay: ({ children, ...props }: MockChildrenProps) =>
      React.createElement("div", props, children),
    SheetPortal: ({ children }: MockChildrenProps) =>
      React.createElement(React.Fragment, null, children),
    SheetTitle,
    SheetTrigger,
  };
});

afterEach(() => {
  cleanup();
});
