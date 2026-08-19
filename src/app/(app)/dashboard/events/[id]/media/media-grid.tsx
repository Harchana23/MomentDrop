"use client";

import { useState } from "react";
import { setUploadStatus } from "@/lib/uploads/actions";
import { DeleteUploadButton } from "@/components/delete-upload-button";

export type MediaItem = {
  id: string;
  guestName: string;
  originalFileName: string | null;
  mediaType: string | null;
  url: string | null;
  viewUrl: string | null;
};

function StatusForm({
  uploadId,
  eventId,
  status,
  label,
  primary,
}: {
  uploadId: string;
  eventId: string;
  status: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <form action={setUploadStatus}>
      <input type="hidden" name="uploadId" value={uploadId} />
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="status" value={status} />
      <button
        className={
          primary
            ? "h-9 rounded-full btn-grad px-4 text-xs font-bold text-white transition"
            : "h-9 rounded-full border border-[#E4D9CF] px-4 text-xs font-bold text-[#4A3540] transition hover:border-[#B5654A] hover:text-[#B5654A]"
        }
      >
        {label}
      </button>
    </form>
  );
}

export function MediaGrid({
  items,
  eventId,
  tab,
}: {
  items: MediaItem[];
  eventId: string;
  tab: string;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allSelected = items.length > 0 && selected.size === items.length;
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(items.map((i) => i.id)));

  const downloadSelected = () => {
    if (selected.size === 0) return;
    const ids = [...selected].join(",");
    // The export route returns the ZIP as an attachment, so this triggers the
    // download without navigating away.
    window.location.href = `/dashboard/events/${eventId}/export?ids=${encodeURIComponent(ids)}`;
  };

  return (
    <>
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={toggleAll}
          className="text-sm font-semibold text-[#B5654A] hover:underline"
        >
          {allSelected ? "Clear selection" : "Select all"}
        </button>
        <span className="text-sm text-[#7A6570]">
          {selected.size > 0 ? `${selected.size} selected` : "Tap the box to select"}
        </span>
      </div>

      {/* padding-bottom leaves room for the sticky bar so it never covers the last row */}
      <div className="mt-4 columns-2 gap-4 pb-24 sm:columns-3 lg:columns-4 [column-fill:_balance]">
        {items.map((u) => {
          const isSel = selected.has(u.id);
          return (
            <div
              key={u.id}
              className={`mb-4 break-inside-avoid overflow-hidden rounded-2xl glass transition ${
                isSel ? "ring-2 ring-[#B5654A]" : ""
              }`}
            >
              <div className="relative bg-[#EFE4D8]">
                <label
                  className="absolute left-2 top-2 z-10 grid h-8 w-8 cursor-pointer place-items-center rounded-lg border-2 border-white text-sm font-bold text-white shadow-sm"
                  style={{ background: isSel ? "#B5654A" : "rgba(42,27,36,0.45)" }}
                  aria-label={isSel ? "Deselect" : "Select"}
                >
                  <input
                    type="checkbox"
                    checked={isSel}
                    onChange={() => toggle(u.id)}
                    className="sr-only"
                  />
                  {isSel ? "✓" : ""}
                </label>
                <a href={u.viewUrl ?? "#"} target="_blank" rel="noreferrer" className="block">
                  {u.mediaType === "photo" && u.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.url} alt={u.originalFileName ?? "photo"} loading="lazy" className="w-full" />
                  ) : (
                    <span className="flex aspect-square w-full items-center justify-center text-xs font-semibold uppercase tracking-wide text-[#9B8676]">
                      {u.mediaType === "video" ? "▶ Video" : "File"}
                    </span>
                  )}
                </a>
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-bold">{u.guestName}</p>
                <p className="truncate text-xs text-[#7A6570]">{u.originalFileName ?? u.mediaType}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tab === "pending" && (
                    <StatusForm uploadId={u.id} eventId={eventId} status="published" label="Approve" primary />
                  )}
                  {tab === "hidden" ? (
                    <StatusForm uploadId={u.id} eventId={eventId} status="published" label="Restore" />
                  ) : (
                    <StatusForm uploadId={u.id} eventId={eventId} status="hidden" label="Hide" />
                  )}
                  <DeleteUploadButton uploadId={u.id} eventId={eventId} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#E4D9CF] bg-white/95 px-5 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <button
              onClick={() => setSelected(new Set())}
              className="text-sm font-semibold text-[#7A6570] hover:text-[#2A1B24]"
            >
              Clear
            </button>
            <button
              onClick={downloadSelected}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full btn-grad px-6 text-sm font-bold text-white"
            >
              ⬇ Download selected ({selected.size})
            </button>
          </div>
        </div>
      )}
    </>
  );
}
