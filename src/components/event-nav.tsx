import Link from "next/link";

const ITEMS = [
  { key: "overview", label: "Overview", path: "" },
  { key: "media", label: "Media", path: "/media" },
  { key: "albums", label: "Albums", path: "/albums" },
  { key: "guests", label: "Guests", path: "/guests" },
  { key: "countdown", label: "Countdown", path: "/countdown" },
  { key: "print", label: "Print", path: "/print" },
  { key: "access", label: "Access", path: "/access" },
  { key: "settings", label: "Settings", path: "/settings" },
];

export function EventNav({ eventId, active }: { eventId: string; active: string }) {
  return (
    <nav className="mt-5 flex gap-1 overflow-x-auto border-b border-[#e6ddcf]">
      {ITEMS.map((i) => (
        <Link
          key={i.key}
          href={`/dashboard/events/${eventId}${i.path}`}
          className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold transition ${
            i.key === active
              ? "border-[#e0734f] text-[#231a12]"
              : "border-transparent text-[#8a755c] hover:text-[#231a12]"
          }`}
        >
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
