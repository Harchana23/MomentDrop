"use client";

import { useState } from "react";

type TemplateKey = "classic" | "minimal" | "festive";

const TEMPLATES: { key: TemplateKey; label: string }[] = [
  { key: "classic", label: "Classic" },
  { key: "minimal", label: "Minimal" },
  { key: "festive", label: "Festive" },
];

const STYLES: Record<TemplateKey, { wrap: string; accent: string; title: string }> = {
  classic: { wrap: "bg-[#fbf6ea] border-[#caa75f]", accent: "text-[#8d7147]", title: "text-[#4a3a1e]" },
  minimal: { wrap: "bg-white border-[#222]", accent: "text-[#555]", title: "text-[#111]" },
  festive: { wrap: "bg-[#fdeef0] border-[#d98aa0]", accent: "text-[#b0506a]", title: "text-[#7a2b41]" },
};

export default function PrintCards({
  title,
  url,
  qr,
}: {
  title: string;
  url: string;
  qr: string;
}) {
  const [t, setT] = useState<TemplateKey>("classic");
  const s = STYLES[t];

  return (
    <div>
      <div className="no-print mt-6 flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-[#4a4035]">Template:</span>
        {TEMPLATES.map((tp) => (
          <button
            key={tp.key}
            onClick={() => setT(tp.key)}
            className={`h-9 border px-3 text-sm font-medium ${
              t === tp.key
                ? "border-[#8d7147] bg-[#f3ecdc] text-[#5c4a2e]"
                : "border-[#d8cdbb] text-[#74664f]"
            }`}
          >
            {tp.label}
          </button>
        ))}
        <button
          onClick={() => window.print()}
          className="ml-auto h-9 bg-[#1f1b16] px-4 text-sm font-semibold text-white"
        >
          Print
        </button>
      </div>

      <div className="mt-6 flex justify-center">
        <div
          className={`md-card flex w-[360px] flex-col items-center border-2 ${s.wrap} px-8 py-10 text-center`}
        >
          <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${s.accent}`}>
            You&apos;re invited
          </p>
          <h2 className={`mt-3 text-3xl font-semibold ${s.title}`}>{title}</h2>
          <p className="mt-3 text-sm text-[#6b5b44]">Scan to share your photos &amp; videos</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="QR code" className="mt-5 h-52 w-52" />
          <p className="mt-4 break-all text-xs text-[#8a795f]">{url}</p>
          <p className={`mt-5 text-[10px] uppercase tracking-[0.24em] ${s.accent}`}>
            Powered by MomentDrop
          </p>
        </div>
      </div>

      <p className="no-print mt-6 text-center text-sm text-[#74664f]">
        Pick a template and click Print. Set your printer to a small paper size (A6/A5) for
        table cards.
      </p>
    </div>
  );
}
