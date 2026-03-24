import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionTokenEdge } from "@/server/auth/session-token";

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/chat")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.SESSION_SECRET ?? "";
  if (!token || secret.length < 32) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const session = await verifySessionTokenEdge(token, secret);
  if (!session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*"],
};
