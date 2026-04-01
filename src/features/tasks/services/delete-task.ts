import type { ApiEnvelope } from "@/contracts/api";
import type { DeleteTaskResponse } from "@/contracts/tasks";
import { apiClient } from "@/services/http/axios-client";
import { normalizeApiClientError } from "@/services/http/api-client-error";

export async function deleteTask(
  taskId: string,
): Promise<DeleteTaskResponse> {
  try {
    const response = await apiClient.delete<ApiEnvelope<DeleteTaskResponse>>(
      `/tasks/${taskId}`,
    );
    const data = response.data as ApiEnvelope<DeleteTaskResponse>;

    if (!data.success) {
      throw new Error(data.error.message);
    }

    return data.data;
  } catch (error) {
    throw normalizeApiClientError(error);
  }
}
