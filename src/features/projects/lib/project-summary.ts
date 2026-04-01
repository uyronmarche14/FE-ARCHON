import type { ProjectSummary, ProjectTaskCounts } from "@/contracts/projects";

export function getProjectInitials(name: string) {
  const segments = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (segments.length === 0) {
    return "PR";
  }

  return segments.map((segment) => segment[0]?.toUpperCase() ?? "").join("");
}

export function getProjectTotalTaskCount(taskCounts: ProjectTaskCounts) {
  return taskCounts.TODO + taskCounts.IN_PROGRESS + taskCounts.DONE;
}

export function getProjectOpenTaskCount(taskCounts: ProjectTaskCounts) {
  return taskCounts.TODO + taskCounts.IN_PROGRESS;
}

export function getProjectProgressSegments(taskCounts: ProjectTaskCounts) {
  const total = getProjectTotalTaskCount(taskCounts);

  if (total === 0) {
    return [];
  }

  return [
    {
      status: "TODO" as const,
      count: taskCounts.TODO,
      width: (taskCounts.TODO / total) * 100,
    },
    {
      status: "IN_PROGRESS" as const,
      count: taskCounts.IN_PROGRESS,
      width: (taskCounts.IN_PROGRESS / total) * 100,
    },
    {
      status: "DONE" as const,
      count: taskCounts.DONE,
      width: (taskCounts.DONE / total) * 100,
    },
  ].filter((segment) => segment.count > 0);
}

export function getProjectDoneCount(taskCounts: ProjectTaskCounts) {
  return taskCounts.DONE;
}

export function getProjectCompletionPercentage(taskCounts: ProjectTaskCounts) {
  const totalTasks = getProjectTotalTaskCount(taskCounts);

  if (totalTasks === 0) {
    return 0;
  }

  return Math.round((taskCounts.DONE / totalTasks) * 100);
}

export function sortProjectsByName(projects: ProjectSummary[]) {
  return [...projects].sort((firstProject, secondProject) =>
    firstProject.name.localeCompare(secondProject.name),
  );
}
