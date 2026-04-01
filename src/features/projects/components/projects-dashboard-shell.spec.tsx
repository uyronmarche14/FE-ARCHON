import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectsDashboardShell } from "@/features/projects/components/projects-dashboard-shell";

const navigationState = vi.hoisted(() => ({
  push: vi.fn(),
}));

let projectsState: Array<{
  id: string;
  name: string;
  description: string | null;
  role: "OWNER" | "MEMBER";
  taskCounts: {
    TODO: number;
    IN_PROGRESS: number;
    DONE: number;
  };
}> = [];

const getProjectsMock = vi.hoisted(() => vi.fn());
const createProjectMock = vi.hoisted(() => vi.fn());
const toastMocks = vi.hoisted(() => ({
  showSuccessToast: vi.fn(),
  showApiErrorToast: vi.fn(),
}));

vi.mock("lucide-react", () => {
  const Icon = () => null;

  return {
    ArrowRight: Icon,
    Compass: Icon,
    FolderKanban: Icon,
    ListChecks: Icon,
    LoaderCircle: Icon,
    Plus: Icon,
    RefreshCcw: Icon,
    X: Icon,
  };
});

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => navigationState,
}));

vi.mock("@/components/ui/dialog", async () => {
  const React = await import("react");

  const DialogContext = React.createContext<{
    open: boolean;
    onOpenChange?: (open: boolean) => void;
  } | null>(null);

  function Dialog({
    open,
    onOpenChange,
    children,
  }: {
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    children: ReactNode;
  }) {
    return React.createElement(
      DialogContext.Provider,
      { value: { open, onOpenChange } },
      children,
    );
  }

  function DialogTrigger({
    children,
    asChild,
  }: {
    children: React.ReactElement;
    asChild?: boolean;
  }) {
    const context = React.useContext(DialogContext);
    const childElement = children as React.ReactElement<{
      onClick?: (event: React.MouseEvent<HTMLElement>) => void;
    }>;

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(childElement, {
        onClick: (event: React.MouseEvent<HTMLElement>) => {
          childElement.props.onClick?.(event);
          context?.onOpenChange?.(true);
        },
      });
    }

    return React.createElement(
      "button",
      {
        type: "button",
        onClick: () => context?.onOpenChange?.(true),
      },
      children,
    );
  }

  function DialogContent({ children }: { children: ReactNode }) {
    const context = React.useContext(DialogContext);

    return context?.open
      ? React.createElement("div", null, children)
      : null;
  }

  function DialogHeader({ children }: { children: ReactNode }) {
    return React.createElement("div", null, children);
  }

  function DialogFooter({ children }: { children: ReactNode }) {
    return React.createElement("div", null, children);
  }

  function DialogTitle({ children }: { children: ReactNode }) {
    return React.createElement("h2", null, children);
  }

  function DialogDescription({ children }: { children: ReactNode }) {
    return React.createElement("p", null, children);
  }

  return {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  };
});

vi.mock("@/features/projects/services/get-projects", () => ({
  getProjects: getProjectsMock,
}));

vi.mock("@/features/projects/services/create-project", () => ({
  createProject: createProjectMock,
}));

vi.mock("@/lib/toast", () => toastMocks);

function renderDashboard() {
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

  return render(
    <QueryClientProvider client={queryClient}>
      <ProjectsDashboardShell />
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

describe("ProjectsDashboardShell", () => {
  beforeEach(() => {
    projectsState = [];
    navigationState.push.mockReset();
    getProjectsMock.mockReset();
    createProjectMock.mockReset();
    toastMocks.showSuccessToast.mockReset();
    toastMocks.showApiErrorToast.mockReset();
  });

  it("renders a loading state before showing the simple dashboard cards", async () => {
    const deferredProjects = createDeferredPromise<{ items: typeof projectsState }>();
    getProjectsMock.mockReturnValueOnce(deferredProjects.promise);

    renderDashboard();

    expect(screen.getByLabelText("Loading projects")).toBeInTheDocument();

    deferredProjects.resolve({
      items: [
        {
          id: "launch-planning",
          name: "Launch planning",
          description: "Coordinate the release work across the team.",
          role: "OWNER",
          taskCounts: {
            TODO: 4,
            IN_PROGRESS: 2,
            DONE: 5,
          },
        },
      ],
    });

    expect(
      (await screen.findAllByText("Launch planning")).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /open board/i }),
    ).toBeInTheDocument();
  });

  it("renders the empty state when there are no accessible projects", async () => {
    getProjectsMock.mockResolvedValueOnce({
      items: [],
    });

    renderDashboard();

    expect(
      await screen.findByRole("heading", { name: /start with the first project/i }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /create project/i }).length,
    ).toBeGreaterThan(0);
  });

  it("validates, creates, refreshes, and routes into the new project", async () => {
    projectsState = [
      {
        id: "launch-planning",
        name: "Launch planning",
        description: "Coordinate the release work across the team.",
        role: "OWNER",
        taskCounts: {
          TODO: 4,
          IN_PROGRESS: 2,
          DONE: 5,
        },
      },
    ];

    getProjectsMock.mockImplementation(async () => ({
      items: projectsState,
    }));
    createProjectMock.mockImplementation(
      async (request: { name: string; description?: string }) => {
        const createdProject = {
          id: "qa-readiness",
          name: request.name,
          description: request.description ?? null,
          role: "OWNER" as const,
          taskCounts: {
            TODO: 0,
            IN_PROGRESS: 0,
            DONE: 0,
          },
        };

        projectsState = [createdProject, ...projectsState];

        return createdProject;
      },
    );

    renderDashboard();

    expect(
      await screen.findByRole("link", { name: /open board/i }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getAllByRole("button", { name: /^create project$/i })[0],
    );

    expect(
      await screen.findByRole("heading", { name: /create a project/i }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getAllByRole("button", { name: /^create project$/i })[1],
    );

    expect(
      await screen.findByText("Project name is required."),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Project name"), {
      target: { value: "  QA    readiness  " },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "  Track validation and smoke checks.  " },
    });

    fireEvent.click(
      screen.getAllByRole("button", { name: /^create project$/i })[1],
    );

    await waitFor(() => {
      expect(createProjectMock).toHaveBeenCalledWith({
        name: "QA readiness",
        description: "Track validation and smoke checks.",
      });
    });

    await waitFor(() => {
      expect(navigationState.push).toHaveBeenCalledWith(
        "/app/projects/qa-readiness",
      );
      expect(getProjectsMock).toHaveBeenCalledTimes(2);
    });

    expect(
      screen.queryByRole("heading", { name: /create a project/i }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByText("QA readiness").length).toBeGreaterThan(0);
    expect(toastMocks.showSuccessToast).toHaveBeenCalledWith(
      "Project created",
      "The new workspace is ready for task planning.",
    );
  });
});
