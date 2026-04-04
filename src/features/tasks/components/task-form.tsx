"use client";

import { LoaderCircle, Plus, Trash2 } from "lucide-react";
import type { ProjectMember } from "@/contracts/projects";
import type { TaskStatus } from "@/contracts/tasks";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  TaskFormChecklistItemValue,
  TaskFormErrors,
  TaskFormLinkValue,
  TaskFormValues,
} from "@/features/tasks/lib/task-form";
import {
  createEmptyTaskChecklistItem,
  createEmptyTaskFormLink,
} from "@/features/tasks/lib/task-form";
import {
  formatTaskStatusLabel,
  getTaskStatusChipClassName,
  getTaskStatusDotClassName,
} from "@/features/tasks/lib/task-board";
import { cn } from "@/lib/utils";

type TaskFormProps = {
  mode: "create" | "edit";
  values: TaskFormValues;
  errors: TaskFormErrors;
  members: ProjectMember[];
  statuses: TaskStatus[];
  membersError?: string | null;
  membersLoading?: boolean;
  formError?: string | null;
  isPending?: boolean;
  submitLabel: string;
  submittingLabel: string;
  saveDisabled?: boolean;
  onCancel: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onValueChange: <TField extends keyof TaskFormValues>(
    field: TField,
    value: TaskFormValues[TField],
  ) => void;
};

const formFieldClassName =
  "h-9 rounded-[0.95rem] border-border/45 bg-background/88 shadow-none transition-[border-color,box-shadow,background-color] focus-visible:border-primary/45 focus-visible:ring-primary/10";

const formTextareaClassName =
  "min-h-[96px] rounded-[1rem] border-border/45 bg-background/88 shadow-none transition-[border-color,box-shadow,background-color] focus-visible:border-primary/45 focus-visible:ring-primary/10";

const formCollectionRowClassName =
  "grid gap-2 rounded-[0.95rem] bg-surface-subtle/35 px-3 py-2.5 ring-1 ring-border/35";

