"use client";

import { useEffect, useRef, useState } from "react";

type Shot = { id: number; file: File; url: string; type: "photo" | "video" };
type Review = { shot: Shot; mode: "new" | "saved" };

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** In-app camera (Instagram/Snapchat style): live preview, snap photos, record
 *  video with auto-stop, review each shot (play videos) and Keep or Discard,
 *  then add the kept shots to the upload. */
export default function CameraCapture({
  open,
  onClose,
  onAdd,
  maxVideoSeconds = 60,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (files: File[]) => void;
  maxVideoSeconds?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const counterRef = useRef(0);

  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [shots, setShots] = useState<Shot[]>([]);
  const [review, setReview] = useState<Review | null>(null);
  const [error, setError] = useState("");

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  useEffect(() => {
    if (!open) return;
    let active = true;
    async function start() {
      setError("");
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("unsupported");
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing }, audio: true });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing } });
        }
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
      } catch {
        setError("Couldn't open the camera. Allow camera access, or add photos from your roll instead.");
      }
    }
    start();
    return () => {
      active = false;
      stopStream();
    };
  }, [open, facing]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopStream();
    };
  }, []);

  function openReview(file: File, type: "photo" | "video") {
    const id = counterRef.current;
    const url = URL.createObjectURL(file);
    setReview({ shot: { id, file, url, type }, mode: "new" });
  }

  function capturePhoto() {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        openReview(new File([blob], `photo-${++counterRef.current}.jpg`, { type: "image/jpeg" }), "photo");
      },
      "image/jpeg",
      0.9,
    );
  }

  function pickMime(): string {
    const cands = ["video/mp4", "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
    for (const c of cands) {
      if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(c)) return c;
    }
    return "";
  }

  function stopRecording() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
    recorderRef.current = null;
    setRecording(false);
  }

  function startRecording() {
    const stream = streamRef.current;
    if (!stream) return;
    const mime = pickMime();
    chunksRef.current = [];
    let rec: MediaRecorder;
    try {
      rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 2_500_000 } : undefined);
    } catch {
      setError("Video recording isn't supported on this device — try a photo.");
      return;
    }
    rec.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };
    rec.onstop = () => {
      const type = rec.mimeType || mime || "video/webm";
      const ext = type.includes("mp4") ? "mp4" : "webm";
      openReview(new File([new Blob(chunksRef.current, { type })], `video-${++counterRef.current}.${ext}`, { type }), "video");
    };
    recorderRef.current = rec;
    rec.start();
    setRecording(true);
    setElapsed(0);
    timerRef.current = setInterval(() => {
      setElapsed((s) => {
        const next = s + 1;
        if (next >= maxVideoSeconds) stopRecording();
        return next;
      });
    }, 1000);
  }

  function downloadShot(shot: Shot) {
    const a = document.createElement("a");
    a.href = shot.url;
    a.download = shot.file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function keepPending() {
    if (!review) return;
    setShots((prev) => [...prev, review.shot]);
    setReview(null);
  }

  function discardPending() {
    if (!review) return;
    URL.revokeObjectURL(review.shot.url);
    setReview(null);
  }

  function removeShot(id: number) {
    setShots((prev) => {
      const s = prev.find((x) => x.id === id);
      if (s) URL.revokeObjectURL(s.url);
      return prev.filter((x) => x.id !== id);
    });
    setReview(null);
  }

  function finish(add: boolean) {
    if (recording) stopRecording();
    if (review) URL.revokeObjectURL(review.shot.url);
    if (add) onAdd(shots.map((s) => s.file));
    else shots.forEach((s) => URL.revokeObjectURL(s.url));
    setShots([]);
    setReview(null);
    stopStream();
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white">
      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          playsInline
          muted
          className={`h-full w-full object-cover ${facing === "user" ? "-scale-x-100" : ""}`}
        />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <button
            onClick={() => finish(false)}
            aria-label="Close camera"
            className="grid h-10 w-10 place-items-center rounded-full bg-black/40 text-lg"
          >
            ✕
          </button>
          {recording && (
            <span className="flex items-center gap-2 rounded-full bg-black/50 px-3 py-1 text-sm font-bold">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
              {fmt(elapsed)} / {fmt(maxVideoSeconds)}
            </span>
          )}
          <button
            onClick={() => setFacing((f) => (f === "environment" ? "user" : "environment"))}
            disabled={recording}
            aria-label="Switch camera"
            className="grid h-10 w-10 place-items-center rounded-full bg-black/40 text-lg disabled:opacity-40"
          >
            ⟳
          </button>
        </div>
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-8 text-center">
            <p className="max-w-xs text-sm leading-6 text-white/90">{error}</p>
          </div>
        )}
      </div>

      <div className="bg-black px-5 pb-7 pt-4">
        {shots.length > 0 && (
          <div className="mb-4 flex gap-2 overflow-x-auto">
            {shots.map((s) => (
              <button
                key={s.id}
                onClick={() => setReview({ shot: s, mode: "saved" })}
                className="relative shrink-0"
                aria-label="Preview"
              >
                {s.type === "photo" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.url} alt="" className="h-16 w-16 rounded-lg object-cover" />
                ) : (
                  <span className="grid h-16 w-16 place-items-center rounded-lg bg-white/10 text-lg">▶</span>
                )}
                <span className="absolute inset-x-0 bottom-0 rounded-b-lg bg-black/50 py-0.5 text-center text-[10px] font-bold">
                  {s.type === "video" ? "Video" : "Photo"}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-3 items-center">
          <div className="flex justify-start">
            <button
              onClick={recording ? stopRecording : startRecording}
              disabled={!!error}
              aria-label={recording ? "Stop recording" : "Record video"}
              className="grid h-14 w-14 place-items-center rounded-full border-2 border-white/70 disabled:opacity-40"
            >
              <span className={recording ? "h-5 w-5 rounded-[3px] bg-red-500" : "h-7 w-7 rounded-full bg-red-500"} />
            </button>
          </div>
          <div className="flex justify-center">
            <button
              onClick={capturePhoto}
              disabled={recording || !!error}
              aria-label="Take photo"
              className="grid h-20 w-20 place-items-center rounded-full border-4 border-white/80 disabled:opacity-40"
            >
              <span className="h-16 w-16 rounded-full bg-white" />
            </button>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => finish(true)}
              disabled={shots.length === 0}
              className="rounded-full bg-[#B5654A] px-5 py-2 text-sm font-bold text-white disabled:opacity-40"
            >
              Done{shots.length > 0 ? ` (${shots.length})` : ""}
            </button>
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-white/60">
          White circle = photo · red = record (auto-stops at {fmt(maxVideoSeconds)})
        </p>
      </div>

      {/* Review a freshly captured shot, or preview a saved one */}
      {review && (
        <div className="absolute inset-0 z-10 flex flex-col bg-black">
          <div className="absolute inset-x-0 top-0 z-10 flex justify-end p-4">
            <button
              onClick={() => downloadShot(review.shot)}
              aria-label="Save to your phone"
              className="flex items-center gap-2 rounded-full bg-black/50 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5" aria-hidden="true">
                <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Save to phone
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center overflow-hidden p-2">
            {review.shot.type === "photo" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={review.shot.url} alt="Preview" className="max-h-full max-w-full object-contain" />
            ) : (
              <video
                src={review.shot.url}
                controls
                autoPlay
                loop
                playsInline
                className="max-h-full max-w-full"
              />
            )}
          </div>
          <div className="flex items-center justify-between gap-3 p-5">
            {review.mode === "new" ? (
              <>
                <button
                  onClick={discardPending}
                  className="flex-1 rounded-full border border-white/40 py-3 text-sm font-bold text-white"
                >
                  Discard
                </button>
                <button
                  onClick={keepPending}
                  className="flex-1 rounded-full bg-[#B5654A] py-3 text-sm font-bold text-white"
                >
                  Keep
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => removeShot(review.shot.id)}
                  className="flex-1 rounded-full border border-red-400/60 py-3 text-sm font-bold text-red-300"
                >
                  Remove
                </button>
                <button
                  onClick={() => setReview(null)}
                  className="flex-1 rounded-full bg-white/15 py-3 text-sm font-bold text-white"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
