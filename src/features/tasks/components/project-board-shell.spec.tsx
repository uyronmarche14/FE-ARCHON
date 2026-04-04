import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClientError } from "@/services/http/api-client-error";
import { AuthSessionProvider } from "@/features/auth/providers/auth-session-provider";
import { ProjectBoardShell } from "@/features/tasks/components/project-board-shell";
import { projectsQueryKey } from "@/features/projects/lib/project-query-keys";

const getProjectsMock = vi.hoisted(() => vi.fn());
const getProjectTasksMock = vi.hoisted(() => vi.fn());
const getProjectDetailMock = vi.hoisted(() => vi.fn());
const getProjectActivityMock = vi.hoisted(() => vi.fn());
const getTaskLogsMock = vi.hoisted(() => vi.fn());
const createTaskMock = vi.hoisted(() => vi.fn());
const updateTaskMock = vi.hoisted(() => vi.fn());
const patchTaskStatusMock = vi.hoisted(() => vi.fn());
const deleteTaskMock = vi.hoisted(() => vi.fn());
const dndMock = vi.hoisted(() => {
  type DragHandlers = {
    onDragCancel?: () => void;
    onDragEnd?: (event: {
      active: { id: string };
      over: { id: string } | null;
    }) => void;
    onDragStart?: (event: { active: { id: string } }) => void;
  };

  let handlers: DragHandlers = {};

  return {
    registerHandlers(nextHandlers: DragHandlers) {
      handlers = nextHandlers;
    },
    reset() {
      handlers = {};
    },
    triggerDragCancel() {
      handlers.onDragCancel?.();
    },
    triggerDragEnd(activeId: string, overId: string | null) {
      handlers.onDragEnd?.({
        active: { id: activeId },
        over: overId ? { id: overId } : null,
      });
    },
    triggerDragStart(activeId: string) {
      handlers.onDragStart?.({
        active: { id: activeId },
      });
    },
  };
});
const toastMocks = vi.hoisted(() => ({
  showSuccessToast: vi.fn(),
  showApiErrorToast: vi.fn(),
}));

vi.mock("@dnd-kit/core", async () => {
  const React = await import("react");

  function DndContext({
    children,
    onDragCancel,
    onDragEnd,
    onDragStart,
  }: {
    children: React.ReactNode;
    onDragCancel?: () => void;
    onDragEnd?: (event: {
      active: { id: string };
      over: { id: string } | null;
    }) => void;
    onDragStart?: (event: { active: { id: string } }) => void;
  }) {
    React.useEffect(() => {
      dndMock.registerHandlers({
        onDragCancel,
        onDragEnd,
        onDragStart,
      });
    }, [onDragCancel, onDragEnd, onDragStart]);

    return React.createElement(React.Fragment, null, children);
  }

  return {
    closestCorners: vi.fn(),
    DndContext,
    DragOverlay: () => null,
    PointerSensor: function PointerSensor() {
      return null;
    },
    useDraggable: () => ({
      attributes: {},
      isDragging: false,
      listeners: {},
      setNodeRef: vi.fn(),
      transform: null,
    }),
    useDroppable: () => ({
      isOver: false,
      setNodeRef: vi.fn(),
    }),
    useSensor: vi.fn((_sensor: unknown, options?: unknown) => options ?? null),
    useSensors: (...sensors: unknown[]) => sensors,
  };
});

vi.mock("lucide-react", () => {
  const Icon = () => null;

  return {
    AlertTriangle: Icon,
    ArrowRight: Icon,
    ArrowUpDown: Icon,
    CalendarClock: Icon,
    Clock3: Icon,
    ChevronDown: Icon,
    CircleCheckBig: Icon,
    FileText: Icon,
    Filter: Icon,
    GripVertical: Icon,
    LayoutGrid: Icon,
    Layers3: Icon,
    LoaderCircle: Icon,
    MoreHorizontal: Icon,
    MailPlus: Icon,
    PencilLine: Icon,
    Plus: Icon,
    RefreshCw: Icon,
    Search: Icon,
    Sparkles: Icon,
    Trash2: Icon,
    UserRound: Icon,
    X: Icon,
  };
});

vi.mock("@/features/projects/services/get-projects", () => ({
  getProjects: getProjectsMock,
}));

vi.mock("@/features/tasks/services/get-project-tasks", () => ({
  getProjectTasks: getProjectTasksMock,
}));

vi.mock("@/features/projects/services/get-project-detail", () => ({
  getProjectDetail: getProjectDetailMock,
}));

vi.mock("@/features/projects/services/get-project-activity", () => ({
  getProjectActivity: getProjectActivityMock,
}));

