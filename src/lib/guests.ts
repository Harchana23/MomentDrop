import { supabaseServer } from "@/lib/supabase/server";

export type GuestRow = {
  id: string;
  displayName: string;
  email: string | null;
  uploadCount: number;
  createdAt: string | null;
};

/** Guests who have uploaded to an event (owner-scoped via RLS), most active first. */
export async function getEventGuests(eventId: string): Promise<GuestRow[]> {
  const sb = await supabaseServer();
  const { data } = await sb
    .from("guests")
    .select("id, display_name, email, upload_count, created_at")
    .eq("event_id", eventId)
    .order("upload_count", { ascending: false });
  return (data ?? []).map((r) => ({
    id: r.id as string,
    displayName: (r.display_name as string) ?? "Guest",
    email: (r.email as string) ?? null,
    uploadCount: (r.upload_count as number) ?? 0,
    createdAt: (r.created_at as string) ?? null,
  }));
}
