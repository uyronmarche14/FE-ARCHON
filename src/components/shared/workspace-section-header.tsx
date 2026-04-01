import { cn } from "@/lib/utils";

type WorkspaceSectionHeaderProps = {
  badge?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function WorkspaceSectionHeader({
  action,
  badge,
  className,
  description,
  title,
}: WorkspaceSectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="space-y-2">
        {badge}
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {title}
          </h2>
          {description ? (
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
