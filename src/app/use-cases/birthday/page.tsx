import type { Metadata } from "next";
import { UseCaseLayout } from "@/components/marketing";
import { BIRTHDAY_FAQS } from "@/lib/faqs";

export const metadata: Metadata = {
  title: "Birthday photo sharing",
  description:
    "Collect every candid from the party with one QR code. Guests upload from their phones — no app, no account.",
  alternates: { canonical: "/use-cases/birthday" },
};

export default function BirthdayUseCasePage() {
  return (
    <UseCaseLayout
      faqs={BIRTHDAY_FAQS}
      crumb={{ name: "Birthdays", path: "/use-cases/birthday" }}
      eyebrow="For birthdays"
      image="/marketing/event-party.jpg"
      title="Every candid from the party."
      subtitle="Set a QR by the cake. Friends and family upload their snaps and clips, and you get the whole celebration in one place."
      ctaLabel="Create your birthday event"
      benefits={[
        { t: "The real moments", d: "The blow-out, the surprise, the dance-off — captured from every phone in the room." },
        { t: "Zero setup for guests", d: "Scan, add photos, done. No app and no account, on any phone." },
        { t: "Keep it private", d: "Photos go to your private album, not a public feed. Show them off only if you want to." },
        { t: "One easy download", d: "Grab everything as a single ZIP when the party's over." },
      ]}
    />
  );
}
