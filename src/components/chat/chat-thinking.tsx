import { Skeleton } from "@/components/ui/skeleton";

export function ChatThinking() {
  return (
    <div className="flex justify-start">
      <div className="flex max-w-md flex-col gap-2 rounded-2xl border border-border/60 bg-muted/30 px-4 py-3">
        <p className="text-xs font-medium text-muted-foreground">Thinking…</p>
        <div className="flex gap-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-3 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}
