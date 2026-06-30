import { supabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type Album = { id: string; title: string; allowUploads: boolean; count: number };

/** Owner's albums for an event with photo counts. `available` is false pre-migration. */
export async function getAlbumsOwner(
  eventId: string,
): Promise<{ available: boolean; albums: Album[] }> {
  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("albums")
    .select("id, title, allow_uploads")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });
  if (error) return { available: false, albums: [] };

  const albums = await Promise.all(
    (data ?? []).map(async (a) => {
      const { count } = await sb
        .from("uploads")
        .select("*", { count: "exact", head: true })
        .eq("album_id", a.id);
      return {
        id: a.id as string,
        title: a.title as string,
        allowUploads: Boolean(a.allow_uploads),
        count: count ?? 0,
      };
    }),
  );
  return { available: true, albums };
}

/** Guest-uploadable albums (service-role). Empty if none / pre-migration. */
export async function getGuestAlbums(eventId: string): Promise<{ id: string; title: string }[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  const { data, error } = await sb
    .from("albums")
    .select("id, title")
    .eq("event_id", eventId)
    .eq("allow_uploads", true)
    .order("created_at", { ascending: true });
  if (error) return [];
  return (data ?? []).map((a) => ({ id: a.id as string, title: a.title as string }));
}

/** True if albumId belongs to the event (used to validate guest album choice). */
export async function isEventAlbum(eventId: string, albumId: string): Promise<boolean> {
  const sb = getSupabaseAdmin();
  if (!sb) return false;
  const { data } = await sb
    .from("albums")
    .select("id")
    .eq("event_id", eventId)
    .eq("id", albumId)
    .maybeSingle();
  return Boolean(data);
}
