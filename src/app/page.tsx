import { redirect } from "next/navigation";
import { isAllowedEmail } from "@/domain/auth/allowed-email";
import { getSessionFromCookies } from "@/server/auth/session-cookie";
import { LoginScreen } from "@/components/auth/login-screen";

export default async function HomePage() {
  const session = await getSessionFromCookies();
  if (session?.email && isAllowedEmail(session.email)) {
    redirect("/chat");
  }
  return <LoginScreen />;
}
