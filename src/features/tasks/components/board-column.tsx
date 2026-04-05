import * as React from "react";
import type { ComponentProps, CSSProperties, HTMLAttributes, ReactNode } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import type { TaskStatus } from "@/contracts/tasks";
import { Button } from "@/components/ui/button";
import {
  getTaskStatusBadgeClassName,
  getTaskStatusDotClassName,
  getTaskStatusEmptyStateClassName,
  getTaskStatusHeaderClassName,
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
  dragHandle?: ReactNode;
  isLaneDragActive?: boolean;
  isLaneDraggable?: boolean;
  onAddTask: () => void;
  presentation?: "desktop" | "mobile";
  surfaceStyle?: CSSProperties;
  dragSurfaceProps?: HTMLAttributes<HTMLElement>;
  showActions?: boolean;
  status: TaskStatus;
  title: string;
  tone?: "default" | "workspace";
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
      dragSurfaceProps,
      dragHandle,
      isLaneDragActive = false,
      isLaneDraggable = false,
      onAddTask,
      presentation = "desktop",
      surfaceStyle,
      showActions = true,
      status,
      title,
      tone = "workspace",
    },
    ref,
  ) => {
    return (
      <section
        ref={ref}
        style={surfaceStyle}
        data-testid={dataTestId}
        className={cn(
          tone === "workspace"
            ? "min-w-0 overflow-hidden rounded-[1.2rem] border shadow-[0_1px_2px_rgba(15,23,42,0.05),0_18px_38px_-30px_rgba(15,23,42,0.5)] transform-gpu transition-[box-shadow,border-color]"
            : "min-w-0 overflow-hidden rounded-[1.2rem] border shadow-[0_1px_2px_rgba(15,23,42,0.04)] transform-gpu transition-shadow",
          presentation === "desktop"
            ? density === "compact"
              ? "w-[18.5rem] shrink-0 rounded-[1rem]"
              : "w-[20.5rem] shrink-0"
            : "w-full",
          isLaneDraggable && "cursor-grab active:cursor-grabbing",
          isLaneDragActive && "ring-2 ring-primary/15",
          getTaskStatusSurfaceClassName(status),
          className,
        )}
        {...dragSurfaceProps}
      >
        <BoardColumnHeader
          count={count}
          density={density}
          description={description}
          dragHandle={dragHandle}
          onAddTask={onAddTask}
          showActions={showActions}
          status={status}
          title={title}
          tone={tone}
        />
        <BoardLaneBody className={bodyClassName} status={status} tone={tone}>
          {children}
        </BoardLaneBody>
      </section>
    );
  },
);

BoardColumn.displayName = "BoardColumn";

type BoardColumnHeaderProps = {
  count: number;
  density: "default" | "compact";
  description: string;
  dragHandle?: ReactNode;
  onAddTask: () => void;
  showActions: boolean;
  status: TaskStatus;
  title: string;
  tone: "default" | "workspace";
};

export function BoardColumnHeader({
  count,
  density,
  description,
  dragHandle,
  onAddTask,
  showActions,
  status,
  title,
  tone,
}: BoardColumnHeaderProps) {
  return (
    <header
      className={cn(
        tone === "workspace"
          ? "sticky top-0 z-10 border-b backdrop-blur-xl"
          : "sticky top-0 z-10 border-b border-black/5 bg-white/75 backdrop-blur supports-[backdrop-filter]:bg-white/65",
        density === "compact" ? "px-3 py-2.5" : "px-3.5 py-3",
        tone === "workspace" && getTaskStatusHeaderClassName(status),
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
            <span
              className={cn(
                tone === "workspace"
                  ? "rounded-full px-2 py-0.5 text-[11px] font-semibold shadow-[0_12px_24px_-22px_rgba(15,23,42,0.42)]"
                  : "rounded-full bg-surface-subtle px-2 py-0.5 text-[11px] font-semibold text-muted-foreground",
                tone === "workspace" && getTaskStatusBadgeClassName(status),
              )}
            >
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

        {showActions || dragHandle ? (
          <div className="flex items-center gap-1">
            {dragHandle}
            {showActions ? (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="rounded-lg text-muted-foreground"
                  aria-label={`Add task to ${title}`}
                  onPointerDownCapture={(event) => event.stopPropagation()}
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
                  onPointerDownCapture={(event) => event.stopPropagation()}
                >
                  <MoreHorizontal className="size-3.5" />
                </Button>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}

export function BoardLaneBody({
  children,
  className,
  status,
  tone = "workspace",
}: ComponentProps<"div"> & {
  status?: TaskStatus;
  tone?: "default" | "workspace";
}) {
  return (
    <div
      className={cn(
        tone === "workspace"
          ? "grid content-start gap-2.5 p-3 [&>*]:w-full"
          : "grid content-start gap-2.5 bg-linear-to-b from-background to-surface-subtle/35 p-3 [&>*]:w-full",
        tone === "workspace" && status && getTaskStatusSurfaceClassName(status),
        className,
      )}
    >
      {children}
    </div>
  );
}

export function BoardLaneEmptyState({
  lane,
  status,
  tone = "workspace",
}: {
  lane: string;
  status?: TaskStatus;
  tone?: "default" | "workspace";
}) {
  return (
    <div
      className={cn(
        tone === "workspace"
          ? "rounded-[1rem] border border-dashed px-4 py-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
          : "rounded-[1rem] border border-dashed border-border/70 bg-surface-subtle/35 px-4 py-6 text-center",
        tone === "workspace" && status && getTaskStatusEmptyStateClassName(status),
      )}
    >
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
