import axios, {
  AxiosHeaders,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";
import { getApiBaseUrl } from "@/services/http/get-api-base-url";
import { clearAccessToken, getAccessToken, setAccessToken } from "@/services/http/auth-token-store";
import { normalizeApiClientError } from "@/services/http/api-client-error";

type RefreshHandler = () => Promise<string | null>;

export type ApiClientRequestConfig = AxiosRequestConfig & {
  _retry?: boolean;
  _skipAuthRefresh?: boolean;
};

let refreshHandler: RefreshHandler | null = null;
let inFlightRefresh: Promise<string | null> | null = null;

export const apiClient = createApiClient();

export function registerAuthRefreshHandler(handler: RefreshHandler | null) {
  refreshHandler = handler;

  return () => {
    if (refreshHandler === handler) {
      refreshHandler = null;
    }
  };
}

function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: getApiBaseUrl(),
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  client.interceptors.request.use((config) => {
    const accessToken = getAccessToken();

    if (accessToken) {
      setAuthorizationHeader(config, accessToken);
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const config = error.config as ApiClientRequestConfig | undefined;

        if (
          error.response?.status === 401 &&
          config &&
          !config._retry &&
          !config._skipAuthRefresh &&
          refreshHandler
        ) {
          config._retry = true;

          const refreshedToken = await refreshAccessToken();

          if (refreshedToken) {
            setAuthorizationHeader(config, refreshedToken);

            return client(config);
          }

          clearAccessToken();
        }
      }

      throw normalizeApiClientError(error);
    },
  );

  return client;
}

async function refreshAccessToken() {
  if (!refreshHandler) {
    return null;
  }

  if (!inFlightRefresh) {
    inFlightRefresh = refreshHandler().finally(() => {
      inFlightRefresh = null;
    });
  }

  const refreshedToken = await inFlightRefresh;

  if (refreshedToken) {
    setAccessToken(refreshedToken);
  }

  return refreshedToken;
}

function setAuthorizationHeader(config: ApiClientRequestConfig, accessToken: string) {
  if (config.headers instanceof AxiosHeaders) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
    return;
  }

  config.headers = {
    ...(config.headers ?? {}),
    Authorization: `Bearer ${accessToken}`,
  };
}
