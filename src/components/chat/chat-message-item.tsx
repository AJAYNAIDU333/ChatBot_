import ReactMarkdown from "react-markdown";
import { Card, CardContent } from "@/components/ui/card";
import type { ResponseColor } from "@/domain/chat/color-logic";
import {
  getAssistantContentTextClass,
  getBorderColorClass,
  getColorClass,
} from "@/domain/chat/color-logic";
import type { ChatMessage } from "@/domain/chat/types";
import { cn } from "@/lib/utils";

interface ChatMessageItemProps {
  message: ChatMessage;
}

export function ChatMessageItem({ message }: ChatMessageItemProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <Card className="max-w-[min(85%,36rem)] border-primary/15 bg-primary/5 shadow-none">
          <CardContent className="px-4 py-3 text-sm leading-relaxed text-foreground">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const color = message.color as ResponseColor | undefined;
  const toneClass =
    color != null
      ? cn(
          "border-y border-r border-border/40 shadow-none",
          "border-l-4",
          getBorderColorClass(color),
          getColorClass(color),
        )
      : "border border-border/60 bg-muted/40 shadow-none";

  return (
    <div className="flex justify-start">
      <Card className={cn("max-w-[min(92%,40rem)] rounded-2xl", toneClass)}>
        <CardContent className="px-4 py-3 text-sm leading-relaxed">
          {/* Apply the foreground on the prose wrapper itself so the typography plugin's
              own `color: var(--tw-prose-body)` rule is beaten at the point where children
              call `color: inherit`. Without this the prose div has grey body-text and all
              descendants inherit grey regardless of what CardContent says. */}
          <div
            className={cn(
              "prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:font-semibold",
              "[&_*]:!text-inherit",
              "[&_a]:underline [&_a]:decoration-current",
              color != null
                ? getAssistantContentTextClass(color)
                : "text-foreground",
            )}
          >
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
