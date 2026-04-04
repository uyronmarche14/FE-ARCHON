"use client";

import type { ReactNode } from "react";
import { CalendarClock, Clock3, Layers3, UserRound } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import type { TaskCard } from "@/contracts/tasks";
import { cn } from "@/lib/utils";
import { TaskMarkdownLite } from "@/features/tasks/components/task-markdown-lite";
import {
  formatTaskStatusLabel,
  getTaskAssigneeLabel,
  getTaskStatusBadgeClassName,
  getTaskStatusSurfaceClassName,
  getTaskDueLabel,
  getTaskUpdatedLabel,
  type TaskMemberLookup,
} from "@/features/tasks/lib/task-board";

type TaskPreviewPanelProps = {
  memberLookup?: TaskMemberLookup;
  presentation?: "hover" | "sheet";
  task: TaskCard;
};

export function TaskPreviewPanel({
  memberLookup,
  presentation = "hover",
  task,
}: TaskPreviewPanelProps) {
  const assigneeLabel = getTaskAssigneeLabel(task.assigneeId, memberLookup);

  if (presentation === "sheet") {
    return (
      <div className="space-y-3">
        <section className="space-y-2.5">
          <TaskPreviewSectionHeader eyebrow="Task" title="Summary" />
          <ReadOnlyValueSurface>
            <TaskMarkdownLite
              className="space-y-2.5 text-sm leading-6 text-muted-foreground"
              emptyFallback="No summary available yet."
              value={task.description}
            />
          </ReadOnlyValueSurface>
        </section>

        <Accordion type="multiple" className="grid gap-2.5">
          <AccordionItem value="acceptance-criteria">
            <AccordionTrigger>
              <TaskAccordionHeader
                title="Acceptance criteria"
                preview={getTextPreview(
                  task.acceptanceCriteria,
                  "Not added",
                )}
              />
            </AccordionTrigger>
            <AccordionContent>
              <ReadOnlyValueSurface className="ring-0 shadow-none">
                <TaskMarkdownLite
                  className="space-y-2.5 text-sm leading-6 text-muted-foreground"
                  emptyFallback="No acceptance criteria captured yet."
                  value={task.acceptanceCriteria}
                />
              </ReadOnlyValueSurface>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="notes">
            <AccordionTrigger>
              <TaskAccordionHeader
                title="Notes"
                preview={getTextPreview(task.notes, "No notes")}
              />
            </AccordionTrigger>
            <AccordionContent>
              <ReadOnlyValueSurface className="ring-0 shadow-none">
                <TaskMarkdownLite
                  className="space-y-2.5 text-sm leading-6 text-muted-foreground"
                  emptyFallback="No notes yet."
                  value={task.notes}
                />
              </ReadOnlyValueSurface>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="links">
            <AccordionTrigger>
              <TaskAccordionHeader
                title="Links"
                preview={getLinksPreview(task.links.length)}
              />
            </AccordionTrigger>
            <AccordionContent>
              {task.links.length === 0 ? (
                <ReadOnlyValueSurface className="ring-0 shadow-none">
                  <p className="text-sm leading-6 text-muted-foreground">
                    No task links yet.
                  </p>
                </ReadOnlyValueSurface>
              ) : (
                <ul className="grid gap-2">
                  {task.links.map((link) => (
                    <li key={link.id}>
                      <ReadOnlyValueSurface className="ring-0 shadow-none">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                        >
                          {link.label}
                        </a>
                        <p className="mt-1 truncate text-xs leading-5 text-muted-foreground">
                          {link.url}
                        </p>
                      </ReadOnlyValueSurface>
                    </li>
                  ))}
                </ul>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="checklist">
            <AccordionTrigger>
              <TaskAccordionHeader
                title="Checklist"
                preview={getChecklistPreview(task.checklistItems)}
              />
            </AccordionTrigger>
            <AccordionContent>
              {task.checklistItems.length === 0 ? (
                <ReadOnlyValueSurface className="ring-0 shadow-none">
                  <p className="text-sm leading-6 text-muted-foreground">
                    No checklist items yet.
                  </p>
                </ReadOnlyValueSurface>
              ) : (
                <ul className="grid gap-2">
                  {task.checklistItems.map((item) => (
                    <li key={item.id}>
                      <ReadOnlyValueSurface
                        className="flex items-center gap-3 ring-0 shadow-none"
                      >
                        <input type="checkbox" checked={item.isCompleted} readOnly />
                        <span className="text-sm leading-6 text-foreground">
                          {item.label}
                        </span>
                      </ReadOnlyValueSurface>
                    </li>
                  ))}
                </ul>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <div
        className={cn(
          "space-y-2.5 rounded-[1rem] border px-3.5 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
          getTaskStatusSurfaceClassName(task.status),
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            size="xs"
            className={getTaskStatusBadgeClassName(task.status)}
          >
            {formatStatusLabel(task.status)}
          </Badge>
          <Badge variant="outline" size="xs" className="bg-background/90">
            {assigneeLabel}
          </Badge>
          <Badge variant="muted" size="xs">
            {getTaskDueLabel(task.dueDate)}
          </Badge>
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-semibold tracking-tight text-foreground">
            {task.title}
          </h3>
          <p className="text-sm leading-5 text-muted-foreground">
            {task.description ?? "No summary available yet."}
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <TaskMetaBlock
            icon={<Layers3 className="size-4 text-primary" />}
            label="Lane"
            value={formatStatusLabel(task.status)}
          />
          <TaskMetaBlock
            icon={<UserRound className="size-4 text-primary" />}
            label="Assignee"
            value={assigneeLabel}
          />
          <TaskMetaBlock
            icon={<CalendarClock className="size-4 text-primary" />}
            label="Due"
            value={getTaskDueLabel(task.dueDate)}
          />
          <TaskMetaBlock
            icon={<Clock3 className="size-4 text-primary" />}
            label="Updated"
            value={getTaskUpdatedLabel(task.updatedAt)}
          />
        </div>
      </div>
    </div>
  );
}

function TaskMetaBlock({
  className,
  icon,
  label,
  value,
}: {
  className?: string;
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <section className={cn("space-y-1.5", className)}>
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <ReadOnlyValueSurface>
        <p className="break-words text-sm leading-6 text-foreground/88">{value}</p>
      </ReadOnlyValueSurface>
    </section>
  );
}

function TaskPreviewSectionHeader({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-muted-foreground/75">
        {eyebrow}
      </p>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
  );
}

function TaskAccordionHeader({
  title,
  preview,
}: {
  title: string;
  preview: string;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3">
      <span className="text-sm font-semibold text-foreground">{title}</span>
      <span className="truncate text-xs text-muted-foreground">{preview}</span>
    </div>
  );
}

function ReadOnlyValueSurface({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[0.95rem] bg-background/88 px-3 py-2.5 ring-1 ring-border/35",
        className,
      )}
    >
      {children}
    </div>
  );
}

function getTextPreview(value: string | null, fallback: string) {
  const normalizedValue = (value ?? "").trim().replace(/\s+/g, " ");

  if (normalizedValue.length === 0) {
    return fallback;
  }

  return normalizedValue.length > 42
    ? `${normalizedValue.slice(0, 42)}…`
    : normalizedValue;
}

function getLinksPreview(linkCount: number) {
  return linkCount === 0
    ? "No links"
    : `${linkCount} ${linkCount === 1 ? "link" : "links"}`;
}

function getChecklistPreview(items: TaskCard["checklistItems"]) {
  if (items.length === 0) {
    return "No items";
  }

  const completedCount = items.filter((item) => item.isCompleted).length;

  return `${items.length} ${items.length === 1 ? "item" : "items"} · ${completedCount} done`;
}

function formatStatusLabel(status: TaskCard["status"]) {
  return formatTaskStatusLabel(status);
}
