import type { ApiEnvelope } from "@/contracts/api";
import type {
  CreateTaskAttachmentRequest,
  TaskAttachment,
} from "@/contracts/tasks";
import { apiClient } from "@/services/http/axios-client";
import { normalizeApiClientError } from "@/services/http/api-client-error";

export async function createTaskAttachment(
  taskId: string,
  request: CreateTaskAttachmentRequest,
): Promise<TaskAttachment> {
  try {
    const response = await apiClient.post<ApiEnvelope<TaskAttachment>>(
      `/tasks/${taskId}/attachments`,
      request,
    );
    const data = response.data as ApiEnvelope<TaskAttachment>;

    if (!data.success) {
      throw new Error(data.error.message);
    }

    return data.data;
  } catch (error) {
    throw normalizeApiClientError(error);
  }
}
