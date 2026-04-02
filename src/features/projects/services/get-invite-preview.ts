import type { ApiEnvelope } from "@/contracts/api";
import type { InvitePreview } from "@/contracts/projects";
import { apiClient, type ApiClientRequestConfig } from "@/services/http/axios-client";
import { normalizeApiClientError } from "@/services/http/api-client-error";

export async function getInvitePreview(token: string): Promise<InvitePreview> {
  try {
    const response = await apiClient.get<ApiEnvelope<InvitePreview>>(
      `/invites/${token}`,
      {
        _skipAuthRefresh: true,
      } as ApiClientRequestConfig,
    );
    const data = response.data as ApiEnvelope<InvitePreview>;

    if (!data.success) {
      throw new Error(data.error.message);
    }

    return data.data;
  } catch (error) {
    throw normalizeApiClientError(error);
  }
}
