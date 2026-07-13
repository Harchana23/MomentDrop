import { GoogleGenAI, type Content } from "@google/genai";
import { buildSystemPrompt } from "@/lib/chat/knowledge";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

type Role = "user" | "assistant";
type ClientMessage = { role: Role; content: string };

const MODEL = "gemini-2.5-flash";
const MAX_TOKENS = 800;
const MAX_HISTORY = 12; // keep the last few turns; the widget also caps this

function sanitize(messages: unknown): ClientMessage[] {
  if (!Array.isArray(messages)) return [];
  const out: ClientMessage[] = [];
  for (const m of messages) {
    if (!m || typeof m !== "object") continue;
    const role = (m as { role?: unknown }).role;
    const content = (m as { content?: unknown }).content;
    if ((role === "user" || role === "assistant") && typeof content === "string") {
      const trimmed = content.trim().slice(0, 4000);
      if (trimmed) out.push({ role, content: trimmed });
    }
  }
  // Conversation must start with a user turn (Gemini requires role[0] === "user").
  while (out.length && out[0].role !== "user") out.shift();
  return out.slice(-MAX_HISTORY);
}

/** Map the widget's messages to Gemini's content format (assistant → "model"). */
function toContents(messages: ClientMessage[]): Content[] {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "The assistant isn't configured yet. Please set GEMINI_API_KEY." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const messages = sanitize((body as { messages?: unknown }).messages);
  if (!messages.length) {
    return Response.json({ error: "No message provided." }, { status: 400 });
  }

  // Tailor the framing to whether the visitor is a signed-in owner.
  let audience: "visitor" | "owner" = "visitor";
  try {
    const supabase = await supabaseServer();
    const { data } = await supabase.auth.getUser();
    if (data.user) audience = "owner";
  } catch {
    // Auth is best-effort; default to visitor framing.
  }

  const ai = new GoogleGenAI({ apiKey });

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        const result = await ai.models.generateContentStream({
          model: MODEL,
          contents: toContents(messages),
          config: {
            systemInstruction: buildSystemPrompt(audience),
            maxOutputTokens: MAX_TOKENS,
            // Direct FAQ-style answers — no visible "thinking" latency/cost.
            thinkingConfig: { thinkingBudget: 0 },
          },
        });

        for await (const chunk of result) {
          const text = chunk.text;
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      } catch (err) {
        console.error("chat route error", err);
        controller.enqueue(
          encoder.encode(
            "Sorry — I hit a snag. Please try again, or email momentdropsharing@gmail.com.",
          ),
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
