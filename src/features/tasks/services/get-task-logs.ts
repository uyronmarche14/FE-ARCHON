import type { ApiEnvelope } from "@/contracts/api";
import type { TaskLogsResponse } from "@/contracts/tasks";
import { apiClient } from "@/services/http/axios-client";
import { normalizeApiClientError } from "@/services/http/api-client-error";

export async function getTaskLogs(taskId: string): Promise<TaskLogsResponse> {
  try {
    const response = await apiClient.get<ApiEnvelope<TaskLogsResponse>>(
      `/tasks/${taskId}/logs`,
    );
    const data = response.data as ApiEnvelope<TaskLogsResponse>;

    if (!data.success) {
      throw new Error(data.error.message);
    }

    return data.data;
  } catch (error) {
    throw normalizeApiClientError(error);
  }
}
