import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getTheme, promptFor } from "@/lib/lab/photobooth-themes";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "gemini-2.5-flash-image";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // the client downscales; this is a backstop

/** Internal AI photobooth demo: photo + theme in, AI-restyled photo out. */
export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not set." }, { status: 503 });
  }

  let body: { imageBase64?: unknown; mimeType?: unknown; themeId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const imageBase64 = typeof body.imageBase64 === "string" ? body.imageBase64 : "";
  const mimeType = typeof body.mimeType === "string" ? body.mimeType : "image/jpeg";
  const themeId = typeof body.themeId === "string" ? body.themeId : "";

  const theme = getTheme(themeId);
  if (!theme) return NextResponse.json({ error: "Unknown theme." }, { status: 400 });
  if (!imageBase64) return NextResponse.json({ error: "No image." }, { status: 400 });
  if (imageBase64.length * 0.75 > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "Image too large." }, { status: 413 });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const res = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType, data: imageBase64 } },
            { text: promptFor(theme) },
          ],
        },
      ],
    });

    const parts = res?.candidates?.[0]?.content?.parts ?? [];
    const img = parts.find((p) => p.inlineData?.data);
    if (img?.inlineData) {
      return NextResponse.json({
        image: `data:${img.inlineData.mimeType ?? "image/png"};base64,${img.inlineData.data}`,
      });
    }

    // The model can decline and return text instead of an image (e.g. no clear face).
    const txt = parts.find((p) => p.text)?.text;
    return NextResponse.json(
      { error: txt ? `The model didn't return an image: ${txt.slice(0, 300)}` : "No image returned." },
      { status: 422 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed.";
    return NextResponse.json({ error: message.slice(0, 300) }, { status: 500 });
  }
}
