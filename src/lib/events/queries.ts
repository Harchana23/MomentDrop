import { supabaseServer } from "@/lib/supabase/server";

export type EventRow = {
  id: string;
  slug: string;
  title: string;
  event_type: string;
  event_date: string | null;
  eyebrow: string | null;
  host_message: string | null;
  plan: string;
  file_limit: number;
  active_until: string;
  status: string;
  allow_uploads: boolean;
  allow_downloads: boolean;
  require_approval: boolean;
  guests_see_only_own: boolean;
  password_hash: string | null;
  per_guest_limit: number | null;
  cover_path: string | null;
};

/** The event if it belongs to the signed-in owner, else null (RLS-enforced). */
export async function getEventForOwner(id: string): Promise<EventRow | null> {
  const sb = await supabaseServer();
  const { data } = await sb
    .from("events")
    .select(
      "id, slug, title, event_type, event_date, eyebrow, host_message, plan, file_limit, active_until, status, allow_uploads, allow_downloads, require_approval, guests_see_only_own, password_hash, per_guest_limit, cover_path",
    )
    .eq("id", id)
    .maybeSingle();
  return (data as EventRow) ?? null;
}

export async function getEventStats(
  eventId: string,
): Promise<{ uploads: number; guests: number }> {
  const sb = await supabaseServer();
  const [uploads, guests] = await Promise.all([
    sb.from("uploads").select("*", { count: "exact", head: true }).eq("event_id", eventId),
    sb.from("guests").select("*", { count: "exact", head: true }).eq("event_id", eventId),
  ]);
  return { uploads: uploads.count ?? 0, guests: guests.count ?? 0 };
}

export type DashboardEvent = {
  id: string;
  slug: string;
  title: string;
  eventType: string;
  eventDate: string | null;
  plan: string;
  fileLimit: number;
  activeUntil: string;
  status: string;
  uploads: number;
  guests: number;
  /** Google Drive file ids of the most recent published photos, newest first. */
  thumbs: string[];
};

export type DashboardData = {
  events: DashboardEvent[];
  totals: { events: number; uploads: number; guests: number };
};

/** Everything the dashboard needs: all owner events + per-event counts + recent photo previews. */
export async function getDashboardData(): Promise<DashboardData> {
  const sb = await supabaseServer();
  const { data: rows } = await sb
    .from("events")
    .select("id, title, slug, event_type, event_date, plan, file_limit, active_until, status")
    .order("created_at", { ascending: false });
  const base = rows ?? [];
  if (base.length === 0) return { events: [], totals: { events: 0, uploads: 0, guests: 0 } };

  const ids = base.map((e) => e.id as string);

  // One query for recent published photos across all events; grouped per event below.
  const { data: recent } = await sb
    .from("uploads")
    .select("event_id, storage_path, created_at")
    .in("event_id", ids)
    .eq("review_status", "published")
    .eq("media_type", "photo")
    .order("created_at", { ascending: false })
    .limit(200);
  const thumbsByEvent = new Map<string, string[]>();
  for (const r of recent ?? []) {
    const eid = r.event_id as string;
    const path = r.storage_path as string | null;
    if (!path) continue;
    const list = thumbsByEvent.get(eid) ?? [];
    if (list.length < 4) list.push(path);
    thumbsByEvent.set(eid, list);
  }

  // Per-event counts (few events per owner — parallel head counts are cheap).
  const counts = await Promise.all(
    base.map(async (e) => {
      const eid = e.id as string;
      const [u, g] = await Promise.all([
        sb.from("uploads").select("*", { count: "exact", head: true }).eq("event_id", eid),
        sb.from("guests").select("*", { count: "exact", head: true }).eq("event_id", eid),
      ]);
      return { id: eid, uploads: u.count ?? 0, guests: g.count ?? 0 };
    }),
  );
  const countById = new Map(counts.map((c) => [c.id, c]));

  const events: DashboardEvent[] = base.map((e) => {
    const eid = e.id as string;
    const c = countById.get(eid);
    return {
      id: eid,
      slug: e.slug as string,
      title: e.title as string,
      eventType: (e.event_type as string) ?? "event",
      eventDate: (e.event_date as string) ?? null,
      plan: (e.plan as string) ?? "trial",
      fileLimit: (e.file_limit as number) ?? 0,
      activeUntil: e.active_until as string,
      status: (e.status as string) ?? "live",
      uploads: c?.uploads ?? 0,
      guests: c?.guests ?? 0,
      thumbs: thumbsByEvent.get(eid) ?? [],
    };
  });

  return {
    events,
    totals: {
      events: events.length,
      uploads: events.reduce((n, e) => n + e.uploads, 0),
      guests: events.reduce((n, e) => n + e.guests, 0),
    },
  };
}
