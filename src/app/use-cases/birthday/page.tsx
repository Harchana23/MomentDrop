import type { Metadata } from "next";
import { UseCaseLayout } from "@/components/marketing";

export const metadata: Metadata = {
  title: "Birthday photo sharing — MomentDrop",
  description:
    "Collect every candid from the party with one QR code. Guests upload from their phones — no app, no account.",
};

export default function BirthdayUseCasePage() {
  return (
    <UseCaseLayout
      eyebrow="For birthdays"
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
