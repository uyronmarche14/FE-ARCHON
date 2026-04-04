import type { ApiEnvelope } from "@/contracts/api";
import type { TaskCommentsResponse } from "@/contracts/tasks";
import { apiClient } from "@/services/http/axios-client";
import { normalizeApiClientError } from "@/services/http/api-client-error";

export async function getTaskComments(
  taskId: string,
): Promise<TaskCommentsResponse> {
  try {
    const response = await apiClient.get<ApiEnvelope<TaskCommentsResponse>>(
      `/tasks/${taskId}/comments`,
    );
    const data = response.data as ApiEnvelope<TaskCommentsResponse>;

    if (!data.success) {
      throw new Error(data.error.message);
    }

    return data.data;
  } catch (error) {
    throw normalizeApiClientError(error);
  }
}
