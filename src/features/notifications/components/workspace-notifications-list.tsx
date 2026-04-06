"use client";

import Link from "next/link";
import { BellDot, MailPlus, UserRoundPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { WorkspaceNotificationItem } from "@/features/notifications/hooks/use-workspace-notifications";
import { cn } from "@/lib/utils";

type WorkspaceNotificationsListProps = {
  items: WorkspaceNotificationItem[];
  onSelect?: () => void;
};

export function WorkspaceNotificationsList({
  items,
  onSelect,
}: WorkspaceNotificationsListProps) {
  return (
    <div className="space-y-2.5">
      {items.map((item) => {
        const Icon = item.type === "invite" ? MailPlus : UserRoundPlus;

        return (
          <article
            key={`${item.type}:${item.id}`}
            className={cn(
              "rounded-[1rem] border px-3 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
              item.type === "invite"
                ? "border-primary/20 bg-primary/5"
                : "border-amber-200/80 bg-amber-50/80",
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "mt-0.5 grid size-8 shrink-0 place-items-center rounded-full",
                  item.type === "invite"
                    ? "bg-primary/12 text-primary"
                    : "bg-amber-500/14 text-amber-700",
                )}
              >
                <Icon className="size-4" />
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      size="xs"
                      className={cn(
                        item.type === "invite"
                          ? "border-primary/25 bg-primary/8 text-primary"
                          : "border-amber-300/70 bg-amber-500/10 text-amber-800",
                      )}
                    >
                      {item.badgeLabel}
                    </Badge>
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <BellDot className="size-3" />
                      {formatNotificationTimestamp(item.createdAt)}
                    </span>
                  </div>
                  <p className="truncate text-sm font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="text-xs leading-5 text-muted-foreground">
                    {item.description}
                  </p>
                </div>

                <Button asChild size="sm" variant="outline" className="rounded-xl">
                  <Link href={item.href} onClick={onSelect}>
                    {item.type === "invite" ? "Review invite" : "Open project"}
                  </Link>
                </Button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function formatNotificationTimestamp(createdAt: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(createdAt));
}
