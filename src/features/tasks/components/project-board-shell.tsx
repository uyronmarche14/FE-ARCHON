import { CalendarClock, CircleCheckBig, CircleDashed, LayoutGrid, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const columns = [
  {
    title: "TODO",
    tone: "muted" as const,
    cards: [
      { title: "Draft API envelope", detail: "Align response metadata and DTO naming.", assignee: "RM" },
      { title: "Define project DTOs", detail: "Prepare backend task contracts for CRUD work.", assignee: "JD" },
      { title: "Write smoke notes", detail: "Capture the review checklist for delivery flow.", assignee: "AL" },
    ],
  },
  {
    title: "IN_PROGRESS",
    tone: "warning" as const,
    cards: [
      { title: "Wire refresh token flow", detail: "Keep session bootstrap calm during auth routing.", assignee: "RM" },
      { title: "Polish dashboard loading state", detail: "Add the final board skeleton and empty-state rules.", assignee: "KT" },
    ],
  },
  {
    title: "DONE",
    tone: "success" as const,
    cards: [
      { title: "Scaffold frontend routes", detail: "Public and app route groups are in place.", assignee: "RM" },
      { title: "Set up shadcn base button", detail: "Shared button primitive is installed and reusable.", assignee: "RM" },
    ],
  },
];

type ProjectBoardShellProps = {
  projectId: string;
};

export function ProjectBoardShell({ projectId }: ProjectBoardShellProps) {
  const projectName = projectId.replace(/-/g, " ");

  return (
    <section className="space-y-4">
      {/* Board header */}
      <Card className="border-border/80 bg-gradient-to-b from-white to-muted/20">
        <CardContent className="grid gap-4 px-4 py-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Badge variant="outline">Project board</Badge>
            <h2 className="mt-3 text-2xl font-bold tracking-tight capitalize">{projectName}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              This board shell is designed for stable Kanban columns, fast scan-ability, and
              room for task logs and drag-and-drop behavior in the next story.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button size="sm">
                <Plus className="size-3.5" />
                Add task
              </Button>
              <Button variant="outline" size="sm">
                Review activity log
              </Button>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {[
              { label: "Tasks", value: "7", icon: LayoutGrid },
              { label: "Due this week", value: "3", icon: CalendarClock },
              { label: "Completed", value: "2", icon: CircleCheckBig },
            ].map((metric) => (
              <Card key={metric.label}>
                <CardContent className="px-3 py-3">
                  <metric.icon className="size-3.5 text-primary" />
                  <p className="mt-2 text-2xl font-semibold tracking-tight">{metric.value}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{metric.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Kanban columns */}
      <div className="grid gap-3 xl:grid-cols-3">
        {columns.map((column) => (
          <Card key={column.title}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-xs tracking-widest uppercase">{column.title}</CardTitle>
                  <CardDescription className="mt-0.5 text-xs">
                    {column.cards.length} cards in this lane
                  </CardDescription>
                </div>
                <Badge variant={column.tone}>{column.cards.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-2">
              {column.cards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-md border border-border/80 bg-background/80 p-3 shadow-sm transition-colors hover:bg-muted/20"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-medium">{card.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{card.detail}</p>
                    </div>
                    <div className="grid size-7 shrink-0 place-items-center rounded-md bg-muted text-xs font-medium text-muted-foreground">
                      {card.assignee}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                      Placeholder task
                    </span>
                    <CircleDashed className="size-3.5 text-muted-foreground" />
                  </div>
                </article>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
