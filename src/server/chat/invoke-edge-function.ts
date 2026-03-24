import type { ChatTurnPayload } from "@/domain/chat/types";
import { createSupabaseServiceClient } from "@/server/supabase/server-client";

export interface ChatFunctionResult {
  reply?: string;
  sentiment?: string;
  error?: string;
}

export async function invokeChatFunction(
  body: ChatTurnPayload,
): Promise<{ data: ChatFunctionResult | null; error: Error | null }> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase.functions.invoke<ChatFunctionResult>(
    "chat",
    { body },
  );
  return { data, error };
}
