import { redirect } from "next/navigation";
import { isAllowedEmail } from "@/domain/auth/allowed-email";
import { getSessionFromCookies } from "@/server/auth/session-cookie";
import { ChatScreen } from "@/components/chat/chat-screen";

export default async function ChatPage() {
  const session = await getSessionFromCookies();
  if (!session?.email || !isAllowedEmail(session.email)) {
    redirect("/");
  }
  return <ChatScreen userEmail={session.email} />;
}
