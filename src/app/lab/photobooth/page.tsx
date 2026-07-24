import type { Metadata } from "next";
import Booth from "./booth";

// Internal tool — never index it, on any domain, regardless of the staging gate.
export const metadata: Metadata = {
  title: "AI Photobooth (lab)",
  robots: { index: false, follow: false },
};

export default function PhotoboothLabPage() {
  return (
    <main className="min-h-screen bg-[#F4ECE3] text-[#2A1B24]">
      <Booth />
    </main>
  );
}
