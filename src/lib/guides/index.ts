import type { Guide } from "./types";
import { collectWeddingPhotos } from "./collect-wedding-photos-from-guests";
import { googlePhotosVs } from "./google-photos-vs-photo-sharing-app";
import { whatsappGroup } from "./whatsapp-group-wedding-photos";
import { qrPhotoBook } from "./qr-code-photo-book-wedding";

/**
 * Every guide, in the order shown on /guides. The index page and the sitemap both
 * derive from this — adding a guide is one module plus one line here.
 */
export const GUIDES: Guide[] = [collectWeddingPhotos, googlePhotosVs, whatsappGroup, qrPhotoBook];

export const getGuide = (slug: string): Guide | undefined => GUIDES.find((g) => g.slug === slug);

export type { Guide, GuideSection } from "./types";
