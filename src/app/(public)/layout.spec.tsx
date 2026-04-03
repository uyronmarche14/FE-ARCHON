import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PublicLayout from "./layout";

const navigationState = vi.hoisted(() => ({
  pathname: "/",
}));

const authProviderState = vi.hoisted(() => ({
  bootstrapSession: false,
}));

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

vi.mock("next/navigation", () => ({
  usePathname: () => navigationState.pathname,
}));

vi.mock("@/features/auth/providers/auth-session-provider", () => ({
  AuthSessionProvider: ({
    bootstrapSession,
    children,
  }: {
    bootstrapSession: boolean;
    children: ReactNode;
  }) => {
    authProviderState.bootstrapSession = bootstrapSession;

    return <>{children}</>;
  },
}));

describe("PublicLayout", () => {
  beforeEach(() => {
    navigationState.pathname = "/";
    authProviderState.bootstrapSession = false;
  });

  it("hides the public header on the landing route so the hero owns the first fold", () => {
    render(
      <PublicLayout>
        <div>Landing page</div>
      </PublicLayout>,
    );

    expect(screen.queryByRole("link", { name: /archon/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^log in$/i })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /^create account$/i }),
    ).not.toBeInTheDocument();
    expect(authProviderState.bootstrapSession).toBe(true);
  });

  it("keeps the simpler public header on non-home public routes", () => {
    navigationState.pathname = "/verify-email";

    render(
      <PublicLayout>
        <div>Verify email</div>
      </PublicLayout>,
    );

    expect(screen.getByRole("link", { name: /archon/i })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: /^log in$/i })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(
      screen.getByRole("link", { name: /^create account$/i }),
    ).toHaveAttribute("href", "/signup");
    expect(authProviderState.bootstrapSession).toBe(true);
  });

  it("hides the public header on auth routes", () => {
    navigationState.pathname = "/login";

    render(
      <PublicLayout>
        <div>Auth page</div>
      </PublicLayout>,
    );

    expect(screen.queryByRole("link", { name: /^log in$/i })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /^create account$/i }),
    ).not.toBeInTheDocument();
    expect(authProviderState.bootstrapSession).toBe(false);
  });
});
