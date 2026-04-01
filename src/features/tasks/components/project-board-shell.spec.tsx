import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProjectBoardShell } from "@/features/tasks/components/project-board-shell";

vi.mock("lucide-react", () => {
  const Icon = () => null;

  return {
    ArrowUpDown: Icon,
    CalendarClock: Icon,
    ChevronDown: Icon,
    CircleCheckBig: Icon,
    Flag: Icon,
    Filter: Icon,
    LayoutGrid: Icon,
    Layers3: Icon,
    MoreHorizontal: Icon,
    Plus: Icon,
    Search: Icon,
    X: Icon,
  };
});

describe("ProjectBoardShell", () => {
  it("renders the redesigned board toolbar and lane area", () => {
    render(<ProjectBoardShell projectId="qa-readiness" />);

    expect(
      screen.getByRole("heading", { name: /qa readiness/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/search title, assignee, due date/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create task/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("board-lanes-scroll-area")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Todo" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "In progress" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Done" }),
    ).toBeInTheDocument();
  }, 10000);

  it("opens a task preview sheet from a board card", async () => {
    render(<ProjectBoardShell projectId="qa-readiness" />);

    fireEvent.click(
      screen.getByRole("button", { name: /draft api envelope/i }),
    );

    expect(
      await screen.findByRole("dialog", { name: /draft api envelope/i }),
    ).toBeInTheDocument();
  });
});
