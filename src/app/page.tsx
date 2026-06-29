import Link from "next/link";

const recentUploads = [
  { name: "Maya", count: "8 photos", time: "2 min ago" },
  { name: "Arun", count: "1 video", time: "6 min ago" },
  { name: "Leela", count: "12 photos", time: "14 min ago" },
];

export default function GuestUploadPage() {
  return (
    <main className="min-h-screen bg-[#fbfaf7] text-[#22211f]">
      <section className="mx-auto grid min-h-screen w-full max-w-6xl gap-8 px-5 py-6 md:grid-cols-[1fr_420px] md:items-center md:px-8 lg:gap-14">
        <div className="flex min-h-[58vh] flex-col justify-between rounded-[2rem] bg-[url('/window.svg')] bg-[length:560px] bg-[center_top_2rem] bg-no-repeat p-6 md:min-h-[86vh] md:p-10">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#7f6a46]">
                MomentDrop
              </p>
              <h1 className="mt-3 max-w-xl text-5xl font-semibold leading-[0.95] tracking-tight text-[#26211b] md:text-7xl">
                Share the moments we missed.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-[#695b49]">
                Harchana Wedding guest photos and videos, gathered in one
                private Drive folder.
              </p>
            </div>
            <Link
              href="/admin"
              className="hidden border border-[#d8cdbb] px-4 py-2 text-sm font-medium text-[#5c4a2e] transition hover:border-[#8d7147] md:inline-flex"
            >
              Admin
            </Link>
          </header>

          <div className="mt-12 grid gap-3 sm:grid-cols-3">
            {recentUploads.map((upload) => (
              <div
                key={upload.name}
                className="border border-[#e6ddcf] bg-white/75 p-4 shadow-sm backdrop-blur"
              >
                <p className="text-sm font-semibold text-[#2d2924]">
                  {upload.name}
                </p>
                <p className="mt-1 text-sm text-[#7a6b58]">{upload.count}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[#a18e73]">
                  {upload.time}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-[#e1d8ca] bg-white p-5 shadow-[0_24px_80px_rgba(70,55,35,0.12)] md:p-7">
          <div className="flex items-center justify-between border-b border-[#eee7dc] pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9a7b3f]">
                Guest Upload
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Add your photos
              </h2>
            </div>
            <div className="grid h-16 w-16 place-items-center border border-[#ddd0bc] text-xs font-bold text-[#6c5432]">
              QR
            </div>
          </div>

          <form className="mt-6 space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-[#4a4035]">
                Your name
              </span>
              <input
                className="mt-2 h-12 w-full border border-[#d8cdbb] bg-[#fffdf9] px-4 text-base outline-none transition focus:border-[#8f7245]"
                placeholder="Name for the album"
                type="text"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[#4a4035]">
                Message
              </span>
              <textarea
                className="mt-2 min-h-24 w-full resize-none border border-[#d8cdbb] bg-[#fffdf9] px-4 py-3 text-base outline-none transition focus:border-[#8f7245]"
                placeholder="A note for the couple"
              />
            </label>

            <label className="grid min-h-40 cursor-pointer place-items-center border border-dashed border-[#bda77f] bg-[#fbf7ef] px-4 text-center transition hover:border-[#8f7245]">
              <input multiple type="file" className="sr-only" />
              <span>
                <span className="block text-base font-semibold text-[#3a3127]">
                  Choose photos or videos
                </span>
                <span className="mt-2 block text-sm text-[#7a6b58]">
                  JPG, PNG, HEIC, MP4, MOV
                </span>
              </span>
            </label>

            <button
              className="h-13 w-full bg-[#1f1b16] px-5 text-base font-semibold text-white transition hover:bg-[#3a3127]"
              type="button"
            >
              Upload memories
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
