import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Continue to login",
  description: "Archon now routes account access through direct login and invite links.",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams?: Promise<{ email?: string | string[] }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const emailValue = Array.isArray(resolvedSearchParams?.email)
    ? resolvedSearchParams.email[0]
    : resolvedSearchParams?.email;
  const normalizedEmail = emailValue?.trim().toLowerCase();

  if (normalizedEmail) {
    redirect(`/login?email=${encodeURIComponent(normalizedEmail)}`);
  }

  redirect("/login");
}
