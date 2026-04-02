"use client";

import type { Route } from "next";
import Link from "next/link";
import { startTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LoaderCircle, MailPlus, Users, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAcceptInvite } from "@/features/projects/hooks/use-accept-invite";
import { useInvitePreview } from "@/features/projects/hooks/use-invite-preview";
import { useAuthSession } from "@/features/auth/providers/auth-session-provider";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { showApiErrorToast, showSuccessToast } from "@/lib/toast";

type InviteRoutePanelProps = {
  token: string;
};

export function InviteRoutePanel({ token }: InviteRoutePanelProps) {
  const router = useRouter();
  const invitePreviewQuery = useInvitePreview(token);
  const acceptInviteMutation = useAcceptInvite();
  const logoutMutation = useLogout();
  const { clearSession, session, status } = useAuthSession();

  async function handleAcceptInvite() {
    try {
      const acceptedInvite = await acceptInviteMutation.mutateAsync(token);

      showSuccessToast(
        "Invite accepted",
        `You now have access to ${acceptedInvite.project.name}.`,
      );

      startTransition(() => {
        router.replace(`/app/projects/${acceptedInvite.project.id}` as Route);
      });
    } catch (error) {
      showApiErrorToast(error, "Unable to accept the invite right now.");
    }
  }

  async function handleLogoutAndSwitchAccount() {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // Ignore logout transport failures and clear the client session anyway.
    }

    clearSession();
    startTransition(() => {
      router.replace(`/login?next=${encodeURIComponent(`/invite/${token}`)}` as Route);
    });
  }

  if (invitePreviewQuery.isPending) {
    return (
      <InvitePageShell>
        <InviteStatusCard
          icon={<LoaderCircle className="size-5 animate-spin text-primary" />}
          title="Loading invite"
          description="We’re checking the invite token and project details."
        />
      </InvitePageShell>
    );
  }

  if (invitePreviewQuery.isError || !invitePreviewQuery.data) {
    return (
      <InvitePageShell>
        <InviteStatusCard
          icon={<XCircle className="size-5 text-destructive" />}
          title="Invite unavailable"
          description="This invite is invalid, expired, or already used."
        />
        <div className="mt-4 flex gap-2">
          <Button asChild variant="outline">
            <Link href="/login">Go to login</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Create account</Link>
          </Button>
        </div>
      </InvitePageShell>
    );
  }

  const invite = invitePreviewQuery.data;
  const isAuthenticated = status === "authenticated" && session !== null;
  const isMatchingUser = session?.user.email === invite.email;

  return (
    <InvitePageShell>
      <Card className="border-border/70 shadow-sm">
        <CardContent className="space-y-5 px-6 py-6">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Project invite</Badge>
            <Badge variant="muted">{invite.role === "OWNER" ? "Owner" : "Member"} access</Badge>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">{invite.project.name}</h1>
            <p className="text-sm leading-6 text-muted-foreground">
              {invite.invitedBy.name} invited <strong>{invite.email}</strong> to join this project.
            </p>
          </div>

          <div className="grid gap-2 rounded-xl border border-border/70 bg-surface-subtle/45 px-4 py-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <span>Role: {invite.role === "OWNER" ? "Owner" : "Member"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MailPlus className="size-4 text-primary" />
              <span>Invite email: {invite.email}</span>
            </div>
            <p className="text-muted-foreground">
              Expires {formatInviteExpiry(invite.expiresAt)}
            </p>
          </div>

          {!isAuthenticated ? (
            <div className="space-y-3">
              <InviteStatusCard
                icon={<MailPlus className="size-5 text-primary" />}
                title="Sign in or create an account to continue"
                description="Existing users can log in and accept immediately. New users can sign up with the invited email, verify it, then return here automatically."
              />
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button asChild className="flex-1">
                  <Link href={`/login?next=${encodeURIComponent(`/invite/${token}`)}` as Route}>
                    Log in
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link
                    href={
                      `/signup?email=${encodeURIComponent(invite.email)}&next=${encodeURIComponent(`/invite/${token}`)}` as Route
                    }
                  >
                    Create account
                  </Link>
                </Button>
              </div>
            </div>
          ) : isMatchingUser ? (
            <div className="space-y-3">
              <InviteStatusCard
                icon={<CheckCircle2 className="size-5 text-primary" />}
                title="This invite matches your account"
                description="Accept the invite to add the project to your workspace."
              />
              <Button
                type="button"
                onClick={() => {
                  void handleAcceptInvite();
                }}
                disabled={acceptInviteMutation.isPending}
              >
                {acceptInviteMutation.isPending ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Accepting
                  </>
                ) : (
                  "Accept invite"
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <InviteStatusCard
                icon={<XCircle className="size-5 text-destructive" />}
                title="This invite belongs to a different email"
                description={`You are signed in as ${session?.user.email}. Switch accounts to continue with ${invite.email}.`}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  void handleLogoutAndSwitchAccount();
                }}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Switching
                  </>
                ) : (
                  "Switch account"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </InvitePageShell>
  );
}

function InvitePageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-3xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="w-full">{children}</section>
    </main>
  );
}

function InviteStatusCard({
  description,
  icon,
  title,
}: {
  description: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-background px-4 py-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div className="space-y-1">
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}

function formatInviteExpiry(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
