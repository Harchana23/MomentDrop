import type { Metadata } from "next";
import { UseCaseLayout } from "@/components/marketing";
import { CORPORATE_FAQS } from "@/lib/faqs";

export const metadata: Metadata = {
  title: "Corporate event photo sharing",
  description:
    "Collect attendee photos from conferences, launches, and off-sites with one QR code — no app, no account.",
  alternates: { canonical: "/use-cases/corporate" },
};

export default function CorporateUseCasePage() {
  return (
    <UseCaseLayout
      faqs={CORPORATE_FAQS}
      crumb={{ name: "Corporate events", path: "/use-cases/corporate" }}
      eyebrow="For corporate events"
      image="/marketing/event-corporate.jpg"
      title="Conferences, launches, off-sites — captured."
      subtitle="Display a QR on stage and on tables. Attendees contribute their photos and videos, and your team gets a ready-to-use library."
      ctaLabel="Create your event"
      benefits={[
        { t: "Crowdsourced coverage", d: "Hundreds of attendee perspectives, without hiring a photographer for every room." },
        { t: "On-brand & controlled", d: "Approve uploads before they show, and keep everything in private storage." },
        { t: "Ready for marketing", d: "Download the full set as a ZIP for recaps, social, and internal comms." },
        { t: "Effortless for attendees", d: "No app, no account — just scan and upload from any phone." },
      ]}
    />
  );
}
