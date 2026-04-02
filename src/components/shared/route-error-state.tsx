"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type RouteErrorStateProps = {
  description: string;
  onRetry: () => void;
  title: string;
};

export function RouteErrorState({
  description,
  onRetry,
  title,
}: RouteErrorStateProps) {
  return (
    <section className="space-y-4" aria-label="Route error fallback">
      <Card className="border-border/70 bg-card shadow-sm">
        <CardHeader className="space-y-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="size-5" />
          </div>
          <div className="space-y-1.5">
            <CardTitle>{title}</CardTitle>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Button type="button" onClick={onRetry} className="rounded-xl">
            <RefreshCcw className="size-4" />
            Retry this screen
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
