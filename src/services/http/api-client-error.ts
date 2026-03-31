import axios, { AxiosError } from "axios";
import type { ApiEnvelope, ApiErrorPayload } from "@/contracts/api";

export class ApiClientError extends Error {
  readonly status: number | null;
  readonly code: string;
  readonly details: ApiErrorPayload["details"];
  readonly requestId: string | null;

  constructor({
    message,
    code,
    status,
    details,
    requestId,
  }: {
    message: string;
    code: string;
    status: number | null;
    details?: ApiErrorPayload["details"];
    requestId?: string | null;
  }) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId ?? null;
  }
}

export function isApiClientError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError;
}

export function normalizeApiClientError(error: unknown): ApiClientError {
  if (error instanceof ApiClientError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    return fromAxiosError(error);
  }

  if (error instanceof Error) {
    return new ApiClientError({
      message: error.message,
      code: "UNKNOWN_ERROR",
      status: null,
    });
  }

  return new ApiClientError({
    message: "Unexpected frontend error",
    code: "UNKNOWN_ERROR",
    status: null,
  });
}

function fromAxiosError(error: AxiosError<ApiEnvelope<unknown>>): ApiClientError {
  const apiError = error.response?.data?.success === false ? error.response.data.error : null;
  const apiMeta = error.response?.data?.meta;

  return new ApiClientError({
    message: apiError?.message ?? error.message ?? "Request failed",
    code: apiError?.code ?? "HTTP_ERROR",
    status: error.response?.status ?? null,
    details: apiError?.details,
    requestId: apiMeta?.requestId ?? null,
  });
}
