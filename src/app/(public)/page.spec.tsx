import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HomePage from "./page";

vi.mock("lucide-react", () => {
  const Icon = () => null;

  return {
    ArrowRight: Icon,
    ArrowRightLeft: Icon,
    CalendarClock: Icon,
    CheckCircle2: Icon,
    Circle: Icon,
    CircleCheckBig: Icon,
    Clock3: Icon,
    FileText: Icon,
    History: Icon,
    Layers3: Icon,
    LayoutPanelTop: Icon,
    MoreHorizontal: Icon,
    PanelsTopLeft: Icon,
    PencilLine: Icon,
    Plus: Icon,
    Search: Icon,
    ShieldCheck: Icon,
    SlidersHorizontal: Icon,
    Sparkles: Icon,
    UserRound: Icon,
    Users2: Icon,
  };
});

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Public home page", () => {
  it("renders the new product-led hero and removes the old cluttered hero blocks", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", {
        name: "Keep projects moving without the hustle.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /^create account$/i }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: /^create account$/i }).every(
        (link) => link.getAttribute("href") === "/signup",
      ),
    ).toBe(true);
    expect(screen.getAllByRole("link", { name: /^log in$/i }).length).toBeGreaterThan(
      0,
    );
    expect(screen.getByTestId("public-hero-visual")).toBeInTheDocument();

    expect(screen.queryByText("Get product updates")).not.toBeInTheDocument();
    expect(screen.queryByText("Active boards")).not.toBeInTheDocument();
    expect(screen.queryByText("Roadmap signal")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Work email")).not.toBeInTheDocument();
  });
});
