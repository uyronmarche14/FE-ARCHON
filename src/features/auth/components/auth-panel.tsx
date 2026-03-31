"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { showInfoToast } from "@/lib/toast";

type AuthPanelProps = {
  mode: "login" | "signup";
};

const copyByMode = {
  login: {
    eyebrow: "Welcome back",
    title: "Log in to your workspace",
    description:
      "Access your projects, boards, and task history.",
    cta: "Log in",
    footerLabel: "Need an account?",
    footerHref: "/signup",
    footerText: "Create one",
  },
  signup: {
    eyebrow: "Get started",
    title: "Create your account",
    description:
      "Set up your workspace and start managing projects in minutes.",
    cta: "Create account",
    footerLabel: "Already have an account?",
    footerHref: "/login",
    footerText: "Log in",
  },
} as const;

const featurePoints = [
  "Calm task boards with clean state transitions",
  "Project shells built for mobile, tablet, and desktop",
  "Audit-friendly status and activity structure",
];

export function AuthPanel({ mode }: AuthPanelProps) {
  const copy = copyByMode[mode];

  function handlePlaceholderSubmit() {
    showInfoToast(
      mode === "login" ? "Login flow comes next." : "Signup flow comes next.",
      "This screen is connected to the shared toast and session bootstrap infrastructure.",
    );
  }

  return (
    <main className="grid min-h-[calc(100vh-3.5rem)] lg:grid-cols-2">
      {/* Left: Brand panel */}
      <section className="hidden border-r border-border/60 bg-muted/30 p-8 lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
              <Sparkles className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Archon</p>
              <p className="text-xs text-muted-foreground">Focused project delivery</p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
              {copy.eyebrow}
            </p>
            <h1 className="max-w-md text-3xl font-bold leading-tight tracking-tight">
              Keep the shell stable while the product grows feature by feature.
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
              Sign in to the workspace scaffold, review project status, and move into the app
              shell built for upcoming auth, projects, and Kanban work.
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          {featurePoints.map((point) => (
            <div key={point} className="flex items-start gap-2.5 rounded-md bg-background/80 px-3 py-2">
              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
              <p className="text-sm text-muted-foreground">{point}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Right: Form panel */}
      <section className="flex items-center justify-center px-4 py-8 sm:px-8">
        <Card className="w-full max-w-md border-border/80 shadow-sm">
          <CardHeader className="space-y-2 px-5 pt-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                  {copy.eyebrow}
                </p>
                <CardTitle className="mt-2 text-xl font-bold">{copy.title}</CardTitle>
              </div>
              <Link
                href="/"
                className="rounded-md border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Home
              </Link>
            </div>
            <CardDescription className="text-sm">{copy.description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 px-5 pb-5">
            <form className="space-y-3">
              {mode === "signup" ? (
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium">Full name</span>
                  <Input placeholder="Jane Doe" />
                </label>
              ) : null}

              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Email</span>
                <Input placeholder="jane@example.com" type="email" />
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Password</span>
                <Input placeholder="StrongPassword123" type="password" />
              </label>

              <div className="grid gap-2 pt-1 sm:grid-cols-[1fr_auto]">
                <Button size="default" type="button" onClick={handlePlaceholderSubmit}>
                  {copy.cta}
                  <ArrowRight className="size-3.5" />
                </Button>
                <Button variant="outline" size="default" type="button">
                  Continue with Google
                </Button>
              </div>
            </form>

            <div className="rounded-md border border-border/80 bg-muted/40 px-3 py-2.5">
              <p className="text-xs font-medium">What is ready already?</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                Shared query provider, Axios client, request error normalization, session
                bootstrap hooks, and global toast feedback are all wired.
              </p>
            </div>

            <p className="text-sm text-muted-foreground">
              {copy.footerLabel}{" "}
              <Link className="font-medium text-primary hover:underline" href={copy.footerHref}>
                {copy.footerText}
              </Link>
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
