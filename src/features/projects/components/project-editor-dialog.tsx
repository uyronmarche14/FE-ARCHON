"use client";

import type { Route } from "next";
import { startTransition, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import type {
  ProjectDetail,
  ProjectsListResponse,
  ProjectSummary,
} from "@/contracts/projects";
import { useCreateProject } from "@/features/projects/hooks/use-create-project";
import { useDeleteProject } from "@/features/projects/hooks/use-delete-project";
import { useUpdateProject } from "@/features/projects/hooks/use-update-project";
import {
  createProjectFormValues,
  mapProjectFormErrors,
  normalizeCreateProjectFormValues,
  normalizeUpdateProjectFormValues,
  type ProjectFormErrors,
  type ProjectFormValues,
  validateProjectFormValues,
} from "@/features/projects/lib/project-form";
import { getProjectPath } from "@/features/projects/lib/project-paths";
import {
  projectDetailQueryKey,
  projectsQueryKey,
} from "@/features/projects/lib/project-query-keys";
import { projectTasksQueryKey } from "@/features/tasks/lib/task-query-keys";
import { showApiErrorToast, showSuccessToast } from "@/lib/toast";
import { isApiClientError } from "@/services/http/api-client-error";

type EditableProject = Pick<ProjectSummary, "description" | "id" | "name">;

type ProjectEditorDialogProps = {
  mode: "create" | "edit";
  project?: EditableProject | null;
  trigger?: React.ReactNode;
};

export function ProjectEditorDialog({
  mode,
  project,
  trigger,
}: ProjectEditorDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const createProjectMutation = useCreateProject();
  const deleteProjectMutation = useDeleteProject();
  const updateProjectMutation = useUpdateProject();
  const [open, setOpen] = useState(false);
  const [formValues, setFormValues] = useState<ProjectFormValues>(() =>
    createProjectFormValues(project ?? undefined),
  );
  const [fieldErrors, setFieldErrors] = useState<ProjectFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const isCreateMode = mode === "create";
  const isSubmitPending = isCreateMode
    ? createProjectMutation.isPending
    : updateProjectMutation.isPending;
  const isPending = isSubmitPending || deleteProjectMutation.isPending;
  const initialValues = useMemo(
    () => createProjectFormValues(project ?? undefined),
    [project],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateProjectFormValues(formValues);
    setFieldErrors(validationErrors);
    setFormError(null);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      if (isCreateMode) {
        const payload = normalizeCreateProjectFormValues(formValues);
        const createdProject = await createProjectMutation.mutateAsync(payload);

        queryClient.setQueryData<ProjectsListResponse>(
          projectsQueryKey,
          (currentProjects) => ({
            items: currentProjects
              ? [
                  createdProject,
                  ...currentProjects.items.filter(
                    (currentProject) => currentProject.id !== createdProject.id,
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

        return;
      }

      if (!project) {
        return;
      }

      const payload = normalizeUpdateProjectFormValues(formValues);
      const updatedProject = await updateProjectMutation.mutateAsync({
        projectId: project.id,
        request: payload,
      });

      queryClient.setQueryData<ProjectsListResponse | undefined>(
        projectsQueryKey,
        (currentProjects) =>
          currentProjects
            ? {
                items: currentProjects.items.map((currentProject) =>
                  currentProject.id === updatedProject.id
                    ? updatedProject
                    : currentProject,
                ),
              }
            : currentProjects,
      );
      queryClient.setQueryData<ProjectDetail | undefined>(
        projectDetailQueryKey(project.id),
        (currentProjectDetail) =>
          currentProjectDetail
            ? {
                ...currentProjectDetail,
                name: updatedProject.name,
                description: updatedProject.description,
              }
            : currentProjectDetail,
      );

      resetDialogState();
      showSuccessToast(
        "Project updated",
        "Project details are now in sync across the workspace.",
      );
      void queryClient.invalidateQueries({
        queryKey: projectsQueryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: projectDetailQueryKey(project.id),
      });
    } catch (error) {
      if (isApiClientError(error)) {
        const nextFieldErrors = mapProjectFormErrors(error.details);

        if (Object.keys(nextFieldErrors).length > 0) {
          setFieldErrors(nextFieldErrors);
        }

        setFormError(error.message);
      } else {
        setFormError(
          isCreateMode
            ? "Unable to create the project right now."
            : "Unable to update the project right now.",
        );
      }

      showApiErrorToast(
        error,
        isCreateMode
          ? "Unable to create the project right now."
          : "Unable to update the project right now.",
      );
    }
  }

  async function handleDeleteProject() {
    if (!project) {
      return;
    }

    if (deleteConfirmation.trim() !== project.name) {
      setFormError(`Type "${project.name}" exactly to delete this project.`);
      return;
    }

    setFormError(null);

    try {
      await deleteProjectMutation.mutateAsync(project.id);

      queryClient.setQueryData<ProjectsListResponse | undefined>(
        projectsQueryKey,
        (currentProjects) =>
          currentProjects
            ? {
                items: currentProjects.items.filter(
                  (currentProject) => currentProject.id !== project.id,
                ),
              }
            : currentProjects,
      );
      queryClient.removeQueries({
        queryKey: projectDetailQueryKey(project.id),
      });
      queryClient.removeQueries({
        queryKey: projectTasksQueryKey(project.id),
      });

      resetDialogState();
      showSuccessToast(
        "Project deleted",
        "The workspace was removed and the dashboard has been refreshed.",
      );

      void queryClient.invalidateQueries({
        queryKey: projectsQueryKey,
      });

      startTransition(() => {
        router.replace("/app");
      });
    } catch (error) {
      setFormError("Unable to delete the project right now.");
      showApiErrorToast(error, "Unable to delete the project right now.");
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && isPending) {
      return;
    }

    if (!nextOpen) {
      resetDialogState();
      return;
    }

    setOpen(true);
    setFormValues(initialValues);
    setFieldErrors({});
    setFormError(null);
  }

  function handleInputChange(field: keyof ProjectFormValues, value: string) {
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
    setFormValues(initialValues);
    setFieldErrors({});
    setFormError(null);
    setDeleteConfirmation("");
  }

  const title = isCreateMode ? "Create a project" : "Edit project";
  const description = isCreateMode
    ? "Start a new workspace with a clear name and optional description."
    : "Refine the project name or description without leaving the workspace.";
  const primaryActionLabel = isCreateMode ? "Create project" : "Save changes";
  const pendingActionLabel = isCreateMode ? "Creating" : "Saving";
  const metaBadges = isCreateMode
    ? ["New workspace", "Board ready after creation"]
    : ["Project details", "Dashboard + board stay aligned"];

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
      <DialogContent className="max-w-xl">
        <DialogHeader className="border-b border-border/60 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            {metaBadges.map((badgeLabel, index) => (
              <Badge
                key={badgeLabel}
                variant={index === 0 ? "outline" : "muted"}
                size="xs"
              >
                {badgeLabel}
              </Badge>
            ))}
          </div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
          <section className="grid gap-4 rounded-[1.1rem] border border-border/70 bg-surface-subtle/55 px-4 py-4">
            <div className="space-y-1">
              <Label htmlFor={`${mode}-project-name`}>Project name</Label>
              <p className="text-xs leading-5 text-muted-foreground">
                Use a clear workspace name people will recognize instantly in the sidebar and dashboard.
              </p>
            </div>
            <div className="space-y-1.5">
              <Input
                id={`${mode}-project-name`}
                value={formValues.name}
                placeholder="Launch website"
                onChange={(event) =>
                  handleInputChange("name", event.target.value)
                }
                aria-invalid={fieldErrors.name ? true : undefined}
                disabled={isPending}
              />
              {fieldErrors.name ? (
                <p className="text-xs text-destructive">{fieldErrors.name}</p>
              ) : null}
            </div>
          </section>

          <section className="grid gap-4 rounded-[1.1rem] border border-border/70 bg-card px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="space-y-1">
              <Label htmlFor={`${mode}-project-description`}>Description</Label>
              <p className="text-xs leading-5 text-muted-foreground">
                Optional. Give the team just enough context to understand what this project will hold.
              </p>
            </div>
            <div className="space-y-1.5">
              <Textarea
                id={`${mode}-project-description`}
                value={formValues.description}
                placeholder="Track the work, reviews, and launch checkpoints."
                onChange={(event) =>
                  handleInputChange("description", event.target.value)
                }
                aria-invalid={fieldErrors.description ? true : undefined}
                disabled={isPending}
              />
              {fieldErrors.description ? (
                <p className="text-xs text-destructive">
                  {fieldErrors.description}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Keep it concise and useful for the team.
                </p>
              )}
            </div>
          </section>

          {!isCreateMode && project ? (
            <section className="grid gap-4 rounded-[1.1rem] border border-destructive/25 bg-destructive/5 px-4 py-4">
              <div className="space-y-1">
                <Label htmlFor={`${mode}-project-delete-confirmation`}>
                  Delete project
                </Label>
                <p className="text-xs leading-5 text-muted-foreground">
                  This permanently removes the project board, its tasks, and its
                  activity history. Type <span className="font-semibold text-foreground">{project.name}</span> to confirm.
                </p>
              </div>
              <div className="space-y-1.5">
                <Input
                  id={`${mode}-project-delete-confirmation`}
                  value={deleteConfirmation}
                  placeholder={project.name}
                  onChange={(event) => {
                    setDeleteConfirmation(event.target.value);
                    setFormError(null);
                  }}
                  disabled={isPending}
                />
                <p className="text-xs text-muted-foreground">
                  This action cannot be undone.
                </p>
              </div>
            </section>
          ) : null}

          {formError ? (
            <div className="rounded-[1rem] border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {formError}
            </div>
          ) : null}

          <DialogFooter className={!isCreateMode ? "sm:justify-between" : undefined}>
            {!isCreateMode && project ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => void handleDeleteProject()}
                disabled={isPending || deleteConfirmation.trim() !== project.name}
              >
                {deleteProjectMutation.isPending ? (
                  <>
                    <LoaderCircle className="size-3.5 animate-spin" />
                    Deleting
                  </>
                ) : (
                  "Delete project"
                )}
              </Button>
            ) : (
              <span />
            )}
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isSubmitPending ? (
                  <>
                    <LoaderCircle className="size-3.5 animate-spin" />
                    {pendingActionLabel}
                  </>
                ) : isCreateMode ? (
                  <>
                    <Plus className="size-3.5" />
                    {primaryActionLabel}
                  </>
                ) : (
                  primaryActionLabel
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
