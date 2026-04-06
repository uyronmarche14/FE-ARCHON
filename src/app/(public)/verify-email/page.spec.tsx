import { beforeEach, describe, expect, it, vi } from "vitest";
import VerifyEmailPage from "./page";

const redirectMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

describe("VerifyEmailPage", () => {
  beforeEach(() => {
    redirectMock.mockReset();
    redirectMock.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });
  });

  it("redirects to login with the normalized email when one is provided", async () => {
    await expect(
      VerifyEmailPage({
        searchParams: Promise.resolve({
          email: "  Jane@Example.com  ",
        }),
      }),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(redirectMock).toHaveBeenCalledWith("/login?email=jane%40example.com");
  });

  it("redirects to login when no email query is present", async () => {
    await expect(
      VerifyEmailPage({
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(redirectMock).toHaveBeenCalledWith("/login");
  });
});
