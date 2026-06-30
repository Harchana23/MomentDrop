"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function ResetPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const { error } = await supabaseBrowser().auth.resetPasswordForEmail(email);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#fbfaf7] px-5 text-[#22211f]">
      <div className="w-full max-w-md border border-[#e1d8ca] bg-white p-7">
        <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
        {sent ? (
          <p className="mt-4 text-sm text-[#695b49]">
            Check your email for a reset link.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            {error && <p className="text-sm text-[#9a3b2b]">{error}</p>}
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="Email"
              className="h-12 w-full border border-[#d8cdbb] bg-[#fffdf9] px-4 outline-none focus:border-[#8f7245]"
            />
            <button className="h-12 w-full bg-[#1f1b16] text-base font-semibold text-white">
              Send reset link
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