export function TaskForm({
  mode,
  values,
  errors,
  members,
  statuses,
  membersError,
  membersLoading = false,
  formError,
  isPending = false,
  saveDisabled = false,
  submitLabel,
  submittingLabel,
  onCancel,
  onSubmit,
  onValueChange,
}: TaskFormProps) {
  function updateLink(id: string, patch: Partial<TaskFormLinkValue>) {
    onValueChange(
      "links",
      values.links.map((link) => (link.id === id ? { ...link, ...patch } : link)),
    );
  }

  function removeLink(id: string) {
    onValueChange(
      "links",
      values.links.filter((link) => link.id !== id),
    );
  }

  function updateChecklistItem(
    id: string,
    patch: Partial<TaskFormChecklistItemValue>,
  ) {
    onValueChange(
      "checklistItems",
      values.checklistItems.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    );
  }

  function removeChecklistItem(id: string) {
    onValueChange(
      "checklistItems",
      values.checklistItems.filter((item) => item.id !== id),
    );
  }

  return (
    <form className="mt-2 grid gap-3" onSubmit={onSubmit}>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_14.5rem] lg:items-start">
        <div className="order-2 space-y-3 lg:order-1">
          <section className="space-y-3">
            <FormSectionHeader
              eyebrow="Task"
              title="Keep the task readable first."
              description="Title, summary, and the next useful details."
            />

            <div className="space-y-2">
              <Label
                className="text-sm font-medium text-foreground/90"
                htmlFor="task-title"
              >
                Task title
              </Label>
              <Input
                id="task-title"
                className={cn(formFieldClassName, "h-10 text-[0.95rem]")}
                value={values.title}
                placeholder="Finalize launch checklist"
                aria-invalid={errors.title ? true : undefined}
                disabled={isPending}
                onChange={(event) => onValueChange("title", event.target.value)}
              />
              <FormAssistiveText
                error={errors.title}
                hint="Keep it specific enough to scan quickly on the board."
              />
            </div>

            <div className="space-y-2">
              <Label
                className="text-sm font-medium text-foreground/90"
                htmlFor="task-description"
              >
                Summary
              </Label>
              <Textarea
                id="task-description"
                className={cn(formTextareaClassName, "min-h-[112px]")}
                value={values.description}
                placeholder="Capture the work, context, and next check needed."
                aria-invalid={errors.description ? true : undefined}
                disabled={isPending}
                onChange={(event) => onValueChange("description", event.target.value)}
              />
              <FormAssistiveText
                error={errors.description}
                hint="Markdown-lite is supported through plain multiline text."
              />
            </div>
          </section>

          <Accordion type="multiple" className="grid gap-2.5">
            <AccordionItem value="acceptance-criteria">
              <AccordionTrigger>
                <TaskAccordionHeader
                  title="Acceptance criteria"
                  preview={getTextPreview(values.acceptanceCriteria, "Not added")}
                />
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <Label
                    className="text-sm font-medium text-foreground/90"
                    htmlFor="task-acceptance-criteria"
                  >
                    Acceptance criteria
                  </Label>
                  <Textarea
                    id="task-acceptance-criteria"
                    className={cn(formTextareaClassName, "min-h-[88px]")}
                    value={values.acceptanceCriteria}
                    aria-invalid={errors.acceptanceCriteria ? true : undefined}
                    disabled={isPending}
                    placeholder="- QA sign-off\n- Stakeholder review complete"
                    onChange={(event) =>
                      onValueChange("acceptanceCriteria", event.target.value)
                    }
                  />
                  <FormAssistiveText error={errors.acceptanceCriteria} />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="notes">
              <AccordionTrigger>
                <TaskAccordionHeader
                  title="Notes"
                  preview={getTextPreview(values.notes, "No notes")}
                />
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <Label
                    className="text-sm font-medium text-foreground/90"
                    htmlFor="task-notes"
                  >
                    Notes
                  </Label>
                  <Textarea
                    id="task-notes"
                    className={cn(formTextareaClassName, "min-h-[88px]")}
                    value={values.notes}
                    aria-invalid={errors.notes ? true : undefined}
                    disabled={isPending}
                    placeholder="Keep stakeholder context, dependencies, or caveats here."
                    onChange={(event) => onValueChange("notes", event.target.value)}
                  />
                  <FormAssistiveText error={errors.notes} />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="links">
              <AccordionTrigger>
                <TaskAccordionHeader
                  title="Links"
                  preview={getLinksPreview(values.links)}
                />
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-full px-3.5 shadow-none"
                      onClick={() =>
                        onValueChange("links", [
                          ...values.links,
                          createEmptyTaskFormLink(),
                        ])
                      }
                      disabled={isPending}
                    >
                      <Plus className="size-3.5" />
                      Add link
                    </Button>
                  </div>

                  <div className="grid gap-2.5">
                    {values.links.length === 0 ? (
                      <p className="rounded-[1rem] border border-dashed border-border/40 bg-surface-subtle/35 px-3.5 py-2.5 text-xs leading-5 text-muted-foreground">
                        No links yet. Add URLs for specs, docs, or external references.
                      </p>
                    ) : null}

                    {values.links.map((link) => (
                      <div key={link.id} className={formCollectionRowClassName}>
                        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto]">
                          <Input
                            className={formFieldClassName}
                            value={link.label}
                            placeholder="Launch brief"
                            disabled={isPending}
                            onChange={(event) =>
                              updateLink(link.id, { label: event.target.value })
                            }
                          />
                          <Input
                            className={formFieldClassName}
                            value={link.url}
                            placeholder="https://example.com/brief"
                            disabled={isPending}
                            onChange={(event) =>
                              updateLink(link.id, { url: event.target.value })
                            }
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="rounded-full"
                            onClick={() => removeLink(link.id)}
                            disabled={isPending}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {errors.links ? (
                      <p className="text-xs text-destructive">{errors.links}</p>
                    ) : null}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="checklist">
              <AccordionTrigger>
                <TaskAccordionHeader
                  title="Checklist"
                  preview={getChecklistPreview(values.checklistItems)}
                />
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-full px-3.5 shadow-none"
                      onClick={() =>
                        onValueChange("checklistItems", [
                          ...values.checklistItems,
                          createEmptyTaskChecklistItem(),
                        ])
                      }
                      disabled={isPending}
                    >
                      <Plus className="size-3.5" />
                      Add item
                    </Button>
                  </div>

                  <div className="grid gap-2.5">
                    {values.checklistItems.length === 0 ? (
                      <p className="rounded-[1rem] border border-dashed border-border/40 bg-surface-subtle/35 px-3.5 py-2.5 text-xs leading-5 text-muted-foreground">
                        No checklist items yet. Add the steps that define “done.”
                      </p>
                    ) : null}

                    {values.checklistItems.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          formCollectionRowClassName,
                          "sm:grid-cols-[auto_minmax(0,1fr)_auto]",
                        )}
                      >
                        <label className="inline-flex items-center gap-2 self-center text-sm text-foreground">
                          <input
                            type="checkbox"
                            checked={item.isCompleted}
                            disabled={isPending}
                            onChange={(event) =>
                              updateChecklistItem(item.id, {
                                isCompleted: event.target.checked,
                              })
                            }
                          />
                          <span className="sr-only">Mark checklist item complete</span>
                        </label>
                        <Input
                          className={formFieldClassName}
                          value={item.label}
                          placeholder="Confirm stakeholder sign-off"
                          disabled={isPending}
                          onChange={(event) =>
                            updateChecklistItem(item.id, { label: event.target.value })
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="rounded-full"
                          onClick={() => removeChecklistItem(item.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))}

                    {errors.checklistItems ? (
                      <p className="text-xs text-destructive">{errors.checklistItems}</p>
                    ) : null}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <aside className="order-1 space-y-2.5 lg:order-2 lg:sticky lg:top-0">
          <TaskRailPanel title={mode === "create" ? "Initial lane" : "Current lane"}>
            {mode === "create" ? (
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => {
                  const isActive = values.statusId === status.id;

                  return (
                    <button
                      key={status.id}
                      type="button"
                      className={cn(
                        "inline-flex min-h-8 items-center gap-2 rounded-full px-3 text-[13px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                        isActive
                          ? getTaskStatusChipClassName(status, true)
                          : "bg-background/80 text-foreground ring-1 ring-border/45 hover:bg-background",
                      )}
                      onClick={() => onValueChange("statusId", status.id)}
                      aria-pressed={isActive}
                    >
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          getTaskStatusDotClassName(status),
                        )}
                      />
                      <span>{formatTaskStatusLabel(status)}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <TaskRailValue>{getStatusLabel(values.statusId, statuses)}</TaskRailValue>
            )}
          </TaskRailPanel>

          <TaskRailPanel title="Properties">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label
                  className="text-sm font-medium text-foreground/90"
                  htmlFor="task-assignee"
                >
                  Assignee
                </Label>
                <Select
                  id="task-assignee"
                  className={formFieldClassName}
                  value={values.assigneeId}
                  aria-invalid={errors.assigneeId ? true : undefined}
                  disabled={isPending || membersLoading}
                  onChange={(event) => onValueChange("assigneeId", event.target.value)}
                >
                  <option value="">Unassigned</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </Select>
                <FormAssistiveText
                  error={errors.assigneeId ?? membersError ?? undefined}
                  hint={
                    membersLoading
                      ? "Loading members…"
                      : "Choose a project member or leave the task unassigned."
                  }
                />
              </div>

              <div className="space-y-2">
                <Label
                  className="text-sm font-medium text-foreground/90"
                  htmlFor="task-due-date"
                >
                  Due date
                </Label>
                <Input
                  id="task-due-date"
                  className={formFieldClassName}
                  type="date"
                  value={values.dueDate}
                  aria-invalid={errors.dueDate ? true : undefined}
                  disabled={isPending}
                  onChange={(event) => onValueChange("dueDate", event.target.value)}
                />
                <FormAssistiveText
                  error={errors.dueDate}
                  hint="Optional. Dates stay lightweight in this release."
                />
              </div>
            </div>
          </TaskRailPanel>

          {formError ? (
            <div className="rounded-[1rem] bg-destructive/5 px-3.5 py-3 text-sm text-destructive ring-1 ring-destructive/15">
              {formError}
            </div>
          ) : null}

          <TaskRailPanel title="Actions" className="gap-2">
            <div className="grid gap-2">
              <Button
                type="submit"
                className="h-9 rounded-[0.95rem]"
                disabled={isPending || saveDisabled}
              >
                {isPending ? (
                  <>
                    <LoaderCircle className="size-3.5 animate-spin" />
                    {submittingLabel}
                  </>
                ) : (
                  submitLabel
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-[0.95rem] shadow-none"
                onClick={onCancel}
                disabled={isPending}
              >
                Cancel
              </Button>
            </div>
          </TaskRailPanel>
        </aside>
      </div>
    </form>
  );
}

type FormSectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

function FormSectionHeader({
  eyebrow,
  title,
  description,
}: FormSectionHeaderProps) {
  return (
    <div className="space-y-0.5">
      <p className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-muted-foreground/75">
        {eyebrow}
      </p>
      <div className="space-y-0.5">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="max-w-xl text-sm leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

type FormAssistiveTextProps = {
  error?: string;
  hint?: string;
};

function FormAssistiveText({ error, hint }: FormAssistiveTextProps) {
  if (!error && !hint) {
    return null;
  }

  return (
    <p
      className={cn(
        "text-xs leading-5",
        error ? "text-destructive" : "text-muted-foreground",
      )}
    >
      {error ?? hint}
    </p>
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

function TaskRailPanel({
  children,
  className,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title: string;
}) {
  return (
    <section
      className={cn(
        "space-y-2 rounded-[0.95rem] bg-surface-subtle/35 px-3 py-3 ring-1 ring-border/35",
        className,
      )}
    >
      <p className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-muted-foreground/75">
        {title}
      </p>
      {children}
    </section>
  );
}

function TaskRailValue({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[0.9rem] bg-background/85 px-3 py-2.5 ring-1 ring-border/45">
      <p className="text-sm text-foreground/88">{children}</p>
    </div>
  );
}

function getTextPreview(value: string, fallback: string) {
  const normalizedValue = value.trim().replace(/\s+/g, " ");

  if (normalizedValue.length === 0) {
    return fallback;
  }

  return normalizedValue.length > 42
    ? `${normalizedValue.slice(0, 42)}…`
    : normalizedValue;
}

function getLinksPreview(links: TaskFormLinkValue[]) {
  return links.length === 0
    ? "No links"
    : `${links.length} ${links.length === 1 ? "link" : "links"}`;
}

function getChecklistPreview(items: TaskFormChecklistItemValue[]) {
  if (items.length === 0) {
    return "No items";
  }

  const completedCount = items.filter((item) => item.isCompleted).length;

  return `${items.length} ${items.length === 1 ? "item" : "items"} · ${completedCount} done`;
}

function getStatusLabel(statusId: string, statuses: TaskStatus[]) {
  const currentStatus = statuses.find((status) => status.id === statusId);

  return currentStatus ? formatTaskStatusLabel(currentStatus) : "No lane";
}
