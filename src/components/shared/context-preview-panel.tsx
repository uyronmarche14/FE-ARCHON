import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ContextPreviewPanelProps = {
  badge?: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

export function ContextPreviewPanel({
  actions,
  badge,
  children,
  className,
  contentClassName,
  description,
  title,
}: ContextPreviewPanelProps) {
  return (
    <Card className={cn("border-border/70 bg-card shadow-sm", className)}>
      <CardHeader className="gap-3 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            {badge}
            <div className="space-y-1">
              <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
              {description ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      </CardHeader>
      <CardContent className={cn("grid gap-4", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
