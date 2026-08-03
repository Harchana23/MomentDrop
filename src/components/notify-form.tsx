"use client";

import { useState } from "react";

/**
 * "Notify me" for a coming-soon feature. Posts the email to /api/waitlist, which
 * forwards it to the same Make.com inbox as the contact form. Styled for the dark
 * teaser bands (light text on a translucent field).
 */
export default function NotifyForm({ feature }: { feature: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "busy") return;
    setState("busy");
    setMsg("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, feature }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setState("done");
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (state === "done") {
    return (
      <p className="mx-auto mt-6 max-w-sm text-sm font-semibold text-[#FBF3EC]">
        You&apos;re on the list — we&apos;ll email you the moment it&apos;s ready. 🎉
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-7 flex max-w-md flex-col gap-2 sm:flex-row">
      <label className="sr-only" htmlFor={`notify-${feature}`}>
        Email address
      </label>
      <input
        id={`notify-${feature}`}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className="h-12 flex-1 rounded-full border border-white/25 bg-white/10 px-5 text-sm text-[#FBF3EC] outline-none placeholder:text-[#FBF3EC]/50 focus:border-white/60"
      />
      <button
        type="submit"
        disabled={state === "busy"}
        className="inline-flex h-12 items-center justify-center rounded-full bg-[#FBF3EC] px-6 text-sm font-bold text-[#2A1B24] transition hover:bg-white disabled:opacity-60"
      >
        {state === "busy" ? "…" : "Notify me"}
      </button>
      {state === "error" && (
        <span className="w-full text-center text-xs text-[#f4c9bd] sm:text-left" role="alert">
          {msg}
        </span>
      )}
    </form>
  );
}
