import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getDashboardStats, getRecentUploads, type UploadRecord } from "@/lib/db";

// Always read fresh data on each request.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const configured = isSupabaseConfigured();
  const data = configured ? await getDashboardStats() : null;
  const uploads: UploadRecord[] = configured ? await getRecentUploads(undefined, 10) : [];

  const stats = [
    { label: "Uploads", value: data ? String(data.uploads) : "—" },
    { label: "Guests", value: data ? String(data.guests) : "—" },
    { label: "Database", value: configured ? "Connected" : "Not set" },
  ];

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-5 py-6 text-[#25211b] md:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 border-b border-[#ded4c4] pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8b6e3f]">
              MomentDrop Admin
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              Harchana Wedding
            </h1>
          </div>
          <div className="flex gap-3">
            {configured && (data?.uploads ?? 0) > 0 && (
              <a
                className="inline-flex h-11 items-center justify-center border border-[#c2a86f] bg-[#8d7147] px-5 text-sm font-semibold text-white"
                href="/api/admin/export"
              >
                Download all (ZIP)
              </a>
            )}
            <Link
              className="inline-flex h-11 items-center justify-center bg-[#1f1b16] px-5 text-sm font-semibold text-white"
              href="/"
            >
              Open guest page
            </Link>
          </div>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="border border-[#ded4c4] bg-white p-5">
              <p className="text-sm text-[#74664f]">{stat.label}</p>
              <p className="mt-3 text-3xl font-semibold">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="border border-[#ded4c4] bg-white">
            <div className="border-b border-[#eee6da] p-5">
              <h2 className="text-xl font-semibold">Recent uploads</h2>
            </div>
            <div className="divide-y divide-[#eee6da]">
              {uploads.length === 0 ? (
                <div className="p-5 text-sm text-[#74664f]">
                  {configured
                    ? "No uploads yet — they'll appear here as guests upload."
                    : "Connect Supabase to see live uploads."}
                </div>
              ) : (
                uploads.map((upload) => (
                  <div
                    key={upload.id}
                    className="grid gap-3 p-5 sm:grid-cols-[1fr_120px_120px]"
                  >
                    <div>
                      <p className="font-semibold">{upload.guestName}</p>
                      <p className="mt-1 text-sm text-[#74664f]">
                        {upload.originalFileName ?? upload.mediaType ?? "file"}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-[#5f513d]">{upload.status}</p>
                    {upload.storagePath ? (
                      <a
                        href={`/api/admin/file?path=${encodeURIComponent(upload.storagePath)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-10 items-center justify-center border border-[#d8cdbb] text-sm font-semibold text-[#5c4a2e]"
                      >
                        View
                      </a>
                    ) : (
                      <span className="flex h-10 items-center justify-center border border-[#eadfce] text-sm text-[#a99a82]">
                        —
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <aside className="border border-[#ded4c4] bg-white p-5">
            <h2 className="text-xl font-semibold">Setup</h2>
            <div className="mt-5 space-y-4">
              <div className="border border-[#eee6da] p-4">
                <p className="text-sm font-semibold">Supabase</p>
                <p className={`mt-2 text-sm ${configured ? "text-[#3b7a4f]" : "text-[#74664f]"}`}>
                  {configured ? "Connected" : "Not connected"}
                </p>
              </div>
              <div className="border border-[#eee6da] p-4">
                <p className="text-sm font-semibold">Media storage</p>
                <p className={`mt-2 text-sm ${configured ? "text-[#3b7a4f]" : "text-[#74664f]"}`}>
                  {configured ? "Supabase Storage · event-media" : "Not connected"}
                </p>
              </div>
              <div className="border border-[#eee6da] p-4">
                <p className="text-sm font-semibold">QR link</p>
                <p className="mt-2 break-all text-sm text-[#74664f]">
                  /e/harchana-wedding
                </p>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
