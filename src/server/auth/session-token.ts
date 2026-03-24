import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "ps_session";

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(email: string): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<{ email: string }> {
  const { payload } = await jwtVerify(token, getSecretKey());
  const email = payload.email;
  if (typeof email !== "string" || !email) {
    throw new Error("Invalid session payload");
  }
  return { email };
}

export async function verifySessionTokenEdge(
  token: string,
  secret: string,
): Promise<{ email: string } | null> {
  if (!secret || secret.length < 32) return null;
  try {
    const key = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, key);
    const email = payload.email;
    if (typeof email !== "string" || !email) return null;
    return { email };
  } catch {
    return null;
  }
}
