import { ArrowRightLeft, CircleCheckBig, PanelsTopLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const featureItems = [
  {
    icon: PanelsTopLeft,
    title: "One clear workspace shape",
    description:
      "The public surface explains the product quickly, then hands off to a project shell that stays consistent once work begins.",
  },
  {
    icon: ArrowRightLeft,
    title: "Task movement that stays understandable",
    description:
      "Kanban states remain compact and readable, while lane changes still carry the context operators need to keep moving.",
  },
  {
    icon: CircleCheckBig,
    title: "Review-ready delivery rhythm",
    description:
      "Recent activity, due dates, and ownership signals are visible enough for handoff without overwhelming the primary board.",
  },
];

export function PublicFeatureSection() {
  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
      <div className="space-y-4">
        <Badge variant="muted" size="sm" className="w-fit">
          Why Archon stays calm
        </Badge>
        <div className="space-y-3">
          <h2 className="max-w-lg text-3xl font-semibold leading-tight tracking-tight text-balance">
            Move from public entry to delivery work without losing task context.
          </h2>
          <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
            The public landing page should feel like the same product as the
            app: minimal, structured, and built for teams that need clean task
            visibility rather than decorative dashboard noise.
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {featureItems.map((item) => (
          <article
            key={item.title}
            className="rounded-[1.5rem] border border-border/75 bg-card/90 px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.03)]"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-2xl bg-primary/[0.08] text-primary">
                <item.icon className="size-4" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
