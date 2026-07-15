import { SiteHeader, SiteFooter } from "@/components/site-chrome";

/** Shared shell for policy pages (privacy, terms, security). */
export function LegalPage({
  eyebrow = "Legal",
  title,
  updated,
  intro,
  children,
}: {
  eyebrow?: string;
  title: string;
  updated: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F4ECE3] text-[#2A1B24]">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 pb-8 pt-16">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#B5654A]">{eyebrow}</p>
        <h1 className="font-serif mt-3 text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
          {title}
        </h1>
        <p className="mt-3 text-sm text-[#7A6570]">Last updated: {updated}</p>
        {intro ? <p className="mt-6 text-[15.5px] leading-7 text-[#4A3540]">{intro}</p> : null}
        <div className="legalprose mt-10">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
