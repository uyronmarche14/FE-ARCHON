import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClientError } from "@/services/http/api-client-error";
import {
  AuthSessionProvider,
  useAuthSession,
} from "@/features/auth/providers/auth-session-provider";

const tokenStore = vi.hoisted(() => {
  let currentToken: string | null = null;

  return {
    getAccessToken: vi.fn(() => currentToken),
    setAccessToken: vi.fn((token: string | null) => {
      currentToken = token;
    }),
    clearAccessToken: vi.fn(() => {
      currentToken = null;
    }),
    reset(initialToken: string | null = null) {
      currentToken = initialToken;
      this.getAccessToken.mockClear();
      this.setAccessToken.mockClear();
      this.clearAccessToken.mockClear();
    },
  };
});

const httpClient = vi.hoisted(() => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
  registerAuthRefreshHandler: vi.fn(() => vi.fn()),
}));

vi.mock("@/services/http/auth-token-store", () => ({
  getAccessToken: tokenStore.getAccessToken,
  setAccessToken: tokenStore.setAccessToken,
  clearAccessToken: tokenStore.clearAccessToken,
}));

vi.mock("@/services/http/axios-client", () => ({
  apiClient: httpClient.apiClient,
  registerAuthRefreshHandler: httpClient.registerAuthRefreshHandler,
}));

function SessionProbe() {
  const { session, status } = useAuthSession();

  return (
    <div>
      <p data-testid="auth-status">{status}</p>
      <p data-testid="auth-user">{session?.user.name ?? "anonymous"}</p>
    </div>
  );
}

function renderProvider(bootstrapSession: boolean) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthSessionProvider bootstrapSession={bootstrapSession}>
        <SessionProbe />
      </AuthSessionProvider>
    </QueryClientProvider>,
  );
}

describe("AuthSessionProvider", () => {
  beforeEach(() => {
    tokenStore.reset();
    httpClient.apiClient.get.mockReset();
    httpClient.apiClient.post.mockReset();
    httpClient.registerAuthRefreshHandler.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("does not bootstrap auth state on public routes", async () => {
    renderProvider(false);

    expect(await screen.findByTestId("auth-status")).toHaveTextContent(
      "anonymous",
    );
    expect(screen.getByTestId("auth-user")).toHaveTextContent("anonymous");
    expect(httpClient.apiClient.get).not.toHaveBeenCalled();
    expect(httpClient.apiClient.post).not.toHaveBeenCalled();
  });

  it("recovers from an expired access token during app bootstrap", async () => {
    tokenStore.reset("expired-access-token");
    httpClient.apiClient.get
      .mockRejectedValueOnce(
        new ApiClientError({
          message: "Authentication is required",
          code: "UNAUTHENTICATED",
          status: 401,
        }),
      )
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            user: {
              id: "user-1",
              name: "Jane Doe",
              email: "jane@example.com",
              role: "MEMBER",
            },
          },
          meta: {
            requestId: "req_123",
            timestamp: "2026-04-01T00:00:00.000Z",
          },
          error: null,
        },
      });
    httpClient.apiClient.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          accessToken: "rotated-access-token",
        },
        meta: {
          requestId: "req_124",
          timestamp: "2026-04-01T00:00:01.000Z",
        },
        error: null,
      },
    });

    renderProvider(true);

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent(
        "authenticated",
      );
      expect(screen.getByTestId("auth-user")).toHaveTextContent("Jane Doe");
    });

    expect(httpClient.apiClient.get).toHaveBeenCalledTimes(2);
    expect(httpClient.apiClient.post).toHaveBeenCalledWith(
      "/auth/refresh",
      undefined,
      expect.objectContaining({
        _skipAuthRefresh: true,
      }),
    );
    expect(tokenStore.setAccessToken).toHaveBeenCalledWith(
      "rotated-access-token",
    );
  });
});
