"use client";

import { useState } from "react";

type Props = {
  label: string;
  url: string;
  tone?: "public" | "admin";
  help?: string;
};

export function CopyLinkCard({ label, url, tone = "public", help }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // fallback: select the text
      const el = document.getElementById(`copy-${tone}`);
      if (el instanceof HTMLInputElement) {
        el.select();
        document.execCommand?.("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }
    }
  }

  const toneClasses =
    tone === "admin"
      ? "border-warn/40 bg-warn/5"
      : "border-border bg-bg-card";

  return (
    <div className={`rounded-lg border p-4 ${toneClasses}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm font-semibold">{label}</div>
        {tone === "admin" ? (
          <span className="inline-flex items-center rounded-full bg-warn/10 px-2 py-0.5 text-[11px] font-medium text-warn">
            keep secret
          </span>
        ) : null}
      </div>
      {help ? <p className="mt-1 text-xs text-muted">{help}</p> : null}
      <div className="mt-3 flex gap-2">
        <input
          id={`copy-${tone}`}
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="h-10 flex-1 rounded-md border border-border bg-bg-muted px-3 text-sm font-mono tracking-tight"
        />
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-10 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-white transition hover:bg-accent-hover"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
