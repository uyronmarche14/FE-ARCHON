import type { ApiEnvelope } from "@/contracts/api";
import type {
  ProjectStatusResponse,
  UpdateProjectStatusRequest,
} from "@/contracts/projects";
import { apiClient } from "@/services/http/axios-client";
import { normalizeApiClientError } from "@/services/http/api-client-error";

export async function updateProjectStatus(
  projectId: string,
  statusId: string,
  request: UpdateProjectStatusRequest,
): Promise<ProjectStatusResponse> {
  try {
    const response = await apiClient.patch<ApiEnvelope<ProjectStatusResponse>>(
      `/projects/${projectId}/statuses/${statusId}`,
      request,
    );
    const data = response.data as ApiEnvelope<ProjectStatusResponse>;

    if (!data.success) {
      throw new Error(data.error.message);
    }

    return data.data;
  } catch (error) {
    throw normalizeApiClientError(error);
  }
}
