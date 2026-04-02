"use client";

import type { Route } from "next";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  MailCheck,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/features/auth/hooks/use-login";
import { useResendVerification } from "@/features/auth/hooks/use-resend-verification";
import { useSignup } from "@/features/auth/hooks/use-signup";
import { useAuthSession } from "@/features/auth/providers/auth-session-provider";
import type { ApiErrorDetails } from "@/contracts/api";
import { showApiErrorToast, showInfoToast, showSuccessToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { isApiClientError } from "@/services/http/api-client-error";

type AuthPanelProps = {
  mode: "login" | "signup";
};

type SignupFormValues = {
  name: string;
  email: string;
  password: string;
};

type SignupFormErrors = Partial<Record<keyof SignupFormValues, string>>;

type VerificationNotice = {
  email: string;
  message: string;
};

const copyByMode = {
  login: {
    eyebrow: "Welcome back",
    title: "Login to your account",
    description: "Access your projects, boards, and task history.",
    cta: "Log in",
    footerLabel: "Don't have an account?",
    footerHref: "/signup",
    footerText: "Sign up",
  },
  signup: {
    eyebrow: "Get started",
    title: "Create your account",
    description: "Set up your workspace and start managing projects in minutes.",
    cta: "Create account",
    footerLabel: "Already have an account?",
    footerHref: "/login",
    footerText: "Log in",
  },
} as const;

export function AuthPanel({ mode }: AuthPanelProps) {
  const copy = copyByMode[mode];
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginMutation = useLogin();
  const signupMutation = useSignup();
  const resendVerificationMutation = useResendVerification();
  const { setSession } = useAuthSession();
  const nextPath = useMemo(
    () => resolvePostAuthRedirect(searchParams.get("next")),
    [searchParams],
  );
  const initialEmail = searchParams.get("email")?.trim().toLowerCase() ?? "";
  const [formValues, setFormValues] = useState<SignupFormValues>({
    name: "",
    email: initialEmail,
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<SignupFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [verificationNotice, setVerificationNotice] =
    useState<VerificationNotice | null>(null);

  const isSubmitting =
    loginMutation.isPending ||
    signupMutation.isPending ||
    resendVerificationMutation.isPending;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedValues = {
      name: formValues.name.trim().replace(/\s+/g, " "),
      email: formValues.email.trim().toLowerCase(),
      password: formValues.password,
    };

    const validationErrors =
      mode === "login"
        ? validateLoginForm(normalizedValues)
        : validateSignupForm(normalizedValues);
    setFieldErrors(validationErrors);
    setFormError(null);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      if (mode === "login") {
        const authResponse = await loginMutation.mutateAsync({
          email: normalizedValues.email,
          password: normalizedValues.password,
        });

        setSession({
          user: authResponse.user,
          accessToken: authResponse.accessToken,
        });

        showSuccessToast("Logged in", "Welcome back to Archon.");
        router.replace(nextPath as Route);
        return;
      }

      const signupResponse = await signupMutation.mutateAsync({
        ...normalizedValues,
        redirectPath: nextPath,
      });

      setVerificationNotice({
        email: signupResponse.email,
        message: signupResponse.message,
      });
      showSuccessToast("Check your email", signupResponse.message);
    } catch (error) {
      if (isApiClientError(error)) {
        const nextFieldErrors = mapApiErrorDetailsToFormErrors(error.details);

        if (Object.keys(nextFieldErrors).length > 0) {
          setFieldErrors(nextFieldErrors);
        }

        setFormError(error.message);

        if (requiresVerification(error.details)) {
          setVerificationNotice({
            email: normalizedValues.email,
            message: "Verification is still pending for this account.",
          });
        }
      } else {
        setFormError(
          mode === "login"
            ? "Unable to log you in right now."
            : "Unable to create your account right now.",
        );
      }

      showApiErrorToast(
        error,
        mode === "login"
          ? "Unable to log you in right now."
          : "Unable to create your account right now.",
      );
    }
  }

  async function handleResendVerification() {
    const email = verificationNotice?.email ?? formValues.email.trim().toLowerCase();

    try {
      const resendResponse = await resendVerificationMutation.mutateAsync({
        email,
        redirectPath: nextPath,
      });
      showInfoToast("Verification email resent", resendResponse.message);
    } catch (error) {
      showApiErrorToast(error, "Unable to resend the verification email.");
    }
  }

  function handleInputChange<K extends keyof SignupFormValues>(
    field: K,
    value: SignupFormValues[K],
  ) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));

    setFieldErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      return {
        ...currentErrors,
        [field]: undefined,
      };
    });
    setFormError(null);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,rgba(44,62,255,0.05),transparent_28%),linear-gradient(135deg,rgba(28,46,190,0.08),transparent_52%),var(--background)] px-4 py-6">
      <section className="w-full max-w-md rounded-[8px] border border-border/70 bg-card px-5 py-7 shadow-[0_24px_80px_rgba(32,44,120,0.12)] sm:px-7 sm:py-8">
        <div className="mb-7 space-y-4 text-center">
          <div className="mx-auto flex w-fit items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold">Archon</p>
              <p className="text-xs text-muted-foreground">Project delivery</p>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold tracking-[0.26em] text-muted-foreground uppercase">
              {verificationNotice ? "Verify email" : copy.eyebrow}
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
              {verificationNotice ? "Check your inbox" : copy.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {verificationNotice ? verificationNotice.message : copy.description}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {copy.footerLabel}{" "}
              <Link className="font-semibold text-primary hover:underline" href={copy.footerHref}>
                {copy.footerText}
              </Link>
            </p>
          </div>
        </div>

        {verificationNotice ? (
          <div className="space-y-4">
            <div className="rounded-[8px] border border-primary/15 bg-primary/5 px-4 py-4">
              <div className="flex items-start gap-3">
                <MailCheck className="mt-0.5 size-5 text-primary" />
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">
                    Verification email sent to {verificationNotice.email}
                  </p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Open the email, confirm the account, and we&apos;ll send you back into the right flow.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  void handleResendVerification();
                }}
                disabled={resendVerificationMutation.isPending}
              >
                {resendVerificationMutation.isPending ? (
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
              <Button asChild className="flex-1">
                <Link href={`/login?next=${encodeURIComponent(nextPath)}`}>
                  Continue to login
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <form className="space-y-3.5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Button
                variant="outline"
                type="button"
                className="h-11 w-full justify-center rounded-[8px] border-border/80 bg-background text-foreground shadow-none"
                onClick={() =>
                  showInfoToast(
                    "Google sign-in is not available",
                    "This build currently supports email and password authentication only.",
                  )
                }
              >
                <GoogleIcon className="size-4" />
                Google sign-in unavailable
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                This assessment build does not include Google OAuth yet.
              </p>
            </div>

            <div className="flex items-center gap-3 py-1 text-xs uppercase">
              <span className="h-px flex-1 bg-border/70" />
              <span className="tracking-[0.22em] text-muted-foreground">Or</span>
              <span className="h-px flex-1 bg-border/70" />
            </div>

            {mode === "signup" ? (
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Full name</span>
                <Input
                  placeholder="Jane Doe"
                  autoComplete="name"
                  className="h-11 rounded-[8px] border-border/80 bg-background px-4 shadow-none"
                  value={formValues.name}
                  onChange={(event) => handleInputChange("name", event.target.value)}
                />
                {fieldErrors.name ? (
                  <p className="text-xs text-destructive">{fieldErrors.name}</p>
                ) : null}
              </label>
            ) : null}

            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Email</span>
              <Input
                placeholder="jane@example.com"
                type="email"
                autoComplete="email"
                className="h-11 rounded-[8px] border-border/80 bg-background px-4 shadow-none"
                value={formValues.email}
                onChange={(event) => handleInputChange("email", event.target.value)}
              />
              {fieldErrors.email ? (
                <p className="text-xs text-destructive">{fieldErrors.email}</p>
              ) : null}
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Password</span>
              <Input
                placeholder="StrongPassword123"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="h-11 rounded-[8px] border-border/80 bg-background px-4 shadow-none"
                value={formValues.password}
                onChange={(event) => handleInputChange("password", event.target.value)}
              />
              {fieldErrors.password ? (
                <p className="text-xs text-destructive">{fieldErrors.password}</p>
              ) : null}
            </label>

            {mode === "signup" ? (
              <div className="rounded-[8px] bg-muted/45 px-4 py-3">
                <div className="mb-2 flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-primary" />
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Verification required
                  </p>
                </div>
                <p className="text-xs leading-6 text-muted-foreground">
                  New accounts confirm ownership through an email link before protected workspace access is allowed.
                </p>
              </div>
            ) : (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {formError ? (
              <div className="rounded-[8px] border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {formError}
              </div>
            ) : null}

            <Button
              size="lg"
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "mt-1.5 h-11 w-full rounded-[8px] text-sm font-semibold shadow-[0_12px_24px_rgba(53,64,209,0.22)]",
                mode === "login" && "bg-primary hover:bg-primary/90",
              )}
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  {mode === "login" ? "Signing in" : "Creating account"}
                </>
              ) : (
                <>
                  {copy.cta}
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>
        )}
      </section>
    </main>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.29h6.45a5.52 5.52 0 0 1-2.4 3.62v3h3.89c2.28-2.1 3.55-5.2 3.55-8.64Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.89-3c-1.08.72-2.47 1.15-4.06 1.15-3.12 0-5.76-2.1-6.7-4.94H1.28v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.3 14.3A7.2 7.2 0 0 1 4.92 12c0-.8.14-1.58.38-2.3V6.62H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.38l4.02-3.08Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.58 1.78l3.43-3.43C17.96 1.12 15.24 0 12 0A12 12 0 0 0 1.28 6.62L5.3 9.7C6.24 6.86 8.88 4.77 12 4.77Z"
      />
    </svg>
  );
}

function validateLoginForm(values: SignupFormValues): SignupFormErrors {
  const errors: SignupFormErrors = {};

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  }

  return errors;
}

function validateSignupForm(values: SignupFormValues): SignupFormErrors {
  const errors: SignupFormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Full name is required.";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  } else if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(values.password)) {
    errors.password = "Password must include uppercase, lowercase, and a number.";
  }

  return errors;
}

function mapApiErrorDetailsToFormErrors(details: ApiErrorDetails | undefined) {
  const nextErrors: SignupFormErrors = {};

  if (!details) {
    return nextErrors;
  }

  for (const field of ["name", "email", "password"] as const) {
    const value = details[field];

    if (Array.isArray(value) && typeof value[0] === "string" && value[0]) {
      nextErrors[field] = value[0];
    } else if (typeof value === "string" && value.length > 0) {
      nextErrors[field] = value;
    }
  }

  return nextErrors;
}

function requiresVerification(details: ApiErrorDetails | undefined) {
  return details?.needsVerification === true;
}

function resolvePostAuthRedirect(nextPath: string | null): string {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/app";
  }

  return nextPath;
}
