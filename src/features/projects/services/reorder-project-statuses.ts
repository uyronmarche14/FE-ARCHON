import type { ApiEnvelope } from "@/contracts/api";
import type {
  ProjectStatusListResponse,
  ReorderProjectStatusesRequest,
} from "@/contracts/projects";
import { apiClient } from "@/services/http/axios-client";
import { normalizeApiClientError } from "@/services/http/api-client-error";

export async function reorderProjectStatuses(
  projectId: string,
  request: ReorderProjectStatusesRequest,
): Promise<ProjectStatusListResponse> {
  try {
    const response = await apiClient.post<ApiEnvelope<ProjectStatusListResponse>>(
      `/projects/${projectId}/statuses/reorder`,
      request,
    );
    const data = response.data as ApiEnvelope<ProjectStatusListResponse>;

    if (!data.success) {
      throw new Error(data.error.message);
    }

    return data.data;
  } catch (error) {
    throw normalizeApiClientError(error);
  }
}
