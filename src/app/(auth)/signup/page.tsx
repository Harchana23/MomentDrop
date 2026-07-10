import Link from "next/link";
import { signUpEmail, signInGoogle } from "@/lib/auth/actions";
import { AuthVisual } from "@/components/auth-visual";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const inputClass =
    "h-12 w-full rounded-xl border border-[#E4D9CF] bg-[#FFFBF6] px-4 text-base outline-none transition focus:border-[#B5654A]";

  return (
    <div className="grid lg:grid-cols-2">
      <AuthVisual
        eyebrow="Start collecting"
        headline={["Every guest's photos,", "in one album."]}
        sub="Create an event, share a QR code, and watch the memories roll in. Your first event is free."
      />

      {/* Form panel */}
      <div className="flex items-center justify-center px-5 py-16 md:py-24">
        <div className="w-full max-w-sm">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#B5654A]">MomentDrop</p>
          <h1 className="font-serif mt-2 text-4xl font-bold tracking-tight text-[#2A1B24]">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-[#7A6570]">Start collecting in two minutes — no card needed.</p>

          {sp.error && (
            <p className="mt-5 rounded-xl border border-[#e7c9c2] bg-[#fbf1ef] px-4 py-3 text-sm text-[#9a3b2b]">
              {sp.error}
            </p>
          )}

          <form action={signUpEmail} className="mt-6 space-y-3">
            <input name="full_name" type="text" required placeholder="Your name" className={inputClass} />
            <input name="email" type="email" required placeholder="Email" className={inputClass} />
            <input
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="Password (8+ characters)"
              className={inputClass}
            />
            <button className="inline-flex h-12 w-full items-center justify-center rounded-full btn-grad text-base font-bold text-white transition">
              Create account
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-[#9B8676]">
            <span className="h-px flex-1 bg-[#E4D9CF]" /> or <span className="h-px flex-1 bg-[#E4D9CF]" />
          </div>

          <form action={signInGoogle}>
            <button className="inline-flex h-12 w-full items-center justify-center rounded-full border border-[#E4D9CF] text-base font-bold text-[#3a3127] transition hover:border-[#B5654A]">
              Continue with Google
            </button>
          </form>

          <p className="mt-6 text-sm text-[#7A6570]">
            Have an account?{" "}
            <Link href="/login" className="font-bold text-[#B5654A] hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
