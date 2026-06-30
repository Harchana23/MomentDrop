import Link from "next/link";

const ITEMS = [
  { key: "overview", label: "Overview", path: "" },
  { key: "media", label: "Media", path: "/media" },
  { key: "guests", label: "Guests", path: "/guests" },
  { key: "print", label: "Print", path: "/print" },
  { key: "access", label: "Access", path: "/access" },
  { key: "settings", label: "Settings", path: "/settings" },
];

export function EventNav({ eventId, active }: { eventId: string; active: string }) {
  return (
    <nav className="mt-4 flex gap-1 overflow-x-auto border-b border-[#ded4c4]">
      {ITEMS.map((i) => (
        <Link
          key={i.key}
          href={`/dashboard/events/${eventId}${i.path}`}
          className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium ${
            i.key === active
              ? "border-[#8d7147] text-[#25211b]"
              : "border-transparent text-[#74664f] hover:text-[#25211b]"
          }`}
        >
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
