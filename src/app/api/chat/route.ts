import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "@/lib/chat/knowledge";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

type Role = "user" | "assistant";
type ClientMessage = { role: Role; content: string };

const MODEL = "claude-opus-4-8";
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
  // Conversation must start with a user turn.
  while (out.length && out[0].role !== "user") out.shift();
  return out.slice(-MAX_HISTORY);
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "The assistant isn't configured yet. Please set ANTHROPIC_API_KEY." },
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

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        const anthropicStream = client.messages.stream({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          system: [
            {
              type: "text",
              text: buildSystemPrompt(audience),
              cache_control: { type: "ephemeral" },
            },
          ],
          messages,
        });

        anthropicStream.on("text", (delta) => {
          controller.enqueue(encoder.encode(delta));
        });

        await anthropicStream.finalMessage();
        controller.close();
      } catch (err) {
        // If nothing has streamed yet, surface a friendly fallback line.
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
