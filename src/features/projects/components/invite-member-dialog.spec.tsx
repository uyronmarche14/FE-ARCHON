import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InviteMemberDialog } from "@/features/projects/components/invite-member-dialog";

const useCreateProjectInviteMock = vi.hoisted(() => vi.fn());
const showApiErrorToastMock = vi.hoisted(() => vi.fn());
const showInfoToastMock = vi.hoisted(() => vi.fn());
const showSuccessToastMock = vi.hoisted(() => vi.fn());
const writeTextMock = vi.hoisted(() => vi.fn());

vi.mock("lucide-react", () => {
  const Icon = () => null;

  return {
    Copy: Icon,
    LoaderCircle: Icon,
    MailPlus: Icon,
  };
});

vi.mock("@/components/ui/dialog", async () => {
  const React = await import("react");

  return {
    Dialog: ({ children }: { children: React.ReactNode }) => React.createElement("div", null, children),
    DialogContent: ({ children }: { children: React.ReactNode }) =>
      React.createElement("div", null, children),
    DialogDescription: ({ children }: { children: React.ReactNode }) =>
      React.createElement("p", null, children),
    DialogFooter: ({ children }: { children: React.ReactNode }) =>
      React.createElement("div", null, children),
    DialogHeader: ({ children }: { children: React.ReactNode }) =>
      React.createElement("div", null, children),
    DialogTitle: ({ children }: { children: React.ReactNode }) =>
      React.createElement("h2", null, children),
    DialogTrigger: ({ children }: { children: React.ReactNode }) =>
      React.createElement("div", null, children),
  };
});

vi.mock("@/features/projects/hooks/use-create-project-invite", () => ({
  useCreateProjectInvite: useCreateProjectInviteMock,
}));

vi.mock("@/lib/toast", () => ({
  showApiErrorToast: showApiErrorToastMock,
  showInfoToast: showInfoToastMock,
  showSuccessToast: showSuccessToastMock,
}));

describe("InviteMemberDialog", () => {
  beforeEach(() => {
    writeTextMock.mockReset();
    showApiErrorToastMock.mockReset();
    showInfoToastMock.mockReset();
    showSuccessToastMock.mockReset();
    useCreateProjectInviteMock.mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn(),
    });

    Object.defineProperty(globalThis.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: writeTextMock,
      },
    });
  });

  it("keeps a neutral success flow when invites are delivered by email", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({
      message: "Invite sent successfully",
      email: "alex@example.com",
      expiresAt: "2026-04-13T00:00:00.000Z",
      deliveryMode: "email",
      inviteUrl: null,
    });
    useCreateProjectInviteMock.mockReturnValue({
      isPending: false,
      mutateAsync,
    });

    render(<InviteMemberDialog projectId="project-1" />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "alex@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create invite/i }));

    await waitFor(() => {
      expect(showSuccessToastMock).toHaveBeenCalledWith(
        "Invite created",
        "Access is ready for alex@example.com.",
      );
    });

    expect(screen.queryByText(/invite link ready/i)).not.toBeInTheDocument();
  });

  it("shows a copyable invite link when hosted staging uses direct-link delivery", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({
      message: "Invite link created successfully",
      email: "alex@example.com",
      expiresAt: "2026-04-13T00:00:00.000Z",
      deliveryMode: "link",
      inviteUrl: "http://localhost:3000/invite/token-123",
    });
    useCreateProjectInviteMock.mockReturnValue({
      isPending: false,
      mutateAsync,
    });
    writeTextMock.mockResolvedValue(undefined);

    render(<InviteMemberDialog projectId="project-1" />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "alex@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create invite/i }));

    expect(await screen.findByText(/invite link ready/i)).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("http://localhost:3000/invite/token-123"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /copy link/i }));

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith(
        "http://localhost:3000/invite/token-123",
      );
    });
    expect(showInfoToastMock).toHaveBeenCalledWith(
      "Invite link copied",
      "Share the link with your teammate.",
    );
  });
});
