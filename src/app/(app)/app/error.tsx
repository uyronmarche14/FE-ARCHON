"use client";

import { RouteErrorState } from "@/components/shared/route-error-state";

type ProtectedAppErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ProtectedAppErrorPage({
  reset,
}: ProtectedAppErrorPageProps) {
  return (
    <RouteErrorState
      title="We couldn’t render the workspace."
      description="Retry the workspace route to recover the latest dashboard or board view."
      onRetry={reset}
    />
  );
}
