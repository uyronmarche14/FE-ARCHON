"use client";

import { CalendarClock, CircleCheckBig, LayoutGrid, Plus } from "lucide-react";
import type { ProjectStatusResponse, ProjectStatusSummary } from "@/contracts/projects";
import type { BoardMetric } from "@/features/project-board/lib/project-board-workspace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreateProjectStatusDialog } from "@/features/projects/components/create-project-status-dialog";
import { InviteMemberDialog } from "@/features/projects/components/invite-member-dialog";
import { ManageProjectStatusesDialog } from "@/features/projects/components/manage-project-statuses-dialog";

type ProjectBoardHeaderCardProps = {
  canInviteMembers: boolean;
  canManageStatuses: boolean;
  firstStatusId: string;
  metrics: BoardMetric[];
  onCreateTask: (statusId: string) => void;
  onProjectStatusCreated: (createdStatus: ProjectStatusResponse) => void;
  projectDescription: string;
  projectId: string;
  projectName: string;
  statuses: ProjectStatusSummary[];
  visibleTaskCount: number;
};

export function ProjectBoardHeaderCard({
  canInviteMembers,
  canManageStatuses,
  firstStatusId,
  metrics,
  onCreateTask,
  onProjectStatusCreated,
  projectDescription,
  projectId,
  projectName,
  statuses,
  visibleTaskCount,
}: ProjectBoardHeaderCardProps) {
  return (
    <Card className="overflow-hidden border-border/70 bg-card shadow-sm">
      <CardContent className="space-y-4 bg-linear-to-b from-background via-background to-surface-subtle/40 px-4 py-4 sm:px-5">
        <header className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" size="xs" className="bg-background">
                Project board
              </Badge>
              <Badge variant="muted" size="xs">
                {visibleTaskCount} visible
              </Badge>
            </div>

            <div className="space-y-1">
              <h2 className="text-[1.85rem] font-semibold tracking-tight">
                {projectName}
              </h2>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                {projectDescription}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {canInviteMembers ? <InviteMemberDialog projectId={projectId} /> : null}
            {canManageStatuses ? (
              <>
                <CreateProjectStatusDialog
                  projectId={projectId}
                  onCreated={onProjectStatusCreated}
                />
                <ManageProjectStatusesDialog projectId={projectId} statuses={statuses} />
              </>
            ) : null}
            <Button
              type="button"
              size="sm"
              className="rounded-xl"
              onClick={() => onCreateTask(firstStatusId)}
              disabled={!firstStatusId}
            >
              <Plus className="size-4" />
              Create task
            </Button>
          </div>
        </header>

        <div className="grid gap-2 sm:grid-cols-3">
          {metrics.map((metric, index) => {
            const Icon =
              index === 0 ? LayoutGrid : index === 1 ? CalendarClock : CircleCheckBig;

            return (
              <article
                key={metric.label}
                className="rounded-[1rem] border border-border/70 bg-card/90 px-3.5 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
              >
                <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  <Icon className="size-3.5 text-primary" />
                  {metric.label}
                </div>
                <p className="mt-1.5 text-[1.65rem] font-semibold tracking-tight">
                  {metric.value}
                </p>
              </article>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
