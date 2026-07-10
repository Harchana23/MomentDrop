"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { subscribe, getState, loader } from "@/lib/loader";

/** Renders the camera-shutter overlay + top progress bar, driven by the loader store. */
export function GlobalLoader() {
  const s = useSyncExternalStore(subscribe, getState, getState);
  return (
    <>
      <div className={`md-loader ${s.overlay ? "on" : ""}`} aria-hidden={!s.overlay}>
        <div className="md-cam" style={{ width: 72, height: 72 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="md-logo" src="/logo-tile.png" alt="" aria-hidden="true" />
          <div className="md-ripple" />
          <div className="md-flash" />
        </div>
        <div className="md-loadermsg">{s.msg}</div>
      </div>
      <div className={`md-topbar ${s.barOn ? "on" : ""}`} style={{ width: `${s.bar}%` }} />
    </>
  );
}

/** Flashes the top bar on internal link navigation so clicks are always acknowledged. */
export function RouteProgress() {
  const pathname = usePathname();

  useEffect(() => {
    loader.barDone();
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("/") || href.startsWith("//")) return; // internal only
      const target = a.getAttribute("target");
      if (target && target !== "_self") return;
      if (a.hasAttribute("download")) return;
      if (href === pathname) return;
      loader.barStart();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [pathname]);

  return null;
}
