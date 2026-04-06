"use client";

import { useState } from "react";
import { Copy, LoaderCircle, MailPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CreateProjectInviteResponse } from "@/contracts/projects";
import { useCreateProjectInvite } from "@/features/projects/hooks/use-create-project-invite";
import { showApiErrorToast, showInfoToast, showSuccessToast } from "@/lib/toast";
import { isApiClientError } from "@/services/http/api-client-error";

type InviteMemberDialogProps = {
  projectId: string;
};

export function InviteMemberDialog({ projectId }: InviteMemberDialogProps) {
  const createInviteMutation = useCreateProjectInvite(projectId);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [inviteResult, setInviteResult] = useState<CreateProjectInviteResponse | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setFieldError("Email is required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setFieldError("Enter a valid email address.");
      return;
    }

    setFieldError(null);
    setFormError(null);

    try {
      const response = await createInviteMutation.mutateAsync({
        email: normalizedEmail,
      });

      if (response.deliveryMode === "link") {
        setInviteResult(response);
        showSuccessToast("Invite link ready", `Share the invite link with ${response.email}.`);
        return;
      }

      setInviteResult(null);
      showSuccessToast("Invite created", `Access is ready for ${response.email}.`);
      setOpen(false);
      setEmail("");
    } catch (error) {
      if (isApiClientError(error) && typeof error.details?.email === "string") {
        setFieldError(error.details.email);
      } else {
        setFormError("Unable to create the invite right now.");
      }

      showApiErrorToast(error, "Unable to create the invite right now.");
    }
  }

  async function handleCopyInviteLink() {
    if (!inviteResult?.inviteUrl) {
      return;
    }

    if (!navigator.clipboard?.writeText) {
      setFormError("Copying is not available in this browser.");
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteResult.inviteUrl);
      showInfoToast("Invite link copied", "Share the link with your teammate.");
    } catch {
      setFormError("Unable to copy the invite link right now.");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && createInviteMutation.isPending) {
          return;
        }

        setOpen(nextOpen);

        if (!nextOpen) {
          setEmail("");
          setFieldError(null);
          setFormError(null);
          setInviteResult(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="rounded-md">
          <MailPlus className="size-4" />
          Invite member
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader className="border-b border-border/60 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" size="xs">
              Team access
            </Badge>
            <Badge variant="muted" size="xs">
              Invite delivery
            </Badge>
          </div>
          <DialogTitle>Invite a member</DialogTitle>
          <DialogDescription>
            Create a project invite for a teammate. This main flow uses direct invite links,
            and existing Archon accounts will also see matching invites inside the app after login.
          </DialogDescription>
        </DialogHeader>

        {inviteResult?.deliveryMode === "link" ? (
          <div className="space-y-5">
            <section className="grid gap-3 rounded-[1.1rem] border border-border/70 bg-surface-subtle/55 px-4 py-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Invite link ready</p>
                <p className="text-xs leading-5 text-muted-foreground">
                  Share this link with {inviteResult.email}. Matching existing accounts will also see the invite inside the workspace.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invite-link">Invite URL</Label>
                <Input id="invite-link" readOnly value={inviteResult.inviteUrl ?? ""} />
                <p className="text-xs text-muted-foreground">
                  The link stays active until {new Date(inviteResult.expiresAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}.
                </p>
              </div>
            </section>

            {formError ? (
              <div className="rounded-[1rem] border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {formError}
              </div>
            ) : null}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Close
              </Button>
              <Button type="button" onClick={() => void handleCopyInviteLink()}>
                <Copy className="size-3.5" />
                Copy link
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <section className="grid gap-4 rounded-[1.1rem] border border-border/70 bg-surface-subtle/55 px-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="invite-email">Email</Label>
                <p className="text-xs leading-5 text-muted-foreground">
                  Invite the teammate by work email so the generated access path stays tied to the
                  right account and appears in their dashboard after login.
                </p>
              </div>
              <div className="space-y-1.5">
                <Input
                  id="invite-email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setFieldError(null);
                    setFormError(null);
                  }}
                  placeholder="teammate@example.com"
                  disabled={createInviteMutation.isPending}
                />
                {fieldError ? (
                  <p className="text-xs text-destructive">{fieldError}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Archon will generate a direct invite link for this teammate. Matching existing
                    accounts will also see the invite inside the workspace.
                  </p>
                )}
              </div>
            </section>

            {formError ? (
              <div className="rounded-[1rem] border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {formError}
              </div>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createInviteMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createInviteMutation.isPending}>
                {createInviteMutation.isPending ? (
                  <>
                    <LoaderCircle className="size-3.5 animate-spin" />
                    Creating
                  </>
                ) : (
                  <>
                    <MailPlus className="size-3.5" />
                    Create invite
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
