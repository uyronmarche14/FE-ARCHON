"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AuthSessionProvider } from "@/features/auth/providers/auth-session-provider";

type PublicLayoutProps = {
  children: React.ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
  const pathname = usePathname();
  const isAuthRoute = pathname === "/login" || pathname === "/signup";
  const showHeader = !isAuthRoute && pathname !== "/";

  return (
    <AuthSessionProvider bootstrapSession={!isAuthRoute}>
      <div className="min-h-screen bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(244,247,251,0.88))]">
        {showHeader ? (
          <header className="sticky top-0 z-30 border-b border-border/60 bg-background/88 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
              <Link href="/" className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-2xl border border-primary/15 bg-primary/[0.08] text-sm font-semibold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                  A
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold leading-none tracking-tight">
                    Archon
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Calm project workspace
                  </p>
                </div>
              </Link>

              <nav className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/signup">Create account</Link>
                </Button>
              </nav>
            </div>
          </header>
        ) : null}

        {children}
      </div>
    </AuthSessionProvider>
  );
}
