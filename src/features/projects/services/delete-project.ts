import type { ApiEnvelope } from "@/contracts/api";
import type { DeleteProjectResponse } from "@/contracts/projects";
import { apiClient } from "@/services/http/axios-client";
import { normalizeApiClientError } from "@/services/http/api-client-error";

export async function deleteProject(
  projectId: string,
): Promise<DeleteProjectResponse> {
  try {
    const response = await apiClient.delete<ApiEnvelope<DeleteProjectResponse>>(
      `/projects/${projectId}`,
    );
    const data = response.data as ApiEnvelope<DeleteProjectResponse>;

    if (!data.success) {
      throw new Error(data.error.message);
    }

    return data.data;
  } catch (error) {
    throw normalizeApiClientError(error);
  }
}
