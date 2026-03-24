import { NextResponse } from "next/server";
import { z } from "zod";
import { isAllowedEmail } from "@/domain/auth/allowed-email";
import { setSessionCookieFromEmail } from "@/server/auth/session-cookie";

const loginSchema = z.object({
  email: z.string().email().max(254),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  if (!isAllowedEmail(email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    await setSessionCookieFromEmail(email);
  } catch (e) {
    console.error("login session error:", e);
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