vi.mock("@/features/projects/components/invite-member-dialog", () => ({
  InviteMemberDialog: () => <div data-testid="invite-member-dialog" />,
}));

vi.mock("@/features/projects/components/create-project-status-dialog", () => ({
  CreateProjectStatusDialog: () => <div data-testid="create-project-status-dialog" />,
}));

vi.mock("@/features/projects/components/manage-project-statuses-dialog", () => ({
  ManageProjectStatusesDialog: () => (
    <div data-testid="manage-project-statuses-dialog" />
  ),
}));

vi.mock("@/features/tasks/services/get-task-logs", () => ({
  getTaskLogs: getTaskLogsMock,
}));

vi.mock("@/features/tasks/services/create-task", () => ({
  createTask: createTaskMock,
}));

vi.mock("@/features/tasks/services/update-task", () => ({
  updateTask: updateTaskMock,
}));

vi.mock("@/features/tasks/services/patch-task-status", () => ({
  patchTaskStatus: patchTaskStatusMock,
}));

vi.mock("@/features/tasks/services/delete-task", () => ({
  deleteTask: deleteTaskMock,
}));

vi.mock("@/lib/toast", () => toastMocks);

function renderBoard(projectId = "qa-readiness") {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        <AuthSessionProvider bootstrapSession={false}>
          <ProjectBoardShell projectId={projectId} />
        </AuthSessionProvider>
      </QueryClientProvider>,
    ),
  };
}

function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width,
    writable: true,
  });
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("min-width: 768px)") ? width >= 768 : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
  window.dispatchEvent(new Event("resize"));
}

function createDeferredPromise<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error?: unknown) => void;

  const promise = new Promise<T>((nextResolve, nextReject) => {
    resolve = nextResolve;
    reject = nextReject;
  });

  return { promise, resolve, reject };
}

async function findTaskOpenButton(title: string) {
  const titleElement = await screen.findByText(title);
  const button = titleElement.closest("button");

  if (!button) {
    throw new Error(`Task button for "${title}" was not found.`);
  }

  return button;
}

function getTaskOpenButton(title: string) {
  const titleElement = screen.getByText(title);
  const button = titleElement.closest("button");

  if (!button) {
    throw new Error(`Task button for "${title}" was not found.`);
  }

  return button;
}

type TaskState = Array<{
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  position: number | null;
  assigneeId: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}>;

let taskState: TaskState = [];
let taskLogState: Record<string, Array<{
  id: string;
  eventType: "TASK_CREATED" | "TASK_UPDATED" | "STATUS_CHANGED";
  fieldName: string | null;
  oldValue: string | { id: string; name: string } | null;
  newValue: string | { id: string; name: string } | null;
  summary: string;
  actor: {
    id: string;
    name: string;
  };
  createdAt: string;
}>> = {};

const STATUS_DEFINITIONS = {
  DONE: {
    id: "status-done",
    name: "Done",
    position: 3,
    isClosed: true,
    color: "GREEN" as const,
  },
  IN_PROGRESS: {
    id: "status-progress",
    name: "In Progress",
    position: 2,
    isClosed: false,
    color: "BLUE" as const,
  },
  TODO: {
    id: "status-todo",
    name: "Todo",
    position: 1,
    isClosed: false,
    color: "SLATE" as const,
  },
} as const;

function createTaskCardFromState(
  task: TaskState[number],
  overrides: Partial<TaskState[number]> = {},
) {
  const nextTask = {
    ...task,
    ...overrides,
  };
  const status = STATUS_DEFINITIONS[nextTask.status];

  return {
    ...nextTask,
    statusId: status.id,
    status,
    acceptanceCriteria: null,
    notes: null,
    parentTaskId: null,
    links: [],
    checklistItems: [],
    subtasks: [],
  };
}

function createProjectStatusesFromState(tasks: TaskState) {
  return (Object.keys(STATUS_DEFINITIONS) as Array<keyof typeof STATUS_DEFINITIONS>)
    .map((statusKey) => ({
      ...STATUS_DEFINITIONS[statusKey],
      tasks: tasks
        .filter((task) => task.status === statusKey)
        .map((task) => createTaskCardFromState(task)),
    }))
    .sort((left, right) => left.position - right.position);
}

function createProjectSummaryFromTasks(tasks: TaskState) {
  return {
    id: "qa-readiness",
    name: "QA readiness",
    description: "Track the final validation work before release.",
    role: "OWNER" as const,
    statuses: createProjectStatusesFromState(tasks).map((status) => ({
      id: status.id,
      name: status.name,
      position: status.position,
      isClosed: status.isClosed,
      color: status.color,
      taskCount: status.tasks.length,
    })),
  };
}

