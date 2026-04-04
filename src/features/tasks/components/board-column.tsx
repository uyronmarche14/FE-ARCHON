import * as React from "react";
import type { ComponentProps, ReactNode } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import type { TaskStatus } from "@/contracts/tasks";
import { Button } from "@/components/ui/button";
import {
  getTaskStatusDotClassName,
  getTaskStatusSurfaceClassName,
} from "@/features/tasks/lib/task-board";
import { cn } from "@/lib/utils";

type BoardColumnProps = {
  bodyClassName?: string;
  className?: string;
  children: ReactNode;
  count: number;
  dataTestId?: string;
  density?: "default" | "compact";
  description: string;
  onAddTask: () => void;
  presentation?: "desktop" | "mobile";
  showActions?: boolean;
  status: TaskStatus;
  title: string;
};

export const BoardColumn = React.forwardRef<HTMLElement, BoardColumnProps>(
  (
    {
      bodyClassName,
      children,
      className,
      count,
      dataTestId,
      density = "default",
      description,
      onAddTask,
      presentation = "desktop",
      showActions = true,
      status,
      title,
    },
    ref,
  ) => {
    return (
      <section
        ref={ref}
        data-testid={dataTestId}
        className={cn(
          "min-w-0 overflow-hidden rounded-[1.2rem] border shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
          presentation === "desktop"
            ? density === "compact"
              ? "w-[18.5rem] shrink-0 rounded-[1rem]"
              : "w-[20.5rem] shrink-0"
            : "w-full",
          getTaskStatusSurfaceClassName(status),
          className,
        )}
      >
        <BoardColumnHeader
          count={count}
          density={density}
          description={description}
          onAddTask={onAddTask}
          showActions={showActions}
          status={status}
          title={title}
        />
        <BoardLaneBody className={bodyClassName}>{children}</BoardLaneBody>
      </section>
    );
  },
);

BoardColumn.displayName = "BoardColumn";

type BoardColumnHeaderProps = {
  count: number;
  density: "default" | "compact";
  description: string;
  onAddTask: () => void;
  showActions: boolean;
  status: TaskStatus;
  title: string;
};

export function BoardColumnHeader({
  count,
  density,
  description,
  onAddTask,
  showActions,
  status,
  title,
}: BoardColumnHeaderProps) {
  return (
    <header
        className={cn(
          "sticky top-0 z-10 border-b border-black/5 bg-white/75 backdrop-blur supports-[backdrop-filter]:bg-white/65",
          density === "compact" ? "px-3 py-2.5" : "px-3.5 py-3",
        )}
    >
      <div
        className={cn(
          "flex items-start justify-between gap-3",
          density === "compact" ? "min-h-[4.15rem]" : "min-h-[4.8rem]",
        )}
      >
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "size-2.5 rounded-full shadow-[0_0_0_3px_rgba(255,255,255,0.72)]",
                getLaneDotClassName(status),
              )}
            />
            <h3
              className={cn(
                "font-semibold tracking-tight text-foreground",
                density === "compact" ? "text-[13px]" : "text-sm",
              )}
            >
              {title}
            </h3>
            <span className="rounded-full bg-surface-subtle px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
              {count}
            </span>
          </div>
          <p
            className={cn(
              "line-clamp-2 pr-6 text-muted-foreground",
              density === "compact"
                ? "text-[11px] leading-[1.125rem]"
                : "text-xs leading-5",
            )}
          >
            {description}
          </p>
        </div>

        {showActions ? (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="rounded-lg text-muted-foreground"
              aria-label={`Add task to ${title}`}
              onClick={onAddTask}
            >
              <Plus className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="rounded-lg text-muted-foreground"
              aria-label={`${title} lane options`}
            >
              <MoreHorizontal className="size-3.5" />
            </Button>
          </div>
        ) : null}
      </div>
    </header>
  );
}

export function BoardLaneBody({
  children,
  className,
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "grid content-start gap-2.5 bg-linear-to-b from-background to-surface-subtle/35 p-3 [&>*]:w-full",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function BoardLaneEmptyState({ lane }: { lane: string }) {
  return (
    <div className="rounded-[1rem] border border-dashed border-border/70 bg-surface-subtle/35 px-4 py-6 text-center">
      <p className="text-sm font-semibold text-foreground">No cards in {lane}.</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        This lane will fill automatically when tasks arrive for this workflow state.
      </p>
    </div>
  );
}

export function getLaneDotClassName(status: TaskStatus) {
  return getTaskStatusDotClassName(status);
}
