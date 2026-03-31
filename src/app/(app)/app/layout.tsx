import type { Metadata } from "next";
import { AppShellChrome } from "@/components/shared/app-shell-chrome";

type AppLayoutProps = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: "Workspace",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AppLayout({ children }: AppLayoutProps) {
  return <AppShellChrome>{children}</AppShellChrome>;
}
