import type { ApiErrorDetails } from "@/contracts/api";
import type {
  CreateProjectRequest,
  UpdateProjectRequest,
} from "@/contracts/projects";

export type ProjectFormValues = {
  name: string;
  description: string;
};

export type ProjectFormErrors = Partial<Record<keyof ProjectFormValues, string>>;

export type CreateProjectFormValues = ProjectFormValues;
export type CreateProjectFormErrors = ProjectFormErrors;

function normalizeProjectFormValues(values: ProjectFormValues) {
  const normalizedName = values.name.trim().replace(/\s+/g, " ");
  const normalizedDescription = values.description.trim();

  return {
    name: normalizedName,
    description: normalizedDescription,
  };
}

export function createProjectFormValues(
  values?: Partial<{
    description: string | null;
    name: string;
  }>,
): ProjectFormValues {
  return {
    name: values?.name ?? "",
    description: values?.description ?? "",
  };
}

export function normalizeCreateProjectFormValues(
  values: ProjectFormValues,
): CreateProjectRequest {
  const normalizedValues = normalizeProjectFormValues(values);

  return {
    name: normalizedValues.name,
    ...(normalizedValues.description
      ? { description: normalizedValues.description }
      : {}),
  };
}

export function normalizeUpdateProjectFormValues(
  values: ProjectFormValues,
): UpdateProjectRequest {
  const normalizedValues = normalizeProjectFormValues(values);

  return {
    name: normalizedValues.name,
    description: normalizedValues.description || null,
  };
}

export function validateProjectFormValues(
  values: ProjectFormValues,
): ProjectFormErrors {
  const normalizedValues = normalizeProjectFormValues(values);
  const errors: ProjectFormErrors = {};

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

export function validateCreateProjectFormValues(
  values: ProjectFormValues,
): ProjectFormErrors {
  return validateProjectFormValues(values);
}

export function mapProjectFormErrors(
  details?: ApiErrorDetails,
): ProjectFormErrors {
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
