"use client";

import type { Route } from "next";
import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, LoaderCircle, MailWarning, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfirmEmailVerification } from "@/features/auth/hooks/use-confirm-email-verification";
import { useResendVerification } from "@/features/auth/hooks/use-resend-verification";
import { useAuthSession } from "@/features/auth/providers/auth-session-provider";
import { showApiErrorToast, showInfoToast, showSuccessToast } from "@/lib/toast";

export function EmailVerificationRoutePanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const confirmMutation = useConfirmEmailVerification();
  const resendMutation = useResendVerification();
  const { status } = useAuthSession();
  const hasTriggeredRef = useRef(false);
  const token = searchParams.get("token")?.trim() ?? "";
  const email = searchParams.get("email")?.trim().toLowerCase() ?? "";
  const requestedNextPath = searchParams.get("next");
  const fallbackNextPath = resolveSafePath(requestedNextPath);

  useEffect(() => {
    if (!token || hasTriggeredRef.current) {
      return;
    }

    hasTriggeredRef.current = true;

    void confirmMutation
      .mutateAsync({ token })
      .then((response) => {
        const nextPath = resolveSafePath(response.redirectPath ?? fallbackNextPath);
        const destination =
          status === "authenticated"
            ? nextPath
            : `/login?next=${encodeURIComponent(nextPath)}`;

        showSuccessToast("Email verified", "Your account is ready.");
        router.replace(destination as Route);
      })
      .catch((error) => {
        showApiErrorToast(error, "Unable to verify the email link.");
      });
  }, [confirmMutation, fallbackNextPath, router, status, token]);

  async function handleResendVerification() {
    if (!email) {
      return;
    }

    try {
      const response = await resendMutation.mutateAsync({
        email,
        redirectPath: fallbackNextPath,
      });

      showInfoToast("Verification email resent", response.message);
    } catch (error) {
      showApiErrorToast(error, "Unable to resend the verification email.");
    }
  }

  const content = useMemo(() => {
    if (!token) {
      return {
        icon: <MailWarning className="size-5 text-destructive" />,
        title: "Verification link missing",
        description:
          "Open the full verification email link to finish confirming the account.",
      };
    }

    if (confirmMutation.isError) {
      return {
        icon: <MailWarning className="size-5 text-destructive" />,
        title: "Verification link expired or invalid",
        description: email
          ? `This verification link can no longer be used. Send a fresh link to ${email} and try again.`
          : "Request a new verification email from the login or signup flow and try again.",
      };
    }

    return {
      icon: confirmMutation.isSuccess ? (
        <CheckCircle2 className="size-5 text-primary" />
      ) : (
        <LoaderCircle className="size-5 animate-spin text-primary" />
      ),
      title: confirmMutation.isSuccess ? "Email verified" : "Verifying your email",
      description: confirmMutation.isSuccess
        ? "Redirecting you into the next step."
        : "Hold on while we confirm the link and route you back into the app flow.",
    };
  }, [confirmMutation.isError, confirmMutation.isSuccess, email, token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <section className="w-full max-w-lg rounded-2xl border border-border/70 bg-card px-6 py-8 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{content.icon}</div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">{content.title}</h1>
            <p className="text-sm leading-6 text-muted-foreground">{content.description}</p>
          </div>
        </div>

        {confirmMutation.isError || !token ? (
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            {confirmMutation.isError && email ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  void handleResendVerification();
                }}
                disabled={resendMutation.isPending}
              >
                {resendMutation.isPending ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Resending
                  </>
                ) : (
                  <>
                    <RefreshCw className="size-4" />
                    Resend email
                  </>
                )}
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link href="/signup">Back to signup</Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href={email ? `/signup?email=${encodeURIComponent(email)}` : "/signup"}>
                Back to signup
              </Link>
            </Button>
            <Button asChild>
              <Link
                href={
                  email
                    ? `/login?email=${encodeURIComponent(email)}`
                    : "/login"
                }
              >
                Go to login
              </Link>
            </Button>
          </div>
        ) : null}

        {status === "loading" ? (
          <p className="mt-4 text-xs text-muted-foreground">Checking session state…</p>
        ) : null}
      </section>
    </main>
  );
}

function resolveSafePath(pathname: string | null) {
  if (!pathname || !pathname.startsWith("/") || pathname.startsWith("//")) {
    return "/app";
  }

  return pathname;
}
