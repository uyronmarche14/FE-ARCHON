import type { ApiEnvelope } from "@/contracts/api";
import type { TaskAssignmentNotificationsResponse } from "@/contracts/notifications";
import { apiClient } from "@/services/http/axios-client";
import { normalizeApiClientError } from "@/services/http/api-client-error";

export async function getTaskAssignmentNotifications(): Promise<TaskAssignmentNotificationsResponse> {
  try {
    const response = await apiClient.get<
      ApiEnvelope<TaskAssignmentNotificationsResponse>
    >("/tasks/assigned-notifications");
    const data = response.data as ApiEnvelope<TaskAssignmentNotificationsResponse>;

    if (!data.success) {
      throw new Error(data.error.message);
    }

    return data.data;
  } catch (error) {
    throw normalizeApiClientError(error);
  }
}
