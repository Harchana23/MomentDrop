"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- ported marketing page; CTAs full-nav to app routes is fine */

import { useEffect, useRef, useState } from "react";
import { OCCASIONS } from "@/components/site-chrome";

/* ─────────── data ─────────── */

const PHOTOS = [
  "hero", "event-wedding", "event-party", "event-festival", "event-corporate",
  "gallery-1", "gallery-2", "gallery-3", "gallery-4", "gallery-5", "gallery-6", "testimonial",
].map((n) => `/marketing/${n}.jpg`);

const SPOTS: [number, number][] = [
  [-460, -240], [420, -200], [-520, 120], [500, 140], [-260, -360], [300, -360],
  [-360, 300], [360, 320], [-140, -140], [180, -120], [-200, 200], [220, 180],
  [-60, -320], [80, 300],
];
const PLANES = SPOTS.map((s, i) => {
  const w = 150 + (i % 4) * 40;
  const h = Math.round(w * (i % 2 ? 1.25 : 0.8));
  return {
    z: -(300 + i * 220),
    w, h,
    mx: s[0] - w / 2,
    my: s[1] - h / 2,
    img: PHOTOS[i % PHOTOS.length],
  };
});

const QR: string[] = (() => {
  const N = 13, cells: string[] = [];
  const inFinder = (r: number, c: number): boolean | null => {
    for (const [zr, zc] of [[0, 0], [0, N - 7], [N - 7, 0]]) {
      if (r >= zr && r < zr + 7 && c >= zc && c < zc + 7) {
        const rr = r - zr, cc = c - zc;
        return rr === 0 || rr === 6 || cc === 0 || cc === 6 || (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4);
      }
    }
    return null;
  };
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const f = inFinder(r, c);
    const on = f !== null ? f : ((r * 7 + c * 13 + r * c) % 5) < 2;
    cells.push(on ? "#171018" : "#ffffff");
  }
  return cells;
})();

const CAPS = [
  { i: 0, step: "01", title: "Scan the QR", body: "Every table has a QR code. Guests point their camera — the upload page opens instantly, no app and no account." },
  { i: 1, step: "02", title: "Snap or upload", body: "Take a photo or video right there, or pick the best shots straight from their camera roll." },
  { i: 2, step: "03", title: "Grab the candids", body: "Capture as many moments as they like — the dance floor, the kids' table, the quiet in-betweens." },
  { i: 3, step: "04", title: "Add a note", body: "A name and a short message travel with the photos, so you know who sent every memory." },
  { i: 4, step: "05", title: "It's in the album", body: "One tap and the moments land privately in your album — ready to relive and download as one ZIP." },
];
const STEPS = [
  { n: "1", icon: "🎟️", title: "Create your event", body: "Sign up, name it, and get a QR code plus link in seconds." },
  { n: "2", icon: "📲", title: "Guests scan & upload", body: "They open a web page and add photos and videos — no app, no account." },
  { n: "3", icon: "📦", title: "Download everything", body: "View, approve, and download every memory as one ZIP." },
];
const FEATURES = [
  { icon: "🚫", title: "No app for guests", body: "Just a QR code and a web page. Works on any phone, instantly." },
  { icon: "🔒", title: "Your photos, private", body: "Uploads land in private storage only you control — never a public feed." },
  { icon: "✅", title: "Approve before it shows", body: "Optionally review uploads before they appear in the album." },
  { icon: "🖥️", title: "Live Photo Wall", body: "Put a slideshow of photos on the big screen as guests upload." },
  { icon: "🗂️", title: "Organize into albums", body: "Ceremony, reception, photobooth — guests upload to the right one." },
  { icon: "⬇️", title: "Download as one ZIP", body: "Every photo and video, organized by guest, in a single download." },
];
const USES = [
  { icon: "💍", title: "Weddings", body: "Malay, Chinese, Indian, church — every tradition.", img: "/marketing/event-wedding.jpg", href: "/use-cases/wedding" },
  { icon: "🪔", title: "Festivals & open houses", body: "Raya, CNY, Deepavali, Christmas.", img: "/marketing/event-festival.jpg", href: "/use-cases/party" },
  { icon: "🎂", title: "Birthdays & parties", body: "Every candid from the night.", img: "/marketing/event-party.jpg", href: "/use-cases/birthday" },
  { icon: "🏢", title: "Company events", body: "Annual dinners, launches, team days.", img: "/marketing/event-corporate.jpg", href: "/use-cases/corporate" },
];
const FAQS = [
  { q: "Do guests need to download an app?", a: "No. Guests scan the QR (or open the link), land on a normal web page, and upload straight from their phone — no app and no account." },
  { q: "Where do the photos go?", a: "Into private storage that only you, the event owner, can access. Nothing is posted to a public feed unless you choose to show the shared album." },
  { q: "Can I download everything at the end?", a: "Yes — one click downloads every photo and video as a single ZIP, organized into folders by guest." },
  { q: "How much does it cost?", a: "Every event starts free. Upgrade a specific event for more uploads and a longer window. See the pricing page for details." },
];

