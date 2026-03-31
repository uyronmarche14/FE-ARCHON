import { ProjectBoardShell } from "@/features/tasks/components/project-board-shell";

type ProjectBoardPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectBoardPage({
  params,
}: ProjectBoardPageProps) {
  const { projectId } = await params;

  return <ProjectBoardShell projectId={projectId} />;
}
