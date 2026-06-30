"use client";

import { useEffect, useRef, useState } from "react";

type Item = { id: string; url: string; guestName: string };

const ADVANCE_MS = 6000;
const POLL_MS = 30000;

export default function PhotoWall({
  slug,
  title,
  initialItems,
}: {
  slug: string;
  title: string;
  initialItems: Item[];
}) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [idx, setIdx] = useState(0);
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Auto-advance the slideshow.
  useEffect(() => {
    if (items.length === 0) return;
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % Math.max(itemsRef.current.length, 1));
    }, ADVANCE_MS);
    return () => clearInterval(t);
  }, [items.length]);

  // Poll for newly uploaded photos (and fresh signed URLs).
  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const res = await fetch(`/api/e/${slug}/wall`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.items)) setItems(data.items);
      } catch {}
    }, POLL_MS);
    return () => clearInterval(t);
  }, [slug]);

  const len = items.length;
  const current = len ? items[idx % len] : null;
  const next = len ? items[(idx + 1) % len] : null;

  return (
    <div className="fixed inset-0 overflow-hidden bg-black text-white">
      <style>{`@keyframes mdwallfade{from{opacity:0}to{opacity:1}}`}</style>

      {!current ? (
        <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-white/40">{title}</p>
          <p className="mt-5 text-2xl text-white/70">Waiting for the first photo…</p>
        </div>
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={current.id}
            src={current.url}
            alt=""
            className="absolute inset-0 h-full w-full object-contain"
            style={{ animation: "mdwallfade 1.2s ease" }}
          />
          {/* Preload the next image so swaps are instant. */}
          {next && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={next.url} alt="" className="hidden" aria-hidden="true" />
          )}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent p-6">
            <span className="text-lg font-medium">{current.guestName}</span>
            <span className="text-sm uppercase tracking-[0.24em] text-white/60">
              {title} · MomentDrop
            </span>
          </div>
        </>
      )}
    </div>
  );
}
