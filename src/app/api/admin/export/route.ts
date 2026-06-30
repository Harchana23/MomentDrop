import { Readable } from "node:stream";
import { createRequire } from "node:module";
import type { Archiver, ArchiverOptions } from "archiver";
import { EVENT_ID, getAllUploadFiles } from "@/lib/db";
import { downloadObject } from "@/lib/storage";
import { isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";
// Allow time to stream many files (Vercel caps this on lower plans).
export const maxDuration = 300;

// archiver is CommonJS; load it through require for Turbopack interop.
const require = createRequire(import.meta.url);
const archiver = require("archiver") as (
  format: "zip" | "tar",
  options?: ArchiverOptions,
) => Archiver;

function safe(part: string): string {
  return part.replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, " ").trim() || "file";
}

/**
 * Stream every uploaded file for the event as a single ZIP, grouped by guest:
 *   <Guest Name>/<original-file-name>
 * Filenames are de-duplicated so nothing is silently overwritten.
 */
export async function GET() {
  if (!isSupabaseConfigured()) {
    return new Response("Storage is not configured.", { status: 503 });
  }

  const files = await getAllUploadFiles(EVENT_ID);
  if (files.length === 0) {
    return new Response("No uploads to export yet.", { status: 404 });
  }

  const archive = archiver("zip", { store: true }); // media is already compressed
  const used = new Set<string>();

  // Feed the archive in the background; the response streams as bytes are produced.
  (async () => {
    try {
      for (const f of files) {
        const blob = await downloadObject(f.storagePath);
        if (!blob) continue;

        const folder = safe(f.guestName);
        let entry = `${folder}/${safe(f.originalFileName)}`;
        if (used.has(entry)) {
          const dot = entry.lastIndexOf(".");
          const stem = dot > folder.length ? entry.slice(0, dot) : entry;
          const ext = dot > folder.length ? entry.slice(dot) : "";
          let n = 2;
          while (used.has(`${stem}-${n}${ext}`)) n++;
          entry = `${stem}-${n}${ext}`;
        }
        used.add(entry);

        archive.append(Buffer.from(await blob.arrayBuffer()), { name: entry });
      }
      await archive.finalize();
    } catch {
      archive.abort();
    }
  })();

  const fileName = `${EVENT_ID}-photos-${new Date().toISOString().slice(0, 10)}.zip`;
  return new Response(Readable.toWeb(archive) as ReadableStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
