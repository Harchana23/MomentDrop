import type { Metadata } from "next";
import { UseCaseLayout } from "@/components/marketing";
import { WEDDING_FAQS } from "@/lib/faqs";

export const metadata: Metadata = {
  title: "Wedding photo sharing",
  description:
    "Collect every wedding photo and video from your guests with one QR code. No app, no account. Download everything as one album.",
  alternates: { canonical: "/use-cases/wedding" },
};

export default function WeddingUseCasePage() {
  return (
    <UseCaseLayout
      faqs={WEDDING_FAQS}
      crumb={{ name: "Weddings", path: "/use-cases/wedding" }}
      eyebrow="For weddings"
      image="/marketing/event-wedding.jpg"
      title="Every guest's view of your wedding day."
      subtitle="Put a QR code on each table. Guests scan, upload their photos and videos, and you walk away with the whole day — from every angle."
      ctaLabel="Create your wedding event"
      benefits={[
        { t: "Catch the candids", d: "Your photographer can't be everywhere. Guests capture the toasts, the dance floor, and the in-between moments." },
        { t: "No app, no friction", d: "Guests scan and upload straight from their camera roll. Grandparents included." },
        { t: "One private album", d: "Everything lands in your private storage — not a public hashtag feed. You decide what's shown." },
        { t: "Yours forever", d: "Download every photo and video as a single ZIP, organized by guest, to keep or print." },
      ]}
    />
  );
}
