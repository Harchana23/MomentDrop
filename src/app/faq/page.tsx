import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Faq } from "@/components/marketing";
import { GENERAL_FAQS } from "@/lib/faqs";
import { JsonLd, graph, breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Common questions about collecting guest photos and videos with MomentDrop — how guests upload, where photos are stored, how long they're kept, and what it costs.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-[#F4ECE3] text-[#2A1B24]">
      <JsonLd schema={graph(breadcrumbSchema([{ name: "FAQ", path: "/faq" }]))} />
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-5 pt-16 text-center md:pt-24">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#7A6570]">FAQ</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-[#2A1B24]">
          Questions, answered
        </h1>
      </section>
      <section className="mx-auto max-w-3xl px-5 py-12">
        <Faq items={GENERAL_FAQS} />
        <div className="mt-12 text-center">
          <Link
            href="/signup"
            className="inline-flex h-12 items-center justify-center btn-grad px-7 text-base font-semibold text-white"
          >
            Create your event
          </Link>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
