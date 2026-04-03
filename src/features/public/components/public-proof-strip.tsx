const proofItems = [
  {
    title: "Stable workspace shell",
    description:
      "Projects, board context, and task detail stay aligned while the team moves work.",
  },
  {
    title: "Readable task activity",
    description:
      "Moves, edits, and field changes stay visible without turning the board into dashboard noise.",
  },
  {
    title: "Audit-friendly by default",
    description:
      "The workspace is shaped for reviews, handoffs, and calmer delivery check-ins.",
  },
];

export function PublicProofStrip() {
  return (
    <section
      aria-labelledby="public-proof-strip-heading"
      className="py-10 sm:py-14 lg:py-20"
    >
      <div className="space-y-8 sm:space-y-10">
        <div className="space-y-3">
          <p className="text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
            Workflow
          </p>
          <h2
            id="public-proof-strip-heading"
            className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-balance text-foreground sm:text-4xl lg:text-[3.15rem]"
          >
            Build calm delivery habits from the first task onward.
          </h2>
        </div>

        <div className="border-t border-border/75">
          {proofItems.map((item, index) => (
            <article
              key={item.title}
              className="grid gap-4 border-b border-border/75 py-6 sm:grid-cols-[4.5rem_minmax(0,1fr)_minmax(0,0.9fr)] sm:gap-6 sm:py-8 lg:py-9"
            >
              <p className="pt-1 text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="max-w-md text-xl font-semibold tracking-tight text-foreground sm:text-[1.7rem]">
                {item.title}
              </h3>
              <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-[1.02rem]">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
