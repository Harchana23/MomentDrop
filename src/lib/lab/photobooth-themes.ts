/**
 * Themes for the internal AI photobooth demo (/lab/photobooth).
 *
 * This is a throwaway prototype to feel the product, not shipped customer code.
 *
 * The load-bearing part is IDENTITY_RULE. In the feasibility test, the single
 * instruction that made outputs usable was "keep their faces recognisable, do not
 * change their facial features" — every theme wraps its scene prompt in it, so a
 * new theme can't accidentally drift the face.
 */

const IDENTITY_RULE =
  "Keep the exact same people from the photo — their faces, features, skin tone, and " +
  "identity must stay clearly recognisable as the same individuals. Do not beautify, " +
  "slim, lighten, or alter their facial features. Keep it photorealistic.";

export type Theme = {
  id: string;
  label: string;
  emoji: string;
  /** The scene to place the subjects in. IDENTITY_RULE is prepended automatically. */
  scene: string;
};

export const THEMES: Theme[] = [
  {
    id: "wedding",
    label: "Wedding editorial",
    emoji: "💍",
    scene:
      "Restyle them into an elegant golden-hour wedding portrait in a dreamy garden with " +
      "soft warm bokeh and string lights, dressed in tasteful formal wedding attire.",
  },
  {
    id: "fantasy",
    label: "Fantasy poster",
    emoji: "🌙",
    scene:
      "Place them in a whimsical cinematic fantasy movie poster: a small boat drifting under " +
      "glowing paper lanterns and a starry night sky, magical and warm.",
  },
  {
    id: "festive",
    label: "Festive glow",
    emoji: "🪔",
    scene:
      "Restyle into a vibrant festive celebration scene with warm lantern light, marigold and " +
      "fairy-light bokeh, rich colours, dressed in elegant traditional festive outfits.",
  },
  {
    id: "vintage",
    label: "Vintage film",
    emoji: "🎞️",
    scene:
      "Restyle as a warm 1970s vintage film photograph: soft grain, faded warm tones, retro " +
      "styling and wardrobe, nostalgic and cinematic.",
  },
  {
    id: "royal",
    label: "Royal portrait",
    emoji: "👑",
    scene:
      "Restyle into a stately royal oil-painting-style portrait in rich formal regalia against " +
      "a grand palace interior with warm dramatic lighting, while staying photorealistic.",
  },
  {
    id: "studio",
    label: "Studio glam",
    emoji: "✨",
    scene:
      "Restyle into a clean high-end studio glamour portrait: soft flattering key light, subtle " +
      "backdrop, magazine-cover polish, sharp and professional.",
  },
];

export const getTheme = (id: string): Theme | undefined => THEMES.find((t) => t.id === id);

/** Full prompt for a theme: the scene plus the non-negotiable identity rule. */
export function promptFor(theme: Theme): string {
  return `${theme.scene} ${IDENTITY_RULE}`;
}
