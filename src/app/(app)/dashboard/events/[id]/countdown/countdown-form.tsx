"use client";

import { useState } from "react";
import { saveCountdown } from "@/lib/events/countdown-actions";

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function CountdownForm({
  id,
  initial,
}: {
  id: string;
  initial: { enabled: boolean; title: string | null; until: string | null };
}) {
  const [enabled, setEnabled] = useState(initial.enabled);
  const [title, setTitle] = useState(initial.title ?? "");
  const [localDt, setLocalDt] = useState(toLocalInput(initial.until));
  const untilIso = localDt ? new Date(localDt).toISOString() : "";

  return (
    <form action={saveCountdown} className="mt-6 space-y-5 border border-[#eaddca] bg-white p-6">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="until" value={untilIso} />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">Enable countdown</p>
          <p className="mt-1 text-sm text-[#74664f]">
            Guests who open the link early see a countdown until the event goes live.
          </p>
        </div>
        <label className="relative inline-flex shrink-0 cursor-pointer items-center">
          <input
            type="checkbox"
            name="enabled"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="peer sr-only"
          />
          <span className="h-6 w-11 rounded-full bg-[#d3cabb] transition peer-checked:rounded-full bg-[#e0734f]" />
          <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5" />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-[#4a4035]">Countdown title</span>
        <input
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. The celebration begins in…"
          className="mt-2 h-12 w-full rounded-xl border border-[#e6d8c4] bg-[#fffdf9] px-4 outline-none focus:border-[#e0734f]"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-[#4a4035]">Goes live at (your local time)</span>
        <input
          type="datetime-local"
          value={localDt}
          onChange={(e) => setLocalDt(e.target.value)}
          className="mt-2 h-12 w-full rounded-xl border border-[#e6d8c4] bg-[#fffdf9] px-4 outline-none focus:border-[#e0734f]"
        />
      </label>

      <button className="h-11 rounded-full bg-[#e0734f] px-5 text-sm font-semibold text-white hover:bg-[#cf6541]">
        Save countdown
      </button>
    </form>
  );
}
