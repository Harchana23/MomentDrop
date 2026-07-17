"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- marketing page; CTAs full-nav to app routes is fine */

import { useEffect, useRef, useState } from "react";
import { OCCASIONS, SiteFooter } from "@/components/site-chrome";

/* ─────────── data ─────────── */

const PHOTOS = [
  // newly uploaded photos (Pexels)
  "pexels-aalap-creation-2158557916-35457633",
  "pexels-alivhi-29226150",
  "pexels-azman-aziz-114407020-10258456",
  "pexels-khidir-29532498",
  "pexels-muhammad-nashrullah-980011-30577483",
  "pexels-nguy-n-ti-n-th-nh-2150376175-33104577",
  "pexels-photographer-gyanu-1357219108-38259809",
  "pexels-rebornfilmes-31128695",
  "pexels-sadman-2058070",
  "pexels-silverkblack-36713489",
  "pexels-silverkblack-36729424",
  "pexels-simeart-30311769",
  "pexels-stockphotoartist-1094995",
  "pexels-thirdman-7652041",
  "pexels-tobiasbjorkli-13293704",
  "pexels-trungnguyenphotog-5096300",
  // original curated set
  "hero", "event-wedding", "event-party", "event-festival", "event-corporate",
  "gallery-1", "gallery-2", "gallery-3", "gallery-4", "gallery-5", "gallery-6", "testimonial",
  // Small, pre-blurred copies (/marketing/hero/*) — light to render as a big montage.
].map((n) => `/marketing/hero/${n}.jpg`);

// Full-bleed hero montage: cycle the (pre-blurred) photos into a big tile wall.
// Stride 5 (coprime with the pool) spreads variety so neighbours rarely repeat.
const WALL = Array.from({ length: 40 }, (_, i) => PHOTOS[(i * 5 + 3) % PHOTOS.length]);

