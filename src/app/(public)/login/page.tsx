import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthPanel } from "@/features/auth/components/auth-panel";

export const metadata: Metadata = {
  title: "Log in",
  description: "Access the Archon project workspace.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthPanelFallback />}>
      <AuthPanel mode="login" />
    </Suspense>
  );
}

function AuthPanelFallback() {
  return <div className="min-h-screen bg-background" />;
}
