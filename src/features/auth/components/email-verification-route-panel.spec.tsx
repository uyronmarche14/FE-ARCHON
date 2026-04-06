import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EmailVerificationRoutePanel } from "./email-verification-route-panel";

const navigationState = vi.hoisted(() => ({
  token: "expired-token",
  email: "jane@example.com",
  next: "/app/projects/project-1",
  replace: vi.fn(),
}));

const confirmMutationState = vi.hoisted(() => ({
  isError: true,
  isSuccess: false,
  mutateAsync: vi.fn(),
}));

const resendMutationState = vi.hoisted(() => ({
  isPending: false,
  mutateAsync: vi.fn(),
}));

const authSessionState = vi.hoisted(() => ({
  status: "unauthenticated" as "loading" | "authenticated" | "unauthenticated",
}));

const toastState = vi.hoisted(() => ({
  showApiErrorToast: vi.fn(),
  showInfoToast: vi.fn(),
  showSuccessToast: vi.fn(),
}));

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
  useRouter: () => ({
    replace: navigationState.replace,
  }),
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === "token") {
        return navigationState.token;
      }

      if (key === "email") {
        return navigationState.email;
      }

      if (key === "next") {
        return navigationState.next;
      }

      return null;
    },
  }),
}));

vi.mock("@/features/auth/hooks/use-confirm-email-verification", () => ({
  useConfirmEmailVerification: () => confirmMutationState,
}));

vi.mock("@/features/auth/hooks/use-resend-verification", () => ({
  useResendVerification: () => resendMutationState,
}));

vi.mock("@/features/auth/providers/auth-session-provider", () => ({
  useAuthSession: () => authSessionState,
}));

vi.mock("@/lib/toast", () => ({
  showApiErrorToast: toastState.showApiErrorToast,
  showInfoToast: toastState.showInfoToast,
  showSuccessToast: toastState.showSuccessToast,
}));

describe("EmailVerificationRoutePanel", () => {
  beforeEach(() => {
    navigationState.token = "expired-token";
    navigationState.email = "jane@example.com";
    navigationState.next = "/app/projects/project-1";
    navigationState.replace.mockReset();

    confirmMutationState.isError = true;
    confirmMutationState.isSuccess = false;
    confirmMutationState.mutateAsync.mockReset();
    confirmMutationState.mutateAsync.mockRejectedValue(
      new Error("Verification token is invalid or expired"),
    );

    resendMutationState.isPending = false;
    resendMutationState.mutateAsync.mockReset();
    resendMutationState.mutateAsync.mockResolvedValue({
      message: "If the account needs verification, a new email is on the way.",
    });

    authSessionState.status = "unauthenticated";
    toastState.showApiErrorToast.mockReset();
    toastState.showInfoToast.mockReset();
    toastState.showSuccessToast.mockReset();
  });

  it("lets users resend an expired verification link when the email is available", async () => {
    render(<EmailVerificationRoutePanel />);

    expect(
      screen.getByRole("heading", { name: "Verification link expired or invalid" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/send a fresh link to jane@example.com/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /resend email/i }));

    await waitFor(() => {
      expect(resendMutationState.mutateAsync).toHaveBeenCalledWith({
        email: "jane@example.com",
        redirectPath: "/app/projects/project-1",
      });
    });

    expect(toastState.showInfoToast).toHaveBeenCalledWith(
      "Verification email resent",
      "If the account needs verification, a new email is on the way.",
    );
  });
});
