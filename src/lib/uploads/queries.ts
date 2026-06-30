import { supabaseServer } from "@/lib/supabase/server";

export type ReviewStatus = "published" | "pending" | "hidden";

export type UploadItem = {
  id: string;
  guestName: string;
  originalFileName: string | null;
  mediaType: string | null;
  storagePath: string | null;
  reviewStatus: ReviewStatus;
  createdAt: string | null;
};

/** Uploads for an event (owner-scoped via RLS), newest first, optionally by status. */
export async function getEventUploads(
  eventId: string,
  status?: ReviewStatus,
): Promise<UploadItem[]> {
  const sb = await supabaseServer();
  let q = sb
    .from("uploads")
    .select("id, guest_name, original_file_name, media_type, storage_path, review_status, created_at")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });
  if (status) q = q.eq("review_status", status);
  const { data } = await q;
  return (data ?? []).map((r) => ({
    id: r.id as string,
    guestName: (r.guest_name as string) ?? "Guest",
    originalFileName: (r.original_file_name as string) ?? null,
    mediaType: (r.media_type as string) ?? null,
    storagePath: (r.storage_path as string) ?? null,
    reviewStatus: ((r.review_status as string) ?? "published") as ReviewStatus,
    createdAt: (r.created_at as string) ?? null,
  }));
}

export async function getUploadCounts(
  eventId: string,
): Promise<{ published: number; pending: number; hidden: number }> {
  const sb = await supabaseServer();
  const mk = (s: string) =>
    sb
      .from("uploads")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId)
      .eq("review_status", s);
  const [p, a, h] = await Promise.all([mk("published"), mk("pending"), mk("hidden")]);
  return { published: p.count ?? 0, pending: a.count ?? 0, hidden: h.count ?? 0 };
}
