/**
 * A guide is data, not JSX, so prose can be edited without touching layout and the
 * registry can drive the index page and the sitemap.
 */
export type GuideSection = {
  /** Rendered as <h2>. */
  heading: string;
  /** Each string is one <p>. Markdown is NOT parsed — keep prose plain. */
  body: string[];
  /** Optional bullets rendered after the body. */
  bullets?: string[];
};

export type Guide = {
  slug: string;
  /** <h1> and <title>. */
  title: string;
  /** Meta description. Aim for 140–160 characters. */
  description: string;
  /** ISO date, e.g. "2026-07-17". Rendered as "Last updated". */
  updated: string;
  /** Standfirst under the h1. One or two sentences. */
  intro: string;
  sections: GuideSection[];
  /** Slugs of sibling guides to cross-link. */
  related: string[];
};
