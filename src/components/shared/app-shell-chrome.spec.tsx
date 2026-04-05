import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppShellChrome } from "@/components/shared/app-shell-chrome";

const navigationState = vi.hoisted(() => ({
  pathname: "/app",
  replace: vi.fn(),
}));

const logoutState = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  isPending: false,
}));

const authState = vi.hoisted(() => ({
  clearSession: vi.fn(),
  status: "authenticated" as const,
  session: {
    user: {
      id: "user-1",
      name: "Jane Doe",
      email: "jane@example.com",
      role: "MEMBER" as const,
    },
  },
}));

const projectsHookState = vi.hoisted(() => ({
  useProjects: vi.fn(),
}));

vi.mock("lucide-react", () => {
  const Icon = () => null;

  return {
    Bell: Icon,
    ChevronDown: Icon,
    ChevronUp: Icon,
    FolderKanban: Icon,
    LayoutDashboard: Icon,
    LogOut: Icon,
    MoreHorizontal: Icon,
    Menu: Icon,
    PanelLeft: Icon,
    Plus: Icon,
    RefreshCcw: Icon,
    Search: Icon,
    ShieldCheck: Icon,
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
  usePathname: () => navigationState.pathname,
  useRouter: () => navigationState,
}));

vi.mock("@/features/auth/providers/auth-session-provider", () => ({
  useAuthSession: () => authState,
}));

vi.mock("@/features/auth/hooks/use-logout", () => ({
  useLogout: () => logoutState,
}));

vi.mock("@/features/projects/hooks/use-projects", () => projectsHookState);

vi.mock("@/features/projects/components/create-project-dialog", () => ({
  CreateProjectDialog: ({
    trigger,
  }: {
    trigger?: ReactNode;
  }) => trigger ?? <button type="button">Create project</button>,
}));

vi.mock("@/lib/toast", () => ({
  showApiErrorToast: vi.fn(),
  showSuccessToast: vi.fn(),
}));

describe("AppShellChrome", () => {
  beforeEach(() => {
    navigationState.pathname = "/app";
    navigationState.replace.mockReset();
    logoutState.mutateAsync.mockReset();
    authState.clearSession.mockReset();
    projectsHookState.useProjects.mockReset();
    projectsHookState.useProjects.mockReturnValue({
      data: {
        items: [
          createProjectSummary("launch-planning", "Launch planning", {
            todo: 4,
            inProgress: 2,
            done: 5,
            description: "Coordinate the release work across the team.",
          }),
          createProjectSummary("qa-readiness", "QA readiness", {
            todo: 0,
            inProgress: 0,
            done: 0,
            description: "Track validation and smoke checks.",
          }),
        ],
      },
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });
  });

  it("renders page navigation with a grouped, indented project list", () => {
    navigationState.pathname = "/app/projects/qa-readiness";

    const { container } = render(
      <AppShellChrome>
        <div>Workspace content</div>
      </AppShellChrome>,
    );

    expect(document.body.dataset.workspaceTheme).toBe("vivid");
    expect(container.firstChild).toHaveAttribute("data-workspace-theme", "vivid");
    expect(
      screen.getByRole("heading", { name: "QA readiness" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /quick create project/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /notifications/i }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /open account menu/i }).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar-projects-list")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /^qa readiness$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /^launch planning$/i }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("sidebar-projects-toggle"));

    expect(screen.queryByTestId("sidebar-projects-list")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("sidebar-projects-toggle"));

    expect(screen.getByTestId("sidebar-projects-list")).toBeInTheDocument();
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
) {
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
        taskCount: options.todo,
      },
      {
        id: `${id}-status-progress`,
        name: "In Progress",
        position: 2,
        isClosed: false,
        taskCount: options.inProgress,
      },
      {
        id: `${id}-status-done`,
        name: "Done",
        position: 3,
        isClosed: true,
        taskCount: options.done,
      },
    ],
  };
}
