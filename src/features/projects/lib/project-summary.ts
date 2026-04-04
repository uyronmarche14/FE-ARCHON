import type {
  ProjectStatusSummary,
  ProjectSummary,
} from "@/contracts/projects";

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

export function getProjectTotalTaskCount(statuses: ProjectStatusSummary[]) {
  return statuses.reduce((total, status) => total + status.taskCount, 0);
}

export function getProjectOpenTaskCount(statuses: ProjectStatusSummary[]) {
  return statuses.reduce(
    (total, status) => total + (status.isClosed ? 0 : status.taskCount),
    0,
  );
}

export function getProjectProgressSegments(statuses: ProjectStatusSummary[]) {
  const total = getProjectTotalTaskCount(statuses);

  if (total === 0) {
    return [];
  }

  return statuses
    .filter((status) => status.taskCount > 0)
    .sort((left, right) => left.position - right.position)
    .map((status) => ({
      id: status.id,
      name: status.name,
      count: status.taskCount,
      isClosed: status.isClosed,
      width: (status.taskCount / total) * 100,
    }));
}

export function getProjectDoneCount(statuses: ProjectStatusSummary[]) {
  return statuses.reduce(
    (total, status) => total + (status.isClosed ? status.taskCount : 0),
    0,
  );
}

export function getProjectCompletionPercentage(statuses: ProjectStatusSummary[]) {
  const totalTasks = getProjectTotalTaskCount(statuses);

  if (totalTasks === 0) {
    return 0;
  }

  return Math.round((getProjectDoneCount(statuses) / totalTasks) * 100);
}

export function sortProjectsByName(projects: ProjectSummary[]) {
  return [...projects].sort((firstProject, secondProject) =>
    firstProject.name.localeCompare(secondProject.name),
  );
}
