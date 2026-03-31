import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Archon frontend scaffold</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        This is a minimal setup page. The route groups, shared folders,
        providers, contracts, and HTTP entry points are in place so you can
        build the frontend feature by feature.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link className="rounded-md border border-border px-3 py-2 text-sm" href="/login">
          Login
        </Link>
        <Link className="rounded-md border border-border px-3 py-2 text-sm" href="/signup">
          Signup
        </Link>
        <Link className="rounded-md border border-border px-3 py-2 text-sm" href="/app">
          App shell
        </Link>
      </div>
      <ul className="mt-8 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
        <li>Public routes live in `src/app/(public)`.</li>
        <li>Protected routes live in `src/app/(app)/app`.</li>
        <li>Feature slices exist for auth, projects, and tasks.</li>
      </ul>
    </main>
  );
}
