import type { ApiEnvelope } from "@/contracts/api";
import type { AcceptInviteResponse } from "@/contracts/projects";
import { apiClient } from "@/services/http/axios-client";
import { normalizeApiClientError } from "@/services/http/api-client-error";

export async function acceptInvite(token: string): Promise<AcceptInviteResponse> {
  try {
    const response = await apiClient.post<ApiEnvelope<AcceptInviteResponse>>(
      `/invites/${token}/accept`,
    );
    const data = response.data as ApiEnvelope<AcceptInviteResponse>;

    if (!data.success) {
      throw new Error(data.error.message);
    }

    return data.data;
  } catch (error) {
    throw normalizeApiClientError(error);
  }
}
