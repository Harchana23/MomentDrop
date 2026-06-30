"use client";

import { useEffect, useState } from "react";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function CountdownScreen({ title, until }: { title: string; until: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date(until).getTime();
    const tick = () => {
      const r = target - Date.now();
      if (r <= 0) {
        window.location.reload();
        return;
      }
      setRemaining(r);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [until]);

  const p = remaining === null ? null : parts(remaining);

  return (
    <main className="fixed inset-0 flex flex-col items-center justify-center bg-[#1b1714] px-6 text-center text-[#f3ecdc]">
      <p className="text-sm font-medium uppercase tracking-[0.3em] text-[#bda77f]">{title}</p>
      <div className="mt-8 flex items-end gap-4 sm:gap-8">
        {p ? (
          [
            { v: p.d, l: "Days" },
            { v: p.h, l: "Hours" },
            { v: p.m, l: "Min" },
            { v: p.s, l: "Sec" },
          ].map((b) => (
            <div key={b.l} className="flex flex-col items-center">
              <span className="text-5xl font-semibold tabular-nums sm:text-7xl">
                {b.l === "Days" ? b.v : pad(b.v)}
              </span>
              <span className="mt-2 text-xs uppercase tracking-[0.24em] text-[#bda77f]/70">
                {b.l}
              </span>
            </div>
          ))
        ) : (
          <span className="text-2xl text-[#bda77f]/70">Starting soon…</span>
        )}
      </div>
      <p className="mt-10 text-xs uppercase tracking-[0.24em] text-[#bda77f]/50">
        Powered by MomentDrop
      </p>
    </main>
  );
}
