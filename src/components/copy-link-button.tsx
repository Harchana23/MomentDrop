"use client";

import { useState } from "react";

/** Copies `url` to the clipboard and briefly shows "Copied". */
export function CopyLinkButton({
  url,
  className,
  label = "Copy link",
}: {
  url: string;
  className?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy(e: React.MouseEvent) {
    // On event cards the button lives inside a big <Link>; don't navigate.
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — no-op */
    }
  }

  return (
    <button type="button" onClick={copy} className={className}>
      {copied ? "✓ Copied" : label}
    </button>
  );
}
