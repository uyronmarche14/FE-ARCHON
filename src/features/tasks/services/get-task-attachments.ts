import type { ApiEnvelope } from "@/contracts/api";
import type { TaskAttachmentsResponse } from "@/contracts/tasks";
import { apiClient } from "@/services/http/axios-client";
import { normalizeApiClientError } from "@/services/http/api-client-error";

export async function getTaskAttachments(
  taskId: string,
): Promise<TaskAttachmentsResponse> {
  try {
    const response = await apiClient.get<ApiEnvelope<TaskAttachmentsResponse>>(
      `/tasks/${taskId}/attachments`,
    );
    const data = response.data as ApiEnvelope<TaskAttachmentsResponse>;

    if (!data.success) {
      throw new Error(data.error.message);
    }

    return data.data;
  } catch (error) {
    throw normalizeApiClientError(error);
  }
}
