import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TaskAttachmentsPanel } from "@/features/tasks/components/task-attachments-panel";

const useAuthSessionMock = vi.hoisted(() => vi.fn());
const useTaskAttachmentsMock = vi.hoisted(() => vi.fn());
const useCreateTaskAttachmentMock = vi.hoisted(() => vi.fn());
const useDeleteTaskAttachmentMock = vi.hoisted(() => vi.fn());

vi.mock("lucide-react", () => {
  const Icon = () => null;

  return {
    ExternalLink: Icon,
    Link2: Icon,
    LoaderCircle: Icon,
    RefreshCw: Icon,
    Trash2: Icon,
  };
});

vi.mock("@/features/auth/providers/auth-session-provider", () => ({
  useAuthSession: useAuthSessionMock,
}));

vi.mock("@/features/tasks/hooks/use-task-attachments", () => ({
  useTaskAttachments: useTaskAttachmentsMock,
}));

vi.mock("@/features/tasks/hooks/use-create-task-attachment", () => ({
  useCreateTaskAttachment: useCreateTaskAttachmentMock,
}));

vi.mock("@/features/tasks/hooks/use-delete-task-attachment", () => ({
  useDeleteTaskAttachment: useDeleteTaskAttachmentMock,
}));

vi.mock("@/lib/toast", () => ({
  showApiErrorToast: vi.fn(),
  showSuccessToast: vi.fn(),
}));

function renderPanel() {
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
      <TaskAttachmentsPanel enabled taskId="task-123" />
    </QueryClientProvider>,
  );
}

describe("TaskAttachmentsPanel", () => {
  beforeEach(() => {
    useAuthSessionMock.mockReturnValue({
      session: {
        user: {
          id: "admin-1",
          role: "ADMIN",
        },
      },
    });
    useTaskAttachmentsMock.mockReturnValue({
      data: {
        items: [
          {
            id: "attachment-1",
            label: "Launch brief",
            fileName: "launch-brief.pdf",
            url: "https://example.com/files/launch-brief.pdf",
            mimeType: "application/pdf",
            sizeBytes: 1024,
            createdAt: "2026-04-05T10:00:00.000Z",
            createdBy: {
              id: "member-1",
              name: "Jordan Lane",
            },
          },
        ],
      },
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });
    useCreateTaskAttachmentMock.mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn(),
    });
    useDeleteTaskAttachmentMock.mockReturnValue({
      mutateAsync: vi.fn(),
    });
  });

  it("renders safer helper copy, destination host, and a hardened external link", () => {
    renderPanel();

    expect(
      screen.getByText(/only attach resources your team trusts/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Destination: example.com")).toBeInTheDocument();

    const link = screen.getByRole("link", {
      name: /open launch brief on example.com/i,
    });

    expect(link).toHaveAttribute(
      "href",
      "https://example.com/files/launch-brief.pdf",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer nofollow");
  });
});
