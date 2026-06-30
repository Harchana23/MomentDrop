import { Readable } from "node:stream";
import { createRequire } from "node:module";
import type { Archiver, ArchiverOptions } from "archiver";
import { getEventForOwner } from "@/lib/events/queries";
import { getEventUploads } from "@/lib/uploads/queries";
import { downloadObject } from "@/lib/storage";

export const runtime = "nodejs";
export const maxDuration = 300;

const require = createRequire(import.meta.url);
const archiver = require("archiver") as (
  format: "zip" | "tar",
  options?: ArchiverOptions,
) => Archiver;

function safe(part: string): string {
  return part.replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, " ").trim() || "file";
}

/** Stream every non-hidden upload for the owner's event as one ZIP, grouped by guest. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const event = await getEventForOwner(id); // RLS: null unless the caller owns it
  if (!event) return new Response("Not found", { status: 404 });

  const uploads = await getEventUploads(id);
  const files = uploads.filter((u) => u.storagePath && u.reviewStatus !== "hidden");
  if (files.length === 0) return new Response("No uploads to export yet.", { status: 404 });

  const archive = archiver("zip", { store: true });
  const used = new Set<string>();

  (async () => {
    try {
      for (const f of files) {
        const blob = await downloadObject(f.storagePath as string);
        if (!blob) continue;
        const folder = safe(f.guestName);
        let entry = `${folder}/${safe(f.originalFileName ?? "file")}`;
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

  const fileName = `${event.slug}-photos-${new Date().toISOString().slice(0, 10)}.zip`;
  return new Response(Readable.toWeb(archive) as ReadableStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
