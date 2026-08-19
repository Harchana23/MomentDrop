import archiver from "archiver";
import { getEventForOwner } from "@/lib/events/queries";
import { getEventUploads } from "@/lib/uploads/queries";
import { downloadDriveFile } from "@/lib/gdrive";

export const runtime = "nodejs";
export const maxDuration = 60;

function safe(part: string): string {
  return part.replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, " ").trim() || "file";
}

/**
 * Build a ZIP for the owner's event, grouped by guest.
 * - No `ids` param: every non-hidden upload (the "Download all" button).
 * - `?ids=a,b,c`: exactly those uploads, whatever their status — the owner explicitly
 *   picked them, so an intentionally-hidden one is still included when selected.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const event = await getEventForOwner(id); // RLS: null unless the caller owns it
    if (!event) return new Response("Not found", { status: 404 });

    const idsParam = new URL(request.url).searchParams.get("ids");
    const idFilter = idsParam
      ? new Set(idsParam.split(",").map((s) => s.trim()).filter(Boolean))
      : null;

    const uploads = await getEventUploads(id);
    const files = uploads.filter((u) =>
      u.storagePath && (idFilter ? idFilter.has(u.id) : u.reviewStatus !== "hidden"),
    );
    if (files.length === 0) return new Response("No uploads to export yet.", { status: 404 });

    const archive = archiver("zip", { store: true });
    const chunks: Buffer[] = [];
    archive.on("data", (c: Buffer) => chunks.push(c));
    const finished = new Promise<void>((resolve, reject) => {
      archive.on("end", () => resolve());
      archive.on("error", reject);
    });

    const used = new Set<string>();
    for (const f of files) {
      const buf = await downloadDriveFile(f.storagePath as string);
      if (!buf) continue;
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
      archive.append(buf, { name: entry });
    }
    await archive.finalize();
    await finished;

    const zip = Buffer.concat(chunks);
    const fileName = `${safe(event.title)} - photos - ${new Date().toISOString().slice(0, 10)}.zip`;
    return new Response(new Uint8Array(zip), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response("Export failed: " + message, { status: 500 });
  }
}
