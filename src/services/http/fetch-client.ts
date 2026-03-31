import type { ApiEnvelope } from "@/contracts/api";
import { getApiBaseUrl } from "@/services/http/get-api-base-url";

type ApiFetchOptions = RequestInit & {
  path: string;
};

export async function apiFetch<TData>({
  path,
  headers,
  ...init
}: ApiFetchOptions): Promise<ApiEnvelope<TData>> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  return (await response.json()) as ApiEnvelope<TData>;
}
