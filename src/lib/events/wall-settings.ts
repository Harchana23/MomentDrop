import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

export type WallTransition = "fade" | "slide" | "none";
export type WallOrder = "newest" | "oldest" | "shuffle";
export type WallFit = "contain" | "cover";

export type WallSettings = {
  slideMs: number;
  transition: WallTransition;
  order: WallOrder;
  jumpToNew: boolean;
  showName: boolean;
  showTitle: boolean;
  showQr: boolean;
  fit: WallFit;
  blurBg: boolean;
};

/**
 * These match the values that were hard-coded in photo-wall.tsx before settings
 * existed, so an unconfigured (or pre-migration) event behaves exactly as it used to.
 */
export const WALL_DEFAULTS: WallSettings = {
  slideMs: 6000,
  transition: "fade",
  order: "newest",
  jumpToNew: true,
  showName: true,
  showTitle: true,
  showQr: false,
  fit: "contain",
  blurBg: true,
};

export const SLIDE_MS_MIN = 3000;
export const SLIDE_MS_MAX = 30000;

const COLUMNS =
  "wall_slide_ms, wall_transition, wall_order, wall_jump_to_new, wall_show_name, wall_show_title, wall_show_qr, wall_fit, wall_blur_bg";

const oneOf = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback;

function fromRow(data: Record<string, unknown>): WallSettings {
  // Number(null) is 0, not NaN — so check for a real number before clamping, or a null
  // column would clamp to the 3s minimum and put every wall at its fastest speed.
  const raw = data.wall_slide_ms;
  const ms = typeof raw === "number" && Number.isFinite(raw) ? raw : Number.NaN;
  return {
    slideMs: Number.isNaN(ms)
      ? WALL_DEFAULTS.slideMs
      : Math.min(SLIDE_MS_MAX, Math.max(SLIDE_MS_MIN, ms)),
    transition: oneOf(data.wall_transition, ["fade", "slide", "none"] as const, "fade"),
    order: oneOf(data.wall_order, ["newest", "oldest", "shuffle"] as const, "newest"),
    jumpToNew: data.wall_jump_to_new !== false,
    showName: data.wall_show_name !== false,
    showTitle: data.wall_show_title !== false,
    showQr: data.wall_show_qr === true,
    fit: oneOf(data.wall_fit, ["contain", "cover"] as const, "contain"),
    blurBg: data.wall_blur_bg !== false,
  };
}

/**
 * Wall settings for the public wall (service-role).
 *
 * Falls back to defaults on ANY failure — missing columns, a dead connection, a bad
 * row. The wall is projected in front of a room; it must never fail to show photos
 * because a settings read didn't work.
 */
export async function getWallSettingsPublic(eventId: string): Promise<WallSettings> {
  try {
    const sb = getSupabaseAdmin();
    if (!sb) return WALL_DEFAULTS;
    const { data, error } = await sb.from("events").select(COLUMNS).eq("id", eventId).maybeSingle();
    if (error || !data) return WALL_DEFAULTS;
    return fromRow(data);
  } catch {
    return WALL_DEFAULTS;
  }
}

/**
 * Wall settings for the owner's dashboard (RLS).
 *
 * `migrated` reports whether the columns exist, so the settings page can tell the host
 * to run 009 instead of silently saving into nothing.
 */
export async function getWallSettingsOwner(
  eventId: string,
): Promise<{ migrated: boolean; settings: WallSettings }> {
  try {
    const sb = await supabaseServer();
    const { data, error } = await sb.from("events").select(COLUMNS).eq("id", eventId).maybeSingle();
    if (error || !data) return { migrated: false, settings: WALL_DEFAULTS };
    return { migrated: true, settings: fromRow(data) };
  } catch {
    return { migrated: false, settings: WALL_DEFAULTS };
  }
}
