import type { Metadata } from "next";
import ImmersiveHome from "./immersive-home";

export const metadata: Metadata = {
  // `absolute` opts out of the layout's "%s | MomentDrop" template, which would
  // otherwise repeat the brand on a title that already carries it.
  title: { absolute: "MomentDrop | collect every guest's photos with one QR scan" },
  description:
    "Create an event, share a QR code, and let guests upload photos and videos from their phones — no app, no account. Download everything as one album.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return <ImmersiveHome />;
}
