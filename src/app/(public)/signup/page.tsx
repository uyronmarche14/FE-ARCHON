import type { Metadata } from "next";
import { AuthPanel } from "@/features/auth/components/auth-panel";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create an Archon account to start managing projects and tasks.",
};

export default function SignupPage() {
  return <AuthPanel mode="signup" />;
}
