import type { CSSProperties } from "react";
import type { PublicArtistData } from "@/lib/serialize";

export const FONT_STACKS: Record<string, { heading: string; body: string }> = {
  modern: { heading: "var(--font-inter), sans-serif", body: "var(--font-inter), sans-serif" },
  editorial: { heading: "var(--font-instrument), serif", body: "var(--font-dm), sans-serif" },
  bold: { heading: "var(--font-bebas), sans-serif", body: "var(--font-dm), sans-serif" },
  elegant: { heading: "var(--font-cormorant), serif", body: "var(--font-dm), sans-serif" },
  minimal: { heading: "var(--font-dm), sans-serif", body: "var(--font-dm), sans-serif" },
};

export const PLATFORM_LABELS: Record<string, string> = {
  spotify: "Spotify",
  apple: "Apple Music",
  youtube: "YouTube",
  soundcloud: "SoundCloud",
  bandcamp: "Bandcamp",
  other: "Listen",
  instagram: "Instagram",
  tiktok: "TikTok",
  x: "X",
  facebook: "Facebook",
  threads: "Threads",
  website: "Website",
};

const SECTION_IDS = ["music", "videos", "about", "shows", "press", "gallery", "highlights", "contact"] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export function frameStyle(fontPairing: string, accent: string, fallback: string): CSSProperties {
  const fonts = FONT_STACKS[fontPairing] ?? FONT_STACKS.editorial;
  return {
    fontFamily: fonts.body,
    ["--pk-heading" as string]: fonts.heading,
    ["--pk-accent" as string]: accent.startsWith("#") ? accent : fallback,
  };
}

export function visibleSectionIds(data: PublicArtistData): SectionId[] {
  const hidden = new Set(data.site.hidden_sections);
  const availability: Record<SectionId, boolean> = {
    music: data.releases.length > 0,
    videos: data.videos.length > 0,
    about: Boolean(data.site.short_bio || data.site.full_bio),
    shows: data.shows.length > 0,
    press: data.press.length > 0,
    gallery: data.gallery.length > 0,
    highlights: data.highlights.length > 0,
    contact: Boolean(data.site.booking_email || data.site.management_email || data.site.press_email),
  };
  const order = (data.site.section_order.length ? data.site.section_order : [...SECTION_IDS]).filter((id): id is SectionId =>
    (SECTION_IDS as readonly string[]).includes(id),
  );
  return order.filter((id) => !hidden.has(id) && availability[id]);
}

export function heroLinks(data: PublicArtistData) {
  if (data.links.length) return data.links.map((link) => ({ id: link.id, label: link.label, url: link.url }));
  const featured = data.releases.find((release) => release.is_featured) ?? data.releases[0];
  const listen = featured?.links[0];
  if (listen) return [{ id: "listen", label: "Listen now", url: listen.url }];
  if (data.site.booking_email) return [{ id: "book", label: "Book me", url: `mailto:${data.site.booking_email}` }];
  return [];
}
