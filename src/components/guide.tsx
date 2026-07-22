import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { JsonLd, graph, breadcrumbSchema, articleSchema } from "@/lib/seo";
import { getGuide, type Guide } from "@/lib/guides";

/** Shared shell for /guides/[slug]. Mirrors LegalPage. */
export function GuideLayout({ guide }: { guide: Guide }) {
  const related = guide.related.map(getGuide).filter((g): g is Guide => Boolean(g));
  return (
    <div className="min-h-screen bg-[#F4ECE3] text-[#2A1B24]">
      <JsonLd
        schema={graph(
          articleSchema({
            headline: guide.title,
            description: guide.description,
            updated: guide.updated,
            path: `/guides/${guide.slug}`,
          }),
          breadcrumbSchema([
            { name: "Guides", path: "/guides" },
            { name: guide.title, path: `/guides/${guide.slug}` },
          ]),
        )}
      />
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 pb-8 pt-16">
        <nav aria-label="Breadcrumb" className="text-sm">
          <Link href="/guides" className="font-semibold text-[#B5654A] hover:underline">
            Guides
          </Link>
        </nav>
        <h1 className="font-serif mt-3 text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
          {guide.title}
        </h1>
        <p className="mt-3 text-sm text-[#7A6570]">
          Last updated:{" "}
          {new Date(guide.updated).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <p className="mt-6 text-lg leading-8 text-[#4A3540]">{guide.intro}</p>

        <div className="guideprose mt-12">
          {guide.sections.map((s) => (
            <section key={s.heading}>
              <h2>{s.heading}</h2>
              {s.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {s.bullets ? (
                <ul>
                  {s.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        {related.length ? (
          <aside className="mt-16 rounded-2xl glass p-6">
            <h2 className="text-lg font-bold">Keep reading</h2>
            <ul className="mt-3 space-y-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/guides/${r.slug}`}
                    className="font-semibold text-[#B5654A] hover:underline"
                  >
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}

        <div className="mt-12 text-center">
          <Link
            href="/signup"
            className="inline-flex h-12 items-center justify-center rounded-full btn-grad px-7 text-base font-bold text-white"
          >
            Create your event — free
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
