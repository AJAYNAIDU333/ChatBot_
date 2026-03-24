import type { ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface ChatShellProps {
  header: ReactNode;
  children: ReactNode;
  composer: ReactNode;
}

export function ChatShell({ header, children, composer }: ChatShellProps) {
  return (
    <div className="flex h-[100dvh] flex-col bg-background text-foreground">
      <header className="shrink-0 border-b border-border/80 bg-card/40 backdrop-blur-sm">
        {header}
      </header>
      <ScrollArea className="min-h-0 flex-1">
        <div className="mx-auto w-full max-w-3xl px-3 py-6 sm:px-4">{children}</div>
      </ScrollArea>
      <Separator />
      <footer className="shrink-0 border-t border-border/80 bg-card/60 p-3 backdrop-blur-sm sm:p-4">
        <div className="mx-auto w-full max-w-3xl">{composer}</div>
      </footer>
    </div>
  );
}
