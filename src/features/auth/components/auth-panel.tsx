"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { showInfoToast } from "@/lib/toast";

type AuthPanelProps = {
  mode: "login" | "signup";
};

const copyByMode = {
  login: {
    eyebrow: "Welcome back",
    title: "Log in to keep delivery moving.",
    description:
      "This placeholder screen is ready for the real auth form, validation, and session bootstrap flow.",
    cta: "Log in",
    footerLabel: "Need an account?",
    footerHref: "/signup",
    footerText: "Create one",
  },
  signup: {
    eyebrow: "Start clean",
    title: "Create your Archon account.",
    description:
      "This placeholder is structured for the signup DTO fields defined in the product docs: name, email, and password.",
    cta: "Create account",
    footerLabel: "Already have an account?",
    footerHref: "/login",
    footerText: "Log in",
  },
} as const;

export function AuthPanel({ mode }: AuthPanelProps) {
  const copy = copyByMode[mode];

  function handlePlaceholderSubmit() {
    showInfoToast(
      mode === "login" ? "Login flow comes next." : "Signup flow comes next.",
      "This placeholder is now wired to the shared toast system from Story 02.2.",
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl items-center px-6 py-12">
      <div className="w-full rounded-lg border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">{copy.eyebrow}</p>
        <h1 className="mt-2 text-2xl font-semibold">{copy.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{copy.description}</p>
        <form className="mt-6 space-y-4">
          {mode === "signup" ? (
            <label className="block space-y-2">
              <span className="text-sm font-medium">Full name</span>
              <input
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                placeholder="Jane Doe"
              />
            </label>
          ) : null}
          <label className="block space-y-2">
            <span className="text-sm font-medium">Email</span>
            <input
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              placeholder="jane@example.com"
              type="email"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Password</span>
            <input
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              placeholder="StrongPassword123"
              type="password"
            />
          </label>
          <Button className="w-full" type="button" onClick={handlePlaceholderSubmit}>
            {copy.cta}
          </Button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">
          {copy.footerLabel}{" "}
          <Link className="font-medium text-primary hover:underline" href={copy.footerHref}>
            {copy.footerText}
          </Link>
        </p>
      </div>
    </div>
  );
}
