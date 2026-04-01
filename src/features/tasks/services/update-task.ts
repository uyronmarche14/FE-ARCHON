import type { ApiEnvelope } from "@/contracts/api";
import type { TaskCard, UpdateTaskRequest } from "@/contracts/tasks";
import { apiClient } from "@/services/http/axios-client";
import { normalizeApiClientError } from "@/services/http/api-client-error";

export async function updateTask(
  taskId: string,
  request: UpdateTaskRequest,
): Promise<TaskCard> {
  try {
    const response = await apiClient.put<ApiEnvelope<TaskCard>>(
      `/tasks/${taskId}`,
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
