import { notFound } from "next/navigation";
import { getPublicEventBySlug, uploadsOpen } from "@/lib/events/public";
import GuestUploader from "./guest-uploader";

export const dynamic = "force-dynamic";

export default async function GuestEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getPublicEventBySlug(slug);
  if (!event) notFound();

  const open = uploadsOpen(event);

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-[#22211f]">
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-8">
        <header className="text-center">
          {event.eyebrow && (
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#7f6a46]">
              {event.eyebrow}
            </p>
          )}
          <h1 className="mt-2 text-4xl font-semibold leading-tight tracking-tight text-[#26211b]">
            {event.title}
          </h1>
          {event.host_message ? (
            <p className="mt-4 text-base leading-7 text-[#695b49]">{event.host_message}</p>
          ) : (
            <p className="mt-4 text-base leading-7 text-[#695b49]">
              Share your photos and videos — no app, no account.
            </p>
          )}
        </header>

        <div className="mt-8 border border-[#e1d8ca] bg-white p-5 shadow-[0_24px_80px_rgba(70,55,35,0.12)] md:p-7">
          {open.open ? (
            <GuestUploader eventSlug={event.slug} />
          ) : (
            <div className="py-8 text-center">
              <h2 className="text-xl font-semibold tracking-tight">Uploads closed</h2>
              <p className="mt-2 text-sm text-[#695b49]">{open.reason}</p>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs uppercase tracking-[0.18em] text-[#a18e73]">
          Powered by MomentDrop
        </p>
      </section>
    </main>
  );
}
