"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuthSessionProvider } from "@/features/auth/providers/auth-session-provider";

type PublicLayoutProps = {
  children: React.ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
  const pathname = usePathname();
  const isAuthRoute = pathname === "/login" || pathname === "/signup";

  return (
    <AuthSessionProvider bootstrapSession={false}>
      <div className="min-h-screen bg-background">
        {isAuthRoute ? null : (
          <header className="sticky top-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur-sm">
            <div className="mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="grid size-8 place-items-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                  A
                </div>
                <div>
                  <p className="text-sm font-semibold leading-none tracking-tight">Archon</p>
                  <p className="text-xs text-muted-foreground">Project delivery</p>
                </div>
              </Link>

              <nav className="hidden items-center gap-1.5 md:flex">
                <Badge variant="muted">Assessment build</Badge>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/signup">Create account</Link>
                </Button>
              </nav>
            </div>
          </header>
        )}

        {children}
      </div>
    </AuthSessionProvider>
  );
}
