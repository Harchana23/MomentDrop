import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { JsonLd, graph, breadcrumbSchema } from "@/lib/seo";
import { GUIDES } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Practical guides to collecting photos and videos from your guests — QR codes, Google Photos, WhatsApp groups, and what actually works at a Malaysian celebration.",
  alternates: { canonical: "/guides" },
};

export default function GuidesIndexPage() {
  return (
    <div className="min-h-screen bg-[#F4ECE3] text-[#2A1B24]">
      <JsonLd schema={graph(breadcrumbSchema([{ name: "Guides", path: "/guides" }]))} />
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-5 pt-16 text-center md:pt-24">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#B5654A]">Guides</p>
        <h1 className="font-serif mt-3 text-5xl font-bold tracking-tight md:text-6xl">
          Getting every photo
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-[#7A6570]">
          Honest guides to collecting your guests&apos; photos — including the times a free
          Google Photos album is the better answer.
        </p>
      </section>
      <section className="mx-auto max-w-3xl px-5 py-14">
        <ul className="space-y-4">
          {GUIDES.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/guides/${g.slug}`}
                className="block rounded-2xl glass p-6 transition hover:-translate-y-0.5"
              >
                <h2 className="font-serif text-xl font-bold text-[#2A1B24]">{g.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#7A6570]">{g.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <SiteFooter />
    </div>
  );
}
