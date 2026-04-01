"use client";

import type { Route } from "next";
import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ProjectsListResponse } from "@/contracts/projects";
import { useCreateProject } from "@/features/projects/hooks/use-create-project";
import {
  type CreateProjectFormErrors,
  mapProjectFormErrors,
  normalizeCreateProjectFormValues,
  type CreateProjectFormValues,
  validateCreateProjectFormValues,
} from "@/features/projects/lib/project-form";
import { getProjectPath } from "@/features/projects/lib/project-paths";
import { projectsQueryKey } from "@/features/projects/lib/project-query-keys";
import { showApiErrorToast, showSuccessToast } from "@/lib/toast";
import { isApiClientError } from "@/services/http/api-client-error";

type CreateProjectDialogProps = {
  trigger?: React.ReactNode;
};

const initialFormValues: CreateProjectFormValues = {
  name: "",
  description: "",
};

export function CreateProjectDialog({
  trigger,
}: CreateProjectDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const createProjectMutation = useCreateProject();
  const [open, setOpen] = useState(false);
  const [formValues, setFormValues] =
    useState<CreateProjectFormValues>(initialFormValues);
  const [fieldErrors, setFieldErrors] = useState<CreateProjectFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateCreateProjectFormValues(formValues);
    setFieldErrors(validationErrors);
    setFormError(null);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      const payload = normalizeCreateProjectFormValues(formValues);
      const createdProject = await createProjectMutation.mutateAsync(payload);

      queryClient.setQueryData<ProjectsListResponse>(
        projectsQueryKey,
        (currentProjects) => ({
          items: currentProjects
            ? [
                createdProject,
                ...currentProjects.items.filter(
                  (project) => project.id !== createdProject.id,
                ),
              ]
            : [createdProject],
        }),
      );

      resetDialogState();
      showSuccessToast(
        "Project created",
        "The new workspace is ready for task planning.",
      );
      void queryClient.invalidateQueries({
        queryKey: projectsQueryKey,
      });

      startTransition(() => {
        router.push(getProjectPath(createdProject.id) as Route);
      });
    } catch (error) {
      if (isApiClientError(error)) {
        const nextFieldErrors = mapProjectFormErrors(error.details);

        if (Object.keys(nextFieldErrors).length > 0) {
          setFieldErrors(nextFieldErrors);
        }

        setFormError(error.message);
      } else {
        setFormError("Unable to create the project right now.");
      }

      showApiErrorToast(error, "Unable to create the project right now.");
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && createProjectMutation.isPending) {
      return;
    }

    if (!nextOpen) {
      resetDialogState();
      return;
    }

    setOpen(true);
  }

  function handleInputChange(
    field: keyof CreateProjectFormValues,
    value: string,
  ) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));

    setFieldErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      return {
        ...currentErrors,
        [field]: undefined,
      };
    });
    setFormError(null);
  }

  function resetDialogState() {
    setOpen(false);
    setFormValues(initialFormValues);
    setFieldErrors({});
    setFormError(null);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Plus className="size-3.5" />
            Create project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a project</DialogTitle>
          <DialogDescription>
            Start a new workspace with a clear name and optional description.
          </DialogDescription>
        </DialogHeader>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="project-name">Project name</Label>
            <Input
              id="project-name"
              value={formValues.name}
              placeholder="Launch website"
              onChange={(event) =>
                handleInputChange("name", event.target.value)
              }
              aria-invalid={fieldErrors.name ? true : undefined}
              disabled={createProjectMutation.isPending}
            />
            {fieldErrors.name ? (
              <p className="text-xs text-destructive">{fieldErrors.name}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              value={formValues.description}
              placeholder="Track the work, reviews, and launch checkpoints."
              onChange={(event) =>
                handleInputChange("description", event.target.value)
              }
              aria-invalid={fieldErrors.description ? true : undefined}
              disabled={createProjectMutation.isPending}
            />
            {fieldErrors.description ? (
              <p className="text-xs text-destructive">
                {fieldErrors.description}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Optional. Keep it concise and useful for the team.
              </p>
            )}
          </div>

          {formError ? (
            <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {formError}
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={createProjectMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createProjectMutation.isPending}>
              {createProjectMutation.isPending ? (
                <>
                  <LoaderCircle className="size-3.5 animate-spin" />
                  Creating
                </>
              ) : (
                <>
                  <Plus className="size-3.5" />
                  Create project
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
