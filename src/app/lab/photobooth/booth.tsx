"use client";

import { useRef, useState } from "react";
import { THEMES } from "@/lib/lab/photobooth-themes";

type Loaded = { dataUrl: string; base64: string; mimeType: string };

/** Downscale to <=1024px and re-encode as JPEG, so uploads are small and cheap to send. */
async function loadAndDownscale(file: File): Promise<Loaded> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = dataUrl;
  });
  const max = 1024;
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
  const out = canvas.toDataURL("image/jpeg", 0.9);
  return { dataUrl: out, base64: out.split(",")[1], mimeType: "image/jpeg" };
}

export default function Booth() {
  const [src, setSrc] = useState<Loaded | null>(null);
  const [theme, setTheme] = useState(THEMES[0].id);
  const [result, setResult] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ms, setMs] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPick(file: File | undefined) {
    if (!file) return;
    setError(null);
    setResult(null);
    try {
      setSrc(await loadAndDownscale(file));
    } catch {
      setError("Couldn't read that image.");
    }
  }

  async function generate() {
    if (!src || busy) return;
    setBusy(true);
    setError(null);
    setResult(null);
    setMs(null);
    const started = performance.now();
    try {
      const res = await fetch("/api/lab/photobooth", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ imageBase64: src.base64, mimeType: src.mimeType, themeId: theme }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed.");
      setResult(data.image);
      setMs(Math.round(performance.now() - started));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#B5654A]">Internal lab</p>
      <h1 className="font-serif mt-2 text-4xl font-bold tracking-tight text-[#2A1B24]">AI Photobooth</h1>
      <p className="mt-2 max-w-xl text-sm text-[#7A6570]">
        Upload a photo, pick a look, and Gemini restyles it while keeping the faces. Prototype only —
        not wired to events, not for customers. Each generation spends real API credit.
      </p>

      {/* Step 1: upload */}
      <div className="mt-8">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0])}
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="inline-flex h-11 items-center rounded-full btn-grad px-5 text-sm font-bold text-white"
        >
          {src ? "Choose a different photo" : "Choose a photo"}
        </button>
      </div>

      {/* Step 2: themes */}
      {src && (
        <div className="mt-6 flex flex-wrap gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                theme === t.id
                  ? "border-[#B5654A] bg-[#F1E4D8] text-[#2A1B24]"
                  : "border-[#E4D9CF] text-[#7A6570] hover:border-[#B5654A]"
              }`}
            >
              <span className="mr-1.5" aria-hidden="true">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Step 3: generate */}
      {src && (
        <div className="mt-6">
          <button
            onClick={generate}
            disabled={busy}
            className="inline-flex h-12 items-center rounded-full btn-grad px-7 text-base font-bold text-white disabled:opacity-60"
          >
            {busy ? "Generating…" : "Generate"}
          </button>
          {ms != null && !busy && (
            <span className="ml-3 text-sm text-[#9B8676]">done in {(ms / 1000).toFixed(1)}s</span>
          )}
        </div>
      )}

      {error && (
        <p className="mt-5 rounded-lg border border-[#e7c9c2] bg-[#fbf1ef] px-4 py-3 text-sm text-[#9a3b2b]">
          {error}
        </p>
      )}

      {/* Before / after */}
      {src && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <figure>
            <figcaption className="mb-2 text-xs font-bold uppercase tracking-wide text-[#9B8676]">
              Original
            </figcaption>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src.dataUrl} alt="Original" className="w-full rounded-2xl border border-[#E4D9CF]" />
          </figure>
          <figure>
            <figcaption className="mb-2 text-xs font-bold uppercase tracking-wide text-[#9B8676]">
              AI photobooth
            </figcaption>
            <div className="grid aspect-square w-full place-items-center overflow-hidden rounded-2xl border border-[#E4D9CF] bg-[#F1E9DF]">
              {busy ? (
                <span className="text-sm text-[#9B8676]">Painting the scene…</span>
              ) : result ? (
                <a href={result} download="ai-photobooth.png" title="Click to download">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={result} alt="AI result" className="h-full w-full object-cover" />
                </a>
              ) : (
                <span className="px-6 text-center text-sm text-[#9B8676]">
                  Pick a look and hit Generate
                </span>
              )}
            </div>
          </figure>
        </div>
      )}
    </div>
  );
}
