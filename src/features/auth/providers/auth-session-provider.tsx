"use client";

import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiEnvelope } from "@/contracts/api";
import type { AuthUser } from "@/contracts/auth";
import {
  ApiClientError,
  isApiClientError,
  normalizeApiClientError,
} from "@/services/http/api-client-error";
import {
  apiClient,
  registerAuthRefreshHandler,
  type ApiClientRequestConfig,
} from "@/services/http/axios-client";
import {
  clearAccessToken as clearStoredAccessToken,
  getAccessToken,
  setAccessToken as setStoredAccessToken,
} from "@/services/http/auth-token-store";
import type { AuthMeResponse, AuthRefreshResponse } from "@/contracts/auth";

export type AuthSession = {
  user: AuthUser;
  accessToken: string | null;
};

type AuthSessionContextValue = {
  session: AuthSession | null;
  status: "loading" | "authenticated" | "anonymous";
  error: ApiClientError | null;
  refetchSession: () => Promise<void>;
  setSession: (session: AuthSession | null) => void;
  setAccessToken: (token: string | null) => void;
  clearSession: () => void;
};

type AuthSessionProviderProps = {
  bootstrapSession?: boolean;
  children: ReactNode;
};

const authSessionQueryKey = ["auth", "me"] as const;

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

export function AuthSessionProvider({
  bootstrapSession = true,
  children,
}: AuthSessionProviderProps) {
  const queryClient = useQueryClient();
  const sessionQuery = useQuery({
    queryKey: authSessionQueryKey,
    queryFn: fetchAuthSession,
    enabled: bootstrapSession,
  });

  useEffect(() => {
    const unregisterRefreshHandler = registerAuthRefreshHandler(async () => {
      const refreshedToken = await refreshAccessToken();

      if (!refreshedToken) {
        queryClient.setQueryData<AuthSession | null>(authSessionQueryKey, null);
      }

      return refreshedToken;
    });

    return unregisterRefreshHandler;
  }, [queryClient]);

  useEffect(() => {
    if (sessionQuery.data?.accessToken) {
      setStoredAccessToken(sessionQuery.data.accessToken);
      return;
    }

    if (sessionQuery.data === null) {
      clearStoredAccessToken();
    }
  }, [sessionQuery.data]);

  const status =
    bootstrapSession && sessionQuery.isPending
      ? "loading"
      : sessionQuery.data
        ? "authenticated"
        : "anonymous";

  const value: AuthSessionContextValue = {
    session: sessionQuery.data ?? null,
    status,
    error: isApiClientError(sessionQuery.error) ? sessionQuery.error : null,
    refetchSession: async () => {
      await sessionQuery.refetch();
    },
    setSession: (session) => {
      if (session?.accessToken) {
        setStoredAccessToken(session.accessToken);
      } else {
        clearStoredAccessToken();
      }

      queryClient.setQueryData(authSessionQueryKey, session);
    },
    setAccessToken: (token) => {
      if (token) {
        setStoredAccessToken(token);
      } else {
        clearStoredAccessToken();
      }

      queryClient.setQueryData<AuthSession | null>(authSessionQueryKey, (currentSession) => {
        if (!currentSession) {
          return currentSession;
        }

        return {
          ...currentSession,
          accessToken: token,
        };
      });
    },
    clearSession: () => {
      clearStoredAccessToken();
      queryClient.setQueryData<AuthSession | null>(authSessionQueryKey, null);
    },
  };

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession() {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error("useAuthSession must be used within an AuthSessionProvider");
  }

  return context;
}

async function fetchAuthSession(): Promise<AuthSession | null> {
  const currentAccessToken = getAccessToken();

  if (currentAccessToken) {
    const currentSession = await fetchCurrentUserSession();

    if (currentSession) {
      return currentSession;
    }
  }

  const refreshedToken = await refreshAccessToken();

  if (!refreshedToken) {
    return null;
  }

  return fetchCurrentUserSession();
}

async function fetchCurrentUserSession(): Promise<AuthSession | null> {
  try {
    const response = await apiClient.get<ApiEnvelope<AuthMeResponse>>("/auth/me", {
      _skipAuthRefresh: true,
    } as ApiClientRequestConfig);
    const data = response.data as ApiEnvelope<AuthMeResponse>;

    if (!data.success) {
      return null;
    }

    return {
      user: data.data.user,
      accessToken: getAccessToken(),
    };
  } catch (error) {
    const normalizedError = normalizeApiClientError(error);

    if (normalizedError.status === 401) {
      clearStoredAccessToken();
      return null;
    }

    if (normalizedError.status === 404 || normalizedError.status === 501) {
      return null;
    }

    throw normalizedError;
  }
}

async function refreshAccessToken() {
  try {
    const response = await apiClient.post<ApiEnvelope<AuthRefreshResponse>>(
      "/auth/refresh",
      undefined,
      {
        _skipAuthRefresh: true,
      } as ApiClientRequestConfig,
    );
    const data = response.data as ApiEnvelope<AuthRefreshResponse>;

    if (!data.success) {
      clearStoredAccessToken();
      return null;
    }

    const accessToken = data.data.accessToken;
    setStoredAccessToken(accessToken);

    return accessToken;
  } catch {
    clearStoredAccessToken();
    return null;
  }
}
