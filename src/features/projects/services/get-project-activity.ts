import type { ApiEnvelope } from "@/contracts/api";
import type { ProjectActivityResponse } from "@/contracts/projects";
import type { TaskLogEventType } from "@/contracts/tasks";
import { apiClient } from "@/services/http/axios-client";
import { normalizeApiClientError } from "@/services/http/api-client-error";

type GetProjectActivityOptions = {
  page?: number;
  pageSize?: number;
  eventType?: TaskLogEventType | "ALL";
  q?: string;
};

export async function getProjectActivity(
  projectId: string,
  options: GetProjectActivityOptions = {},
): Promise<ProjectActivityResponse> {
  try {
    const response = await apiClient.get<ApiEnvelope<ProjectActivityResponse>>(
      `/projects/${projectId}/activity`,
      {
        params: {
          ...(options.page ? { page: options.page } : {}),
          ...(options.pageSize ? { pageSize: options.pageSize } : {}),
          ...(options.eventType && options.eventType !== "ALL"
            ? { eventType: options.eventType }
            : {}),
          ...(options.q ? { q: options.q } : {}),
        },
      },
    );
    const data = response.data as ApiEnvelope<ProjectActivityResponse>;

    if (!data.success) {
      throw new Error(data.error.message);
    }

    return data.data;
  } catch (error) {
    throw normalizeApiClientError(error);
  }
}
