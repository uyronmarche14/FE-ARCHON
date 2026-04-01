import * as React from "react";
import type { ComponentProps, ReactNode } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import type { TaskStatus } from "@/contracts/tasks";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BoardColumnProps = {
  bodyClassName?: string;
  className?: string;
  children: ReactNode;
  count: number;
  dataTestId?: string;
  description: string;
  onAddTask: () => void;
  presentation?: "desktop" | "mobile";
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
      description,
      onAddTask,
      presentation = "desktop",
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
          "min-w-0 overflow-hidden rounded-lg border border-border/70 bg-card shadow-sm",
          presentation === "desktop" ? "w-[22rem] shrink-0" : "w-full",
          className,
        )}
      >
        <BoardColumnHeader
          count={count}
          description={description}
          onAddTask={onAddTask}
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
  description: string;
  onAddTask: () => void;
  status: TaskStatus;
  title: string;
};

export function BoardColumnHeader({
  count,
  description,
  onAddTask,
  status,
  title,
}: BoardColumnHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border/60 bg-card/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-card/88">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className={cn("size-2 rounded-full", getLaneDotClassName(status))} />
            <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
            <span className="rounded-sm bg-surface-subtle px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
              {count}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="rounded-md text-muted-foreground"
            aria-label={`Add task to ${title}`}
            onClick={onAddTask}
          >
            <Plus className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="rounded-md text-muted-foreground"
            aria-label={`${title} lane options`}
          >
            <MoreHorizontal className="size-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
}

export function BoardLaneBody({
  children,
  className,
}: ComponentProps<"div">) {
  return <div className={cn("grid gap-2.5 p-3", className)}>{children}</div>;
}

export function BoardLaneEmptyState({ lane }: { lane: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border/70 bg-surface-subtle/35 px-4 py-6 text-center">
      <p className="text-sm font-semibold text-foreground">No cards in {lane}.</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        This lane will fill automatically when tasks arrive for this workflow state.
      </p>
    </div>
  );
}

export function getLaneDotClassName(status: TaskStatus) {
  if (status === "IN_PROGRESS") {
    return "bg-in-progress";
  }

  if (status === "DONE") {
    return "bg-done";
  }

  return "bg-todo";
}
