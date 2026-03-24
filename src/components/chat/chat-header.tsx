"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  userEmail: string;
}

export function ChatHeader({ userEmail }: ChatHeaderProps) {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  async function logout() {
    setLeaving(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } finally {
      setLeaving(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-3 py-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar className="h-9 w-9 border border-border/80">
          <AvatarFallback className="bg-muted text-xs font-medium text-muted-foreground">
            GK
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold tracking-tight sm:text-base">
            Assistant
          </h1>
          <p className="truncate font-mono text-xs text-muted-foreground">{userEmail}</p>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={logout}
        disabled={leaving}
        aria-label="Sign out"
        className="shrink-0 gap-1.5"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Sign out</span>
      </Button>
    </div>
  );
}
