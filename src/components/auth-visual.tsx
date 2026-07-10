const COL_A = ["event-wedding", "gallery-1", "event-party", "gallery-6", "gallery-3"];
const COL_B = ["gallery-4", "gallery-5", "event-festival", "hero", "gallery-2"];

function PhotoColumn({ files, anim }: { files: string[]; anim: string }) {
  const doubled = [...files, ...files];
  return (
    <div className={anim} aria-hidden="true">
      {doubled.map((f, i) => (
        <div
          key={i}
          className="mb-4 h-44 rounded-2xl bg-[#E4D3BF] bg-cover bg-center shadow-[0_10px_30px_rgba(90,50,40,0.25)]"
          style={{ backgroundImage: `url(/marketing/${f}.jpg)` }}
        />
      ))}
    </div>
  );
}

/** The drifting photo-wall + brand story panel shared across auth pages. */
export function AuthVisual({
  eyebrow = "Welcome to",
  headline = ["Every joyful moment,", "in one place."],
  sub = "Collect every guest's photos and videos with one QR scan — no app, no account.",
}: {
  eyebrow?: string;
  headline?: string[];
  sub?: string;
}) {
  return (
    <div className="relative hidden min-h-[660px] overflow-hidden lg:block">
      <div className="absolute inset-0 grid grid-cols-2 gap-4 p-4">
        <PhotoColumn files={COL_A} anim="md-wallA" />
        <div className="-mt-16">
          <PhotoColumn files={COL_B} anim="md-wallB" />
        </div>
      </div>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(155deg, rgba(224,115,79,0.85) 0%, rgba(150,64,32,0.78) 52%, rgba(35,26,18,0.92) 100%)",
        }}
      />
      <div className="relative flex h-full flex-col justify-end p-10 text-white xl:p-14">
        <p className="font-script text-3xl text-[#ffd9c2]">{eyebrow}</p>
        <h2 className="font-serif mt-1 text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
          {headline.map((line, i) => (
            <span key={i}>
              {line}
              {i < headline.length - 1 && <br />}
            </span>
          ))}
        </h2>
        <p className="mt-4 max-w-sm text-white/85">{sub}</p>
        <div className="mt-6 flex items-center gap-3">
          <span className="tracking-[2px] text-[#ffca7a]">★★★★★</span>
          <span className="text-sm font-medium text-white/85">Loved by Malaysian celebrations</span>
        </div>
      </div>
    </div>
  );
}
