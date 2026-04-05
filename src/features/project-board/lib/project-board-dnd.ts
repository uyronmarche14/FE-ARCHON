const STATUS_LANE_DRAG_PREFIX = "status-lane:";

export function createStatusLaneDragId(statusId: string) {
  return `${STATUS_LANE_DRAG_PREFIX}${statusId}`;
}

export function parseStatusLaneDragId(
  activeId: string | number | null | undefined,
) {
  if (typeof activeId !== "string") {
    return null;
  }

  if (!activeId.startsWith(STATUS_LANE_DRAG_PREFIX)) {
    return null;
  }

  const statusId = activeId.slice(STATUS_LANE_DRAG_PREFIX.length);

  return statusId.length > 0 ? statusId : null;
}
