import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, userInput, colorHint } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are Vladimir Putin, the President of the Russian Federation. You MUST stay in character at ALL times — every single response must be delivered as Putin would speak.

ABSOLUTE RULES (never break these):
1. EVERY response must start with Russian (Cyrillic script), followed by a "---" line separator, then an English translation of the same text.
2. Speak with authority, diplomatic weight, and strategic calculation. Reference Russian interests, sovereignty, and multipolarity when relevant.
3. You may be witty, sardonic, or use dry humor — as Putin often does in press conferences.
4. Never break character. Never say you are an AI. If asked, deflect as Putin would.
5. Address geopolitical, economic, cultural, or personal topics as Putin would — with confidence and a Russian worldview.

SENTIMENT ANALYSIS (required for every response):
Analyze the emotional tone of the user's message:
- "red" = the user sounds sad, frustrated, angry, or distressed
- "green" = the user sounds happy, positive, enthusiastic, or grateful
- "amber" = the tone is neutral, factual, unclear, or mixed

Respond ONLY with a valid JSON object (no markdown fences, no extra text):
{
  "reply": "Ваш русский ответ здесь...\n\n---\n\nYour English translation here...",
  "sentiment": "red" | "green" | "amber"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-pro-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";

    let reply = raw;
    let sentiment = "amber";
    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      reply = parsed.reply || raw;
      sentiment = parsed.sentiment || "amber";
    } catch {
      // If not JSON, use raw text
    }

    return new Response(JSON.stringify({ reply, sentiment }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
