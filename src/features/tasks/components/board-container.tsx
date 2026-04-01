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
    <section className="space-y-3" aria-label="Task board">
      {isDesktop ? (
        <ScrollArea className="w-full" data-testid="board-lanes-scroll-area">
          <div className="flex min-w-max gap-4 pb-3">{desktopChildren}</div>
        </ScrollArea>
      ) : (
        <div className="grid gap-3" data-testid="mobile-board-lane-stack">
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
