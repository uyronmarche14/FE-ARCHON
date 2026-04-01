import type { ApiEnvelope } from "@/contracts/api";
import type { ProjectsListResponse } from "@/contracts/projects";
import { apiClient } from "@/services/http/axios-client";
import { normalizeApiClientError } from "@/services/http/api-client-error";

export async function getProjects(): Promise<ProjectsListResponse> {
  try {
    const response = await apiClient.get<ApiEnvelope<ProjectsListResponse>>(
      "/projects",
    );
    const data = response.data as ApiEnvelope<ProjectsListResponse>;

    if (!data.success) {
      throw new Error(data.error.message);
    }

    return data.data;
  } catch (error) {
    throw normalizeApiClientError(error);
  }
}
