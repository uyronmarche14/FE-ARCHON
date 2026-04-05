"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type BoardContainerProps = {
  desktopChildren: ReactNode;
  density?: "default" | "compact";
  mobileChildren: ReactNode;
  tone?: "default" | "workspace";
};

export function BoardContainer({
  desktopChildren,
  density = "default",
  mobileChildren,
  tone = "workspace",
}: BoardContainerProps) {
  const isDesktop = useIsDesktopViewport();

  return (
    <section
      className={cn(
        tone === "workspace"
          ? "rounded-[1.25rem] border border-border/80 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--primary)_3%,white)_0%,color-mix(in_oklab,var(--background)_96%,white)_42%,color-mix(in_oklab,var(--surface-subtle)_95%,white)_100%)] shadow-[0_1px_2px_rgba(15,23,42,0.05),0_24px_52px_-38px_rgba(15,23,42,0.5)]"
          : "rounded-[1.2rem] border border-border/70 bg-linear-to-b from-background via-background to-surface-subtle/45 shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        density === "compact" ? "p-2 sm:p-2.5" : "p-2.5 sm:p-3",
      )}
      aria-label="Task board"
    >
      {isDesktop ? (
        <ScrollArea className="w-full" data-testid="board-lanes-scroll-area">
          <div
            className={
              density === "compact"
                ? "flex min-w-max gap-2.5 pb-1"
                : "flex min-w-max gap-3 pb-1"
            }
          >
            {desktopChildren}
          </div>
        </ScrollArea>
      ) : (
        <div
          className={density === "compact" ? "grid gap-2" : "grid gap-2.5"}
          data-testid="mobile-board-lane-stack"
        >
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
