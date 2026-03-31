import type { ApiEnvelope } from "@/contracts/api";
import type { SignupRequest, SignupResponse } from "@/contracts/auth";
import { apiClient, type ApiClientRequestConfig } from "@/services/http/axios-client";
import { normalizeApiClientError } from "@/services/http/api-client-error";

export async function signup(request: SignupRequest): Promise<SignupResponse> {
  try {
    const response = await apiClient.post<ApiEnvelope<SignupResponse>>(
      "/auth/signup",
      request,
      {
        _skipAuthRefresh: true,
      } as ApiClientRequestConfig,
    );
    const data = response.data as ApiEnvelope<SignupResponse>;

    if (!data.success) {
      throw new Error(data.error.message);
    }

    return data.data;
  } catch (error) {
    throw normalizeApiClientError(error);
  }
}
