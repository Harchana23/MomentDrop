import type { Metadata } from "next";
import { UseCaseLayout } from "@/components/marketing";
import { PARTY_FAQS } from "@/lib/faqs";

export const metadata: Metadata = {
  title: "Party photo sharing",
  description:
    "Crowdsource the whole night with one QR code. Guests upload photos and videos from their phones — no app, no account.",
  alternates: { canonical: "/use-cases/party" },
};

export default function PartyUseCasePage() {
  return (
    <UseCaseLayout
      faqs={PARTY_FAQS}
      crumb={{ name: "Parties & festivals", path: "/use-cases/party" }}
      eyebrow="For parties"
      image="/marketing/event-festival.jpg"
      title="The whole night, from everyone."
      subtitle="Drop a QR at the bar and on the tables. Everyone's photos and clips land in one shared album you actually keep."
      ctaLabel="Create your party event"
      benefits={[
        { t: "Every angle, no chasing", d: "Stop begging friends to 'send me that photo' — it's already in your album." },
        { t: "Instant for guests", d: "A scan and a tap. No app, no login, on any phone." },
        { t: "Live on the screen", d: "Put a Photo Wall slideshow on the TV as the photos roll in." },
        { t: "Download it all", d: "One ZIP with everything, organized by who uploaded it." },
      ]}
    />
  );
}
