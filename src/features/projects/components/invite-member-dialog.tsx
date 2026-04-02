"use client";

import { useState } from "react";
import { LoaderCircle, MailPlus } from "lucide-react";
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

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a member</DialogTitle>
          <DialogDescription>
            Send a project invite by email. New users can sign up from the invite and existing users can accept it after login.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">Email</Label>
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
            {fieldError ? <p className="text-xs text-destructive">{fieldError}</p> : null}
          </div>

          {formError ? (
            <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
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
