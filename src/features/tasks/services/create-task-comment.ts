import type { ApiEnvelope } from "@/contracts/api";
import type {
  CreateTaskCommentRequest,
  TaskComment,
} from "@/contracts/tasks";
import { apiClient } from "@/services/http/axios-client";
import { normalizeApiClientError } from "@/services/http/api-client-error";

export async function createTaskComment(
  taskId: string,
  request: CreateTaskCommentRequest,
): Promise<TaskComment> {
  try {
    const response = await apiClient.post<ApiEnvelope<TaskComment>>(
      `/tasks/${taskId}/comments`,
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