/* ─────────── reusable style bits ─────────── */
const glassLg = { background: "rgba(255,251,246,.6)", border: "1px solid rgba(255,255,255,.75)", boxShadow: "0 24px 60px -22px rgba(90,50,40,.3)" } as const;
const glassSm = { background: "rgba(255,251,246,.55)", border: "1px solid rgba(255,255,255,.68)", boxShadow: "0 14px 40px -22px rgba(90,50,40,.25)" } as const;
const gradText = { background: "linear-gradient(135deg,#C97F52,#E8B85C)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" } as const;
const eyebrow = { fontWeight: 700, fontSize: 13, letterSpacing: ".18em", textTransform: "uppercase", color: "#B5654A" } as const;
const h2Style = { margin: 0, fontWeight: 700, fontSize: "clamp(34px,5vw,66px)", lineHeight: 1, letterSpacing: "-.02em" } as const;
const navLink = { padding: "9px 14px", borderRadius: 100, fontWeight: 600, fontSize: 14.5, color: "#4A3540" } as const;
const panelLink = { display: "block", padding: "11px 12px", borderRadius: 12, fontWeight: 600, fontSize: 15.5, color: "#2A1B24" } as const;

export default function ImmersiveHome() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const q = <T extends Element = HTMLElement>(sel: string) => root.querySelector(sel) as T | null;
    const qa = <T extends Element = HTMLElement>(sel: string) => [...root.querySelectorAll(sel)] as T[];
    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

    /* preloader */
    const bar = q<HTMLElement>("[data-loadbar]");
    const txt = q<HTMLElement>("[data-loadtext]");
    const msgs = ["Gathering moments…", "Adding sparkle…", "Arranging photos…", "Almost there…"];
    const DUR = 2200; const start = Date.now(); let mi = -1, done = false;
    const ease = (t: number) => 1 - Math.pow(1 - t, 2);
    const timers: { pi?: ReturnType<typeof setInterval>; pt?: ReturnType<typeof setTimeout> } = {};
    const hide = () => { if (done) return; done = true; if (timers.pi) clearInterval(timers.pi); setLoaded(true); };
    const stepPre = () => {
      const t = Math.min(1, (Date.now() - start) / DUR);
      if (bar) bar.style.width = Math.round(ease(t) * 100) + "%";
      const nm = Math.min(msgs.length - 1, Math.floor(t * msgs.length));
      if (nm !== mi && txt) { mi = nm; txt.textContent = msgs[nm]; }
      if (t >= 1) hide();
    };
    timers.pi = setInterval(stepPre, 60);
    timers.pt = setTimeout(hide, 3500);
    const onVis = () => { if (!document.hidden) hide(); };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onVis);

    /* reveals */
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    qa<HTMLElement>(".ih-rv").forEach((el, i) => {
      el.style.transitionDelay = (Math.min(i % 6, 5) * 70) + "ms";
      if (reduce || el.getBoundingClientRect().top < window.innerHeight * 0.92) el.classList.add("in");
      else io.observe(el);
    });

    /* phone step setter */
    const screens = qa<HTMLElement>("[data-screen]");
    const capEls = qa<HTMLElement>("[data-cap]");
    const dotEls = qa<HTMLElement>("[data-dot]");
    let lastIdx = -1;
    const setStep = (idx: number) => {
      if (idx === lastIdx) return; lastIdx = idx;
      screens.forEach((s) => { const on = +(s.dataset.i || 0) === idx; s.style.opacity = on ? "1" : "0"; s.style.transform = on ? "none" : "scale(.98)"; });
      capEls.forEach((c) => { const on = +(c.dataset.i || 0) === idx; c.style.opacity = on ? "1" : "0"; c.style.transform = on ? "none" : "translateY(14px)"; });
      dotEls.forEach((d) => { const on = +(d.dataset.i || 0) === idx; d.style.background = on ? "linear-gradient(90deg,#C97F52,#E8B85C)" : "rgba(90,50,40,.18)"; d.style.width = on ? "40px" : "28px"; });
    };
    setStep(0);

    if (reduce) {
      // No scroll-driven motion for reduced-motion users.
      return () => {
        if (timers.pi) clearInterval(timers.pi); if (timers.pt) clearTimeout(timers.pt);
        document.removeEventListener("visibilitychange", onVis); window.removeEventListener("focus", onVis);
      };
    }

    /* dive + parallax + phone flow */
    const diveWrap = q<HTMLElement>("[data-dive-wrap]");
    const planes = qa<HTMLElement>("[data-plane]");
    const copy = q<HTMLElement>("[data-herocopy]");
    const cue = q<HTMLElement>("[data-scrollcue]");
    const pars = qa<HTMLElement>("[data-par]");
    const phoneWrap = q<HTMLElement>("[data-phone-wrap]");
    const tunnel = q<HTMLElement>("[data-tunnel]");
    const CAM = 3200;

    const onScroll = () => {
      const y = window.scrollY;
      pars.forEach((p) => { const s = parseFloat(p.dataset.par || "0"); p.style.transform = `translateX(-50%) translateY(${y * s}px)`; });
      const range = diveWrap ? diveWrap.offsetHeight - window.innerHeight : 1;
      const prog = clamp(y / range, 0, 1);
      const travel = prog * CAM;
      planes.forEach((pl) => {
        const z = parseFloat(pl.dataset.z || "0") + travel;
        pl.style.transform = `translateZ(${z}px)`;
        let op = 1;
        if (z > 120) op = clamp(1 - (z - 120) / 220, 0, 1);
        else if (z < -2400) op = clamp(1 - (-z - 2400) / 600, 0, 1);
        pl.style.opacity = String(op);
      });
      if (copy) { copy.style.transform = `scale(${1 + prog * 0.6})`; copy.style.opacity = String(clamp(1 - prog * 1.8, 0, 1)); }
      if (cue) cue.style.opacity = String(clamp(1 - prog * 4, 0, 1));
      if (phoneWrap && screens.length) {
        const top = phoneWrap.offsetTop;
        const r2 = phoneWrap.offsetHeight - window.innerHeight;
        const pp = clamp((window.scrollY - top) / r2, 0, 1);
        setStep(clamp(Math.floor(pp * screens.length), 0, screens.length - 1));
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const onMove = (ev: MouseEvent) => {
      const dx = (ev.clientX - window.innerWidth / 2) / window.innerWidth;
      const dy = (ev.clientY - window.innerHeight / 2) / window.innerHeight;
      if (tunnel) tunnel.style.transform = `rotateY(${dx * 6}deg) rotateX(${-dy * 6}deg)`;
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      if (timers.pi) clearInterval(timers.pi); if (timers.pt) clearTimeout(timers.pt);
      document.removeEventListener("visibilitychange", onVis); window.removeEventListener("focus", onVis);
      window.removeEventListener("scroll", onScroll); window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="ih"
      style={{ position: "relative", width: "100%", minHeight: "100vh", background: "#F4ECE3", color: "#2A1B24", fontFamily: "var(--font-sans-jakarta), sans-serif" }}
    >
      <style>{`
        .ih .g, .ih .ih-g { font-family: var(--font-grotesk), 'Space Grotesk', sans-serif; }
        .ih a { color: #B5654A; text-decoration: none; }
        .ih a:hover { color: #8F4A34; }
        .ih ::selection { background: #E8B85C; color: #2A1B24; }
        .ih section, .ih footer, .ih .dv-body { overflow-x: clip; }
        .ih nav a { white-space: nowrap; }
        @keyframes ih-glow { 0%,100% { opacity: .6; } 50% { opacity: 1; } }
        .ih .ih-rv { opacity: 0; transform: translateY(50px); transition: opacity 1.1s cubic-bezier(.2,.7,.2,1), transform 1.1s cubic-bezier(.2,.7,.2,1); }
        .ih .ih-rv.in { opacity: 1; transform: none; }
        .ih [data-screen], .ih [data-cap] { transition: opacity .55s ease, transform .55s ease; }
        .ih details summary::-webkit-details-marker { display: none; }
        .ih details[open] summary span.ih-plus { transform: rotate(45deg); }
        @media (max-width: 820px) { .ih .phone-copy { display: none; } }
        @media (prefers-reduced-motion: reduce) { .ih .ih-rv { opacity: 1; transform: none; transition: none; } }

        /* nav: inline links (desktop) vs hamburger (mobile) */
        .ih .navburger { display: none; }
        @media (max-width: 1000px) {
          .ih .navlinks-inline { display: none !important; }
          .ih .navburger { display: inline-flex !important; }
        }
        /* Occasions dropdown — reveal on hover / keyboard focus */
        .ih .occ-menu { opacity: 0; visibility: hidden; transform: translateX(-50%) translateY(8px); transition: opacity .18s ease, transform .18s ease, visibility .18s; }
        .ih .occ:hover .occ-menu, .ih .occ:focus-within .occ-menu { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0); }
        .ih .occ:hover .occ-caret, .ih .occ:focus-within .occ-caret { transform: rotate(180deg); }
        .ih .occ-item:hover { background: rgba(255,255,255,.6); }
        /* mobile dropdown panel */
        .ih .navpanel { display: none; }
        .ih .navpanel[data-open="true"] { display: block; }
        @media (min-width: 1001px) { .ih .navpanel { display: none !important; } }
      `}</style>

      {/* PRELOADER */}
      <div data-preloader style={{ position: "fixed", inset: 0, zIndex: 200, background: "#F4ECE3", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26, opacity: loaded ? 0 : 1, visibility: loaded ? "hidden" : "visible", pointerEvents: loaded ? "none" : "auto", transition: "opacity .8s ease, visibility .8s" }}>
        <div style={{ position: "absolute", width: "50vw", height: "50vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(243,183,160,.75), transparent 65%)", filter: "blur(60px)", animation: "ih-glow 2.4s ease-in-out infinite" }} />
        <div className="g" style={{ position: "relative", display: "flex", alignItems: "center", gap: 14, fontWeight: 700, fontSize: 26, letterSpacing: "-.02em" }}>
          <div className="md-cam" style={{ width: 52, height: 52 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="md-logo" src="/logo-tile.png" alt="" aria-hidden="true" />
            <div className="md-ripple" />
            <div className="md-flash" />
          </div>
          MomentDrop
        </div>
        <div style={{ position: "relative", width: 220, height: 3, borderRadius: 3, background: "rgba(90,50,40,.14)", overflow: "hidden" }}>
          <div data-loadbar style={{ height: "100%", width: "0%", background: "linear-gradient(90deg,#C97F52,#E8B85C)" }} />
        </div>
        <div data-loadtext className="g" style={{ position: "relative", fontSize: 13, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(90,69,80,.7)" }}>Gathering moments…</div>
      </div>

      {/* ambient glows */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div data-par="0.18" style={{ position: "absolute", top: "-15%", left: "50%", transform: "translateX(-50%)", width: "70vw", height: "55vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(243,183,160,.6), transparent 62%)", filter: "blur(80px)" }} />
        <div data-par="0.3" style={{ position: "absolute", bottom: "-20%", right: "-12%", width: "55vw", height: "55vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(232,184,92,.5), transparent 62%)", filter: "blur(80px)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 2 }}>
        {/* NAV */}
        <nav style={{ position: "fixed", top: 18, left: "50%", transform: "translateX(-50%)", zIndex: 60, width: "min(1200px, calc(100% - 36px))", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 11px 9px 16px", borderRadius: 100, background: "rgba(255,251,246,.6)", backdropFilter: "blur(20px) saturate(140%)", WebkitBackdropFilter: "blur(20px) saturate(140%)", border: "1px solid rgba(255,255,255,.7)", boxShadow: "0 12px 40px -12px rgba(90,50,40,.28)" }}>
          <a href="/" className="g" style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 19, letterSpacing: "-.01em", color: "#2A1B24" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" aria-hidden="true" style={{ width: 32, height: 32, objectFit: "contain" }} />
            MomentDrop
          </a>
          {/* desktop inline links */}
          <div className="navlinks-inline" style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <a href="#how" style={navLink}>How it works</a>

            {/* Occasions dropdown */}
            <div className="occ" style={{ position: "relative" }}>
              <a href="#uses" style={{ ...navLink, display: "inline-flex", alignItems: "center", gap: 5 }}>
                Occasions
                <span className="occ-caret" aria-hidden="true" style={{ fontSize: 11, transition: "transform .18s ease" }}>▾</span>
              </a>
              <div className="occ-menu" role="menu" style={{ position: "absolute", top: "100%", left: "50%", marginTop: 12, width: 292, padding: 8, borderRadius: 18, background: "rgba(255,251,246,.85)", backdropFilter: "blur(20px) saturate(140%)", WebkitBackdropFilter: "blur(20px) saturate(140%)", border: "1px solid rgba(255,255,255,.7)", boxShadow: "0 24px 60px -20px rgba(90,50,40,.45)" }}>
                {OCCASIONS.map((o) => (
                  <a key={o.href} href={o.href} className="occ-item" role="menuitem" style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 12px", borderRadius: 12, color: "#2A1B24" }}>
                    <span aria-hidden="true" style={{ fontSize: 18, lineHeight: 1 }}>{o.icon}</span>
                    <span>
                      <span style={{ display: "block", fontWeight: 700, fontSize: 14.5 }}>{o.label}</span>
                      <span style={{ display: "block", fontSize: 12.5, color: "rgba(90,69,80,.8)" }}>{o.blurb}</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>

            <a href="/pricing" style={navLink}>Pricing</a>
            <a href="/contact" style={navLink}>Contact</a>
            <a href="#faq" style={navLink}>FAQ</a>
            <a href="/login" style={navLink}>Log in</a>
            <a className="navcta" href="/signup" style={{ marginLeft: 6, padding: "11px 22px", borderRadius: 100, fontWeight: 700, fontSize: 14.5, color: "#fff", background: "linear-gradient(135deg,#C97F52,#B5654A)" }}>Create event</a>
          </div>

          {/* mobile hamburger */}
          <button className="navburger" type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)} style={{ display: "none", alignItems: "center", justifyContent: "center", width: 42, height: 42, borderRadius: 100, border: "1px solid rgba(255,255,255,.7)", background: "rgba(255,251,246,.55)", color: "#2A1B24", cursor: "pointer", fontSize: 17 }}>
            <span aria-hidden="true">{menuOpen ? "✕" : "☰"}</span>
          </button>
        </nav>

        {/* mobile dropdown panel */}
        <div className="navpanel" data-open={menuOpen ? "true" : "false"} style={{ position: "fixed", top: 76, left: "50%", transform: "translateX(-50%)", zIndex: 59, width: "min(1200px, calc(100% - 36px))", padding: 12, borderRadius: 22, background: "rgba(255,251,246,.92)", backdropFilter: "blur(20px) saturate(140%)", WebkitBackdropFilter: "blur(20px) saturate(140%)", border: "1px solid rgba(255,255,255,.7)", boxShadow: "0 24px 60px -18px rgba(90,50,40,.4)" }}>
          <a href="#how" onClick={() => setMenuOpen(false)} style={panelLink}>How it works</a>
          <div style={{ padding: "10px 12px 4px", fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#B5654A" }}>Occasions</div>
          {OCCASIONS.map((o) => (
            <a key={o.href} href={o.href} onClick={() => setMenuOpen(false)} style={{ ...panelLink, paddingLeft: 22 }}>
              <span aria-hidden="true" style={{ marginRight: 8 }}>{o.icon}</span>{o.label}
            </a>
          ))}
          <a href="/pricing" onClick={() => setMenuOpen(false)} style={panelLink}>Pricing</a>
          <a href="/contact" onClick={() => setMenuOpen(false)} style={panelLink}>Contact</a>
          <a href="#faq" onClick={() => setMenuOpen(false)} style={panelLink}>FAQ</a>
          <a href="/login" onClick={() => setMenuOpen(false)} style={panelLink}>Log in</a>
          <a href="/signup" onClick={() => setMenuOpen(false)} style={{ display: "block", textAlign: "center", marginTop: 8, padding: "13px", borderRadius: 100, fontWeight: 700, color: "#fff", background: "linear-gradient(135deg,#C97F52,#B5654A)" }}>Create event</a>
        </div>

        {/* HERO + DIVE */}
        <section data-dive-wrap style={{ position: "relative", height: "340vh" }}>
          <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
            <div data-scene style={{ position: "absolute", inset: 0, perspective: "900px", perspectiveOrigin: "50% 50%", pointerEvents: "none" }}>
              <div data-tunnel style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d" }}>
                {PLANES.map((p, i) => (
                  <div key={i} data-plane data-z={p.z} style={{ position: "absolute", left: "50%", top: "50%", width: p.w, height: p.h, marginLeft: p.mx, marginTop: p.my, borderRadius: 16, backgroundImage: `url(${p.img})`, backgroundSize: "cover", backgroundPosition: "center", boxShadow: "0 30px 70px -20px rgba(0,0,0,.8)", border: "1px solid rgba(255,255,255,.14)", willChange: "transform, opacity" }} />
                ))}
              </div>
            </div>
            <div data-herocopy style={{ position: "absolute", inset: 0, zIndex: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 100, background: "rgba(255,255,255,.55)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,.7)", fontWeight: 700, fontSize: 12.5, letterSpacing: ".12em", textTransform: "uppercase", color: "#B5654A", marginBottom: 26 }}>🇲🇾 Made for Malaysian celebrations</div>
              <h1 className="g" style={{ margin: 0, fontWeight: 700, fontSize: "clamp(46px,8.5vw,138px)", lineHeight: 0.9, letterSpacing: "-.03em", maxWidth: "15ch" }}>
                Dive into<br /><span style={{ background: "linear-gradient(100deg,#C97F52,#B5654A)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>every moment.</span>
              </h1>
              <p style={{ margin: "26px auto 0", maxWidth: "44ch", fontSize: "clamp(16px,1.9vw,20px)", lineHeight: 1.55, color: "rgba(90,69,80,.9)", fontWeight: 500 }}>Guests scan one QR and their photos rush into a shared world you keep forever. No app, no fuss.</p>
            </div>
            <div data-scrollcue style={{ position: "absolute", bottom: 30, left: "50%", transform: "translateX(-50%)", zIndex: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: "rgba(90,69,80,.7)", fontSize: 12, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase" }}>
              Scroll down &amp; dive in<span style={{ width: 1, height: 34, background: "linear-gradient(rgba(90,69,80,.7), transparent)" }} />
            </div>
          </div>
        </section>

        <div className="dv-body">
          {/* CTA STRIP */}
          <section style={{ maxWidth: 760, margin: "0 auto", padding: "30px 24px 90px", textAlign: "center" }}>
            <div className="ih-rv" style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "center" }}>
              <a href="/signup" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "17px 34px", borderRadius: 100, fontWeight: 700, fontSize: 17, color: "#fff", background: "linear-gradient(135deg,#C97F52,#B5654A)", boxShadow: "0 18px 50px -12px rgba(201,127,82,.5)" }}>Create your event — free →</a>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: "rgba(90,69,80,.75)", whiteSpace: "nowrap" }}>No card · 2 minutes</span>
            </div>
          </section>

          {/* PHONE FLOW */}
          <section data-phone-wrap style={{ position: "relative", height: "520vh" }}>
            <div style={{ position: "sticky", top: 0, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "90px 24px" }}>
              <div style={{ width: "100%", maxWidth: 1120, display: "grid", gridTemplateColumns: "1fr auto", gap: 60, alignItems: "center" }}>
                {/* caption column */}
                <div className="phone-copy" style={{ position: "relative", minHeight: 320 }}>
                  <div style={{ ...eyebrow, marginBottom: 18 }}>How guests add photos</div>
                  <div style={{ position: "relative", minHeight: 210 }}>
                    {CAPS.map((c) => (
                      <div key={c.i} data-cap data-i={c.i} style={{ position: "absolute", inset: 0, opacity: 0 }}>
                        <div className="g" style={{ fontSize: "clamp(30px,4vw,52px)", lineHeight: 1, fontWeight: 700, letterSpacing: "-.02em", marginBottom: 16 }}><span style={{ color: "#B5654A" }}>{c.step}</span>&nbsp; {c.title}</div>
                        <p style={{ margin: 0, maxWidth: "40ch", fontSize: 17, lineHeight: 1.55, color: "rgba(90,69,80,.85)" }}>{c.body}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 34 }}>
                    {CAPS.map((c) => (
                      <div key={c.i} data-dot data-i={c.i} style={{ width: 28, height: 5, borderRadius: 5, background: "rgba(90,50,40,.18)", transition: "background .4s ease, width .4s ease" }} />
                    ))}
                  </div>
                </div>

                {/* PHONE */}
                <div style={{ justifySelf: "center" }}>
                  <div style={{ position: "relative", width: 300, height: 620, borderRadius: 48, padding: 12, background: "linear-gradient(160deg,#1a1922,#0c0b11)", border: "1px solid rgba(255,255,255,.14)", boxShadow: "0 50px 120px -30px rgba(201,127,82,.4), 0 20px 50px -20px rgba(90,50,40,.5)" }}>
                    <div style={{ position: "absolute", top: 22, left: "50%", transform: "translateX(-50%)", width: 96, height: 28, borderRadius: 20, background: "#0c0b11", zIndex: 10 }} />
                    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 37, overflow: "hidden", background: "#F7F2EC" }}>
                      {/* screen 0 · scan */}
                      <div data-screen data-i="0" style={{ position: "absolute", inset: 0, opacity: 0, background: "#0e0d13", display: "flex", flexDirection: "column" }}>
                        <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg,#2a2436,#141019)" }} />
                          <div style={{ position: "absolute", width: 210, height: 210, borderRadius: 26, border: "2px solid rgba(201,127,82,.85)", boxShadow: "0 0 0 2000px rgba(8,7,11,.55)" }} />
                          <div style={{ position: "relative", width: 150, height: 150, borderRadius: 14, background: "#fff", padding: 12, display: "grid", gridTemplateColumns: "repeat(13,1fr)", gridTemplateRows: "repeat(13,1fr)", gap: 1 }}>
                            {QR.map((c, i) => <div key={i} style={{ background: c, borderRadius: 1 }} />)}
                          </div>
                        </div>
                        <div style={{ padding: 22, textAlign: "center", color: "#EDE7F5", background: "#0e0d13" }}>
                          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Point at the table QR</div>
                          <div style={{ fontSize: 13, color: "rgba(237,231,245,.6)" }}>Opens instantly — no app to install</div>
                        </div>
                      </div>
                      {/* screen 1 · join */}
                      <div data-screen data-i="1" style={{ position: "absolute", inset: 0, opacity: 0, padding: "30px 22px", display: "flex", flexDirection: "column", color: "#2A1B24" }}>
                        <div style={{ height: 34 }} />
                        <div style={{ width: 54, height: 54, borderRadius: 16, background: "linear-gradient(135deg,#C97F52,#E8B85C)", display: "grid", placeItems: "center", color: "#fff", fontSize: 24, marginBottom: 16 }}>💍</div>
                        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#B07A5E" }}>You&apos;re invited to add photos</div>
                        <h3 style={{ margin: "6px 0 4px", fontSize: 24, fontWeight: 700 }}>Aisyah &amp; Daniel</h3>
                        <div style={{ fontSize: 14, color: "#7A6570", marginBottom: 26 }}>KL Wedding · 12 July</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: 16, borderRadius: 15, background: "linear-gradient(135deg,#C97F52,#B5654A)", color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 12 }}><span style={{ fontSize: 20 }}>📷</span> Take photo or video</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: 16, border: "1px solid #E4D9CF", borderRadius: 15, background: "#fff", color: "#2A1B24", fontWeight: 700, fontSize: 15 }}><span style={{ fontSize: 20 }}>🖼️</span> Upload from gallery</div>
                      </div>
                      {/* screen 2 · capture */}
                      <div data-screen data-i="2" style={{ position: "absolute", inset: 0, opacity: 0, display: "flex", flexDirection: "column", background: "#100c14" }}>
                        <div style={{ flex: 1, position: "relative", background: "linear-gradient(150deg,#E7A9B4,#B56C8C)" }}>
                          <div style={{ position: "absolute", top: 14, left: 14, padding: "5px 12px", borderRadius: 100, background: "rgba(0,0,0,.4)", color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF5A5A" }} /> REC</div>
                        </div>
                        <div style={{ padding: 16, background: "#100c14" }}>
                          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 9, background: "linear-gradient(135deg,#FFC6A8,#E39A5C)" }} />
                            <div style={{ width: 44, height: 44, borderRadius: 9, background: "linear-gradient(135deg,#E8B85C,#C97F52)" }} />
                            <div style={{ width: 44, height: 44, borderRadius: 9, background: "linear-gradient(135deg,#7FB0C9,#4A7F94)" }} />
                            <div style={{ width: 44, height: 44, borderRadius: 9, border: "1.5px dashed rgba(255,255,255,.3)", display: "grid", placeItems: "center", color: "rgba(255,255,255,.6)", fontSize: 20 }}>+</div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#EDE7F5" }}><span style={{ fontSize: 13, color: "rgba(237,231,245,.6)" }}>3 selected</span><span style={{ padding: "9px 18px", borderRadius: 100, background: "linear-gradient(135deg,#C97F52,#B5654A)", fontWeight: 700, fontSize: 14 }}>Next →</span></div>
                        </div>
                      </div>
                      {/* screen 3 · name */}
                      <div data-screen data-i="3" style={{ position: "absolute", inset: 0, opacity: 0, padding: "34px 22px", display: "flex", flexDirection: "column", color: "#2A1B24" }}>
                        <div style={{ height: 20 }} />
                        <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
                          <div style={{ width: 52, height: 52, borderRadius: 11, background: "linear-gradient(135deg,#FFC6A8,#E39A5C)" }} />
                          <div style={{ width: 52, height: 52, borderRadius: 11, background: "linear-gradient(135deg,#E8B85C,#C97F52)" }} />
                          <div style={{ width: 52, height: 52, borderRadius: 11, background: "linear-gradient(135deg,#7FB0C9,#4A7F94)" }} />
                        </div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: "#7A6570", marginBottom: 7 }}>YOUR NAME</label>
                        <div style={{ padding: "14px 15px", borderRadius: 13, border: "1px solid #E4D9CF", background: "#fff", fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Aisyah<span style={{ display: "inline-block", width: 1.5, height: 16, background: "#C97F52", verticalAlign: "middle", marginLeft: 2 }} /></div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: "#7A6570", marginBottom: 7 }}>ADD A NOTE</label>
                        <div style={{ padding: "14px 15px", borderRadius: 13, border: "1px solid #E4D9CF", background: "#fff", fontSize: 14, lineHeight: 1.5, color: "#4A3540", flex: 1 }}>So happy for you both — here&apos;s the dance floor! 💃</div>
                        <div style={{ marginTop: 16, width: "100%", padding: 16, borderRadius: 15, background: "linear-gradient(135deg,#C97F52,#B5654A)", color: "#fff", fontWeight: 700, fontSize: 15, textAlign: "center" }}>Upload 3 moments</div>
                      </div>
                      {/* screen 4 · done */}
                      <div data-screen data-i="4" style={{ position: "absolute", inset: 0, opacity: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 32, background: "linear-gradient(160deg,#F7F2EC,#F0E6DC)", color: "#2A1B24" }}>
                        <div style={{ width: 92, height: 92, borderRadius: "50%", background: "linear-gradient(135deg,#C97F52,#E8B85C)", display: "grid", placeItems: "center", color: "#fff", fontSize: 46, marginBottom: 24, boxShadow: "0 16px 40px -10px rgba(201,127,82,.5)" }}>✓</div>
                        <h3 style={{ margin: "0 0 10px", fontSize: 24, fontWeight: 700 }}>Added to the album!</h3>
                        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: "#7A6570", maxWidth: "24ch" }}>Your 3 moments are now with Aisyah &amp; Daniel — privately.</p>
                        <div style={{ marginTop: 24, padding: "10px 20px", borderRadius: 100, background: "rgba(201,127,82,.14)", color: "#8F4A34", fontWeight: 700, fontSize: 14 }}>Add more →</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section id="how" style={{ maxWidth: 1200, margin: "0 auto", padding: "30px 24px 110px" }}>
            <div className="ih-rv" style={{ textAlign: "center", marginBottom: 56 }}>
              <div style={{ ...eyebrow, marginBottom: 14 }}>The shared album</div>
              <h2 className="g" style={h2Style}>From QR to album in three steps</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
              {STEPS.map((s) => (
                <div key={s.n} className="ih-rv" style={{ padding: "34px 30px", borderRadius: 22, ...glassLg }}>
                  <div className="g" style={{ fontSize: 58, lineHeight: 1, fontWeight: 700, ...gradText }}>{s.n}</div>
                  <div style={{ fontSize: 32, margin: "8px 0 14px" }}>{s.icon}</div>
                  <h3 style={{ margin: "0 0 8px", fontSize: 21, fontWeight: 700 }}>{s.title}</h3>
                  <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: "rgba(90,69,80,.8)" }}>{s.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* OCCASIONS */}
          <section id="uses" style={{ maxWidth: 1280, margin: "0 auto", padding: "20px 24px 110px" }}>
            <div className="ih-rv" style={{ textAlign: "center", marginBottom: 48 }}>
              <div style={{ ...eyebrow, marginBottom: 14 }}>Proudly Malaysian</div>
              <h2 className="g" style={h2Style}>For every celebration</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
              {USES.map((u) => (
                <a key={u.title} href={u.href} className="ih-rv" style={{ position: "relative", aspectRatio: "3/4", borderRadius: 22, overflow: "hidden", boxShadow: "0 30px 70px -26px rgba(0,0,0,.85)", backgroundImage: `url(${u.img})`, backgroundSize: "cover", backgroundPosition: "center", display: "block" }}>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(30,15,22,.8), transparent 55%)" }} />
                  <div style={{ position: "absolute", top: 16, left: 16, fontSize: 30 }}>{u.icon}</div>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 20 }}>
                    <h3 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#fff" }}>{u.title}</h3>
                    <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: "rgba(255,255,255,.78)" }}>{u.body}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>

          {/* FEATURES */}
          <section style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 24px 110px" }}>
            <div className="ih-rv" style={{ textAlign: "center", marginBottom: 48 }}>
              <h2 className="g" style={{ margin: "0 auto", fontWeight: 700, fontSize: "clamp(32px,4.6vw,60px)", lineHeight: 1.02, letterSpacing: "-.02em", maxWidth: "18ch" }}>Everything you need to keep the memories</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 }}>
              {FEATURES.map((f) => (
                <div key={f.title} className="ih-rv" style={{ display: "flex", gap: 16, padding: 26, borderRadius: 18, ...glassSm }}>
                  <span style={{ flex: "none", width: 44, height: 44, borderRadius: 12, display: "grid", placeItems: "center", fontSize: 21, background: "linear-gradient(135deg, rgba(232,184,92,.35), rgba(217,139,160,.35))" }}>{f.icon}</span>
                  <div><h3 style={{ margin: "0 0 6px", fontSize: 17.5, fontWeight: 700 }}>{f.title}</h3><p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.55, color: "rgba(90,69,80,.8)" }}>{f.body}</p></div>
                </div>
              ))}
            </div>
          </section>

          {/* TESTIMONIAL */}
          <section style={{ maxWidth: 900, margin: "0 auto", padding: "20px 24px 110px" }}>
            <div className="ih-rv" style={{ padding: "56px 48px", borderRadius: 28, textAlign: "center", ...glassLg }}>
              <div style={{ color: "#E8B85C", fontSize: 20, letterSpacing: 3, marginBottom: 22 }}>★★★★★</div>
              <p className="g" style={{ margin: 0, fontWeight: 500, fontSize: "clamp(23px,3.2vw,38px)", lineHeight: 1.3, letterSpacing: "-.01em" }}>&ldquo;We got hundreds of photos we&apos;d never have seen otherwise — the dance floor, the kids&apos; table, all of it. The QR on every table just worked.&rdquo;</p>
              <div style={{ marginTop: 30, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
                <div role="img" aria-label="A happy MomentDrop couple" style={{ width: 56, height: 56, borderRadius: "50%", backgroundImage: "url(/marketing/testimonial.jpg)", backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "#E4D3BF", border: "2px solid rgba(255,255,255,.85)", boxShadow: "0 10px 24px -10px rgba(90,50,40,.5)" }} />
                <div style={{ fontWeight: 700, color: "#B5654A" }}>Aisyah &amp; Daniel · KL wedding</div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" style={{ maxWidth: 780, margin: "0 auto", padding: "20px 24px 110px" }}>
            <div className="ih-rv" style={{ textAlign: "center", marginBottom: 42 }}>
              <h2 className="g" style={h2Style}>Questions, answered</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {FAQS.map((f) => (
                <details key={f.q} className="ih-rv" style={{ borderRadius: 16, ...glassSm, overflow: "hidden" }}>
                  <summary style={{ cursor: "pointer", listStyle: "none", padding: "22px 26px", fontWeight: 700, fontSize: 17, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>{f.q}<span className="ih-plus" style={{ color: "#B5654A", fontSize: 22, transition: "transform .2s ease" }}>+</span></summary>
                  <div style={{ padding: "0 26px 24px", fontSize: 15, lineHeight: 1.6, color: "rgba(90,69,80,.8)" }}>{f.a}</div>
                </details>
              ))}
            </div>
          </section>

          {/* FINAL CTA */}
          <section id="cta" style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 24px 120px" }}>
            <div className="ih-rv" style={{ position: "relative", overflow: "hidden", borderRadius: 32, padding: "88px 40px", textAlign: "center", background: "linear-gradient(135deg,#C97F52,#B5654A)" }}>
              <div style={{ position: "absolute", top: "-30%", left: "-8%", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,.35), transparent 70%)", filter: "blur(40px)" }} />
              <h2 className="g" style={{ position: "relative", margin: 0, fontWeight: 700, fontSize: "clamp(34px,5.4vw,70px)", lineHeight: 1, letterSpacing: "-.02em", color: "#fff" }}>Start collecting in two minutes</h2>
              <p style={{ position: "relative", margin: "20px auto 0", maxWidth: "42ch", fontSize: 18, lineHeight: 1.5, color: "rgba(255,255,255,.92)", fontWeight: 500 }}>Create an event, print the QR, and watch the photos roll in.</p>
              <a href="/signup" style={{ position: "relative", display: "inline-flex", marginTop: 34, padding: "18px 38px", borderRadius: 100, fontWeight: 700, fontSize: 17, color: "#B5654A", background: "#fff" }}>Create your event — free →</a>
            </div>
          </section>

          {/* FOOTER */}
          <footer style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 24px 70px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 30, borderTop: "1px solid rgba(90,50,40,.14)" }}>
            <div style={{ maxWidth: 300, paddingTop: 30 }}>
              <div className="g" style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: 18, marginBottom: 12 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="" aria-hidden="true" style={{ width: 30, height: 30, objectFit: "contain" }} />MomentDrop
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "rgba(90,69,80,.7)" }}>Collect every guest&apos;s photos and videos with one QR scan. Scan. Drop. Remember.</p>
            </div>
            <div style={{ display: "flex", gap: 56, paddingTop: 30, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: ".1em", color: "#B5654A", marginBottom: 14 }}>Occasions</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 9, fontSize: 14.5 }}>
                  <a href="/use-cases/wedding">Weddings</a><a href="/use-cases/birthday">Birthdays</a><a href="/use-cases/party">Parties</a><a href="/use-cases/corporate">Corporate</a>
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: ".1em", color: "#B5654A", marginBottom: 14 }}>Product</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 9, fontSize: 14.5 }}>
                  <a href="#how">How it works</a><a href="/pricing">Pricing</a><a href="#faq">FAQ</a><a href="/contact">Contact</a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
