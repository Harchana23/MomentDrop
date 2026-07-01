import Link from "next/link";
import { Counter } from "./counter";

const COL_A = ["event-wedding", "gallery-1", "event-party", "gallery-6", "gallery-3", "event-corporate"];
const COL_B = ["gallery-4", "gallery-5", "testimonial", "event-festival", "hero", "gallery-2"];

const CONFETTI = [
  { l: "6%", t: "58%", c: "#e0734f", d: "4.2s", dl: "0s", w: 9 },
  { l: "15%", t: "80%", c: "#e8a33c", d: "5.1s", dl: ".6s", w: 7 },
  { l: "24%", t: "70%", c: "#c9738f", d: "4.6s", dl: "1.4s", w: 8 },
  { l: "45%", t: "84%", c: "#7fb2a1", d: "5.4s", dl: ".3s", w: 9 },
  { l: "53%", t: "64%", c: "#e0734f", d: "4.4s", dl: "2s", w: 7 },
  { l: "70%", t: "82%", c: "#e8a33c", d: "5s", dl: "1s", w: 8 },
  { l: "88%", t: "72%", c: "#c9738f", d: "4.8s", dl: ".9s", w: 7 },
  { l: "34%", t: "78%", c: "#7fb2a1", d: "5.2s", dl: "1.7s", w: 8 },
];

function Tile({ name, first }: { name: string; first?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`h-28 rounded-2xl bg-[#e3d3bd] bg-cover bg-center shadow-[0_8px_20px_rgba(80,50,20,0.12)] ${first ? "" : "mt-3"}`}
      style={{ backgroundImage: `url(/marketing/${name}.jpg)` }}
    />
  );
}

function Column({ files, anim }: { files: string[]; anim: string }) {
  const doubled = [...files, ...files];
  return (
    <div className={anim}>
      {doubled.map((f, i) => (
        <Tile key={i} name={f} first={i === 0} />
      ))}
    </div>
  );
}

export function JoyfulHero() {
  return (
    <section className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pt-14 md:grid-cols-2 md:pt-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {CONFETTI.map((c, i) => (
          <span
            key={i}
            className="md-conf"
            style={{
              left: c.l,
              top: c.t,
              width: c.w,
              height: c.w,
              background: c.c,
              animationDuration: c.d,
              animationDelay: c.dl,
            }}
          />
        ))}
      </div>

      <div className="relative">
        <span className="inline-block rounded-full bg-[#fbeadf] px-3 py-1.5 text-xs font-bold tracking-[0.08em] text-[#c85f3c]">
          🇲🇾 MADE FOR MALAYSIAN CELEBRATIONS
        </span>
        <h1 className="font-serif mt-4 text-5xl font-bold leading-[1.02] tracking-tight text-[#231a12] md:text-6xl">
          Every{" "}
          <span className="font-script text-6xl leading-none text-[#e0734f] md:text-7xl">joyful</span>{" "}
          moment, <span className="md-wig">🎉</span>
          <br className="hidden sm:block" /> in one place.
        </h1>
        <p className="mt-5 max-w-md text-lg font-medium leading-relaxed text-[#6f5c46]">
          Guests scan a QR — their photos pour in. Weddings, open houses, birthdays, company
          nights. No app, no fuss.
        </p>
        <div className="mt-7 flex items-center gap-3">
          <Link
            href="/signup"
            className="md-cta inline-flex h-12 items-center justify-center rounded-full bg-[#e0734f] px-7 text-base font-bold text-white hover:bg-[#cf6541]"
          >
            Create your event — free →
          </Link>
          <span className="text-xs font-semibold leading-tight text-[#8a755c]">
            No card
            <br />2 minutes
          </span>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <span className="tracking-[2px] text-[#e8a33c]">★★★★★</span>
          <span className="text-sm font-medium text-[#6f5c46]">
            <b className="text-[#231a12]">
              <Counter to={8412} />
            </b>{" "}
            moments collected
          </span>
        </div>
      </div>

      <div className="relative h-[380px] overflow-hidden rounded-3xl">
        <div className="absolute inset-0 grid grid-cols-2 gap-3">
          <div>
            <Column files={COL_A} anim="md-wallA" />
          </div>
          <div className="-mt-12">
            <Column files={COL_B} anim="md-wallB" />
          </div>
        </div>
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(#fbf6ee,transparent 12%,transparent 88%,#fbf6ee)" }}
        />
        <div className="md-chip absolute bottom-14 left-3 rounded-full border border-[#f0e2d0] bg-white px-3 py-1.5 text-xs font-bold text-[#3a2c1e] shadow-[0_10px_24px_rgba(80,50,20,0.16)]">
          📸 Aisyah added a photo
        </div>
        <div
          className="md-chip absolute bottom-4 right-3 rounded-full border border-[#f0e2d0] bg-white px-3 py-1.5 text-xs font-bold text-[#3a2c1e] shadow-[0_10px_24px_rgba(80,50,20,0.16)]"
          style={{ animationDelay: "2.5s" }}
        >
          🎥 Wei Jie added a video
        </div>
      </div>
    </section>
  );
}
