import type { ResponseColor } from "@/domain/chat/color-logic";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
  color?: ResponseColor;
}

export interface ChatTurnPayload {
  messages: { role: ChatRole; content: string }[];
  userInput: string;
  colorHint: ResponseColor;
}
