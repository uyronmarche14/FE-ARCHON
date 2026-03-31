import { Card, CardContent } from "@/components/ui/card";

export function AppShellLoading() {
  return (
    <div className="space-y-5">
      <Card className="rounded-[2rem] border-border/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(243,246,249,0.96))]">
        <CardContent className="grid gap-4 px-6 py-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            <div className="h-3 w-28 rounded-full bg-muted animate-pulse" />
            <div className="h-10 w-72 rounded-full bg-muted animate-pulse" />
            <div className="h-4 w-full max-w-2xl rounded-full bg-muted animate-pulse" />
            <div className="h-4 w-5/6 rounded-full bg-muted animate-pulse" />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[1.5rem] border border-border/80 bg-background/80 p-5"
              >
                <div className="h-4 w-16 rounded-full bg-muted animate-pulse" />
                <div className="mt-4 h-8 w-20 rounded-full bg-muted animate-pulse" />
                <div className="mt-2 h-3 w-24 rounded-full bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, columnIndex) => (
          <Card key={columnIndex} className="rounded-[1.85rem]">
            <CardContent className="space-y-4 px-5 py-5">
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 rounded-full bg-muted animate-pulse" />
                <div className="h-6 w-8 rounded-full bg-muted animate-pulse" />
              </div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, cardIndex) => (
                  <div
                    key={cardIndex}
                    className="rounded-[1.35rem] border border-border/80 bg-background/80 p-4"
                  >
                    <div className="h-4 w-36 rounded-full bg-muted animate-pulse" />
                    <div className="mt-3 h-3 w-full rounded-full bg-muted animate-pulse" />
                    <div className="mt-2 h-3 w-3/4 rounded-full bg-muted animate-pulse" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
