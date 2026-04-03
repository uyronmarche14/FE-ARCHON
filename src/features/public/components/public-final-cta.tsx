import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function PublicFinalCta() {
  return (
    <section className="rounded-[2rem] border border-border/70 bg-gradient-to-br from-card via-background to-surface-subtle px-5 py-8 shadow-[0_18px_42px_rgba(15,23,42,0.04)] sm:px-8 sm:py-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-4">
          <Badge variant="outline" size="sm" className="w-fit">
            Start with the workspace
          </Badge>
          <div className="space-y-2">
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-balance">
              Bring planning, board movement, and task history into one calm workspace.
            </h2>
            <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
              Create an account to move from the public surface into the same
              structured project shell shown here.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/signup">
              Create account
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/login">Log in</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
