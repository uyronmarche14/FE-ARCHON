import type { ApiEnvelope } from "@/contracts/api";
import type { LogoutResponse } from "@/contracts/auth";
import { apiClient, type ApiClientRequestConfig } from "@/services/http/axios-client";
import { normalizeApiClientError } from "@/services/http/api-client-error";

export async function logout(): Promise<LogoutResponse> {
  try {
    const response = await apiClient.post<ApiEnvelope<LogoutResponse>>(
      "/auth/logout",
      undefined,
      {
        _skipAuthRefresh: true,
      } as ApiClientRequestConfig,
    );
    const data = response.data as ApiEnvelope<LogoutResponse>;

    if (!data.success) {
      throw new Error(data.error.message);
    }

    return data.data;
  } catch (error) {
    throw normalizeApiClientError(error);
  }
}
