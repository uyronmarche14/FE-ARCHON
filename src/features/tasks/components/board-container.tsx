"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

type BoardContainerProps = {
  desktopChildren: ReactNode;
  mobileChildren: ReactNode;
};

export function BoardContainer({
  desktopChildren,
  mobileChildren,
}: BoardContainerProps) {
  const isDesktop = useIsDesktopViewport();

  return (
    <section
      className="rounded-[1.2rem] border border-border/70 bg-linear-to-b from-background via-background to-surface-subtle/45 p-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-3"
      aria-label="Task board"
    >
      {isDesktop ? (
        <ScrollArea className="w-full" data-testid="board-lanes-scroll-area">
          <div className="flex min-w-max gap-3 pb-1">{desktopChildren}</div>
        </ScrollArea>
      ) : (
        <div className="grid gap-2.5" data-testid="mobile-board-lane-stack">
          {mobileChildren}
        </div>
      )}
    </section>
  );
}

function useIsDesktopViewport() {
  const [isDesktop, setIsDesktop] = useState(getIsDesktopViewport);

  useEffect(() => {
    const mediaQuery =
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(min-width: 768px)")
        : null;

    function updateViewport() {
      setIsDesktop(getIsDesktopViewport());
    }

    updateViewport();

    if (mediaQuery) {
      if (typeof mediaQuery.addEventListener === "function") {
        mediaQuery.addEventListener("change", updateViewport);
      } else {
        mediaQuery.addListener(updateViewport);
      }
    }

    window.addEventListener("resize", updateViewport);

    return () => {
      if (mediaQuery) {
        if (typeof mediaQuery.removeEventListener === "function") {
          mediaQuery.removeEventListener("change", updateViewport);
        } else {
          mediaQuery.removeListener(updateViewport);
        }
      }

      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  return isDesktop;
}

function getIsDesktopViewport() {
  if (typeof window === "undefined") {
    return true;
  }

  if (typeof window.matchMedia === "function") {
    return window.matchMedia("(min-width: 768px)").matches;
  }

  return window.innerWidth >= 768;
}
