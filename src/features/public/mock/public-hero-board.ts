import type { ProjectActivityEntry, ProjectMember } from "@/contracts/projects";
import type { ProjectTaskStatus } from "@/contracts/tasks";

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

export const publicHeroStatuses: ProjectTaskStatus[] = [
  {
    id: "status-public-hero-todo",
    name: "Todo",
    position: 1,
    isClosed: false,
    tasks: [
      {
        id: "task-release-blockers",
        projectId: "public-hero-project",
        title: "Document release blockers",
        description: "Owner review",
        statusId: "status-public-hero-todo",
        status: {
          id: "status-public-hero-todo",
          name: "Todo",
          position: 1,
          isClosed: false,
        },
        position: 1,
        assigneeId: "member-leah-moore",
        dueDate: null,
        createdAt: "2026-04-01T08:00:00.000Z",
        updatedAt: "2026-04-03T09:15:00.000Z",
      },
    ],
  },
  {
    id: "status-public-hero-progress",
    name: "In Progress",
    position: 2,
    isClosed: false,
    tasks: [
      {
        id: "task-refine-invite-flow",
        projectId: "public-hero-project",
        title: "Refine invite flow",
        description: "Review due today",
        statusId: "status-public-hero-progress",
        status: {
          id: "status-public-hero-progress",
          name: "In Progress",
          position: 2,
          isClosed: false,
        },
        position: 1,
        assigneeId: "member-rory-kim",
        dueDate: "2026-04-10",
        createdAt: "2026-04-02T08:00:00.000Z",
        updatedAt: "2026-04-04T11:30:00.000Z",
      },
      {
        id: "task-polish-board-states",
        projectId: "public-hero-project",
        title: "Polish board states",
        description: "Activity logs visible",
        statusId: "status-public-hero-progress",
        status: {
          id: "status-public-hero-progress",
          name: "In Progress",
          position: 2,
          isClosed: false,
        },
        position: 2,
        assigneeId: "member-jordan-diaz",
        dueDate: "2026-04-12",
        createdAt: "2026-04-02T10:30:00.000Z",
        updatedAt: "2026-04-04T13:10:00.000Z",
      },
    ],
  },
  {
    id: "status-public-hero-done",
    name: "Done",
    position: 3,
    isClosed: true,
    tasks: [
      {
        id: "task-audit-trail",
        projectId: "public-hero-project",
        title: "Ship task movement audit trail",
        description: "Ready for handoff",
        statusId: "status-public-hero-done",
        status: {
          id: "status-public-hero-done",
          name: "Done",
          position: 3,
          isClosed: true,
        },
        position: 1,
        assigneeId: "member-ava-ng",
        dueDate: "2026-04-08",
        createdAt: "2026-03-30T08:00:00.000Z",
        updatedAt: "2026-04-03T17:45:00.000Z",
      },
    ],
  },
];

export const publicHeroActivityEntries: ProjectActivityEntry[] = [
  {
    id: "activity-status-change",
    eventType: "STATUS_CHANGED",
    fieldName: "status",
    oldValue: "Todo",
    newValue: "In Progress",
    summary: "Moved invite flow into In Progress.",
    createdAt: "2026-04-04T11:30:00.000Z",
    actor: {
      id: "member-rory-kim",
      name: "Rory Kim",
    },
    task: {
      id: "task-refine-invite-flow",
      title: "Refine invite flow",
      statusId: "status-public-hero-progress",
      statusName: "In Progress",
      isClosed: false,
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
      statusId: "status-public-hero-progress",
      statusName: "In Progress",
      isClosed: false,
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
      statusId: "status-public-hero-done",
      statusName: "Done",
      isClosed: true,
    },
  },
];
