import type { Metadata } from "next";
import { InviteRoutePanel } from "@/features/projects/components/invite-route-panel";

export const metadata: Metadata = {
  title: "Project invite",
  description: "Review and accept a project invite in Archon.",
};

export default async function InviteTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return <InviteRoutePanel token={token} />;
}
