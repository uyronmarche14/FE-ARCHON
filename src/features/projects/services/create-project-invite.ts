import type { ApiEnvelope } from "@/contracts/api";
import type {
  CreateProjectInviteRequest,
  CreateProjectInviteResponse,
} from "@/contracts/projects";
import { apiClient } from "@/services/http/axios-client";
import { normalizeApiClientError } from "@/services/http/api-client-error";

export async function createProjectInvite(
  projectId: string,
  request: CreateProjectInviteRequest,
): Promise<CreateProjectInviteResponse> {
  try {
    const response = await apiClient.post<ApiEnvelope<CreateProjectInviteResponse>>(
      `/projects/${projectId}/invites`,
      request,
    );
    const data = response.data as ApiEnvelope<CreateProjectInviteResponse>;

    if (!data.success) {
      throw new Error(data.error.message);
    }

    return data.data;
  } catch (error) {
    throw normalizeApiClientError(error);
  }
}
