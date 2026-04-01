export function getProjectPath(projectId: string) {
  return `/app/projects/${projectId}`;
}

export function getProjectIdFromPathname(pathname: string) {
  const match = pathname.match(/^\/app\/projects\/([^/]+)(?:\/|$)/);

  return match?.[1] ?? null;
}
