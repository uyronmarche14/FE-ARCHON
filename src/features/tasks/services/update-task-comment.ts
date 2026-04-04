import type { ApiEnvelope } from "@/contracts/api";
import type {
  TaskComment,
  UpdateTaskCommentRequest,
} from "@/contracts/tasks";
import { apiClient } from "@/services/http/axios-client";
import { normalizeApiClientError } from "@/services/http/api-client-error";

export async function updateTaskComment(
  taskId: string,
  commentId: string,
  request: UpdateTaskCommentRequest,
): Promise<TaskComment> {
  try {
    const response = await apiClient.patch<ApiEnvelope<TaskComment>>(
      `/tasks/${taskId}/comments/${commentId}`,
      request,
    );
    const data = response.data as ApiEnvelope<TaskComment>;

    if (!data.success) {
      throw new Error(data.error.message);
    }

    return data.data;
  } catch (error) {
    throw normalizeApiClientError(error);
  }
}