function formatTaskStatusLabel(status: "TODO" | "IN_PROGRESS" | "DONE") {
  return STATUS_DEFINITIONS[status].name;
}

describe("ProjectBoardShell", () => {
  beforeEach(() => {
    setViewportWidth(1024);

    taskState = [
      {
        id: "task-api-envelope",
        projectId: "qa-readiness",
        title: "Draft API envelope",
        description: "Align response metadata before the live board ships.",
        status: "TODO",
        position: 1,
        assigneeId: null,
        dueDate: null,
        createdAt: "2026-04-01T09:00:00.000Z",
        updatedAt: "2026-04-01T09:00:00.000Z",
      },
      {
        id: "task-refresh-flow",
        projectId: "qa-readiness",
        title: "Wire refresh token flow",
        description: "Keep session bootstrap calm during auth routing.",
        status: "IN_PROGRESS",
        position: null,
        assigneeId: "member-1",
        dueDate: "2026-04-10",
        createdAt: "2026-04-02T09:00:00.000Z",
        updatedAt: "2026-04-02T10:00:00.000Z",
      },
    ];
    taskLogState = {};

    getProjectsMock.mockReset();
    getProjectTasksMock.mockReset();
    getProjectDetailMock.mockReset();
    getProjectActivityMock.mockReset();
    getTaskLogsMock.mockReset();
    createTaskMock.mockReset();
    updateTaskMock.mockReset();
    patchTaskStatusMock.mockReset();
    deleteTaskMock.mockReset();
    dndMock.reset();
    toastMocks.showSuccessToast.mockReset();
    toastMocks.showApiErrorToast.mockReset();

    getProjectsMock.mockImplementation(async () => ({
      items: [createProjectSummaryFromTasks(taskState)],
    }));
    getProjectTasksMock.mockImplementation(async () => ({
      statuses: createProjectStatusesFromState(taskState),
    }));
    getProjectDetailMock.mockResolvedValue({
      id: "qa-readiness",
      name: "QA readiness",
      description: "Track the final validation work before release.",
      members: [
        {
          id: "member-1",
          name: "Jordan Lane",
          role: "MEMBER",
        },
        {
          id: "owner-1",
          name: "Ron Marchero",
          role: "OWNER",
        },
      ],
      statuses: createProjectStatusesFromState(taskState),
    });
    getTaskLogsMock.mockImplementation(async (taskId: string) => ({
      items: taskLogState[taskId] ?? [],
    }));
    getProjectActivityMock.mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 10,
      hasMore: false,
    });
    createTaskMock.mockImplementation(
      async (
        projectId: string,
        request: {
          title: string;
          description?: string;
          statusId?: string;
          assigneeId?: string;
          dueDate?: string;
        },
      ) => {
        const status =
          Object.values(STATUS_DEFINITIONS).find(
            (entry) => entry.id === request.statusId,
          ) ?? STATUS_DEFINITIONS.TODO;
        const createdTaskState: TaskState[number] = {
          id: "task-new",
          projectId,
          title: request.title,
          description: request.description ?? null,
          status:
            (Object.entries(STATUS_DEFINITIONS).find(
              ([, entry]) => entry.id === status.id,
            )?.[0] as TaskState[number]["status"] | undefined) ?? "TODO",
          position: null,
          assigneeId: request.assigneeId ?? null,
          dueDate: request.dueDate ?? null,
          createdAt: "2026-04-04T09:00:00.000Z",
          updatedAt: "2026-04-04T09:00:00.000Z",
        };
        const createdTask = createTaskCardFromState(createdTaskState);

        taskState = [...taskState, createdTaskState];
        taskLogState = {
          ...taskLogState,
          [createdTask.id]: [
            {
              id: `log-${createdTask.id}-created`,
              eventType: "TASK_CREATED",
              fieldName: null,
              oldValue: null,
              newValue: null,
              summary: "Member User created the task",
              actor: {
                id: "member-1",
                name: "Member User",
              },
              createdAt: "2026-04-04T09:00:00.000Z",
            },
          ],
        };

        return createdTask;
      },
    );
    updateTaskMock.mockImplementation(
      async (
        taskId: string,
        request: {
          title?: string;
          description?: string | null;
          assigneeId?: string | null;
          dueDate?: string | null;
        },
      ) => {
        const existingTask = taskState.find((task) => task.id === taskId);

        if (!existingTask) {
          throw new Error("Task not found");
        }

        const updatedTask = {
          ...existingTask,
          ...request,
          updatedAt: "2026-04-05T09:00:00.000Z",
        };

        taskState = taskState.map((task) =>
          task.id === taskId ? updatedTask : task,
        );
        taskLogState = {
          ...taskLogState,
          [taskId]: [
            {
              id: `log-${taskId}-${(taskLogState[taskId]?.length ?? 0) + 1}`,
              eventType: "TASK_UPDATED",
              fieldName: "title",
              oldValue: existingTask.title,
              newValue: request.title ?? existingTask.title,
              summary: "Member User updated the title",
              actor: {
                id: "member-1",
                name: "Member User",
              },
              createdAt: "2026-04-05T09:00:00.000Z",
            },
            ...(taskLogState[taskId] ?? []),
          ],
        };

        return updatedTask;
      },
    );
    patchTaskStatusMock.mockImplementation(
      async (
        taskId: string,
        request: { statusId: string; position?: number | null },
      ) => {
        const existingTask = taskState.find((task) => task.id === taskId);

        if (!existingTask) {
          throw new Error("Task not found");
        }

        const nextStatusEntry =
          Object.entries(STATUS_DEFINITIONS).find(
            ([, entry]) => entry.id === request.statusId,
          ) ?? null;

        if (!nextStatusEntry) {
          throw new Error("Status not found");
        }

        const updatedTaskState: TaskState[number] = {
          ...existingTask,
          status: nextStatusEntry[0] as TaskState[number]["status"],
          position: request.position ?? null,
          updatedAt: "2026-04-06T09:00:00.000Z",
        };
        const updatedTask = createTaskCardFromState(updatedTaskState);

        taskState = taskState.map((task) =>
          task.id === taskId ? updatedTaskState : task,
        );
        taskLogState = {
          ...taskLogState,
          [taskId]: [
            {
              id: `log-${taskId}-status-${(taskLogState[taskId]?.length ?? 0) + 1}`,
              eventType: "STATUS_CHANGED",
              fieldName: "status",
              oldValue: existingTask.status,
              newValue: updatedTaskState.status,
              summary: `Member User moved the task from ${formatTaskStatusLabel(existingTask.status)} to ${formatTaskStatusLabel(updatedTaskState.status)}`,
              actor: {
                id: "member-1",
                name: "Member User",
              },
              createdAt: "2026-04-06T09:00:00.000Z",
            },
            ...(taskLogState[taskId] ?? []),
          ],
        };

        return updatedTask;
      },
    );
    deleteTaskMock.mockImplementation(async (taskId: string) => {
      taskState = taskState.filter((task) => task.id !== taskId);

      return {
        message: "Task deleted successfully",
      };
    });
  });

  it("shows a loading state before grouped tasks resolve", async () => {
    const deferredTasks = createDeferredPromise<{
      statuses: ReturnType<typeof createProjectStatusesFromState>;
    }>();

    getProjectTasksMock.mockReturnValueOnce(deferredTasks.promise);

    renderBoard();

    expect(screen.getByLabelText("Loading project tasks")).toBeInTheDocument();

    deferredTasks.resolve({
      statuses: createProjectStatusesFromState([
        {
          id: "task-api-envelope",
          projectId: "qa-readiness",
          title: "Draft API envelope",
          description: "Align response metadata before the live board ships.",
          status: "TODO",
          position: 1,
          assigneeId: null,
          dueDate: null,
          createdAt: "2026-04-01T09:00:00.000Z",
          updatedAt: "2026-04-01T09:00:00.000Z",
        },
      ]),
    });

    expect(await findTaskOpenButton("Draft API envelope")).toBeInTheDocument();
    expect(screen.getByText("Draft API envelope")).toBeInTheDocument();
  });

  it("renders live grouped task lanes and opens the centered task workspace from a task card", async () => {
    renderBoard();

    expect(await findTaskOpenButton("Draft API envelope")).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.getByRole("img", { name: /assignee jordan lane/i }),
      ).toBeInTheDocument();
    });
    expect(screen.getByRole("tab", { name: "Board" })).toHaveAttribute(
      "data-state",
      "active",
    );
    expect(
      screen.getByPlaceholderText(
        "Search title, summary, acceptance criteria, or notes",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create task/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("board-lanes-scroll-area")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Todo" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "In Progress" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Done" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /drag draft api envelope/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/no fixed order in/i)).not.toBeInTheDocument();

    fireEvent.click(getTaskOpenButton("Draft API envelope"));

    const drawer = await screen.findByRole("dialog", {
      name: /draft api envelope/i,
    });

    expect(drawer).toBeInTheDocument();
    expect(drawer).toHaveClass("!w-[min(calc(100%-1rem),58rem)]");
  });

  it("shows resolved member names instead of raw assignee ids in the drawer preview", async () => {
    renderBoard();

    expect(await findTaskOpenButton("Wire refresh token flow")).toBeInTheDocument();

    fireEvent.click(getTaskOpenButton("Wire refresh token flow"));

    const drawer = await screen.findByRole("dialog", {
      name: /wire refresh token flow/i,
    });

    expect(within(drawer).getAllByText("Jordan Lane").length).toBeGreaterThan(0);
    expect(within(drawer).queryByText("member-1")).not.toBeInTheDocument();
  });

  it("keeps secondary task sections collapsed by default and expands on demand", async () => {
    renderBoard();

    expect(await findTaskOpenButton("Draft API envelope")).toBeInTheDocument();

    fireEvent.click(getTaskOpenButton("Draft API envelope"));

    const drawer = await screen.findByRole("dialog", {
      name: /draft api envelope/i,
    });

    expect(
      within(drawer).getByRole("button", { name: /acceptance criteria/i }),
    ).toBeInTheDocument();
    expect(
      within(drawer).queryByText("No acceptance criteria captured yet."),
    ).not.toBeInTheDocument();

    fireEvent.click(
      within(drawer).getByRole("button", { name: /acceptance criteria/i }),
    );

    expect(
      await within(drawer).findByText("No acceptance criteria captured yet."),
    ).toBeInTheDocument();
  });

  it("switches between compact board and activity tabs without stacking both surfaces", async () => {
    getProjectActivityMock.mockResolvedValueOnce({
      items: [
        {
          id: "activity-1",
          eventType: "STATUS_CHANGED",
          fieldName: "status",
          oldValue: "TODO",
          newValue: "IN_PROGRESS",
          summary: "Member User moved the task from Todo to In Progress",
          actor: {
            id: "member-1",
            name: "Member User",
          },
          createdAt: "2026-04-06T09:00:00.000Z",
          task: {
            id: "task-api-envelope",
            title: "Draft API envelope",
            statusId: STATUS_DEFINITIONS.IN_PROGRESS.id,
            statusName: STATUS_DEFINITIONS.IN_PROGRESS.name,
            isClosed: STATUS_DEFINITIONS.IN_PROGRESS.isClosed,
          },
        },
      ],
      page: 1,
      pageSize: 10,
      hasMore: false,
    });

    renderBoard();

    expect(await findTaskOpenButton("Draft API envelope")).toBeInTheDocument();
    expect(getProjectActivityMock).toHaveBeenCalledTimes(0);
    expect(
      screen.getByPlaceholderText(
        "Search title, summary, acceptance criteria, or notes",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Search project activity"),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Activity" }));

    expect(
      await screen.findByLabelText("Search project activity"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Member User moved the task from Todo to In Progress"),
    ).toBeInTheDocument();
    expect(getProjectActivityMock).toHaveBeenCalledWith("qa-readiness", {
      eventType: "ALL",
      page: 1,
      pageSize: 10,
      q: "",
    });
    expect(
      screen.queryByPlaceholderText(
        "Search title, summary, acceptance criteria, or notes",
      ),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("board-lanes-scroll-area")).not.toBeInTheDocument();
  });

  it("moves a task across lanes optimistically and calls the status patch endpoint", async () => {
    const { queryClient } = renderBoard();

    expect(await findTaskOpenButton("Draft API envelope")).toBeInTheDocument();

    expect(
      within(screen.getByTestId("lane-todo")).getByText("Draft API envelope"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId("lane-done")).queryByText("Draft API envelope"),
    ).not.toBeInTheDocument();

    await act(async () => {
      dndMock.triggerDragStart("task-api-envelope");
      dndMock.triggerDragEnd("task-api-envelope", STATUS_DEFINITIONS.DONE.id);
    });

    await waitFor(() => {
      expect(patchTaskStatusMock).toHaveBeenCalledWith("task-api-envelope", {
        statusId: STATUS_DEFINITIONS.DONE.id,
      });
    });

    await waitFor(() => {
      expect(
        within(screen.getByTestId("lane-done")).getByText("Draft API envelope"),
      ).toBeInTheDocument();
      expect(
        within(screen.getByTestId("lane-todo")).queryByText("Draft API envelope"),
      ).not.toBeInTheDocument();
    });

    expect(queryClient.getQueryData(projectsQueryKey)).toMatchObject({
      items: [
        {
          id: "qa-readiness",
          statuses: [
            { id: STATUS_DEFINITIONS.TODO.id, taskCount: 0 },
            { id: STATUS_DEFINITIONS.IN_PROGRESS.id, taskCount: 1 },
            { id: STATUS_DEFINITIONS.DONE.id, taskCount: 1 },
          ],
        },
      ],
    });
  });

  it("rolls the board state back when a status patch fails", async () => {
    patchTaskStatusMock.mockRejectedValueOnce(
      new ApiClientError({
        message: "Status update failed",
        code: "VALIDATION_ERROR",
        status: 400,
        details: undefined,
      }),
    );

    const { queryClient } = renderBoard();

    expect(await findTaskOpenButton("Draft API envelope")).toBeInTheDocument();

    await act(async () => {
      dndMock.triggerDragEnd("task-api-envelope", STATUS_DEFINITIONS.DONE.id);
    });

    await waitFor(() => {
      expect(toastMocks.showApiErrorToast).toHaveBeenCalledWith(
        expect.any(ApiClientError),
        "Task move failed and the board was restored.",
      );
    });

    expect(
      within(screen.getByTestId("lane-todo")).getByText("Draft API envelope"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId("lane-done")).queryByText("Draft API envelope"),
    ).not.toBeInTheDocument();

    expect(queryClient.getQueryData(projectsQueryKey)).toMatchObject({
      items: [
        {
          id: "qa-readiness",
          statuses: [
            { id: STATUS_DEFINITIONS.TODO.id, taskCount: 1 },
            { id: STATUS_DEFINITIONS.IN_PROGRESS.id, taskCount: 1 },
            { id: STATUS_DEFINITIONS.DONE.id, taskCount: 0 },
          ],
        },
      ],
    });
  });

  it("opens create from the header with Todo selected by default", async () => {
    renderBoard();

    expect(await findTaskOpenButton("Draft API envelope")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^create task$/i }));

    const createDrawer = await screen.findByRole("dialog", { name: /create task/i });
    expect(getProjectDetailMock).toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText("Task title"), {
      target: { value: "  Prepare   qa wrap-up  " },
    });

    fireEvent.click(
      within(createDrawer).getByRole("button", { name: /^create task$/i }),
    );

    await waitFor(() => {
      expect(createTaskMock).toHaveBeenCalledWith("qa-readiness", {
        title: "Prepare qa wrap-up",
        statusId: STATUS_DEFINITIONS.TODO.id,
      });
    });
  });

  it("opens create from a lane, loads members, and adds the task to that lane", async () => {
    renderBoard();

    expect(await findTaskOpenButton("Draft API envelope")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /add task to done/i }));

    expect(
      await screen.findByRole("dialog", { name: /create task/i }),
    ).toBeInTheDocument();
    expect((await screen.findAllByRole("option", { name: /Jordan Lane/ })).length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText("Task title"), {
      target: { value: "Publish smoke notes" },
    });
    fireEvent.change(screen.getByLabelText("Assignee"), {
      target: { value: "member-1" },
    });
    fireEvent.change(screen.getByLabelText("Due date"), {
      target: { value: "2026-04-12" },
    });
    const createDrawer = await screen.findByRole("dialog", { name: /create task/i });

    fireEvent.click(
      within(createDrawer).getByRole("button", { name: /^create task$/i }),
    );

    await waitFor(() => {
      expect(createTaskMock).toHaveBeenCalledWith("qa-readiness", {
        title: "Publish smoke notes",
        statusId: STATUS_DEFINITIONS.DONE.id,
        assigneeId: "member-1",
        dueDate: "2026-04-12",
      });
    });

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: /create task/i }),
      ).not.toBeInTheDocument();
      expect(screen.getByText("Publish smoke notes")).toBeInTheDocument();
    });

    expect(toastMocks.showSuccessToast).toHaveBeenCalledWith(
      "Task created",
      "The new card is ready on the board.",
    );
  });

  it("edits a task and returns the drawer to view mode", async () => {
    renderBoard();

    expect(await findTaskOpenButton("Wire refresh token flow")).toBeInTheDocument();

    fireEvent.click(getTaskOpenButton("Wire refresh token flow"));
    fireEvent.click(screen.getByRole("button", { name: /edit task/i }));

    expect(await screen.findByRole("heading", { name: /edit task/i })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Task title"), {
      target: { value: "Wire refresh token flow safely" },
    });
    fireEvent.change(screen.getByLabelText("Summary"), {
      target: { value: "Keep auth recovery steady during app bootstrap." },
    });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(updateTaskMock).toHaveBeenCalledWith("task-refresh-flow", {
        title: "Wire refresh token flow safely",
        description: "Keep auth recovery steady during app bootstrap.",
      });
    });

    expect(
      await screen.findByRole("dialog", {
        name: /wire refresh token flow safely/i,
      }),
    ).toBeInTheDocument();
    expect(toastMocks.showSuccessToast).toHaveBeenCalledWith(
      "Task updated",
      "Changes were saved without leaving the board.",
    );
  });

  it("shows inline delete confirmation and removes the task on delete", async () => {
    renderBoard();

    expect(await findTaskOpenButton("Draft API envelope")).toBeInTheDocument();

    fireEvent.click(getTaskOpenButton("Draft API envelope"));
    fireEvent.click(screen.getByRole("button", { name: /delete task/i }));

    expect(
      await screen.findByText(/deleting removes this task from the board immediately\./i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /confirm delete/i }));

    await waitFor(() => {
      expect(deleteTaskMock).toHaveBeenCalledWith("task-api-envelope");
      expect(
        screen.queryByRole("dialog", { name: /draft api envelope/i }),
      ).not.toBeInTheDocument();
    });

    expect(screen.queryByText("Draft API envelope")).not.toBeInTheDocument();
    expect(toastMocks.showSuccessToast).toHaveBeenCalledWith(
      "Task deleted",
      "The card was removed from the board.",
    );
  });

  it("keeps all three columns visible and shows empty-lane guidance", async () => {
    getProjectTasksMock.mockResolvedValueOnce({
      statuses: createProjectStatusesFromState([
        {
          id: "task-complete",
          projectId: "qa-readiness",
          title: "Publish smoke notes",
          description: null,
          status: "DONE",
          position: null,
          assigneeId: null,
          dueDate: null,
          createdAt: "2026-04-03T09:00:00.000Z",
          updatedAt: "2026-04-03T09:00:00.000Z",
        },
      ]),
    });

    renderBoard();

    expect(
      await screen.findByText("Publish smoke notes"),
    ).toBeInTheDocument();
    expect(screen.getByText("No cards in Todo.")).toBeInTheDocument();
    expect(screen.getByText("No cards in In Progress.")).toBeInTheDocument();
    expect(screen.getByText("Publish smoke notes")).toBeInTheDocument();
  });

  it("shows a retry surface when task loading fails and can recover", async () => {
    getProjectTasksMock
      .mockRejectedValueOnce(new Error("Network failed"))
      .mockResolvedValueOnce({
        statuses: createProjectStatusesFromState([]),
      });

    renderBoard();

    expect(
      await screen.findByText(/we couldn't load the board right now/i),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /retry loading tasks/i }),
    );

    expect(
      await screen.findByRole("button", { name: /create task/i }),
    ).toBeInTheDocument();
    expect(getProjectTasksMock).toHaveBeenCalledTimes(2);
  });

  it("renders backend validation errors inline inside the drawer", async () => {
    createTaskMock.mockRejectedValueOnce(
      new ApiClientError({
        message: "Request validation failed",
        code: "VALIDATION_ERROR",
        status: 400,
        details: {
          title: ["Task title must be 160 characters or fewer."],
        },
      }),
    );

    renderBoard();

    expect(await findTaskOpenButton("Draft API envelope")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^create task$/i }));
    fireEvent.change(screen.getByLabelText("Task title"), {
      target: { value: "Task title" },
    });
    const createDrawer = await screen.findByRole("dialog", { name: /create task/i });

    fireEvent.click(
      within(createDrawer).getByRole("button", { name: /^create task$/i }),
    );

    expect(
      await screen.findByText("Task title must be 160 characters or fewer."),
    ).toBeInTheDocument();
    expect(toastMocks.showApiErrorToast).not.toHaveBeenCalled();
  });

  it("loads logs only in view mode and shows an empty state when none exist", async () => {
    renderBoard();

    expect(await findTaskOpenButton("Draft API envelope")).toBeInTheDocument();
    expect(getTaskLogsMock).toHaveBeenCalledTimes(0);

    fireEvent.click(screen.getByRole("button", { name: /^create task$/i }));
    expect(await screen.findByRole("dialog", { name: /create task/i })).toBeInTheDocument();
    expect(getTaskLogsMock).toHaveBeenCalledTimes(0);

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    fireEvent.click(getTaskOpenButton("Draft API envelope"));
    const taskDrawer = await screen.findByRole("dialog", {
      name: /draft api envelope/i,
    });

    expect(within(taskDrawer).getByRole("tab", { name: "Task" })).toHaveAttribute(
      "data-state",
      "active",
    );
    expect(getTaskLogsMock).toHaveBeenCalledTimes(0);

    fireEvent.click(within(taskDrawer).getByRole("tab", { name: "Activity" }));

    expect(await screen.findByText(/no activity yet/i)).toBeInTheDocument();
    expect(getTaskLogsMock).toHaveBeenCalledWith("task-api-envelope", {
      page: 1,
      pageSize: 10,
    });
  });

  it("resets the drawer to task when a different task is opened", async () => {
    renderBoard();

    expect(await findTaskOpenButton("Draft API envelope")).toBeInTheDocument();

    fireEvent.click(getTaskOpenButton("Draft API envelope"));

    let taskDrawer = await screen.findByRole("dialog", {
      name: /draft api envelope/i,
    });

    fireEvent.click(within(taskDrawer).getByRole("tab", { name: "Activity" }));
    expect(await screen.findByText(/no activity yet/i)).toBeInTheDocument();
    expect(getTaskLogsMock).toHaveBeenCalledTimes(1);

    fireEvent.click(getTaskOpenButton("Wire refresh token flow"));

    taskDrawer = await screen.findByRole("dialog", {
      name: /wire refresh token flow/i,
    });

    expect(
      within(taskDrawer).getByRole("tab", { name: "Task" }),
    ).toHaveAttribute("data-state", "active");
    expect(within(taskDrawer).queryByText(/no activity yet/i)).not.toBeInTheDocument();
    expect(getTaskLogsMock).toHaveBeenCalledTimes(1);
  });

  it("renders newest-first log history and can retry after a log load error", async () => {
    taskLogState["task-refresh-flow"] = [
      {
        id: "log-status",
        eventType: "STATUS_CHANGED",
        fieldName: "status",
        oldValue: "TODO",
        newValue: "IN_PROGRESS",
        summary: "Member User moved the task from Todo to In Progress",
        actor: {
          id: "member-1",
          name: "Member User",
        },
        createdAt: "2026-04-06T09:00:00.000Z",
      },
      {
        id: "log-created",
        eventType: "TASK_CREATED",
        fieldName: null,
        oldValue: null,
        newValue: null,
        summary: "Member User created the task",
        actor: {
          id: "member-1",
          name: "Member User",
        },
        createdAt: "2026-04-02T09:00:00.000Z",
      },
    ];
    getTaskLogsMock
      .mockRejectedValueOnce(new Error("History failed"))
      .mockImplementation(async (taskId: string) => ({
        items: taskLogState[taskId] ?? [],
      }));

    renderBoard();

    expect(await findTaskOpenButton("Wire refresh token flow")).toBeInTheDocument();

    fireEvent.click(getTaskOpenButton("Wire refresh token flow"));
    const taskDrawer = await screen.findByRole("dialog", {
      name: /wire refresh token flow/i,
    });
    fireEvent.click(within(taskDrawer).getByRole("tab", { name: "Activity" }));

    expect(
      await screen.findByText("We couldn't load the activity log."),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /retry loading logs/i }));

    expect(
      await screen.findByText("Member User moved the task from Todo to In Progress"),
    ).toBeInTheDocument();

    const logItems = screen.getAllByRole("listitem");
    expect(logItems[0]).toHaveTextContent("Member User moved the task from Todo to In Progress");
    expect(logItems[1]).toHaveTextContent("Member User created the task");
  });

  it("refreshes log history after edit and status mutations", async () => {
    taskLogState["task-refresh-flow"] = [];

    renderBoard();

    expect(await findTaskOpenButton("Wire refresh token flow")).toBeInTheDocument();

    fireEvent.click(getTaskOpenButton("Wire refresh token flow"));

    fireEvent.click(screen.getByRole("button", { name: /edit task/i }));
    fireEvent.change(screen.getByLabelText("Task title"), {
      target: { value: "Wire refresh token flow safely" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    const taskDrawer = await screen.findByRole("dialog", {
      name: /wire refresh token flow safely/i,
    });
    fireEvent.click(within(taskDrawer).getByRole("tab", { name: "Activity" }));

    expect(
      await screen.findByText("Member User updated the title"),
    ).toBeInTheDocument();

    await act(async () => {
      dndMock.triggerDragEnd("task-refresh-flow", STATUS_DEFINITIONS.DONE.id);
    });

    await waitFor(() => {
      expect(
        screen.getByText("Member User moved the task from In Progress to Done"),
      ).toBeInTheDocument();
    });
    expect(getTaskLogsMock).toHaveBeenCalledWith("task-refresh-flow", {
      page: 1,
      pageSize: 10,
    });
  });

  it("stacks all lanes on mobile so every drop target stays visible", async () => {
    setViewportWidth(480);

    renderBoard();

    expect(await screen.findByTestId("mobile-board-lane-stack")).toBeInTheDocument();
    expect(screen.queryByTestId("board-lanes-scroll-area")).not.toBeInTheDocument();
    expect(screen.getByText("Draft API envelope")).toBeInTheDocument();
    expect(screen.getByText("Wire refresh token flow")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Done" })).toBeInTheDocument();
  });
});
