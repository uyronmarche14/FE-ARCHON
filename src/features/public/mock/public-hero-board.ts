import type { ProjectActivityEntry, ProjectMember } from "@/contracts/projects";
import type { TaskGroups } from "@/contracts/tasks";

export const publicHeroBoardMeta = {
  title: "Launch readiness board",
  description: "Calm delivery flow with visible task history.",
};

export const publicHeroMembers: ProjectMember[] = [
  {
    id: "member-leah-moore",
    name: "Leah Moore",
    role: "OWNER",
  },
  {
    id: "member-rory-kim",
    name: "Rory Kim",
    role: "MEMBER",
  },
  {
    id: "member-jordan-diaz",
    name: "Jordan Diaz",
    role: "MEMBER",
  },
  {
    id: "member-ava-ng",
    name: "Ava Ng",
    role: "MEMBER",
  },
];

export const publicHeroTaskGroups: TaskGroups = {
  TODO: [
    {
      id: "task-release-blockers",
      projectId: "public-hero-project",
      title: "Document release blockers",
      description: "Owner review",
      status: "TODO",
      position: 1,
      assigneeId: "member-leah-moore",
      dueDate: null,
      createdAt: "2026-04-01T08:00:00.000Z",
      updatedAt: "2026-04-03T09:15:00.000Z",
    },
  ],
  IN_PROGRESS: [
    {
      id: "task-refine-invite-flow",
      projectId: "public-hero-project",
      title: "Refine invite flow",
      description: "Review due today",
      status: "IN_PROGRESS",
      position: 1,
      assigneeId: "member-rory-kim",
      dueDate: "2026-04-10T00:00:00.000Z",
      createdAt: "2026-04-02T08:00:00.000Z",
      updatedAt: "2026-04-04T11:30:00.000Z",
    },
    {
      id: "task-polish-board-states",
      projectId: "public-hero-project",
      title: "Polish board states",
      description: "Activity logs visible",
      status: "IN_PROGRESS",
      position: 2,
      assigneeId: "member-jordan-diaz",
      dueDate: "2026-04-12T00:00:00.000Z",
      createdAt: "2026-04-02T10:30:00.000Z",
      updatedAt: "2026-04-04T13:10:00.000Z",
    },
  ],
  DONE: [
    {
      id: "task-audit-trail",
      projectId: "public-hero-project",
      title: "Ship task movement audit trail",
      description: "Ready for handoff",
      status: "DONE",
      position: 1,
      assigneeId: "member-ava-ng",
      dueDate: "2026-04-08T00:00:00.000Z",
      createdAt: "2026-03-30T08:00:00.000Z",
      updatedAt: "2026-04-03T17:45:00.000Z",
    },
  ],
};

export const publicHeroActivityEntries: ProjectActivityEntry[] = [
  {
    id: "activity-status-change",
    eventType: "STATUS_CHANGED",
    fieldName: "status",
    oldValue: "TODO",
    newValue: "IN_PROGRESS",
    summary: "Moved invite flow into In progress.",
    createdAt: "2026-04-04T11:30:00.000Z",
    actor: {
      id: "member-rory-kim",
      name: "Rory Kim",
    },
    task: {
      id: "task-refine-invite-flow",
      title: "Refine invite flow",
      status: "IN_PROGRESS",
    },
  },
  {
    id: "activity-due-date",
    eventType: "TASK_UPDATED",
    fieldName: "dueDate",
    oldValue: "2026-04-12",
    newValue: "2026-04-10",
    summary: "Due date confirmed for launch review.",
    createdAt: "2026-04-04T10:05:00.000Z",
    actor: {
      id: "member-rory-kim",
      name: "Rory Kim",
    },
    task: {
      id: "task-refine-invite-flow",
      title: "Refine invite flow",
      status: "IN_PROGRESS",
    },
  },
  {
    id: "activity-created",
    eventType: "TASK_CREATED",
    fieldName: null,
    oldValue: null,
    newValue: null,
    summary: "Board ready for review.",
    createdAt: "2026-04-03T17:45:00.000Z",
    actor: {
      id: "member-ava-ng",
      name: "Ava Ng",
    },
    task: {
      id: "task-audit-trail",
      title: "Ship task movement audit trail",
      status: "DONE",
    },
  },
];
