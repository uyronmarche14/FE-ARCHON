"use client";

import { ChevronUp, LogOut, MoreHorizontal, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type AccountMenuProps = {
  email: string;
  initials: string;
  logoutPending: boolean;
  name: string;
  onLogout: () => Promise<void>;
  status: string;
  variant?: "navbar" | "sidebar";
};

export function AccountMenu({
  email,
  initials,
  logoutPending,
  name,
  onLogout,
  status,
  variant = "navbar",
}: AccountMenuProps) {
  const isSidebar = variant === "sidebar";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {isSidebar ? (
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-3 rounded-[1rem] border border-transparent px-2.5 py-2.5 text-left transition-colors hover:border-border/60 hover:bg-background/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "group-data-[state=collapsed]/sidebar:mx-auto group-data-[state=collapsed]/sidebar:size-10 group-data-[state=collapsed]/sidebar:justify-center group-data-[state=collapsed]/sidebar:px-0",
            )}
            aria-label="Open account menu"
          >
            <Avatar className="hidden size-8 rounded-md border-0 bg-primary/10 group-data-[state=collapsed]/sidebar:flex">
              <AvatarFallback className="rounded-md">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 group-data-[state=collapsed]/sidebar:hidden">
              <p className="truncate text-[14px] font-semibold text-foreground">
                {name}
              </p>
              <p className="truncate text-[12px] text-muted-foreground">{email}</p>
            </div>
            <ChevronUp className="size-4 text-muted-foreground group-data-[state=collapsed]/sidebar:hidden" />
          </button>
        ) : (
          <Button
            variant="outline"
            size="icon-sm"
            className="rounded-[0.95rem] bg-card/85 shadow-none"
            aria-label="Open account menu"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={isSidebar ? "start" : "end"}
        className="w-64 rounded-[1.1rem]"
      >
        <DropdownMenuLabel className="normal-case tracking-normal text-foreground">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 rounded-2xl border-0 bg-primary/10">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {name}
              </p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 pb-1">
          <Badge
            variant={status === "authenticated" ? "success" : "muted"}
            size="xs"
          >
            {status}
          </Badge>
        </div>
        <DropdownMenuItem disabled>
          <ShieldCheck className="size-4" />
          Current session
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            void onLogout();
          }}
          disabled={logoutPending}
        >
          <LogOut className="size-4" />
          {logoutPending ? "Logging out" : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
