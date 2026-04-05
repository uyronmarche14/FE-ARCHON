import type { ApiEnvelope } from "@/contracts/api";
import type { ProjectSummary, UpdateProjectRequest } from "@/contracts/projects";
import { apiClient } from "@/services/http/axios-client";
import { normalizeApiClientError } from "@/services/http/api-client-error";

export async function updateProject(
  projectId: string,
  request: UpdateProjectRequest,
): Promise<ProjectSummary> {
  try {
    const response = await apiClient.put<ApiEnvelope<ProjectSummary>>(
      `/projects/${projectId}`,
      request,
    );
    const data = response.data as ApiEnvelope<ProjectSummary>;

    if (!data.success) {
      throw new Error(data.error.message);
    }

    return data.data;
  } catch (error) {
    throw normalizeApiClientError(error);
  }
}
