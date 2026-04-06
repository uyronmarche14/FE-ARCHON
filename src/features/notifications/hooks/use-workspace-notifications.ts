"use client";

import { useMemo } from "react";
import type { Route } from "next";
import { usePendingProjectInvites } from "@/features/projects/hooks/use-pending-project-invites";
import { getProjectPath } from "@/features/projects/lib/project-paths";
import { useTaskAssignmentNotifications } from "@/features/tasks/hooks/use-task-assignment-notifications";

export type WorkspaceNotificationItem =
  | {
      id: string;
      type: "invite";
      createdAt: string;
      title: string;
      description: string;
      href: Route;
      badgeLabel: string;
    }
  | {
      id: string;
      type: "task_assigned";
      createdAt: string;
      title: string;
      description: string;
      href: Route;
      badgeLabel: string;
    };

export function useWorkspaceNotifications() {
  const pendingInvitesQuery = usePendingProjectInvites();
  const taskAssignmentNotificationsQuery = useTaskAssignmentNotifications();

  const items = useMemo<WorkspaceNotificationItem[]>(() => {
    const inviteItems = (pendingInvitesQuery.data?.items ?? []).map((invite) => ({
      id: invite.token,
      type: "invite" as const,
      createdAt: invite.createdAt,
      title: invite.project.name,
      description: `Invited by ${invite.invitedBy.name} as ${invite.role === "OWNER" ? "owner" : "member"}.`,
      href: `/invite/${encodeURIComponent(invite.token)}` as Route,
      badgeLabel: "Invite",
    }));
    const assignmentItems = (taskAssignmentNotificationsQuery.data?.items ?? []).map(
      (notification) => ({
        id: notification.id,
        type: "task_assigned" as const,
        createdAt: notification.createdAt,
        title: notification.task.title,
        description: `${notification.actor.name} assigned you in ${notification.project.name}.`,
        href: getProjectPath(notification.project.id) as Route,
        badgeLabel: "Assigned",
      }),
    );

    return [...inviteItems, ...assignmentItems].sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );
  }, [pendingInvitesQuery.data?.items, taskAssignmentNotificationsQuery.data?.items]);

  return {
    items,
    totalCount: items.length,
    isPending: pendingInvitesQuery.isPending || taskAssignmentNotificationsQuery.isPending,
    isError: pendingInvitesQuery.isError || taskAssignmentNotificationsQuery.isError,
  };
}
