import Link from "next/link";

const uploads = [
  {
    guest: "Maya",
    files: "8 photos",
    status: "Ready",
    folder: "Photos",
  },
  {
    guest: "Arun",
    files: "1 video",
    status: "Processing",
    folder: "Videos",
  },
  {
    guest: "Leela",
    files: "12 photos",
    status: "Ready",
    folder: "Photos",
  },
];

const stats = [
  { label: "Uploads", value: "21" },
  { label: "Guests", value: "3" },
  { label: "Drive", value: "Ready" },
];

export default function AdminPage() {
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
          <Link
            className="inline-flex h-11 items-center justify-center bg-[#1f1b16] px-5 text-sm font-semibold text-white"
            href="/"
          >
            Open guest page
          </Link>
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
              {uploads.map((upload) => (
                <div
                  key={upload.guest}
                  className="grid gap-3 p-5 sm:grid-cols-[1fr_120px_120px]"
                >
                  <div>
                    <p className="font-semibold">{upload.guest}</p>
                    <p className="mt-1 text-sm text-[#74664f]">
                      {upload.files} to {upload.folder}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-[#5f513d]">
                    {upload.status}
                  </p>
                  <button className="h-10 border border-[#d8cdbb] text-sm font-semibold text-[#5c4a2e]">
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>

          <aside className="border border-[#ded4c4] bg-white p-5">
            <h2 className="text-xl font-semibold">Setup</h2>
            <div className="mt-5 space-y-4">
              <div className="border border-[#eee6da] p-4">
                <p className="text-sm font-semibold">Firebase</p>
                <p className="mt-2 text-sm text-[#74664f]">Not connected</p>
              </div>
              <div className="border border-[#eee6da] p-4">
                <p className="text-sm font-semibold">Google Drive</p>
                <p className="mt-2 text-sm text-[#74664f]">Not connected</p>
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
