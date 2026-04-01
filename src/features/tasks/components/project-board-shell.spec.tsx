import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectBoardShell } from "@/features/tasks/components/project-board-shell";

const getProjectsMock = vi.hoisted(() => vi.fn());
const getProjectTasksMock = vi.hoisted(() => vi.fn());

vi.mock("lucide-react", () => {
  const Icon = () => null;

  return {
    ArrowUpDown: Icon,
    CalendarClock: Icon,
    ChevronDown: Icon,
    CircleCheckBig: Icon,
    Filter: Icon,
    History: Icon,
    LayoutGrid: Icon,
    Layers3: Icon,
    MoreHorizontal: Icon,
    Plus: Icon,
    Search: Icon,
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

function renderBoard(projectId = "qa-readiness") {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ProjectBoardShell projectId={projectId} />
    </QueryClientProvider>,
  );
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

describe("ProjectBoardShell", () => {
  beforeEach(() => {
    getProjectsMock.mockReset();
    getProjectTasksMock.mockReset();

    getProjectsMock.mockResolvedValue({
      items: [
        {
          id: "qa-readiness",
          name: "QA readiness",
          description: "Track the final validation work before release.",
          role: "OWNER",
          taskCounts: {
            TODO: 1,
            IN_PROGRESS: 1,
            DONE: 0,
          },
        },
      ],
    });
  });

  it("shows a loading state before grouped tasks resolve", async () => {
    const deferredTasks = createDeferredPromise<{
      taskGroups: {
        TODO: Array<{
          id: string;
          projectId: string;
          title: string;
          description: string | null;
          status: "TODO";
          position: number | null;
          assigneeId: string | null;
          dueDate: string | null;
          createdAt: string;
          updatedAt: string;
        }>;
        IN_PROGRESS: [];
        DONE: [];
      };
    }>();

    getProjectTasksMock.mockReturnValueOnce(deferredTasks.promise);

    renderBoard();

    expect(screen.getByLabelText("Loading project tasks")).toBeInTheDocument();

    deferredTasks.resolve({
      taskGroups: {
        TODO: [
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
        ],
        IN_PROGRESS: [],
        DONE: [],
      },
    });

    expect(
      await screen.findByRole("button", { name: /draft api envelope/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Draft API envelope")).toBeInTheDocument();
  });

  it("renders live grouped task lanes and opens a preview from a task card", async () => {
    getProjectTasksMock.mockResolvedValueOnce({
      taskGroups: {
        TODO: [
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
        ],
        IN_PROGRESS: [
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
        ],
        DONE: [],
      },
    });

    renderBoard();

    expect(
      await screen.findByRole("button", { name: /draft api envelope/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Search title, assignee, due date"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create task/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("board-lanes-scroll-area")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Todo" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "In progress" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Done" })).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /draft api envelope/i }),
    );

    expect(
      await screen.findByRole("dialog", { name: /draft api envelope/i }),
    ).toBeInTheDocument();
  });

  it("keeps all three columns visible and shows empty-lane guidance", async () => {
    getProjectTasksMock.mockResolvedValueOnce({
      taskGroups: {
        TODO: [],
        IN_PROGRESS: [],
        DONE: [
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
        ],
      },
    });

    renderBoard();

    expect(
      await screen.findByText("Publish smoke notes"),
    ).toBeInTheDocument();
    expect(screen.getByText("No cards in Todo.")).toBeInTheDocument();
    expect(screen.getByText("No cards in In progress.")).toBeInTheDocument();
    expect(screen.getByText("Publish smoke notes")).toBeInTheDocument();
  });

  it("shows a retry surface when task loading fails and can recover", async () => {
    getProjectTasksMock
      .mockRejectedValueOnce(new Error("Network failed"))
      .mockResolvedValueOnce({
        taskGroups: {
          TODO: [],
          IN_PROGRESS: [],
          DONE: [],
        },
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
});
