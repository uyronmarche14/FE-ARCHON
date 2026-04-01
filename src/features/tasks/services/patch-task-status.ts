import type { ApiEnvelope } from "@/contracts/api";
import type { TaskCard, UpdateTaskStatusRequest } from "@/contracts/tasks";
import { apiClient } from "@/services/http/axios-client";
import { normalizeApiClientError } from "@/services/http/api-client-error";

export async function patchTaskStatus(
  taskId: string,
  request: UpdateTaskStatusRequest,
): Promise<TaskCard> {
  try {
    const response = await apiClient.patch<ApiEnvelope<TaskCard>>(
      `/tasks/${taskId}/status`,
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
