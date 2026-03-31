import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  LayoutPanelTop,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const metrics = [
  { label: "Active boards", value: "12" },
  { label: "Tasks audited", value: "148" },
  { label: "Update latency", value: "< 1s" },
];

const features = [
  {
    icon: ShieldCheck,
    title: "Audit-friendly by default",
    description: "Every task move, update, and status change is built to surface clean history.",
  },
  {
    icon: LayoutPanelTop,
    title: "Stable project shells",
    description: "Public pages stay focused while the workspace keeps navigation and context steady.",
  },
  {
    icon: Sparkles,
    title: "Clear delivery rhythm",
    description: "Designed for lightweight planning, handoff visibility, and fast execution.",
  },
];

const timeline = [
  { title: "Scope lock", detail: "Docs, schema, and route structure are aligned." },
  { title: "Backend foundation", detail: "Config, health checks, Prisma, and response envelopes are ready." },
  { title: "Frontend shell", detail: "Responsive layouts, providers, and shared HTTP utilities are live." },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-6 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div className="space-y-5">
          <Badge variant="default">Focused project delivery</Badge>

          <div className="space-y-3">
            <h1 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]">
              Calm shells for teams moving work across projects without losing context.
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Archon gives you a clean public surface, a deliberate app shell, and an
              audit-ready workspace for shipping tasks with less chaos.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/signup">
                Start with the shell
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/app">Preview the workspace</Link>
            </Button>
          </div>

          {/* Email waitlist */}
          <div className="flex flex-col gap-3 rounded-lg border border-border/70 bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Get product updates</p>
              <p className="text-xs text-muted-foreground">
                Keep this assessment shell moving one feature at a time.
              </p>
            </div>
            <div className="flex w-full flex-col gap-1.5 sm:w-auto sm:min-w-72 sm:flex-row">
              <Input aria-label="Work email" placeholder="Work email" />
              <Button size="sm">Join waitlist</Button>
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid gap-2 sm:grid-cols-3">
            {metrics.map((metric) => (
              <Card key={metric.label}>
                <CardContent className="px-3 py-3">
                  <p className="text-xl font-semibold tracking-tight">{metric.value}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{metric.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Board Preview Card */}
        <Card className="overflow-hidden border-border/80 bg-gradient-to-b from-white to-muted/30">
          <CardContent className="p-0">
            <div className="border-b border-border/80 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Workspace preview</p>
                  <p className="text-xs text-muted-foreground">
                    A compact board view for launches and reviews.
                  </p>
                </div>
                <Badge variant="muted">Live shell</Badge>
              </div>
            </div>

            <div className="grid gap-3 p-4">
              {/* Kanban lanes */}
              <div className="grid gap-2 sm:grid-cols-3">
                {["TODO", "IN PROGRESS", "DONE"].map((label, index) => (
                  <div key={label} className="rounded-md border border-border/80 bg-background/90 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                        {label}
                      </p>
                      <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-medium">{index + 2}</span>
                    </div>
                    <div className="mt-2.5 space-y-2">
                      {[0, 1].map((item) => (
                        <div
                          key={`${label}-${item}`}
                          className="rounded-md border border-border/80 bg-card px-3 py-2"
                        >
                          <p className="text-xs font-medium">
                            {label === "TODO"
                              ? "Write task rules"
                              : label === "IN PROGRESS"
                                ? "Polish shell interactions"
                                : "Ship shared providers"}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            Request metadata, status lanes, and handoff clarity.
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Activity + Stats */}
              <div className="grid gap-2 sm:grid-cols-[1fr_180px]">
                <div className="rounded-md border border-border/80 bg-background/90 p-3">
                  <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                    Activity signal
                  </p>
                  <div className="mt-2.5 grid grid-cols-12 gap-1.5">
                    {Array.from({ length: 72 }).map((_, index) => {
                      const active = [3, 4, 8, 9, 10, 16, 17, 23, 31, 32, 35, 40, 41, 50, 59, 60, 67].includes(index);

                      return (
                        <div
                          key={index}
                          className={[
                            "aspect-square rounded-[2px] border border-border/60",
                            active ? "bg-primary/85" : "bg-muted/70",
                          ].join(" ")}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-md border border-border/80 bg-background/90 p-3">
                  <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                    Status recap
                  </p>
                  <div className="mt-2.5 space-y-2">
                    {[
                      { label: "Tracked tasks", value: "23" },
                      { label: "Team members", value: "6" },
                      { label: "Open blockers", value: "2" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-md bg-muted/60 px-2.5 py-2">
                        <p className="text-base font-semibold">{item.value}</p>
                        <p className="text-[11px] text-muted-foreground">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Features */}
      <section className="grid gap-3 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardContent className="px-4 py-4">
              <feature.icon className="size-4 text-primary" />
              <h2 className="mt-3 text-base font-semibold">{feature.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Roadmap + Timeline */}
      <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardContent className="px-4 py-4">
            <Badge variant="outline" className="mb-3">
              Roadmap signal
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight">
              Built step by step, without losing the product shape.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              This shell is intentionally paced: backend contracts first, shared providers next,
              then auth, projects, and Kanban interactions on top of a stable frame.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-2">
          {timeline.map((step, index) => (
            <Card key={step.title}>
              <CardContent className="flex items-start gap-3 px-4 py-3">
                {index === timeline.length - 1 ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                ) : (
                  <CircleDashed className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{step.detail}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
