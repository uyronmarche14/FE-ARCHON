"use client";

import { useState } from "react";
import { Layers3, LoaderCircle, Plus } from "lucide-react";
import type {
  ProjectStatusColor,
  ProjectStatusResponse,
} from "@/contracts/projects";
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
import { Select } from "@/components/ui/select";
import { useCreateProjectStatus } from "@/features/projects/hooks/use-create-project-status";
import { showApiErrorToast } from "@/lib/toast";
import { isApiClientError } from "@/services/http/api-client-error";

type CreateProjectStatusDialogProps = {
  projectId: string;
  onCreated: (status: ProjectStatusResponse) => void;
};

export function CreateProjectStatusDialog({
  projectId,
  onCreated,
}: CreateProjectStatusDialogProps) {
  const createProjectStatusMutation = useCreateProjectStatus(projectId);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<"OPEN" | "CLOSED">("OPEN");
  const [color, setColor] = useState<ProjectStatusColor>("BLUE");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  function resetForm() {
    setName("");
    setType("OPEN");
    setColor("BLUE");
    setFieldError(null);
    setFormError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = name.trim().replace(/\s+/g, " ");

    if (!normalizedName) {
      setFieldError("Status name is required.");
      return;
    }

    setFieldError(null);
    setFormError(null);

    try {
      const createdStatus = await createProjectStatusMutation.mutateAsync({
        name: normalizedName,
        isClosed: type === "CLOSED",
        color,
      });

      onCreated(createdStatus);
      resetForm();
      setOpen(false);
    } catch (error) {
      if (isApiClientError(error)) {
        const nameError = Array.isArray(error.details?.name)
          ? error.details.name[0]
          : typeof error.details?.name === "string"
            ? error.details.name
            : null;

        if (nameError) {
          setFieldError(nameError);
        } else {
          setFormError(error.message);
          showApiErrorToast(error, "Unable to add the status right now.");
        }

        return;
      }

      setFormError("Unable to add the status right now.");
      showApiErrorToast(error, "Unable to add the status right now.");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && createProjectStatusMutation.isPending) {
          return;
        }

        setOpen(nextOpen);

        if (!nextOpen) {
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="rounded-md">
          <Layers3 className="size-4" />
          Add status
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader className="border-b border-border/60 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" size="xs">
              Workflow
            </Badge>
            <Badge variant="muted" size="xs">
              Dynamic lane
            </Badge>
          </div>
          <DialogTitle>Create a status</DialogTitle>
          <DialogDescription>
            Add a new board lane for this project. New projects still start with Todo, In Progress, and Done automatically.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <section className="grid gap-4 rounded-[1.1rem] border border-border/70 bg-surface-subtle/55 px-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="status-name">Status name</Label>
              <p className="text-xs leading-5 text-muted-foreground">
                Keep the label short and clear so it reads well across the board.
              </p>
            </div>
            <div className="space-y-1.5">
              <Input
                id="status-name"
                value={name}
                placeholder="Review"
                disabled={createProjectStatusMutation.isPending}
                onChange={(event) => {
                  setName(event.target.value);
                  setFieldError(null);
                  setFormError(null);
                }}
              />
              {fieldError ? (
                <p className="text-xs text-destructive">{fieldError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Examples: Review, Blocked, Ready for QA.
                </p>
              )}
            </div>
          </section>

          <section className="grid gap-4 rounded-[1.1rem] border border-border/70 bg-card px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="space-y-1">
              <Label htmlFor="status-type">Workflow meaning</Label>
              <p className="text-xs leading-5 text-muted-foreground">
                Decide whether tasks in this lane count as active work or completed work.
              </p>
            </div>
            <Select
              id="status-type"
              value={type}
              disabled={createProjectStatusMutation.isPending}
              onChange={(event) => {
                const nextType = event.target.value as "OPEN" | "CLOSED";
                setType(nextType);
                setColor((currentColor: ProjectStatusColor) =>
                  currentColor === "BLUE" || currentColor === "GREEN"
                    ? nextType === "CLOSED"
                      ? "GREEN"
                      : "BLUE"
                    : currentColor,
                );
              }}
            >
              <option value="OPEN">Open stage</option>
              <option value="CLOSED">Completed stage</option>
            </Select>
          </section>

          <section className="grid gap-4 rounded-[1.1rem] border border-border/70 bg-card px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="space-y-1">
              <Label htmlFor="status-color">Status color</Label>
              <p className="text-xs leading-5 text-muted-foreground">
                Use a distinct accent so the lane, cards, and pills stay readable across the board.
              </p>
            </div>
            <Select
              id="status-color"
              value={color}
              disabled={createProjectStatusMutation.isPending}
              onChange={(event) =>
                setColor(event.target.value as ProjectStatusColor)
              }
            >
              <option value="SLATE">Slate</option>
              <option value="BLUE">Blue</option>
              <option value="AMBER">Amber</option>
              <option value="GREEN">Green</option>
              <option value="RED">Red</option>
              <option value="PURPLE">Purple</option>
            </Select>
          </section>

          {formError ? (
            <div className="rounded-[1rem] border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {formError}
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createProjectStatusMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createProjectStatusMutation.isPending}>
              {createProjectStatusMutation.isPending ? (
                <>
                  <LoaderCircle className="size-3.5 animate-spin" />
                  Creating
                </>
              ) : (
                <>
                  <Plus className="size-3.5" />
                  Create status
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
