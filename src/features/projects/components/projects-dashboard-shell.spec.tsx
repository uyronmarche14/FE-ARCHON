import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProjectSummary } from "@/contracts/projects";
import { ProjectsDashboardShell } from "@/features/projects/components/projects-dashboard-shell";

const navigationState = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
}));

let projectsState: ProjectSummary[] = [];

const getProjectsMock = vi.hoisted(() => vi.fn());
const pendingInvitesHookState = vi.hoisted(() => ({
  usePendingProjectInvites: vi.fn(),
}));
const createProjectMock = vi.hoisted(() => vi.fn());
const deleteProjectMock = vi.hoisted(() => vi.fn());
const updateProjectMock = vi.hoisted(() => vi.fn());
const toastMocks = vi.hoisted(() => ({
  showSuccessToast: vi.fn(),
  showApiErrorToast: vi.fn(),
}));
const authState = vi.hoisted(() => ({
  session: {
    accessToken: "token",
    user: {
      id: "member-1",
      name: "Jordan Lane",
      email: "jordan@example.com",
      role: "MEMBER" as const,
      emailVerifiedAt: "2026-04-01T00:00:00.000Z",
    },
  },
  status: "authenticated" as const,
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
    Sparkles: Icon,
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

vi.mock("@/features/projects/hooks/use-pending-project-invites", () => pendingInvitesHookState);

vi.mock("@/features/projects/services/create-project", () => ({
  createProject: createProjectMock,
}));

vi.mock("@/features/projects/services/delete-project", () => ({
  deleteProject: deleteProjectMock,
}));

vi.mock("@/features/projects/services/update-project", () => ({
  updateProject: updateProjectMock,
}));

vi.mock("@/features/auth/providers/auth-session-provider", () => ({
  useAuthSession: () => authState,
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
    navigationState.replace.mockReset();
    getProjectsMock.mockReset();
    pendingInvitesHookState.usePendingProjectInvites.mockReset();
    createProjectMock.mockReset();
    deleteProjectMock.mockReset();
    updateProjectMock.mockReset();
    toastMocks.showSuccessToast.mockReset();
    toastMocks.showApiErrorToast.mockReset();
    authState.session.user.role = "MEMBER";
    pendingInvitesHookState.usePendingProjectInvites.mockReturnValue({
      data: {
        items: [],
      },
      isPending: false,
      isError: false,
    });
  });

  it("renders a loading state before showing the simple dashboard cards", async () => {
    const deferredProjects = createDeferredPromise<{ items: typeof projectsState }>();
    getProjectsMock.mockReturnValueOnce(deferredProjects.promise);

    renderDashboard();

    expect(screen.getByLabelText("Loading projects")).toBeInTheDocument();

    deferredProjects.resolve({
      items: [
        createProjectSummary("launch-planning", "Launch planning", {
          todo: 4,
          inProgress: 2,
          done: 5,
          description: "Coordinate the release work across the team.",
        }),
      ],
    });

    expect(
      (await screen.findAllByText("Launch planning")).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /open board/i }).length,
    ).toBeGreaterThan(0);
  });

  it("renders projects without any dashboard preview surface", async () => {
    getProjectsMock.mockResolvedValueOnce({
      items: [
        createProjectSummary("launch-planning", "Launch planning", {
          todo: 4,
          inProgress: 2,
          done: 5,
          description: "Coordinate the release work across the team.",
        }),
        createProjectSummary("qa-readiness", "QA readiness", {
          todo: 1,
          inProgress: 3,
          done: 2,
          description: "Track validation and smoke checks.",
        }),
      ],
    });

    renderDashboard();

    expect(await screen.findByText("QA readiness")).toBeInTheDocument();
    expect(screen.queryByText(/project preview/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^preview$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /select preview/i })).not.toBeInTheDocument();
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

  it("shows the pending invites card when invite matches exist for the signed-in email", async () => {
    getProjectsMock.mockResolvedValueOnce({
      items: [
        createProjectSummary("launch-planning", "Launch planning", {
          todo: 4,
          inProgress: 2,
          done: 5,
          description: "Coordinate the release work across the team.",
        }),
      ],
    });
    pendingInvitesHookState.usePendingProjectInvites.mockReturnValue({
      data: {
        items: [
          {
            token: "invite-review-token",
            createdAt: "2026-04-07T00:00:00.000Z",
            project: {
              id: "project-2",
              name: "Release Planning",
            },
            role: "MEMBER",
            expiresAt: "2026-04-13T00:00:00.000Z",
            invitedBy: {
              id: "user-2",
              name: "Taylor Reed",
            },
          },
        ],
      },
      isPending: false,
      isError: false,
    });

    renderDashboard();

    expect(
      await screen.findByRole("heading", { name: /projects/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/pending invites/i)).toBeInTheDocument();
    expect(screen.getByText("Release Planning")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /review invite/i }),
    ).toHaveAttribute("href", "/invite/invite-review-token");
  });

  it("validates, creates, refreshes, and routes into the new project", async () => {
    projectsState = [
      createProjectSummary("launch-planning", "Launch planning", {
        todo: 4,
        inProgress: 2,
        done: 5,
        description: "Coordinate the release work across the team.",
      }),
    ];

    getProjectsMock.mockImplementation(async () => ({
      items: projectsState,
    }));
    createProjectMock.mockImplementation(
      async (request: { name: string; description?: string }) => {
        const createdProject = {
          ...createProjectSummary("qa-readiness", request.name, {
            todo: 0,
            inProgress: 0,
            done: 0,
            description: request.description ?? null,
          }),
        };

        projectsState = [createdProject, ...projectsState];

        return createdProject;
      },
    );

    renderDashboard();

    expect(
      (await screen.findAllByRole("link", { name: /open board/i })).length,
    ).toBeGreaterThan(0);

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

  it("lets owners edit project metadata from the dashboard card", async () => {
    projectsState = [
      createProjectSummary("launch-planning", "Launch planning", {
        todo: 4,
        inProgress: 2,
        done: 5,
        description: "Coordinate the release work across the team.",
      }),
    ];

    getProjectsMock.mockImplementation(async () => ({
      items: projectsState,
    }));
    updateProjectMock.mockImplementation(
      async (
        projectId: string,
        request: { description?: string | null; name?: string },
      ) => {
        const currentProject = projectsState.find(
          (project) => project.id === projectId,
        );

        if (!currentProject) {
          throw new Error("Project not found");
        }

        const updatedProject: ProjectSummary = {
          ...currentProject,
          name: request.name ?? currentProject.name,
          description:
            request.description !== undefined
              ? request.description
              : currentProject.description,
        };

        projectsState = projectsState.map((project) =>
          project.id === projectId ? updatedProject : project,
        );

        return updatedProject;
      },
    );

    renderDashboard();

    expect(await screen.findByText("Launch planning")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /edit project/i }));

    expect(
      await screen.findByRole("heading", { name: /edit project/i }),
    ).toBeInTheDocument();

    const projectNameField = screen.getByLabelText("Project name");
    const descriptionField = screen.getByLabelText("Description");

    expect(projectNameField).toHaveValue("Launch planning");
    expect(descriptionField).toHaveValue(
      "Coordinate the release work across the team.",
    );

    fireEvent.change(projectNameField, {
      target: { value: "  Release readiness  " },
    });
    fireEvent.change(descriptionField, {
      target: { value: "  Track launch readiness and approvals.  " },
    });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(updateProjectMock).toHaveBeenCalledWith("launch-planning", {
        name: "Release readiness",
        description: "Track launch readiness and approvals.",
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Release readiness")).toBeInTheDocument();
    });

    expect(toastMocks.showSuccessToast).toHaveBeenCalledWith(
      "Project updated",
      "Project details are now in sync across the workspace.",
    );
  });

  it("lets owners delete a project from the edit dialog after confirmation", async () => {
    projectsState = [
      createProjectSummary("launch-planning", "Launch planning", {
        todo: 4,
        inProgress: 2,
        done: 5,
        description: "Coordinate the release work across the team.",
      }),
    ];

    getProjectsMock.mockImplementation(async () => ({
      items: projectsState,
    }));
    deleteProjectMock.mockImplementation(async (projectId: string) => {
      projectsState = projectsState.filter((project) => project.id !== projectId);

      return {
        message: "Project deleted successfully",
      };
    });

    renderDashboard();

    expect(await screen.findByText("Launch planning")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /edit project/i }));

    expect(
      await screen.findByRole("heading", { name: /edit project/i }),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/delete project/i), {
      target: { value: "Launch planning" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^delete project$/i }));

    await waitFor(() => {
      expect(deleteProjectMock).toHaveBeenCalledWith("launch-planning");
    });

    await waitFor(() => {
      expect(navigationState.replace).toHaveBeenCalledWith("/app");
    });

    expect(toastMocks.showSuccessToast).toHaveBeenCalledWith(
      "Project deleted",
      "The workspace was removed and the dashboard has been refreshed.",
    );
  });

  it("hides the edit action for member-only project access", async () => {
    getProjectsMock.mockResolvedValueOnce({
      items: [
        createProjectSummary("qa-readiness", "QA readiness", {
          todo: 1,
          inProgress: 3,
          done: 2,
          description: "Track validation and smoke checks.",
          role: "MEMBER",
        }),
      ],
    });

    renderDashboard();

    expect(await screen.findByText("QA readiness")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /edit project/i }),
    ).not.toBeInTheDocument();
  });
});

function createProjectSummary(
  id: string,
  name: string,
  options: {
    description?: string | null;
    done: number;
    inProgress: number;
    role?: "OWNER" | "MEMBER";
    todo: number;
  },
): ProjectSummary {
  return {
    id,
    name,
    description: options.description ?? null,
    role: options.role ?? "OWNER",
    statuses: [
      {
        id: `${id}-status-todo`,
        name: "Todo",
        position: 1,
        isClosed: false,
        color: "SLATE",
        taskCount: options.todo,
      },
      {
        id: `${id}-status-progress`,
        name: "In Progress",
        position: 2,
        isClosed: false,
        color: "BLUE",
        taskCount: options.inProgress,
      },
      {
        id: `${id}-status-done`,
        name: "Done",
        position: 3,
        isClosed: true,
        color: "GREEN",
        taskCount: options.done,
      },
    ],
  };
}
