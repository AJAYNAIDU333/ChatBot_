"use client";

import { type FormEvent } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  disabled: boolean;
}

export function ChatComposer({ value, onChange, onSubmit, disabled }: ChatComposerProps) {
  return (
    <form onSubmit={onSubmit} className="flex items-end gap-2">
      <Textarea
        id="chat-message"
        name="message"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Message…"
        disabled={disabled}
        rows={1}
        autoComplete="off"
        className="min-h-[48px] max-h-40 flex-1 resize-none rounded-2xl border-border/80 bg-background px-4 py-3 text-sm shadow-sm focus-visible:ring-1"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!disabled && value.trim()) {
              e.currentTarget.form?.requestSubmit();
            }
          }
        }}
        aria-label="Message input"
      />
      <Button
        type="submit"
        size="icon"
        disabled={disabled || !value.trim()}
        className="h-11 w-11 shrink-0 rounded-full"
        aria-label="Send message"
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
    </form>
  );
}
