import type { ApiEnvelope } from "@/contracts/api";
import type { ProjectTasksResponse } from "@/contracts/tasks";
import { apiClient } from "@/services/http/axios-client";
import { normalizeApiClientError } from "@/services/http/api-client-error";

export async function getProjectTasks(
  projectId: string,
): Promise<ProjectTasksResponse> {
  try {
    const response = await apiClient.get<ApiEnvelope<ProjectTasksResponse>>(
      `/projects/${projectId}/tasks`,
    );
    const data = response.data as ApiEnvelope<ProjectTasksResponse>;

    if (!data.success) {
      throw new Error(data.error.message);
    }

    return data.data;
  } catch (error) {
    throw normalizeApiClientError(error);
  }
}
