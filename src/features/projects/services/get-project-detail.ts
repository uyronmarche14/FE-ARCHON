import type { ApiEnvelope } from "@/contracts/api";
import type { ProjectDetail } from "@/contracts/projects";
import { apiClient } from "@/services/http/axios-client";
import { normalizeApiClientError } from "@/services/http/api-client-error";

export async function getProjectDetail(
  projectId: string,
): Promise<ProjectDetail> {
  try {
    const response = await apiClient.get<ApiEnvelope<ProjectDetail>>(
      `/projects/${projectId}`,
    );
    const data = response.data as ApiEnvelope<ProjectDetail>;

    if (!data.success) {
      throw new Error(data.error.message);
    }

    return data.data;
  } catch (error) {
    throw normalizeApiClientError(error);
  }
}
