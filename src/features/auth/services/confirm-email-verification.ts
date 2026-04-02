import type { ApiEnvelope } from "@/contracts/api";
import type {
  VerifyEmailConfirmRequest,
  VerifyEmailConfirmResponse,
} from "@/contracts/auth";
import { apiClient, type ApiClientRequestConfig } from "@/services/http/axios-client";
import { normalizeApiClientError } from "@/services/http/api-client-error";

export async function confirmEmailVerification(
  request: VerifyEmailConfirmRequest,
): Promise<VerifyEmailConfirmResponse> {
  try {
    const response = await apiClient.post<ApiEnvelope<VerifyEmailConfirmResponse>>(
      "/auth/verify-email/confirm",
      request,
      {
        _skipAuthRefresh: true,
      } as ApiClientRequestConfig,
    );
    const data = response.data as ApiEnvelope<VerifyEmailConfirmResponse>;

    if (!data.success) {
      throw new Error(data.error.message);
    }

    return data.data;
  } catch (error) {
    throw normalizeApiClientError(error);
  }
}
