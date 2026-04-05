"use client";

import { ProjectEditorDialog } from "@/features/projects/components/project-editor-dialog";

type CreateProjectDialogProps = {
  trigger?: React.ReactNode;
};

export function CreateProjectDialog({
  trigger,
}: CreateProjectDialogProps) {
  return <ProjectEditorDialog mode="create" trigger={trigger} />;
}
