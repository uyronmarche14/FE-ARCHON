const columns = [
  {
    title: "TODO",
    cards: ["Draft API envelope", "Define project DTOs", "Write smoke notes"],
  },
  {
    title: "IN_PROGRESS",
    cards: ["Wire refresh token flow", "Polish dashboard loading state"],
  },
  {
    title: "DONE",
    cards: ["Scaffold frontend routes", "Set up shadcn base button"],
  },
];

type ProjectBoardShellProps = {
  projectId: string;
};

export function ProjectBoardShell({ projectId }: ProjectBoardShellProps) {
  return (
    <section className="space-y-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{projectId.replace(/-/g, " ")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Placeholder board route. Real task data and drag-and-drop come next.
          </p>
        </div>
        <button className="rounded-md border border-border px-3 py-2 text-sm">
          Add task
        </button>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        {columns.map((column) => (
          <section key={column.title} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">{column.title}</h2>
              <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                {column.cards.length}
              </span>
            </div>
            <div className="mt-3 space-y-3">
              {column.cards.map((card) => (
                <article
                  key={card}
                  className="rounded-md border border-border bg-background p-3"
                >
                  <h3 className="font-medium">{card}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Placeholder task card.
                  </p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
