import type { Route } from "next";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Clock3, FolderKanban, Layers3, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const projects = [
  {
    id: "launch-planning",
    name: "Launch planning",
    description: "Organize release tasks across the Kanban board.",
    counts: { TODO: 4, IN_PROGRESS: 2, DONE: 5 },
    owner: "Owner",
    health: "On track",
  },
  {
    id: "qa-readiness",
    name: "QA readiness",
    description: "Track validation, smoke checks, and reviewer notes.",
    counts: { TODO: 3, IN_PROGRESS: 1, DONE: 7 },
    owner: "Owner",
    health: "Needs review",
  },
];

const summaryCards = [
  { label: "Projects", value: "2", icon: FolderKanban },
  { label: "Open tasks", value: "10", icon: Layers3 },
  { label: "Review queue", value: "3", icon: BriefcaseBusiness },
  { label: "Avg cycle", value: "2.4d", icon: Clock3 },
];

export function ProjectsDashboardShell() {
  return (
    <section className="space-y-4">
      {/* Hero banner */}
      <Card className="overflow-hidden border-border/80 bg-gradient-to-b from-white to-muted/20">
        <CardContent className="grid gap-4 px-4 py-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Badge variant="outline">Dashboard shell</Badge>
            <h2 className="mt-3 text-2xl font-bold tracking-tight">
              Keep delivery visible without turning the workspace into noise.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              This dashboard shell is ready for real project queries, task counts, loading
              states, and mutation feedback. For now it gives the workspace a stable, scalable frame.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button size="sm">
                <Plus className="size-3.5" />
                Create project
              </Button>
              <Button variant="outline" size="sm">
                Review roadmap
              </Button>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {summaryCards.map((card) => (
              <Card key={card.label}>
                <CardContent className="px-3 py-3">
                  <div className="flex items-center justify-between">
                    <div className="grid size-7 place-items-center rounded-md bg-primary/10 text-primary">
                      <card.icon className="size-3.5" />
                    </div>
                    <Badge variant="muted">Live</Badge>
                  </div>
                  <p className="mt-3 text-2xl font-semibold tracking-tight">{card.value}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{card.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Projects + sidebar */}
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Active projects</CardTitle>
            <CardDescription>
              The dashboard keeps projects scannable, owner context visible, and status counts easy to compare.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/app/projects/${project.id}` as Route}
                className="rounded-md border border-border/80 bg-background/80 p-3 transition-colors hover:bg-muted/30"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="text-sm font-semibold">{project.name}</h3>
                      <Badge variant={project.health === "On track" ? "success" : "warning"}>
                        {project.health}
                      </Badge>
                    </div>
                    <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
                      {project.description}
                    </p>
                  </div>
                  <Badge variant="outline">{project.owner}</Badge>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {Object.entries(project.counts).map(([status, count]) => (
                    <span
                      key={status}
                      className="rounded-sm border border-border bg-card px-2 py-1 text-[11px] font-medium text-muted-foreground"
                    >
                      {status.replace("_", " ")}: {count}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-3">
          {/* Activity heatmap */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery rhythm</CardTitle>
              <CardDescription>
                A compact visual block for recent throughput and operational attention.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-9 gap-1.5">
                {Array.from({ length: 54 }).map((_, index) => {
                  const active = [1, 3, 7, 8, 12, 13, 14, 18, 21, 22, 28, 29, 34, 35, 36, 40, 46, 47, 52].includes(index);

                  return (
                    <div
                      key={index}
                      className={[
                        "aspect-square rounded-[2px] border border-border/60",
                        active ? "bg-primary" : "bg-muted/70",
                      ].join(" ")}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Next actions */}
          <Card>
            <CardHeader>
              <CardTitle>Next action surface</CardTitle>
              <CardDescription>
                Keep the next useful steps visible while feature work is still landing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {[
                "Connect protected shell auth gating",
                "Load projects from TanStack Query",
                "Add task creation feedback states",
              ].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-md border border-border/80 bg-background/80 px-3 py-2">
                  <p className="text-sm font-medium">{item}</p>
                  <ArrowRight className="size-3.5 text-muted-foreground" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
