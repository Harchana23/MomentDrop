"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { WallSettings } from "@/lib/events/wall-settings";

type Item = { id: string; url: string; guestName: string };

const POLL_MS = 30000;
const CONTROLS_HIDE_MS = 3000;

/**
 * Assign each photo id a fixed pseudo-random rank derived from the session seed.
 *
 * Ranking per id (rather than shuffling the array) is what keeps the order stable as
 * photos arrive: an existing photo's rank never changes, so a poll that adds three
 * uploads slots them in without reordering what the room has already seen. Shuffling
 * the whole array on every poll would make the wall jump and repeat.
 */
function rankOf(id: string, seed: number): number {
  let h = seed >>> 0;
  for (let i = 0; i < id.length; i++) {
    h = Math.imul(h ^ id.charCodeAt(i), 16777619) >>> 0;
  }
  return h;
}

export default function PhotoWall({
  slug,
  title,
  initialItems,
  settings,
  qrDataUrl,
  joinUrl,
}: {
  slug: string;
  title: string;
  initialItems: Item[];
  settings: WallSettings;
  qrDataUrl: string | null;
  joinUrl: string;
}) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [controlsOn, setControlsOn] = useState(false);
  const [isFull, setIsFull] = useState(false);

  // Fixed once, so `shuffle` stays stable for the whole session.
  const seedRef = useRef(Math.floor(Math.random() * 4294967296));
  const seenRef = useRef(new Set(initialItems.map((i) => i.id)));
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const ordered = useMemo(() => {
    if (settings.order === "shuffle") {
      const seed = seedRef.current;
      return [...items].sort((a, b) => rankOf(a.id, seed) - rankOf(b.id, seed));
    }
    // `items` arrives newest-first from the API.
    return settings.order === "oldest" ? [...items].reverse() : items;
  }, [items, settings.order]);

  const orderedRef = useRef(ordered);
  useEffect(() => {
    orderedRef.current = ordered;
  }, [ordered]);

  const len = ordered.length;
  const go = useCallback((delta: number) => {
    const n = orderedRef.current.length;
    if (n === 0) return;
    setIdx((i) => (i + delta + n) % n);
  }, []);

  // Auto-advance. Restarts whenever the interval or pause state changes, so a manual
  // skip also gives the new photo its full time on screen.
  useEffect(() => {
    if (paused || len === 0) return;
    const t = setInterval(() => go(1), settings.slideMs);
    return () => clearInterval(t);
  }, [paused, len, settings.slideMs, go, idx]);

  // Poll for new uploads (and refreshed signed URLs).
  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const res = await fetch(`/api/e/${slug}/wall`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data.items)) return;
        const next = data.items as Item[];

        const fresh = next.filter((i) => !seenRef.current.has(i.id));
        next.forEach((i) => seenRef.current.add(i.id));
        setItems(next);

        // Jumping to a new photo is what makes guests keep uploading — they see their
        // shot hit the screen. But never seize a wall the host has deliberately paused.
        if (settings.jumpToNew && fresh.length > 0 && !pausedRef.current) {
          const target = orderedRef.current.findIndex((i) => i.id === fresh[0].id);
          if (target >= 0) setIdx(target);
        }
      } catch {}
    }, POLL_MS);
    return () => clearInterval(t);
  }, [slug, settings.jumpToNew]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else document.documentElement.requestFullscreen().catch(() => {});
  }, []);

  useEffect(() => {
    const onChange = () => setIsFull(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // Controls reveal on any activity, then fade out again.
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const wake = () => {
      setControlsOn(true);
      clearTimeout(t);
      t = setTimeout(() => setControlsOn(false), CONTROLS_HIDE_MS);
    };
    const onKey = (e: KeyboardEvent) => {
      wake();
      if (e.key === " ") {
        e.preventDefault();
        setPaused((p) => !p);
      } else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "f" || e.key === "F") toggleFullscreen();
    };
    window.addEventListener("mousemove", wake);
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("mousemove", wake);
      window.removeEventListener("keydown", onKey);
    };
  }, [go, toggleFullscreen]);

  const current = len ? ordered[idx % len] : null;
  const next = len ? ordered[(idx + 1) % len] : null;

  const anim =
    settings.transition === "none"
      ? undefined
      : settings.transition === "slide"
        ? "mdwallslide .6s cubic-bezier(.22,.61,.36,1)"
        : "mdwallfade 1.2s ease";

  return (
    <div className="fixed inset-0 overflow-hidden bg-black text-white">
      <style>{`
        @keyframes mdwallfade{from{opacity:0}to{opacity:1}}
        @keyframes mdwallslide{from{opacity:0;transform:translateX(4%)}to{opacity:1;transform:none}}
        @media (prefers-reduced-motion: reduce){
          .mdwall-img{animation:none !important}
        }
      `}</style>

      {!current ? (
        <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center">
          {settings.showTitle && (
            <p className="text-sm uppercase tracking-[0.3em] text-white/40">{title}</p>
          )}
          <p className="mt-5 text-2xl text-white/70">Waiting for the first photo…</p>
          {qrDataUrl && (
            <div className="mt-10 flex flex-col items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="" aria-hidden="true" className="h-40 w-40 rounded-lg bg-white p-2" />
              <p className="text-sm text-white/60">Scan to add your photos</p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Blurred backdrop so letterboxed portraits don't sit on flat black. */}
          {settings.blurBg && settings.fit === "contain" && (
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${current.url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(48px) brightness(.45)",
                transform: "scale(1.15)",
              }}
            />
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={current.id}
            src={current.url}
            alt=""
            className="mdwall-img absolute inset-0 h-full w-full"
            style={{ objectFit: settings.fit, animation: anim }}
          />

          {/* Preload the next image so swaps are instant. */}
          {next && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={next.url} alt="" className="hidden" aria-hidden="true" />
          )}

          {(settings.showName || settings.showTitle) && (
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 bg-gradient-to-t from-black/70 to-transparent p-6">
              <span className="text-lg font-medium">{settings.showName ? current.guestName : ""}</span>
              {settings.showTitle && (
                <span className="text-sm uppercase tracking-[0.24em] text-white/60">
                  {title} · MomentDrop
                </span>
              )}
            </div>
          )}

          {qrDataUrl && (
            <div className="absolute right-6 top-6 flex flex-col items-center gap-2 rounded-xl bg-black/45 p-3 backdrop-blur-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="" aria-hidden="true" className="h-24 w-24 rounded bg-white p-1.5" />
              <p className="max-w-[7rem] text-center text-[11px] leading-tight text-white/80">
                Scan to add your photos
              </p>
            </div>
          )}
        </>
      )}

      {/* Playback controls — hidden until the mouse moves or a key is pressed. */}
      <div
        className="absolute inset-x-0 bottom-0 flex justify-center pb-24 transition-opacity duration-300"
        style={{ opacity: controlsOn ? 1 : 0, pointerEvents: controlsOn ? "auto" : "none" }}
      >
        <div className="flex items-center gap-1 rounded-full bg-black/60 p-1.5 backdrop-blur-sm">
          <button
            onClick={() => go(-1)}
            aria-label="Previous photo"
            className="grid h-11 w-11 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M15.5 4.5v15L6 12z" />
            </svg>
          </button>
          <button
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Play" : "Pause"}
            className="grid h-11 w-11 place-items-center rounded-full text-white hover:bg-white/10"
          >
            {paused ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M7 4.5v15L19 12z" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M7 4.5h3.5v15H7zM13.5 4.5H17v15h-3.5z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next photo"
            className="grid h-11 w-11 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8.5 4.5v15L18 12z" />
            </svg>
          </button>
          <span className="mx-1 h-6 w-px bg-white/20" />
          <button
            onClick={toggleFullscreen}
            aria-label={isFull ? "Exit fullscreen" : "Fullscreen"}
            className="grid h-11 w-11 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {isFull ? (
                <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
              ) : (
                <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
              )}
            </svg>
          </button>
          {len > 0 && (
            <span className="px-3 text-sm tabular-nums text-white/60">
              {(idx % len) + 1}/{len}
            </span>
          )}
        </div>
      </div>

      {/* Screen-reader/keyboard hint, and the join URL for anyone inspecting the page. */}
      <span className="sr-only">
        Photo wall for {title}. Space pauses, arrow keys move, F toggles fullscreen. Guests can
        upload at {joinUrl}.
      </span>
    </div>
  );
}
