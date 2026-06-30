"use client";

import { useRef, useState } from "react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

type SignedFile = { originalFileName: string; path: string; token: string };
type Phase = "idle" | "uploading" | "done" | "error";

function uploadToSignedUrl(
  file: File,
  bucket: string,
  signed: SignedFile,
  onProgress: (fraction: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const endpoint =
      `${SUPABASE_URL}/storage/v1/object/upload/sign/${bucket}/` +
      `${signed.path}?token=${encodeURIComponent(signed.token)}`;
    const form = new FormData();
    form.append("cacheControl", "3600");
    form.append("", file, signed.originalFileName);

    const xhr = new XMLHttpRequest();
    xhr.open("PUT", endpoint);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed (${xhr.status})`));
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(form);
  });
}

export default function GuestUploader({
  eventSlug,
  albums = [],
}: {
  eventSlug: string;
  albums?: { id: string; title: string }[];
}) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [albumId, setAlbumId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [pct, setPct] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const busy = phase === "uploading";

  function pickFiles(list: FileList | null) {
    setFiles(list ? Array.from(list) : []);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Please enter your name.");
    if (files.length === 0) return setError("Choose at least one photo or video.");

    setPhase("uploading");
    setPct(0);

    try {
      const signRes = await fetch("/api/upload/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSlug,
          guestName: name.trim(),
          files: files.map((f) => ({ name: f.name, type: f.type, size: f.size })),
        }),
      });
      const signData = await signRes.json();
      if (!signRes.ok) throw new Error(signData.error ?? "Could not start upload.");

      const signed: SignedFile[] = signData.files;
      const bucket: string = signData.bucket;
      const total = files.length;
      const done: {
        storagePath: string;
        originalFileName: string;
        mimeType: string;
        size: number;
      }[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const sgn = signed[i];
        await uploadToSignedUrl(file, bucket, sgn, (frac) => {
          setPct(Math.round(((i + frac) / total) * 100));
        });
        done.push({
          storagePath: sgn.path,
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
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#eef4ec] text-2xl text-[#3b7a4f]">
          ✓
        </div>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight">Thank you!</h2>
        <p className="mt-2 text-sm text-[#695b49]">
          Your {files.length} {files.length === 1 ? "memory is" : "memories are"} in the
          couple&apos;s album.
        </p>
        <button
          onClick={reset}
          className="mt-7 h-12 w-full bg-[#1f1b16] px-5 text-base font-semibold text-white transition hover:bg-[#3a3127]"
        >
          Add more
        </button>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <label className="block">
        <span className="text-sm font-medium text-[#4a4035]">Your name</span>
        <input
          className="mt-2 h-12 w-full border border-[#d8cdbb] bg-[#fffdf9] px-4 text-base outline-none transition focus:border-[#8f7245] disabled:opacity-60"
          placeholder="Name for the album"
          type="text"
          value={name}
          disabled={busy}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-[#4a4035]">Message (optional)</span>
        <textarea
          className="mt-2 min-h-24 w-full resize-none border border-[#d8cdbb] bg-[#fffdf9] px-4 py-3 text-base outline-none transition focus:border-[#8f7245] disabled:opacity-60"
          placeholder="A note for the couple"
          value={message}
          disabled={busy}
          onChange={(e) => setMessage(e.target.value)}
        />
      </label>

      {albums.length > 0 && (
        <label className="block">
          <span className="text-sm font-medium text-[#4a4035]">Album</span>
          <select
            value={albumId}
            onChange={(e) => setAlbumId(e.target.value)}
            disabled={busy}
            className="mt-2 h-12 w-full border border-[#d8cdbb] bg-[#fffdf9] px-4 text-base outline-none transition focus:border-[#8f7245] disabled:opacity-60"
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

      <label className="grid min-h-40 cursor-pointer place-items-center border border-dashed border-[#bda77f] bg-[#fbf7ef] px-4 text-center transition hover:border-[#8f7245]">
        <input
          ref={fileInputRef}
          multiple
          type="file"
          accept="image/*,video/*"
          className="sr-only"
          disabled={busy}
          onChange={(e) => pickFiles(e.target.files)}
        />
        <span>
          <span className="block text-base font-semibold text-[#3a3127]">
            {files.length > 0
              ? `${files.length} file${files.length === 1 ? "" : "s"} selected`
              : "Choose photos or videos"}
          </span>
          <span className="mt-2 block text-sm text-[#7a6b58]">
            JPG, PNG, HEIC, MP4, MOV · up to 50MB each
          </span>
        </span>
      </label>

      {busy && (
        <div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#eee7dc]">
            <div className="h-full bg-[#8d7147] transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-sm text-[#7a6b58]">Uploading… {pct}%</p>
        </div>
      )}

      {error && (
        <p className="border border-[#e7c9c2] bg-[#fbf1ef] px-4 py-3 text-sm text-[#9a3b2b]">
          {error}
        </p>
      )}

      <button
        className="h-13 w-full bg-[#1f1b16] px-5 py-3 text-base font-semibold text-white transition hover:bg-[#3a3127] disabled:opacity-60"
        type="submit"
        disabled={busy}
      >
        {busy ? "Uploading…" : "Upload memories"}
      </button>
    </form>
  );
}
