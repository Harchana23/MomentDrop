import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventForOwner } from "@/lib/events/queries";
import { getSiteUrl } from "@/lib/site-url";
import { qrDataUrl } from "@/lib/qr";
import { EventNav } from "@/components/event-nav";
import PrintCards from "./print-cards";

export const dynamic = "force-dynamic";

export default async function PrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventForOwner(id);
  if (!event) notFound();

  const url = `${await getSiteUrl()}/e/${event.slug}`;
  const qr = await qrDataUrl(url);

  return (
    <main className="md-print-root min-h-screen bg-[#F4ECE3] px-5 py-6 text-[#2A1B24] md:px-8">
      <style>{`@media print{.no-print{display:none!important}body{background:#fff}.md-print-root{background:#fff!important;padding:0!important}.md-card{box-shadow:none!important}}`}</style>
      <div className="mx-auto max-w-3xl">
        <Link href={`/dashboard/events/${id}`} className="no-print text-sm text-[#B5654A]">
          ← {event.title}
        </Link>
        <h1 className="no-print mt-2 text-3xl font-semibold tracking-tight">Print templates</h1>
        <div className="no-print">
          <EventNav eventId={id} active="print" />
        </div>
        <PrintCards title={event.title} url={url} qr={qr} />
      </div>
    </main>
  );
}
