"use client";

import { RouteErrorState } from "@/components/shared/route-error-state";

type PublicErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function PublicErrorPage({
  reset,
}: PublicErrorPageProps) {
  return (
    <RouteErrorState
      title="We couldn’t load this page."
      description="Retry the public route to restore the landing or authentication surface."
      onRetry={reset}
    />
  );
}
