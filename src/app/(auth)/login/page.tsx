import Link from "next/link";
import { signInEmail, signInGoogle } from "@/lib/auth/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const sp = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center bg-[#fbfaf7] px-5 text-[#22211f]">
      <div className="w-full max-w-md border border-[#e1d8ca] bg-white p-7 shadow-[0_24px_80px_rgba(70,55,35,0.12)]">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#7f6a46]">
          MomentDrop
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Welcome back</h1>
        {sp.error && (
          <p className="mt-4 border border-[#e7c9c2] bg-[#fbf1ef] px-4 py-3 text-sm text-[#9a3b2b]">
            {sp.error}
          </p>
        )}
        <form action={signInEmail} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={sp.next ?? "/dashboard"} />
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className="h-12 w-full border border-[#d8cdbb] bg-[#fffdf9] px-4 outline-none focus:border-[#8f7245]"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Password"
            className="h-12 w-full border border-[#d8cdbb] bg-[#fffdf9] px-4 outline-none focus:border-[#8f7245]"
          />
          <button className="h-12 w-full bg-[#1f1b16] text-base font-semibold text-white hover:bg-[#3a3127]">
            Log in
          </button>
        </form>
        <form action={signInGoogle} className="mt-3">
          <button className="h-12 w-full border border-[#d8cdbb] text-base font-semibold text-[#3a3127] hover:border-[#8f7245]">
            Continue with Google
          </button>
        </form>
        <p className="mt-5 text-sm text-[#695b49]">
          No account?{" "}
          <Link href="/signup" className="font-semibold text-[#5c4a2e] underline">
            Sign up
          </Link>
          <span className="mx-2">·</span>
          <Link href="/auth/reset" className="text-[#5c4a2e] underline">
            Forgot password
          </Link>
        </p>
      </div>
    </main>
  );
}
