"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  determineColor,
  type ResponseColor,
  usesModelToneColor,
} from "@/domain/chat/color-logic";
import type { ChatMessage } from "@/domain/chat/types";
import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatEmptyState } from "@/components/chat/chat-empty-state";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatMessageItem } from "@/components/chat/chat-message-item";
import { ChatShell } from "@/components/chat/chat-shell";
import { ChatThinking } from "@/components/chat/chat-thinking";

interface ChatScreenProps {
  userEmail: string;
}

/** Maps model sentiment labels to bubble colors (WCAG-oriented tokens). */
function sentimentToResponseColor(raw: string | undefined): ResponseColor | undefined {
  if (!raw) return undefined;
  const s = raw.trim().toLowerCase().replace(/\s+/g, "_");

  switch (s) {
    case "very_sad":
    case "very-sad":
      return "red";
    case "sad":
    case "somewhat_sad":
    case "somewhat-sad":
      return "rose";
    case "neutral":
      return "amber";
    case "happy":
    case "somewhat_happy":
    case "somewhat-happy":
      return "greenSoft";
    case "very_happy":
    case "very-happy":
      return "green";
    case "red":
      return "red";
    case "green":
      return "green";
    case "amber":
      return "amber";
    default:
      return undefined;
  }
}

export function ChatScreen({ userEmail }: ChatScreenProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    const localColor = determineColor(text);
    const userMsg: ChatMessage = { role: "user", content: text };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userInput: text,
          colorHint: localColor,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        reply?: string;
        sentiment?: string;
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error ?? "Request failed");
      }

      const fromModel = sentimentToResponseColor(data.sentiment);
      const finalColor =
        usesModelToneColor(localColor) && fromModel != null ? fromModel : localColor;

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.reply || "System error.",
        color: finalColor,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "A critical error occurred. Please try again.",
          color: "red",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ChatShell
      header={<ChatHeader userEmail={userEmail} />}
      composer={
        <ChatComposer
          value={input}
          onChange={setInput}
          onSubmit={send}
          disabled={isLoading}
        />
      }
    >
      <div
        className="flex flex-col gap-4 pb-4"
        role="log"
        aria-live="polite"
        aria-label="Conversation"
      >
        {messages.length === 0 && !isLoading ? <ChatEmptyState /> : null}
        {messages.map((msg, i) => (
          <ChatMessageItem key={`${msg.role}-${i}`} message={msg} />
        ))}
        {isLoading ? <ChatThinking /> : null}
        <div ref={bottomRef} />
      </div>
    </ChatShell>
  );
}
