import type { ApiEnvelope } from "@/contracts/api";
import type { PendingProjectInvitesResponse } from "@/contracts/projects";
import { apiClient } from "@/services/http/axios-client";
import { normalizeApiClientError } from "@/services/http/api-client-error";

export async function getPendingProjectInvites(): Promise<PendingProjectInvitesResponse> {
  try {
    const response = await apiClient.get<ApiEnvelope<PendingProjectInvitesResponse>>(
      "/invites/pending/items",
    );
    const data = response.data as ApiEnvelope<PendingProjectInvitesResponse>;

    if (!data.success) {
      throw new Error(data.error.message);
    }

    return data.data;
  } catch (error) {
    throw normalizeApiClientError(error);
  }
}
