"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "@/features/auth/providers/auth-session-provider";
import { getTaskAssignmentNotifications } from "@/features/tasks/services/get-task-assignment-notifications";

export const taskAssignmentNotificationsQueryKey = [
  "tasks",
  "assigned-notifications",
] as const;

export function useTaskAssignmentNotifications() {
  const { session, status } = useAuthSession();

  return useQuery({
    queryKey: taskAssignmentNotificationsQueryKey,
    queryFn: getTaskAssignmentNotifications,
    enabled: status === "authenticated" && session !== null,
  });
}
