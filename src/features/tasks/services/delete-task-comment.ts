import type { ApiEnvelope } from "@/contracts/api";
import type { TaskActionResponse } from "@/contracts/tasks";
import { apiClient } from "@/services/http/axios-client";
import { normalizeApiClientError } from "@/services/http/api-client-error";

export async function deleteTaskComment(
  taskId: string,
  commentId: string,
): Promise<TaskActionResponse> {
  try {
    const response = await apiClient.delete<ApiEnvelope<TaskActionResponse>>(
      `/tasks/${taskId}/comments/${commentId}`,
    );
    const data = response.data as ApiEnvelope<TaskActionResponse>;

    if (!data.success) {
      throw new Error(data.error.message);
    }

    return data.data;
  } catch (error) {
    throw normalizeApiClientError(error);
  }
}
