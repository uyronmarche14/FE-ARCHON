import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AppDashboardLoadingPage from "./(app)/app/loading";
import ProjectBoardLoadingPage from "./(app)/app/projects/[projectId]/loading";
import { RouteErrorState } from "@/components/shared/route-error-state";

vi.mock("lucide-react", () => ({
  AlertTriangle: () => <span aria-hidden="true">AlertTriangle</span>,
  RefreshCcw: () => <span aria-hidden="true">RefreshCcw</span>,
}));

describe("route boundaries", () => {
  it("renders the protected dashboard and board loading fallbacks", () => {
    const { rerender } = render(<AppDashboardLoadingPage />);

    expect(screen.getByLabelText("Loading projects")).toBeInTheDocument();

    rerender(<ProjectBoardLoadingPage />);

    expect(screen.getByLabelText("Loading project tasks")).toBeInTheDocument();
  });

  it("renders safe protected and public route error recovery surfaces", () => {
    const protectedReset = vi.fn();
    const publicReset = vi.fn();
    const { rerender } = render(
      <RouteErrorState
        title="We couldn’t render the workspace."
        description="Retry the workspace route to recover the latest dashboard or board view."
        onRetry={protectedReset}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "We couldn’t render the workspace." }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /retry this screen/i }));
    expect(protectedReset).toHaveBeenCalledTimes(1);

    rerender(
      <RouteErrorState
        title="We couldn’t load this page."
        description="Retry the public route to restore the landing or authentication surface."
        onRetry={publicReset}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "We couldn’t load this page." }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /retry this screen/i }));
    expect(publicReset).toHaveBeenCalledTimes(1);
  });
});
