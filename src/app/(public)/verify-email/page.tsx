import { Suspense } from "react";
import type { Metadata } from "next";
import { EmailVerificationRoutePanel } from "@/features/auth/components/email-verification-route-panel";

export const metadata: Metadata = {
  title: "Verify email",
  description: "Confirm your Archon account email address.",
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <EmailVerificationRoutePanel />
    </Suspense>
  );
}
