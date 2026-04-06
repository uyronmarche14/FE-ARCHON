import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthPanel } from "@/features/auth/components/auth-panel";

const replaceMock = vi.hoisted(() => vi.fn());
const searchParamsState = vi.hoisted(
  () => new URLSearchParams("next=/app/projects/project-1"),
);
const useLoginMock = vi.hoisted(() => vi.fn());
const useSignupMock = vi.hoisted(() => vi.fn());
const useResendVerificationMock = vi.hoisted(() => vi.fn());
const useAuthSessionMock = vi.hoisted(() => vi.fn());
const showApiErrorToastMock = vi.hoisted(() => vi.fn());
const showInfoToastMock = vi.hoisted(() => vi.fn());
const showSuccessToastMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
  useSearchParams: () => searchParamsState,
}));

vi.mock("@/features/auth/hooks/use-login", () => ({
  useLogin: useLoginMock,
}));

vi.mock("@/features/auth/hooks/use-signup", () => ({
  useSignup: useSignupMock,
}));

vi.mock("@/features/auth/hooks/use-resend-verification", () => ({
  useResendVerification: useResendVerificationMock,
}));

vi.mock("@/features/auth/providers/auth-session-provider", () => ({
  useAuthSession: useAuthSessionMock,
}));

vi.mock("@/lib/toast", () => ({
  showApiErrorToast: showApiErrorToastMock,
  showInfoToast: showInfoToastMock,
  showSuccessToast: showSuccessToastMock,
}));

describe("AuthPanel", () => {
  beforeEach(() => {
    replaceMock.mockReset();
    showApiErrorToastMock.mockReset();
    showInfoToastMock.mockReset();
    showSuccessToastMock.mockReset();
    useLoginMock.mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn(),
    });
    useSignupMock.mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn(),
    });
    useResendVerificationMock.mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn(),
    });
    useAuthSessionMock.mockReturnValue({
      setSession: vi.fn(),
    });
  });

  it("keeps the inbox verification flow when signup still requires email confirmation", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({
      message: "Check your email to verify your account",
      email: "jane@example.com",
      emailVerificationRequired: true,
    });
    useSignupMock.mockReturnValue({
      isPending: false,
      mutateAsync,
    });

    render(<AuthPanel mode="signup" />);

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "StrongPass1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        name: "Jane Doe",
        email: "jane@example.com",
        password: "StrongPass1",
        redirectPath: "/app/projects/project-1",
      });
    });

    expect(await screen.findByText(/check your inbox/i)).toBeInTheDocument();
    expect(showSuccessToastMock).toHaveBeenCalledWith(
      "Check your email",
      "Check your email to verify your account",
    );
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("redirects back to login when signup completes with verification bypassed", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({
      message: "Account created successfully. You can log in now.",
      email: "jane@example.com",
      emailVerificationRequired: false,
    });
    useSignupMock.mockReturnValue({
      isPending: false,
      mutateAsync,
    });

    render(<AuthPanel mode="signup" />);

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "StrongPass1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith(
        "/login?email=jane%40example.com&next=%2Fapp%2Fprojects%2Fproject-1",
      );
    });

    expect(showSuccessToastMock).toHaveBeenCalledWith(
      "Account created",
      "Account created successfully. You can log in now.",
    );
    expect(screen.queryByText(/check your inbox/i)).not.toBeInTheDocument();
  });
});
