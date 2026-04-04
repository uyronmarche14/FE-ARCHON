"use client";

type TaskMarkdownLiteProps = {
  className?: string;
  emptyFallback?: string;
  value: string | null;
};

export function TaskMarkdownLite({
  className,
  emptyFallback = "No content yet.",
  value,
}: TaskMarkdownLiteProps) {
  const normalizedValue = value?.trim() ?? "";

  if (!normalizedValue) {
    return <p className={className}>{emptyFallback}</p>;
  }

  const blocks = normalizedValue.split(/\n{2,}/).filter(Boolean);

  return (
    <div className={className}>
      {blocks.map((block, index) => {
        const lines = block.split("\n").filter(Boolean);
        const isBulletList = lines.every((line) => /^[-*]\s+/.test(line.trim()));

        if (isBulletList) {
          return (
            <ul key={`list:${index}`} className="ml-5 list-disc space-y-1">
              {lines.map((line) => (
                <li key={line}>{line.trim().replace(/^[-*]\s+/, "")}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={`paragraph:${index}`} className="leading-6">
            {block}
          </p>
        );
      })}
    </div>
  );
}
