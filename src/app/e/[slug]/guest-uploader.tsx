"use client";

import { useRef, useState } from "react";
import CameraCapture from "./camera-capture";

const MAX_VIDEO_SECONDS = 60;
const VIDEO_LIMIT_LABEL = "1 minute";

type SignedFile = { originalFileName: string; sessionUri: string };
type Phase = "idle" | "uploading" | "done" | "error";

/** Read a video file's duration (seconds) via a throwaway <video> element. */
function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(v.duration || 0);
    };
    v.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("metadata"));
    };
    v.src = url;
  });
}

/** A stable per-device token kept in a cookie, so the per-guest cap survives renames. */
function getGuestToken(): string {
  const m = document.cookie.match(/(?:^|;\s*)md_guest=([^;]+)/);
  if (m) return decodeURIComponent(m[1]);
  const token =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : String(Math.random()).slice(2);
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; secure" : "";
  document.cookie =
    `md_guest=${encodeURIComponent(token)}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax` + secure;
  return token;
}

/** PUT the file straight to the Google Drive resumable session; returns the Drive file id. */
function uploadToDrive(
  file: File,
  sessionUri: string,
  onProgress: (fraction: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", sessionUri);
    if (file.type) xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const id = JSON.parse(xhr.responseText).id;
          if (id) return resolve(id);
        } catch {}
        reject(new Error("Upload succeeded but no file id returned"));
      } else {
        reject(new Error(`Upload failed (${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(file);
  });
}

export default function GuestUploader({
  eventSlug,
  albums = [],
  perGuestLimit = null,
}: {
  eventSlug: string;
  albums?: { id: string; title: string }[];
  perGuestLimit?: number | null;
}) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [albumId, setAlbumId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [pct, setPct] = useState(0);
  const [error, setError] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const busy = phase === "uploading";

  /** Append picked files; reject videos longer than the limit. */
  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files;
    e.target.value = "";
    if (!list || list.length === 0) return;

    const accepted: File[] = [];
    let tooLong = false;
    for (const f of Array.from(list)) {
      if (f.type.startsWith("video/")) {
        const dur = await getVideoDuration(f).catch(() => 0);
        if (dur > MAX_VIDEO_SECONDS + 0.7) {
          tooLong = true;
          continue;
        }
      }
      accepted.push(f);
    }
    if (accepted.length > 0) setFiles((prev) => [...prev, ...accepted]);
    setError(tooLong ? `Videos need to be under ${VIDEO_LIMIT_LABEL} — the longer clip wasn't added.` : "");
  }

  function addCaptured(captured: File[]) {
    if (captured.length > 0) setFiles((prev) => [...prev, ...captured]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Please enter your name.");
    if (files.length === 0) return setError("Choose at least one photo or video.");

    setPhase("uploading");
    setPct(0);
    const guestToken = getGuestToken();

    try {
      const signRes = await fetch("/api/upload/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSlug,
          guestName: name.trim(),
          guestToken,
          files: files.map((f) => ({ name: f.name, type: f.type, size: f.size })),
        }),
      });
      const signData = await signRes.json();
      if (!signRes.ok) throw new Error(signData.error ?? "Could not start upload.");

      const signed: SignedFile[] = signData.files;
      const total = files.length;
      const done: {
        driveFileId: string;
        originalFileName: string;
        mimeType: string;
        size: number;
      }[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const sgn = signed[i];
        const driveFileId = await uploadToDrive(file, sgn.sessionUri, (frac) => {
          setPct(Math.round(((i + frac) / total) * 100));
        });
        done.push({
          driveFileId,
          originalFileName: file.name,
          mimeType: file.type,
          size: file.size,
        });
        setPct(Math.round(((i + 1) / total) * 100));
      }

      const completeRes = await fetch("/api/upload/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSlug,
          guestName: name.trim(),
          guestToken,
          message: message.trim(),
          albumId,
          files: done,
        }),
      });
      const completeData = await completeRes.json();
      if (!completeRes.ok) throw new Error(completeData.error ?? "Could not save upload.");

      setPhase("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPhase("error");
    }
  }

  function reset() {
    setName("");
    setMessage("");
    setFiles([]);
    setPct(0);
    setError("");
    setPhase("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  if (phase === "done") {
    return (
      <div className="py-10 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#e6f2e8] text-3xl text-[#3b7a4f]">
          ✓
        </div>
        <h2 className="font-serif mt-5 text-2xl font-bold tracking-tight text-[#231a12]">
          Thank you
        </h2>
        <p className="mt-2 text-sm text-[#6f5c46]">
          {files.length === 1
            ? "Your memory is now in the album."
            : `Your ${files.length} memories are now in the album.`}
        </p>
        <button
          onClick={reset}
          className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#e0734f] text-base font-bold text-white transition hover:bg-[#cf6541]"
        >
          Add more photos
        </button>
      </div>
    );
  }

  const inputClass =
    "mt-2 h-12 w-full rounded-xl border border-[#e6d8c4] bg-[#fffdf9] px-4 text-base outline-none transition focus:border-[#e0734f] disabled:opacity-60";

  return (
    <>
      <CameraCapture
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onAdd={addCaptured}
        maxVideoSeconds={MAX_VIDEO_SECONDS}
      />
      <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block">
        <span className="text-sm font-semibold text-[#3a2c1e]">Your name</span>
        <input
          className={inputClass}
          placeholder="Name for the album"
          type="text"
          value={name}
          disabled={busy}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-[#3a2c1e]">Message (optional)</span>
        <textarea
          className="mt-2 min-h-24 w-full resize-none rounded-xl border border-[#e6d8c4] bg-[#fffdf9] px-4 py-3 text-base outline-none transition focus:border-[#e0734f] disabled:opacity-60"
          placeholder="A little note for the host"
          value={message}
          disabled={busy}
          onChange={(e) => setMessage(e.target.value)}
        />
      </label>

      {albums.length > 0 && (
        <label className="block">
          <span className="text-sm font-semibold text-[#3a2c1e]">Album</span>
          <select
            value={albumId}
            onChange={(e) => setAlbumId(e.target.value)}
            disabled={busy}
            className={inputClass}
          >
            <option value="">General</option>
            {albums.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
        </label>
      )}

      <div>
        <label className="grid min-h-40 cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-[#f0c3ab] bg-[#fdf5ef] px-4 text-center transition hover:border-[#e0734f]">
          <input
            ref={fileInputRef}
            multiple
            type="file"
            accept="image/*,video/*"
            className="sr-only"
            disabled={busy}
            onChange={handleFiles}
          />
          <span>
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#fbeadf] text-[#c26545]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6" aria-hidden="true">
                <path d="M12 15V4m0 0 4 4m-4-4-4 4M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="mt-3 block text-base font-semibold text-[#3a2c1e]">
              Tap to choose from your camera roll
            </span>
            <span className="mt-1 block text-xs text-[#a18e73]">
              JPG · PNG · HEIC · MP4 · MOV · up to 100MB each
            </span>
          </span>
        </label>

        <button
          type="button"
          onClick={() => setCameraOpen(true)}
          disabled={busy}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#e6d8c4] bg-white py-3.5 text-sm font-bold text-[#5c4a2e] transition hover:border-[#e0734f] hover:text-[#c85f3c] disabled:opacity-60"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5" aria-hidden="true">
            <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7H8l1-1.5h6L16 7h2.5A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5z" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12.5" r="3.2" />
          </svg>
          Take a photo or video
        </button>

        {files.length > 0 && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-[#3a2c1e]">
              {files.length} file{files.length === 1 ? "" : "s"} ready to share
            </span>
            <button
              type="button"
              onClick={() => setFiles([])}
              disabled={busy}
              className="text-xs font-bold text-[#c85f3c] hover:underline"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {!busy && perGuestLimit != null && (
        <div>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[#6f5c46]">Your uploads</span>
            <span className="text-[#c85f3c]">
              {Math.min(files.length, perGuestLimit)} of {perGuestLimit} selected
            </span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#f0e2d0]">
            <div
              className="h-full rounded-full bg-[#e0734f] transition-all"
              style={{ width: `${(Math.min(files.length, perGuestLimit) / perGuestLimit) * 100}%` }}
            />
          </div>
        </div>
      )}

      {busy && (
        <div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#f0e2d0]">
            <div className="h-full rounded-full bg-[#e0734f] transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-sm font-semibold text-[#c85f3c]">Uploading… {pct}%</p>
        </div>
      )}

      {error && (
        <p className="rounded-xl border border-[#e7c9c2] bg-[#fbf1ef] px-4 py-3 text-sm text-[#9a3b2b]">
          {error}
        </p>
      )}

      <button
        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#e0734f] text-base font-bold text-white transition hover:bg-[#cf6541] disabled:opacity-60"
        type="submit"
        disabled={busy}
      >
        {busy ? "Uploading…" : "Share your photos →"}
      </button>
      </form>
    </>
  );
}
