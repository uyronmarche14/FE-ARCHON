export type PlaceholderTaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type PlaceholderTaskCard = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: PlaceholderTaskStatus;
  assigneeName: string;
  assigneeInitials: string;
  dueLabel: string;
  priorityLabel: "High" | "Medium" | "Low";
  position: number;
};

type PlaceholderLane = {
  status: PlaceholderTaskStatus;
  title: string;
  description: string;
  tasks: PlaceholderTaskCard[];
};

type PlaceholderBoardMetric = {
  label: string;
  value: string;
};

type PlaceholderBoardModel = {
  lanes: PlaceholderLane[];
  metrics: PlaceholderBoardMetric[];
  projectName: string;
  tasks: PlaceholderTaskCard[];
};

const baseTasks = [
  {
    id: "task-api-envelope",
    title: "Draft API envelope",
    description: "Align response metadata and DTO naming before tasks go live.",
    status: "TODO",
    assigneeName: "Ron Marchero",
    assigneeInitials: "RM",
    dueLabel: "Due in 2 days",
    priorityLabel: "High",
    position: 1,
  },
  {
    id: "task-project-dtos",
    title: "Define project DTOs",
    description: "Prepare backend task contracts for CRUD work and future task fetches.",
    status: "TODO",
    assigneeName: "Jade Doe",
    assigneeInitials: "JD",
    dueLabel: "Due this week",
    priorityLabel: "Medium",
    position: 2,
  },
  {
    id: "task-smoke-notes",
    title: "Write smoke notes",
    description: "Capture the review checklist for the delivery flow before task mutations land.",
    status: "TODO",
    assigneeName: "Ari Lee",
    assigneeInitials: "AL",
    dueLabel: "No due date",
    priorityLabel: "Low",
    position: 3,
  },
  {
    id: "task-refresh-flow",
    title: "Wire refresh token flow",
    description: "Keep session bootstrap calm during auth routing and route-group transitions.",
    status: "IN_PROGRESS",
    assigneeName: "Ron Marchero",
    assigneeInitials: "RM",
    dueLabel: "Due tomorrow",
    priorityLabel: "High",
    position: 1,
  },
  {
    id: "task-dashboard-polish",
    title: "Polish dashboard loading state",
    description: "Tighten skeleton rules and board entry affordances across breakpoints.",
    status: "IN_PROGRESS",
    assigneeName: "Kai Tran",
    assigneeInitials: "KT",
    dueLabel: "Due this week",
    priorityLabel: "Medium",
    position: 2,
  },
  {
    id: "task-routes-scaffold",
    title: "Scaffold frontend routes",
    description: "Public and app route groups are in place and ready for live board flows.",
    status: "DONE",
    assigneeName: "Ron Marchero",
    assigneeInitials: "RM",
    dueLabel: "Completed",
    priorityLabel: "Low",
    position: 1,
  },
  {
    id: "task-base-button",
    title: "Set up shadcn base button",
    description: "Shared button primitives are installed, themed, and reusable across the app.",
    status: "DONE",
    assigneeName: "Ron Marchero",
    assigneeInitials: "RM",
    dueLabel: "Completed",
    priorityLabel: "Low",
    position: 2,
  },
] satisfies Omit<PlaceholderTaskCard, "projectId">[];

export function getPlaceholderBoard(projectId: string): PlaceholderBoardModel {
  const tasks = baseTasks.map((task) => ({
    ...task,
    projectId,
  }));
  const projectName = projectId.replace(/-/g, " ");
  const lanes: PlaceholderLane[] = [
    {
      status: "TODO",
      title: "Todo",
      description: "Queued work prepared for the next execution cycle.",
      tasks: tasks.filter((task) => task.status === "TODO"),
    },
    {
      status: "IN_PROGRESS",
      title: "In progress",
      description: "Work already moving and worth checking first.",
      tasks: tasks.filter((task) => task.status === "IN_PROGRESS"),
    },
    {
      status: "DONE",
      title: "Done",
      description: "Completed work that confirms delivery momentum.",
      tasks: tasks.filter((task) => task.status === "DONE"),
    },
  ];
  const inProgressCount = lanes.find((lane) => lane.status === "IN_PROGRESS")?.tasks.length ?? 0;
  const doneCount = lanes.find((lane) => lane.status === "DONE")?.tasks.length ?? 0;

  return {
    projectName,
    tasks,
    lanes,
    metrics: [
      { label: "Tracked tasks", value: String(tasks.length) },
      { label: "Active lane cards", value: String(inProgressCount) },
      { label: "Completed", value: String(doneCount) },
    ],
  };
}
