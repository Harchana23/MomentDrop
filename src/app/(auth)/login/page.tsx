import Link from "next/link";
import { signInEmail, signInGoogle } from "@/lib/auth/actions";

const COL_A = ["event-wedding", "gallery-1", "event-party", "gallery-6", "gallery-3"];
const COL_B = ["gallery-4", "gallery-5", "event-festival", "hero", "gallery-2"];

function PhotoColumn({ files, anim }: { files: string[]; anim: string }) {
  const doubled = [...files, ...files];
  return (
    <div className={anim} aria-hidden="true">
      {doubled.map((f, i) => (
        <div
          key={i}
          className="mb-4 h-44 rounded-2xl bg-[#e3d3bd] bg-cover bg-center shadow-[0_10px_30px_rgba(80,50,20,0.25)]"
          style={{ backgroundImage: `url(/marketing/${f}.jpg)` }}
        />
      ))}
    </div>
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const sp = await searchParams;
  const inputClass =
    "h-12 w-full rounded-xl border border-[#e6d8c4] bg-[#fffdf9] px-4 text-base outline-none transition focus:border-[#e0734f]";

  return (
    <div className="grid lg:grid-cols-2">
      {/* Visual panel */}
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
          <p className="font-script text-3xl text-[#ffd9c2]">Welcome to</p>
          <h2 className="font-serif mt-1 text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
            Every joyful moment,
            <br />
            in one place.
          </h2>
          <p className="mt-4 max-w-sm text-white/85">
            Collect every guest&apos;s photos and videos with one QR scan — no app, no account.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <span className="tracking-[2px] text-[#ffca7a]">★★★★★</span>
            <span className="text-sm font-medium text-white/85">Loved by Malaysian celebrations</span>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-5 py-16 md:py-24">
        <div className="w-full max-w-sm">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#c85f3c]">MomentDrop</p>
          <h1 className="font-serif mt-2 text-4xl font-bold tracking-tight text-[#231a12]">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-[#6f5c46]">
            Log in to manage your events, albums, and downloads.
          </p>

          {sp.error && (
            <p className="mt-5 rounded-xl border border-[#e7c9c2] bg-[#fbf1ef] px-4 py-3 text-sm text-[#9a3b2b]">
              {sp.error}
            </p>
          )}

          <form action={signInEmail} className="mt-6 space-y-3">
            <input type="hidden" name="next" value={sp.next ?? "/dashboard"} />
            <input name="email" type="email" required placeholder="Email" className={inputClass} />
            <input
              name="password"
              type="password"
              required
              placeholder="Password"
              className={inputClass}
            />
            <button className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#e0734f] text-base font-bold text-white transition hover:bg-[#cf6541]">
              Log in
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-[#a18e73]">
            <span className="h-px flex-1 bg-[#e6ddcf]" /> or <span className="h-px flex-1 bg-[#e6ddcf]" />
          </div>

          <form action={signInGoogle}>
            <button className="inline-flex h-12 w-full items-center justify-center rounded-full border border-[#d8cdbb] text-base font-bold text-[#3a3127] transition hover:border-[#e0734f]">
              Continue with Google
            </button>
          </form>

          <p className="mt-6 text-sm text-[#6f5c46]">
            No account?{" "}
            <Link href="/signup" className="font-bold text-[#c85f3c] hover:underline">
              Sign up
            </Link>
            <span className="mx-2 text-[#c9b597]">·</span>
            <Link href="/auth/reset" className="font-semibold text-[#8a755c] hover:underline">
              Forgot password
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
