import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthPanel } from "@/features/auth/components/auth-panel";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create an Archon account to start managing projects and tasks.",
};

export default function SignupPage() {
  return (
    <Suspense fallback={<AuthPanelFallback />}>
      <AuthPanel mode="signup" />
    </Suspense>
  );
}

function AuthPanelFallback() {
  return <div className="min-h-screen bg-background" />;
}
