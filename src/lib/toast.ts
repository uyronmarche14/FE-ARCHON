import { toast } from "sonner";
import { isApiClientError } from "@/services/http/api-client-error";

export function showInfoToast(title: string, description?: string) {
  toast(title, {
    description,
  });
}

export function showSuccessToast(title: string, description?: string) {
  toast.success(title, {
    description,
  });
}

export function showApiErrorToast(error: unknown, fallbackMessage = "Something went wrong.") {
  if (isApiClientError(error)) {
    toast.error(error.message, {
      description: error.requestId
        ? `Request ID: ${error.requestId}`
        : fallbackMessage,
    });

    return;
  }

  toast.error(fallbackMessage);
}
