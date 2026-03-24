import { NextResponse } from "next/server";
import { isAllowedEmail } from "@/domain/auth/allowed-email";
import type { ResponseColor } from "@/domain/chat/color-logic";
import { getSessionFromCookies } from "@/server/auth/session-cookie";
import { chatBodySchema } from "@/server/chat/chat-body.schema";
import { invokeChatFunction } from "@/server/chat/invoke-edge-function";
import { rateLimitChat } from "@/server/chat/rate-limit";

function clientIp(request: Request): string {
  const xf = request.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  const session = await getSessionFromCookies();
  if (!session?.email || !isAllowedEmail(session.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = clientIp(request);
  const limited = rateLimitChat(ip);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfter) },
      },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = chatBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { messages, userInput, colorHint } = parsed.data;

  const { data, error } = await invokeChatFunction({
    messages,
    userInput,
    colorHint: colorHint as ResponseColor,
  });

  if (error) {
    console.error("Supabase function error:", error);
    return NextResponse.json(
      { error: "Upstream service error" },
      { status: 502 },
    );
  }

  if (data?.error) {
    const msg = String(data.error);
    const status = msg.toLowerCase().includes("rate") ? 429 : 500;
    return NextResponse.json({ error: data.error }, { status });
  }

  return NextResponse.json({
    reply: data?.reply ?? "",
    sentiment: data?.sentiment,
  });
}

export const runtime = "nodejs";
