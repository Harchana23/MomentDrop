import type { Metadata } from "next";
import ImmersiveHome from "./immersive-home";

export const metadata: Metadata = {
  title: "MomentDrop — collect every guest's photos with one QR scan",
  description:
    "Create an event, share a QR code, and let guests upload photos and videos from their phones — no app, no account. Download everything as one album.",
};

export default function HomePage() {
  return <ImmersiveHome />;
}
