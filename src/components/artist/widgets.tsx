"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { AnalyticsEventType } from "@/types";
import { artistUrl } from "@/lib/utils";

function visitorId() {
  const key = "pk_vid";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const created = crypto.randomUUID();
  window.localStorage.setItem(key, created);
  return created;
}

export function track(slug: string, eventType: AnalyticsEventType, label?: string) {
  const body = JSON.stringify({ slug, event_type: eventType, label, visitor_id: visitorId() });
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics", new Blob([body], { type: "application/json" }));
    return;
  }
  void fetch("/api/analytics", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true });
}

export function AnalyticsBeacon({ slug, eventType = "page_view" }: { slug: string; eventType?: AnalyticsEventType }) {
  useEffect(() => {
    const key = `pk_${eventType}_${slug}`;
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "1");
    track(slug, eventType);
  }, [slug, eventType]);
  return null;
}

export function TrackedLink({
  slug,
  href,
  eventType,
  label,
  className,
  children,
}: {
  slug: string;
  href: string;
  eventType: AnalyticsEventType;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      className={className}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onClick={() => track(slug, eventType, label)}
    >
      {children}
    </a>
  );
}

export function CopyButton({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }}
    >
      {copied ? "Copied" : children}
    </button>
  );
}

export function ShareBar({ slug, name, className }: { slug: string; name: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const url = artistUrl(slug);
  return (
    <div className="relative">
      <button type="button" className={className} onClick={() => setOpen((value) => !value)}>
        Share
      </button>
      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-64 border border-current/20 bg-inherit p-4 text-inherit shadow-xl">
          <p className="text-xs tracking-[0.2em] uppercase opacity-70">Share {name}</p>
          <div className="mt-3 flex justify-center bg-white p-3">
            <QRCodeSVG value={url} size={148} />
          </div>
          <div className="mt-3 flex gap-2">
            <CopyButton value={url} className="flex-1 border border-current/30 px-3 py-2 text-xs">
              Copy link
            </CopyButton>
            <button
              type="button"
              className="flex-1 border border-current/30 px-3 py-2 text-xs"
              onClick={async () => {
                if (navigator.share) await navigator.share({ title: name, url }).catch(() => undefined);
                else await navigator.clipboard.writeText(url);
              }}
            >
              Send
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function GalleryGrid({ images, className, tileClass }: { images: { id: string; url: string; caption: string | null }[]; className?: string; tileClass?: string }) {
  const [active, setActive] = useState<string | null>(null);
  const current = images.find((image) => image.id === active);
  return (
    <>
      <div className={className}>
        {images.map((image) => (
          <button key={image.id} type="button" className={tileClass} onClick={() => setActive(image.id)}>
            <img src={image.url} alt={image.caption || ""} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      {current ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true">
          <button type="button" className="absolute right-4 top-4 text-sm text-white" onClick={() => setActive(null)}>
            Close
          </button>
          <figure className="max-h-[90svh] max-w-5xl">
            <img src={current.url} alt={current.caption || ""} className="max-h-[80svh] w-auto max-w-full object-contain" />
            {current.caption ? <figcaption className="mt-3 text-center text-sm text-white/80">{current.caption}</figcaption> : null}
          </figure>
        </div>
      ) : null}
    </>
  );
}
