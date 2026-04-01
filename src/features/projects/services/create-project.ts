import type { ApiEnvelope } from "@/contracts/api";
import type { CreateProjectRequest, ProjectSummary } from "@/contracts/projects";
import { apiClient } from "@/services/http/axios-client";
import { normalizeApiClientError } from "@/services/http/api-client-error";

export async function createProject(
  request: CreateProjectRequest,
): Promise<ProjectSummary> {
  try {
    const response = await apiClient.post<ApiEnvelope<ProjectSummary>>(
      "/projects",
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
