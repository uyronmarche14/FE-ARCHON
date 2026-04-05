import type {
  ProjectMember,
} from "@/contracts/projects";
import type { TaskStatus } from "@/contracts/tasks";

export type TaskMemberLookup = Record<string, string>;
export type TaskStatusThemeTarget = Pick<TaskStatus, "color" | "isClosed"> &
  Partial<Pick<TaskStatus, "id" | "name" | "position">>;

export function createTaskMemberLookup(
  members: Pick<ProjectMember, "id" | "name">[],
): TaskMemberLookup {
  return members.reduce<TaskMemberLookup>((memberLookup, member) => {
    return {
      ...memberLookup,
      [member.id]: member.name,
    };
  }, {});
}

export function getTaskAssigneeLabel(
  assigneeId: string | null,
  memberLookup: TaskMemberLookup = {},
) {
  if (!assigneeId) {
    return "Unassigned";
  }

  return memberLookup[assigneeId] ?? "Unassigned";
}

export function getTaskAssigneeInitials(
  assigneeId: string | null,
  memberLookup: TaskMemberLookup = {},
) {
  const assigneeLabel = getTaskAssigneeLabel(assigneeId, memberLookup);

  if (assigneeLabel === "Unassigned") {
    return "UA";
  }

  return createInitialsFromName(assigneeLabel);
}

export function getTaskDueLabel(dueDate: string | null) {
  return dueDate ? `Due ${formatBoardDate(dueDate)}` : "No due date";
}

export function getTaskUpdatedLabel(updatedAt: string) {
  return `Updated ${formatBoardDate(updatedAt)}`;
}

export function getTaskPositionLabel(
  position: number | null,
  status: TaskStatus | string,
) {
  if (position === null) {
    return `No fixed order in ${formatTaskStatusLabel(status)}.`;
  }

  return `Card ${position} in ${formatTaskStatusLabel(status)}.`;
}

export function getTaskPositionSummaryLabel(position: number | null) {
  if (position === null) {
    return "Flexible";
  }

  return `#${position}`;
}

export function formatTaskStatusLabel(status: TaskStatus | string) {
  if (typeof status === "string") {
    const normalizedStatus =
      status === status.toUpperCase() ? status.toLowerCase() : status;

    return normalizedStatus
      .replace(/_/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase());
  }

  return status.name;
}

export function getTaskStatusTone(status: TaskStatusThemeTarget) {
  if (status.color === "GREEN") {
    return "done" as const;
  }

  if (status.color === "BLUE" || status.color === "PURPLE") {
    return "progress" as const;
  }

  if (status.isClosed) {
    return "done" as const;
  }

  return "todo" as const;
}

export function getTaskStatusDotClassName(status: TaskStatusThemeTarget) {
  switch (status.color) {
    case "BLUE":
      return "bg-[color:var(--status-blue)]";
    case "AMBER":
      return "bg-[color:var(--status-amber)]";
    case "GREEN":
      return "bg-[color:var(--status-green)]";
    case "RED":
      return "bg-[color:var(--status-red)]";
    case "PURPLE":
      return "bg-[color:var(--status-purple)]";
    case "SLATE":
    default:
      return "bg-[color:var(--status-slate)]";
  }
}

export function getTaskStatusBadgeClassName(status: TaskStatusThemeTarget) {
  return getTaskStatusThemeClassName(status, "soft");
}

export function getTaskStatusCardClassName(status: TaskStatusThemeTarget) {
  return getTaskStatusThemeClassName(status, "card");
}

export function getTaskStatusSurfaceClassName(status: TaskStatusThemeTarget) {
  return getTaskStatusThemeClassName(status, "surface");
}

export function getTaskStatusHeaderClassName(status: TaskStatusThemeTarget) {
  return getTaskStatusThemeClassName(status, "header");
}

export function getTaskStatusEmptyStateClassName(status: TaskStatusThemeTarget) {
  return getTaskStatusThemeClassName(status, "empty");
}

export function getTaskStatusChipClassName(
  status: TaskStatusThemeTarget,
  active: boolean,
) {
  const base =
    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50";

  if (!active) {
    return `${base} border-transparent bg-transparent text-muted-foreground hover:border-border/70 hover:bg-muted/75 hover:text-foreground`;
  }

  return `${base} ${getTaskStatusThemeClassName(status, "soft")} shadow-[0_12px_24px_-22px_rgba(15,23,42,0.35)]`;
}

function createInitialsFromName(name: string) {
  const nameParts = name
    .trim()
    .split(/\s+/)
    .map((part) => part.replace(/[^a-zA-Z0-9]/g, ""))
    .filter(Boolean);

  if (nameParts.length === 0) {
    return "UA";
  }

  if (nameParts.length === 1) {
    return nameParts[0].slice(0, 2).toUpperCase();
  }

  return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
}

function formatBoardDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: value.includes("T") ? undefined : "numeric",
  }).format(new Date(value.includes("T") ? value : `${value}T00:00:00.000Z`));
}

function getTaskStatusThemeClassName(
  status: TaskStatusThemeTarget,
  tone: "soft" | "card" | "surface" | "header" | "empty",
) {
  const colorKey = status.color.toLowerCase();
  const borderColor = `border-[color:color-mix(in_srgb,var(--status-${colorKey})_38%,var(--border))]`;

  if (tone === "card") {
    return `${borderColor} bg-[linear-gradient(145deg,color-mix(in_srgb,var(--status-${colorKey})_18%,white),color-mix(in_srgb,var(--status-${colorKey})_8%,white)_40%,color-mix(in_srgb,var(--status-${colorKey})_14%,var(--surface-subtle)))]`;
  }

  if (tone === "surface") {
    return `${borderColor} bg-[linear-gradient(180deg,color-mix(in_srgb,var(--status-${colorKey})_16%,white),color-mix(in_srgb,var(--status-${colorKey})_12%,var(--surface-subtle)))]`;
  }

  if (tone === "header") {
    return `border-[color:color-mix(in_srgb,var(--status-${colorKey})_50%,white)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--status-${colorKey})_26%,white),color-mix(in_srgb,var(--status-${colorKey})_14%,var(--card))_78%)]`;
  }

  if (tone === "empty") {
    return `border-[color:color-mix(in_srgb,var(--status-${colorKey})_44%,var(--border))] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--status-${colorKey})_14%,white),color-mix(in_srgb,var(--status-${colorKey})_8%,var(--surface-subtle)))]`;
  }

  return `border-[color:color-mix(in_srgb,var(--status-${colorKey})_56%,transparent)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--status-${colorKey})_26%,white),color-mix(in_srgb,var(--status-${colorKey})_18%,var(--surface-subtle)))] text-[color:color-mix(in_srgb,var(--status-${colorKey})_82%,var(--foreground))] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]`;
}
