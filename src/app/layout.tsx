import type { Metadata } from "next";
import { Playfair_Display, Caveat, Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { GlobalLoader, RouteProgress } from "@/components/global-loader";
import { ChatWidget } from "@/components/chat-widget";
import { JsonLd, graph, organizationSchema, websiteSchema, SITE_URL } from "@/lib/seo";
import "./globals.css";

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const serif = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const script = Caveat({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

const TITLE = "MomentDrop — collect every guest's photos with one QR scan";
const DESCRIPTION =
  "Create an event, share a QR code, and let guests upload photos and videos from their phones — no app, no account. Download everything as one album.";

export const metadata: Metadata = {
  // Without metadataBase, relative OG/canonical URLs resolve to localhost.
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s — MomentDrop" },
  description: DESCRIPTION,
  applicationName: "MomentDrop",
  alternates: { canonical: "/" },
  // No title/description here on purpose: Next fills og:title and og:description
  // from each page's own title/description when they're absent, so every page
  // gets its own preview card instead of inheriting the homepage's.
  openGraph: {
    type: "website",
    siteName: "MomentDrop",
    locale: "en_MY",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Guests at a celebration taking photos on their phones — MomentDrop" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} ${script.variable} ${grotesk.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* Sitewide entity graph: who MomentDrop is, and what this site is.
            Page-specific nodes (breadcrumbs, pricing offers) live on their pages. */}
        <JsonLd schema={graph(organizationSchema, websiteSchema)} />
        <RouteProgress />
        {children}
        <GlobalLoader />
        <ChatWidget />
      </body>
    </html>
  );
}
