"use client";

import { useState } from "react";
import { LoaderCircle, MailPlus } from "lucide-react";
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
import { useCreateProjectInvite } from "@/features/projects/hooks/use-create-project-invite";
import { showApiErrorToast, showSuccessToast } from "@/lib/toast";
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

      showSuccessToast("Invite sent", `Invitation sent to ${response.email}.`);
      setOpen(false);
      setEmail("");
    } catch (error) {
      if (isApiClientError(error) && typeof error.details?.email === "string") {
        setFieldError(error.details.email);
      } else {
        setFormError("Unable to send the invite right now.");
      }

      showApiErrorToast(error, "Unable to send the invite right now.");
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
              Email invite
            </Badge>
          </div>
          <DialogTitle>Invite a member</DialogTitle>
          <DialogDescription>
            Send a project invite by email. New users can sign up from the invite and existing users can accept it after login.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <section className="grid gap-4 rounded-[1.1rem] border border-border/70 bg-surface-subtle/55 px-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="invite-email">Email</Label>
              <p className="text-xs leading-5 text-muted-foreground">
                Invite the teammate by work email so they can join this project directly from the app flow.
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
                  The invite email carries the acceptance link and project context.
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
                  Sending
                </>
              ) : (
                <>
                  <MailPlus className="size-3.5" />
                  Send invite
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