const STEPS = [
  { n: "1", icon: "🎟️", title: "Create your event", body: "Sign up, name it, and get a QR code plus a link in seconds." },
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

/**
 * PLACEHOLDER testimonials — these are illustrative, not real customer quotes.
 * Replace with genuine, permissioned quotes before launch.
 */
const TESTIMONIALS = [
  {
    quote:
      "We got hundreds of photos we’d never have seen otherwise — the dance floor, the kids’ table, all of it. The QR on every table just worked.",
    name: "Aisyah & Daniel",
    event: "Wedding · KL",
  },
  {
    quote:
      "Letak QR atas setiap meja, tetamu scan terus upload — tak payah install apa-apa. Lepas majlis, download semua jadi satu ZIP. Tak payah kejar orang dalam group WhatsApp dah.",
    name: "Nurul H.",
    event: "Majlis kahwin · Shah Alam",
  },
  {
    quote:
      "Last time we chase people in the group chat for photos one, damn leceh. This one just scan lah, then everything also inside already. Got 300+ photos in one ZIP.",
    name: "Wei Ling T.",
    event: "21st birthday · PJ",
  },
  {
    quote:
      "Aiyo, my relatives all not so tech-savvy one, but no app to install so they also can manage. I switch on the approval first ah, so I check before anything shows up.",
    name: "Kavitha R.",
    event: "Deepavali open house · Klang",
  },
  {
    quote:
      "Put the live photo wall on the big screen at our annual dinner and people actually started uploading — before this nobody bothered. Setup took about two minutes.",
    name: "Daniel L.",
    event: "Company annual dinner · KL",
  },
];

/* ─────────── reusable style bits ─────────── */
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

    /* preloader */
    const bar = q<HTMLElement>("[data-loadbar]");
    const txt = q<HTMLElement>("[data-loadtext]");
    const msgs = ["Gathering moments…", "Adding sparkle…", "Arranging photos…", "Almost there…"];
    const DUR = 1900; const start = Date.now(); let mi = -1, done = false;
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
    timers.pt = setTimeout(hide, 3000);
    const onVis = () => { if (!document.hidden) hide(); };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onVis);

    /* scroll reveals (cheap: one class toggle per element, then unobserved) */
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    qa<HTMLElement>(".ih-rv").forEach((el, i) => {
      el.style.transitionDelay = (Math.min(i % 6, 5) * 70) + "ms";
      if (reduce || el.getBoundingClientRect().top < window.innerHeight * 0.94) el.classList.add("in");
      else io.observe(el);
    });

    return () => {
      if (timers.pi) clearInterval(timers.pi);
      if (timers.pt) clearTimeout(timers.pt);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onVis);
      io.disconnect();
    };
  }, []);

  return (
    <>
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
        .ih .ih-rv { opacity: 0; transform: translateY(40px); transition: opacity 1s cubic-bezier(.2,.7,.2,1), transform 1s cubic-bezier(.2,.7,.2,1); }
        .ih .ih-rv.in { opacity: 1; transform: none; }
        .ih details summary::-webkit-details-marker { display: none; }
        .ih details[open] summary span.ih-plus { transform: rotate(45deg); }
        @media (max-width: 860px) { .ih .how-grid { grid-template-columns: 1fr !important; justify-items: center; } }

        /* Testimonials marquee — loops seamlessly, pauses on hover/focus.
           Cards carry their own right margin (not a flex gap) so one full set
           is exactly 50% of the track and translateX(-50%) lands seamlessly. */
        .ih .tmarquee {
          overflow: hidden;
          -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%);
          mask-image: linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%);
        }
        .ih .tmarquee-track { display: flex; width: max-content; animation: t-scroll 60s linear infinite; }
        .ih .tmarquee:hover .tmarquee-track,
        .ih .tmarquee:focus-within .tmarquee-track { animation-play-state: paused; }
        @keyframes t-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        /* every card the same width, or the loop maths stops landing cleanly */
        .ih .tcard { flex: 0 0 400px; }
        @media (max-width: 520px) { .ih .tcard { flex: 0 0 84vw; } }

        @media (prefers-reduced-motion: reduce) {
          .ih .ih-rv { opacity: 1; transform: none; transition: none; }
          .ih .tmarquee { overflow-x: auto; -webkit-mask-image: none; mask-image: none; }
          .ih .tmarquee-track { animation: none; }
        }

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

      {/* ambient glows (static) */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-15%", left: "50%", transform: "translateX(-50%)", width: "70vw", height: "55vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(243,183,160,.6), transparent 62%)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "-20%", right: "-12%", width: "55vw", height: "55vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(232,184,92,.5), transparent 62%)", filter: "blur(80px)" }} />
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

        {/* HERO — full-bleed photo montage behind a clear title layer */}
        <section style={{ position: "relative", minHeight: "94vh", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", padding: "132px 24px 88px" }}>
          {/* montage wall (behind) */}
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(clamp(150px, 17vw, 250px), 1fr))", gridAutoRows: "min-content", gap: 10, padding: 10, alignContent: "start" }}>
            {WALL.map((img, i) => (
              <div key={i} style={{ aspectRatio: "1", borderRadius: 16, backgroundImage: `url(${img})`, backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "#E4D3BF", boxShadow: "0 18px 40px -26px rgba(90,50,40,.5)" }} />
            ))}
          </div>
          {/* scrim so the title reads clearly in front */}
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 1, background: "radial-gradient(125% 88% at 50% 44%, rgba(244,236,227,.94) 0%, rgba(244,236,227,.74) 30%, rgba(244,236,227,.32) 60%, rgba(244,236,227,.04) 100%)" }} />
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(to bottom, rgba(244,236,227,.35) 0%, transparent 20%, transparent 72%, rgba(244,236,227,.95) 100%)" }} />

          {/* content (in front) */}
          <div style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: 940 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 100, background: "rgba(255,255,255,.6)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,.75)", fontWeight: 700, fontSize: 12.5, letterSpacing: ".12em", textTransform: "uppercase", color: "#B5654A", marginBottom: 26 }}>🇲🇾 Made for Malaysian celebrations</div>
            <h1 className="g" style={{ margin: 0, fontWeight: 700, fontSize: "clamp(44px,8vw,124px)", lineHeight: 0.92, letterSpacing: "-.03em" }}>
              Every photo, from<br /><span style={{ background: "linear-gradient(100deg,#C97F52,#B5654A)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>every guest.</span>
            </h1>
            <p style={{ margin: "26px auto 0", maxWidth: "46ch", fontSize: "clamp(16px,1.9vw,20px)", lineHeight: 1.55, color: "rgba(74,53,64,.92)", fontWeight: 500 }}>
              Put a QR code on every table. Guests scan and their photos and videos flow straight into your private album — no app, no account.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "center", marginTop: 34 }}>
              <a href="/signup" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "17px 34px", borderRadius: 100, fontWeight: 700, fontSize: 17, color: "#fff", background: "linear-gradient(135deg,#C97F52,#B5654A)", boxShadow: "0 18px 50px -12px rgba(201,127,82,.5)" }}>Create your event — free →</a>
              <a href="#how" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "17px 28px", borderRadius: 100, fontWeight: 700, fontSize: 16, color: "#8F4A34", background: "rgba(255,255,255,.6)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,.8)" }}>See how it works</a>
            </div>
            <div style={{ marginTop: 18, fontSize: 13.5, fontWeight: 600, color: "rgba(90,69,80,.72)" }}>No app · no account · free to start</div>
          </div>
        </section>

        <div className="dv-body">
          {/* HOW IT WORKS — compact, no scroll-jacking */}
          <section id="how" style={{ maxWidth: 1150, margin: "0 auto", padding: "80px 24px 100px" }}>
            <div className="ih-rv" style={{ textAlign: "center", marginBottom: 56 }}>
              <div style={{ ...eyebrow, marginBottom: 14 }}>How it works</div>
              <h2 className="g" style={h2Style}>From QR to shared album</h2>
            </div>
            <div className="how-grid" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 64, alignItems: "center" }}>
              {/* steps */}
              <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                {STEPS.map((s) => (
                  <div key={s.n} className="ih-rv" style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                    <div className="g" style={{ flex: "none", width: 52, height: 52, borderRadius: 16, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 22, color: "#fff", background: "linear-gradient(135deg,#C97F52,#B5654A)", boxShadow: "0 14px 30px -14px rgba(201,127,82,.7)" }}>{s.n}</div>
                    <div>
                      <h3 style={{ margin: "3px 0 6px", fontSize: 21, fontWeight: 700 }}>{s.icon} {s.title}</h3>
                      <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: "rgba(90,69,80,.8)", maxWidth: "42ch" }}>{s.body}</p>
                    </div>
                  </div>
                ))}
                <a href="/signup" style={{ alignSelf: "flex-start", marginTop: 10, display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 100, fontWeight: 700, fontSize: 16, color: "#fff", background: "linear-gradient(135deg,#C97F52,#B5654A)" }}>Create your event — free →</a>
              </div>

              {/* phone mockup showing the real MomentDrop screens */}
              <div className="how-phone ih-rv" style={{ justifySelf: "center" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/marketing/PhoneMockup.png"
                  alt="Two phones showing MomentDrop — the event homepage and a guest's upload page"
                  width={900}
                  height={900}
                  style={{ width: 460, maxWidth: "100%", height: "auto", display: "block" }}
                />
              </div>
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

          {/* TESTIMONIALS */}
          <section style={{ padding: "20px 0 110px" }}>
            <div className="ih-rv" style={{ textAlign: "center", marginBottom: 44, padding: "0 24px" }}>
              <div style={{ ...eyebrow, marginBottom: 14 }}>From our hosts</div>
              <h2 className="g" style={h2Style}>What they say</h2>
            </div>

            <div className="tmarquee ih-rv">
              <div className="tmarquee-track">
                {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                  <figure
                    key={i}
                    className="tcard"
                    /* the duplicate set is decorative — don't read it twice */
                    aria-hidden={i >= TESTIMONIALS.length}
                    style={{ display: "flex", flexDirection: "column", margin: "0 20px 0 0", padding: 30, borderRadius: 20, ...glassSm }}
                  >
                    <blockquote style={{ margin: 0, fontSize: 16, lineHeight: 1.65, color: "rgba(90,69,80,.9)" }}>
                      “{t.quote}”
                    </blockquote>
                    <figcaption style={{ marginTop: "auto", paddingTop: 18, borderTop: "1px solid rgba(90,50,40,.1)" }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#2A1B24" }}>{t.name}</div>
                      <div style={{ fontSize: 13, color: "#B5654A" }}>{t.event}</div>
                    </figcaption>
                  </figure>
                ))}
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

        </div>
      </div>
    </div>
    <SiteFooter />
    </>
  );
}
