import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicHeroVisual } from "@/features/public/components/public-hero-visual";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function PublicHero() {
  return (
    <section className="relative w-full py-16 sm:py-20 lg:py-20">
      <div className="relative space-y-12 sm:space-y-14 lg:space-y-16">
        <div className="mx-auto flex max-w-4xl flex-col items-center space-y-6 py-3 text-center sm:space-y-7">
          <Badge variant="outline" size="sm" className="mx-auto w-fit">
            Product workspace for project delivery
          </Badge>

          <div className="space-y-4">
            <h1
              className="mx-auto max-w-3xl text-5xl font-medium leading-[0.92] tracking-[-0.05em] text-balance text-foreground sm:text-6xl lg:text-[5.15rem]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Keep projects moving without the hustle.
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-7 text-muted-foreground sm:text-[1.05rem]">
              Archon gives teams a calm workspace for boards, task activity,
              and handoff-ready delivery. Stay aligned from the first task to
              the final review.
            </p>
          </div>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="sm:min-w-40">
              <Link href="/signup">
                Create account
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="sm:min-w-32"
            >
              <Link href="/login">Log in</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-[2rem] bg-background/24 p-3 shadow-[0_24px_48px_rgba(15,23,42,0.04)] ring-1 ring-white/55 backdrop-blur-[2px] sm:p-4">
          <PublicHeroVisual />
        </div>
      </div>
    </section>
  );
}
