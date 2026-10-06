import { sanitizeUrl } from "@/lib/urls";

export interface EmbedResult {
  provider: "youtube" | "vimeo" | "spotify";
  src: string;
}

function youtubeId(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, "");
  let id: string | null = null;
  if (host === "youtu.be") id = url.pathname.split("/").filter(Boolean)[0] ?? null;
  if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
    if (url.pathname === "/watch") id = url.searchParams.get("v");
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "live") id = parts[1] ?? null;
  }
  if (!id || !/^[\w-]{11}$/.test(id)) return null;
  return id;
}

function vimeoId(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, "");
  if (host !== "vimeo.com" && host !== "player.vimeo.com") return null;
  const parts = url.pathname.split("/").filter(Boolean);
  const id = host === "player.vimeo.com" ? parts[1] : parts[0];
  if (!id || !/^\d+$/.test(id)) return null;
  return id;
}

export function videoEmbed(input: string): EmbedResult | null {
  const safe = sanitizeUrl(input);
  if (!safe) return null;
  const url = new URL(safe);
  const youtube = youtubeId(url);
  if (youtube) {
    return { provider: "youtube", src: `https://www.youtube-nocookie.com/embed/${youtube}` };
  }
  const vimeo = vimeoId(url);
  if (vimeo) {
    return { provider: "vimeo", src: `https://player.vimeo.com/video/${vimeo}` };
  }
  return null;
}

export function spotifyEmbed(input: string): EmbedResult | null {
  const safe = sanitizeUrl(input);
  if (!safe) return null;
  const url = new URL(safe);
  const host = url.hostname.replace(/^www\./, "");
  if (host !== "open.spotify.com") return null;
  const parts = url.pathname.split("/").filter(Boolean);
  const kinds = ["track", "album", "playlist", "artist", "episode"];
  const index = parts.findIndex((part) => kinds.includes(part));
  if (index === -1) return null;
  const kind = parts[index];
  const id = parts[index + 1];
  if (!id || !/^[A-Za-z0-9]+$/.test(id)) return null;
  return { provider: "spotify", src: `https://open.spotify.com/embed/${kind}/${id}` };
}
