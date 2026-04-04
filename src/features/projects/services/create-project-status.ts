import type { ApiEnvelope } from "@/contracts/api";
import type {
  CreateProjectStatusRequest,
  ProjectStatusResponse,
} from "@/contracts/projects";
import { apiClient } from "@/services/http/axios-client";
import { normalizeApiClientError } from "@/services/http/api-client-error";

export async function createProjectStatus(
  projectId: string,
  request: CreateProjectStatusRequest,
): Promise<ProjectStatusResponse> {
  try {
    const response = await apiClient.post<ApiEnvelope<ProjectStatusResponse>>(
      `/projects/${projectId}/statuses`,
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
