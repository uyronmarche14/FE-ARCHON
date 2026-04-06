"use client";

import type { Route } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PendingProjectInvite } from "@/contracts/projects";
import { cn } from "@/lib/utils";

type PendingProjectInvitesListProps = {
  items: PendingProjectInvite[];
  compact?: boolean;
  onReview?: () => void;
};

export function PendingProjectInvitesList({
  items,
  compact = false,
  onReview,
}: PendingProjectInvitesListProps) {
  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      {items.map((invite) => (
        <article
          key={invite.token}
          className={cn(
            "rounded-[1rem] border border-border/75 bg-[linear-gradient(145deg,color-mix(in_oklab,var(--primary)_3%,white),color-mix(in_oklab,var(--surface-subtle)_95%,white))] px-4 py-3",
            compact && "rounded-[0.95rem] px-3 py-2.5",
          )}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-semibold text-foreground">
                  {invite.project.name}
                </p>
                <Badge variant="muted" size="xs">
                  {invite.role === "OWNER" ? "Owner" : "Member"}
                </Badge>
              </div>
              <p className="text-xs leading-5 text-muted-foreground">
                Invited by {invite.invitedBy.name}. Review before{" "}
                {formatInviteExpiry(invite.expiresAt)}.
              </p>
            </div>

            <Button asChild size="sm" variant="outline" className="rounded-xl">
              <Link
                href={getInviteReviewPath(invite.token)}
                onClick={onReview}
              >
                Review invite
              </Link>
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}

function getInviteReviewPath(token: string) {
  return `/invite/${encodeURIComponent(token)}` as Route;
}

function formatInviteExpiry(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
