"use client";
import { useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { AuthVisual } from "@/components/auth-visual";

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
    <div className="grid lg:grid-cols-2">
      <AuthVisual
        eyebrow="No worries"
        headline={["Let's get you", "back in."]}
        sub="Enter your email and we'll send a link to reset your password."
      />

      {/* Form panel */}
      <div className="flex items-center justify-center px-5 py-16 md:py-24">
        <div className="w-full max-w-sm">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#B5654A]">MomentDrop</p>
          <h1 className="font-serif mt-2 text-4xl font-bold tracking-tight text-[#2A1B24]">
            Reset password
          </h1>

          {sent ? (
            <p className="mt-6 rounded-xl border border-[#cfe2d0] bg-[#eef4ec] px-4 py-3 text-sm text-[#3b7a4f]">
              Check your email for a reset link.
            </p>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-3">
              <p className="text-sm text-[#7A6570]">
                Enter the email you signed up with and we&apos;ll send a reset link.
              </p>
              {error && (
                <p className="rounded-xl border border-[#e7c9c2] bg-[#fbf1ef] px-4 py-3 text-sm text-[#9a3b2b]">
                  {error}
                </p>
              )}
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="Email"
                className="h-12 w-full rounded-xl border border-[#E4D9CF] bg-[#FFFBF6] px-4 text-base outline-none transition focus:border-[#B5654A]"
              />
              <button className="inline-flex h-12 w-full items-center justify-center rounded-full btn-grad text-base font-bold text-white transition">
                Send reset link
              </button>
            </form>
          )}

          <p className="mt-6 text-sm text-[#7A6570]">
            <Link href="/login" className="font-bold text-[#B5654A] hover:underline">
              ← Back to log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
