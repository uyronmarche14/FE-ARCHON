import type { Route } from "next";
import Link from "next/link";

const projects = [
  {
    id: "launch-planning",
    name: "Launch planning",
    description: "Organize release tasks across the Kanban board.",
    counts: { TODO: 4, IN_PROGRESS: 2, DONE: 5 },
  },
  {
    id: "qa-readiness",
    name: "QA readiness",
    description: "Track validation, smoke checks, and reviewer notes.",
    counts: { TODO: 3, IN_PROGRESS: 1, DONE: 7 },
  },
];

export function ProjectsDashboardShell() {
  return (
    <section className="space-y-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Placeholder dashboard route. Real project data comes later.
          </p>
        </div>
        <button className="rounded-md border border-border px-3 py-2 text-sm">
          Create project
        </button>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/app/projects/${project.id}` as Route}
            className="block rounded-lg border border-border bg-card p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">{project.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {project.description}
                </p>
              </div>
              <span className="rounded-md bg-muted px-2 py-1 text-xs">
                Owner
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(project.counts).map(([status, count]) => (
                <span
                  key={status}
                  className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground"
                >
                  {status}: {count}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
