const DEFAULT_APP_URL = "http://localhost:3000";
const DEFAULT_API_URL = "http://localhost:4000/api/v1";

export const siteConfig = {
  name: "Archon",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_APP_URL,
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL,
  description:
    "A calm, audit-friendly project workspace for moving work across Kanban states.",
};
