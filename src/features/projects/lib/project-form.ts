import type { ApiErrorDetails } from "@/contracts/api";
import type { CreateProjectRequest } from "@/contracts/projects";

export type CreateProjectFormValues = {
  name: string;
  description: string;
};

export type CreateProjectFormErrors = Partial<
  Record<keyof CreateProjectFormValues, string>
>;

export function normalizeCreateProjectFormValues(
  values: CreateProjectFormValues,
): CreateProjectRequest {
  const normalizedName = values.name.trim().replace(/\s+/g, " ");
  const normalizedDescription = values.description.trim();

  return {
    name: normalizedName,
    ...(normalizedDescription ? { description: normalizedDescription } : {}),
  };
}

export function validateCreateProjectFormValues(
  values: CreateProjectFormValues,
): CreateProjectFormErrors {
  const normalizedValues = normalizeCreateProjectFormValues(values);
  const errors: CreateProjectFormErrors = {};

  if (!normalizedValues.name) {
    errors.name = "Project name is required.";
  } else if (normalizedValues.name.length > 120) {
    errors.name = "Project name must be 120 characters or fewer.";
  }

  if (
    normalizedValues.description !== undefined &&
    normalizedValues.description.length > 2000
  ) {
    errors.description =
      "Project description must be 2000 characters or fewer.";
  }

  return errors;
}

export function mapProjectFormErrors(
  details?: ApiErrorDetails,
): CreateProjectFormErrors {
  if (!details) {
    return {};
  }

  return {
    name: readProjectFieldError(details.name),
    description: readProjectFieldError(details.description),
  };
}

function readProjectFieldError(
  detail?: string | number | boolean | string[] | null,
) {
  if (Array.isArray(detail)) {
    return detail[0];
  }

  return typeof detail === "string" ? detail : undefined;
}
