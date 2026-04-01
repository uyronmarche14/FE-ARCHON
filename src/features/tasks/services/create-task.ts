import type { ApiEnvelope } from "@/contracts/api";
import type { CreateTaskRequest, TaskCard } from "@/contracts/tasks";
import { apiClient } from "@/services/http/axios-client";
import { normalizeApiClientError } from "@/services/http/api-client-error";

export async function createTask(
  projectId: string,
  request: CreateTaskRequest,
): Promise<TaskCard> {
  try {
    const response = await apiClient.post<ApiEnvelope<TaskCard>>(
      `/projects/${projectId}/tasks`,
      request,
    );
    const data = response.data as ApiEnvelope<TaskCard>;

    if (!data.success) {
      throw new Error(data.error.message);
    }

    return data.data;
  } catch (error) {
    throw normalizeApiClientError(error);
  }
}
