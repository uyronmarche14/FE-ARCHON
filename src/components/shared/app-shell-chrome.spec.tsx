import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
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
          {
            id: "qa-readiness",
            name: "QA readiness",
            description: "Track validation and smoke checks.",
            role: "OWNER",
            taskCounts: {
              TODO: 0,
              IN_PROGRESS: 0,
              DONE: 0,
            },
          },
        ],
      },
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });
  });

  it("renders compact page navigation and keeps only the current project in context", () => {
    navigationState.pathname = "/app/projects/qa-readiness";

    render(
      <AppShellChrome>
        <div>Workspace content</div>
      </AppShellChrome>,
    );

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
    expect(
      screen.getByRole("link", { name: /^qa readiness$/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Launch planning")).not.toBeInTheDocument();
  });
});
