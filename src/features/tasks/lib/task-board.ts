import type {
  ProjectMember,
} from "@/contracts/projects";
import type { TaskStatus } from "@/contracts/tasks";

export type TaskMemberLookup = Record<string, string>;

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

export function getTaskStatusTone(status: TaskStatus) {
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

export function getTaskStatusDotClassName(status: TaskStatus) {
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

export function getTaskStatusBadgeClassName(status: TaskStatus) {
  return getTaskStatusThemeClassName(status, "soft");
}

export function getTaskStatusCardClassName(status: TaskStatus) {
  return getTaskStatusThemeClassName(status, "card");
}

export function getTaskStatusSurfaceClassName(status: TaskStatus) {
  return getTaskStatusThemeClassName(status, "surface");
}

export function getTaskStatusChipClassName(
  status: TaskStatus,
  active: boolean,
) {
  const base =
    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50";

  if (!active) {
    return `${base} border-transparent bg-transparent text-muted-foreground hover:bg-muted/70 hover:text-foreground`;
  }

  return `${base} ${getTaskStatusThemeClassName(status, "soft")} shadow-[0_1px_2px_rgba(15,23,42,0.04)]`;
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
  status: TaskStatus,
  tone: "soft" | "card" | "surface",
) {
  const colorKey = status.color.toLowerCase();

  if (tone === "card") {
    return `border-[color:color-mix(in_srgb,var(--status-${colorKey})_18%,var(--border))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--status-${colorKey})_8%,white),white_52%,color-mix(in_srgb,var(--status-${colorKey})_6%,var(--surface-subtle)))]`;
  }

  if (tone === "surface") {
    return `border-[color:color-mix(in_srgb,var(--status-${colorKey})_18%,var(--border))] bg-[color:color-mix(in_srgb,var(--status-${colorKey})_8%,white)]`;
  }

  return `border-[color:color-mix(in_srgb,var(--status-${colorKey})_24%,transparent)] bg-[color:color-mix(in_srgb,var(--status-${colorKey})_12%,white)] text-[color:var(--status-${colorKey})]`;
}
