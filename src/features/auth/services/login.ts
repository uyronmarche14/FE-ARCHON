import type { ApiEnvelope } from "@/contracts/api";
import type { LoginRequest, LoginResponse } from "@/contracts/auth";
import { apiClient, type ApiClientRequestConfig } from "@/services/http/axios-client";
import { normalizeApiClientError } from "@/services/http/api-client-error";

export async function login(request: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await apiClient.post<ApiEnvelope<LoginResponse>>("/auth/login", request, {
      _skipAuthRefresh: true,
    } as ApiClientRequestConfig);
    const data = response.data as ApiEnvelope<LoginResponse>;

    if (!data.success) {
      throw new Error(data.error.message);
    }

    return data.data;
  } catch (error) {
    throw normalizeApiClientError(error);
  }
}
