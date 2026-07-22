"use client";

import { useState } from "react";
import { saveWallSettings } from "@/lib/events/wall-actions";
import type { WallSettings } from "@/lib/events/wall-settings";

function Toggle({
  name,
  label,
  hint,
  defaultOn,
}: {
  name: string;
  label: string;
  hint: string;
  defaultOn: boolean;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-start justify-between gap-4 border-t border-[#E4D9CF] pt-4 first:border-0 first:pt-0">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="mt-1 text-sm text-[#7A6570]">{hint}</p>
      </div>
      <label className="relative inline-flex shrink-0 cursor-pointer items-center">
        <input
          type="checkbox"
          name={name}
          checked={on}
          onChange={(e) => setOn(e.target.checked)}
          className="peer sr-only"
        />
        <span className="h-6 w-11 rounded-full bg-[#d3cabb] transition peer-checked:btn-grad" />
        <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5" />
      </label>
    </div>
  );
}

const selectClass =
  "mt-2 h-12 w-full rounded-xl border border-[#E4D9CF] bg-[#FFFBF6] px-4 outline-none focus:border-[#B5654A]";

export default function WallForm({ id, initial }: { id: string; initial: WallSettings }) {
  const [slideMs, setSlideMs] = useState(initial.slideMs);

  return (
    <form action={saveWallSettings} className="mt-6 space-y-6">
      <input type="hidden" name="id" value={id} />

      <section className="space-y-5 glass p-6">
        <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[#B5654A]">Playback</h2>

        <label className="block">
          <span className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-[#4A3540]">Time on each photo</span>
            <span className="text-sm font-bold tabular-nums text-[#2A1B24]">
              {(slideMs / 1000).toFixed(0)}s
            </span>
          </span>
          <input
            type="range"
            name="slide_ms"
            min={3000}
            max={30000}
            step={1000}
            value={slideMs}
            onChange={(e) => setSlideMs(Number(e.target.value))}
            className="mt-3 w-full accent-[#B5654A]"
          />
          <span className="mt-1 flex justify-between text-xs text-[#9B8676]">
            <span>3s — busy events</span>
            <span>30s — few photos</span>
          </span>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-[#4A3540]">Transition</span>
          <select name="transition" defaultValue={initial.transition} className={selectClass}>
            <option value="fade">Fade</option>
            <option value="slide">Slide</option>
            <option value="none">None</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-[#4A3540]">Photo order</span>
          <select name="order" defaultValue={initial.order} className={selectClass}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="shuffle">Shuffle</option>
          </select>
        </label>

        <Toggle
          name="jump_to_new"
          label="Jump to new photos"
          hint="When a guest uploads, show it straight away. Seeing their photo hit the screen is what makes people keep uploading."
          defaultOn={initial.jumpToNew}
        />
      </section>

      <section className="space-y-4 glass p-6">
        <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[#B5654A]">On screen</h2>
        <Toggle
          name="show_name"
          label="Show guest name"
          hint="Credit whoever took the photo, under each one."
          defaultOn={initial.showName}
        />
        <Toggle
          name="show_title"
          label="Show event name"
          hint="Your event title in the corner."
          defaultOn={initial.showTitle}
        />
        <Toggle
          name="show_qr"
          label="Show join QR code"
          hint="A small QR in the corner so anyone watching can scan and upload — without being told how."
          defaultOn={initial.showQr}
        />
      </section>

      <section className="space-y-4 glass p-6">
        <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[#B5654A]">Display</h2>

        <label className="block">
          <span className="text-sm font-medium text-[#4A3540]">Photo fit</span>
          <select name="fit" defaultValue={initial.fit} className={selectClass}>
            <option value="contain">Fit whole photo</option>
            <option value="cover">Fill the screen (crops edges)</option>
          </select>
        </label>

        <Toggle
          name="blur_bg"
          label="Blurred backdrop"
          hint="Fills the space around portrait photos with a soft blur instead of flat black. Only applies when fitting the whole photo."
          defaultOn={initial.blurBg}
        />
      </section>

      <button className="h-11 rounded-full btn-grad px-5 text-sm font-semibold text-white">
        Save wall settings
      </button>
    </form>
  );
}
