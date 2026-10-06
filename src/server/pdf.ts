import { readFile } from "node:fs/promises";
import path from "node:path";
import { jsPDF } from "jspdf";
import type { PublicArtistData } from "@/lib/serialize";
import { artistUrl, formatDate } from "@/lib/utils";
import { splitShows } from "@/lib/shows";

async function imageData(url: string | null) {
  if (!url) return null;
  try {
    if (url.startsWith("/")) {
      const file = path.join(process.cwd(), "public", url);
      if (!file.startsWith(path.join(process.cwd(), "public"))) return null;
      const bytes = await readFile(file);
      const type = url.endsWith(".png") ? "PNG" : "JPEG";
      return { type, data: `data:image/${type === "PNG" ? "png" : "jpeg"};base64,${bytes.toString("base64")}` };
    }
    if (!url.startsWith("https://")) return null;
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) return null;
    const bytes = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type") || "";
    const type = contentType.includes("png") ? "PNG" : "JPEG";
    return { type, data: `data:image/${type === "PNG" ? "png" : "jpeg"};base64,${bytes.toString("base64")}` };
  } catch {
    return null;
  }
}

export async function renderEpkPdf(data: PublicArtistData) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  let y = margin;
  const site = data.site;

  const ensure = (height: number) => {
    if (y + height <= pageHeight - margin) return;
    doc.addPage();
    y = margin;
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(90);
  doc.text("ELECTRONIC PRESS KIT", margin, y);
  doc.text(artistUrl(site.slug).replace(/^https?:\/\//, ""), pageWidth - margin, y, { align: "right" });
  y += 28;

  const photo = await imageData(site.profile_image_url || site.hero_image_url);
  if (photo) {
    doc.addImage(photo.data, photo.type, pageWidth - margin - 120, y, 120, 150);
  }

  doc.setTextColor(12);
  doc.setFont("times", "bold");
  doc.setFontSize(32);
  const nameWidth = photo ? pageWidth - margin * 2 - 140 : pageWidth - margin * 2;
  const nameLines = doc.splitTextToSize(site.artist_name, nameWidth);
  doc.text(nameLines, margin, y + 24);
  y += 24 + nameLines.length * 34;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(60);
  const meta = [site.genre, site.city].filter(Boolean).join("  ·  ");
  if (meta) {
    doc.text(meta, margin, y);
    y += 18;
  }
  if (site.tagline) {
    doc.setFont("times", "italic");
    doc.setFontSize(13);
    doc.setTextColor(20);
    const taglines = doc.splitTextToSize(site.tagline, nameWidth);
    doc.text(taglines, margin, y);
    y += taglines.length * 16 + 8;
  }

  y = Math.max(y, photo ? margin + 28 + 160 : y);
  y += 8;
  doc.setDrawColor(20);
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 24;

  const section = (title: string) => {
    ensure(36);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(90);
    doc.text(title, margin, y);
    y += 16;
    doc.setTextColor(20);
  };

  const bio = site.short_bio || site.full_bio;
  if (bio) {
    section("BIOGRAPHY");
    doc.setFont("times", "normal");
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(bio, pageWidth - margin * 2);
    ensure(lines.length * 16);
    doc.text(lines.slice(0, 12), margin, y);
    y += Math.min(lines.length, 12) * 16 + 16;
  }

  if (data.highlights.length) {
    section("CAREER HIGHLIGHTS");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    for (const highlight of data.highlights.slice(0, 6)) {
      ensure(16);
      doc.text(`•  ${highlight.text}`, margin, y);
      y += 16;
    }
    y += 10;
  }

  const featured = data.releases.find((release) => release.is_featured) ?? data.releases[0];
  if (featured) {
    section("FEATURED MUSIC");
    doc.setFont("times", "bold");
    doc.setFontSize(16);
    doc.text(featured.title, margin, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(70);
    const detail = [featured.type.toUpperCase(), featured.release_date ? formatDate(featured.release_date) : null].filter(Boolean).join("  ·  ");
    doc.text(detail, margin, y);
    y += 14;
    doc.text(featured.links.map((link) => link.platform).join("   "), margin, y);
    y += 20;
  }

  if (data.press.length) {
    section("PRESS");
    for (const item of data.press.slice(0, 3)) {
      doc.setFont("times", "italic");
      doc.setFontSize(13);
      doc.setTextColor(20);
      const quote = doc.splitTextToSize(`“${item.quote}”`, pageWidth - margin * 2);
      ensure(quote.length * 16 + 16);
      doc.text(quote, margin, y);
      y += quote.length * 16 + 4;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(80);
      doc.text(`— ${item.publication}`, margin, y);
      y += 20;
    }
  }

  const { upcoming } = splitShows(data.shows);
  if (upcoming.length) {
    section("UPCOMING SHOWS");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(20);
    for (const show of upcoming.slice(0, 5)) {
      ensure(16);
      doc.text(`${formatDate(show.date)}   ${show.event_name} — ${show.venue}, ${show.city}`, margin, y);
      y += 16;
    }
    y += 8;
  }

  const contacts = [
    site.booking_email ? `Booking  ${site.booking_email}` : null,
    site.management_email ? `Management  ${site.management_email}` : null,
    site.press_email ? `Press  ${site.press_email}` : null,
  ].filter((line): line is string => Boolean(line));
  if (contacts.length) {
    section("CONTACT");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(20);
    for (const line of contacts) {
      ensure(16);
      doc.text(line, margin, y);
      y += 16;
    }
  }

  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(130);
    doc.text("Artist-provided information. Generated with PRESSKIT.", margin, pageHeight - 28);
    doc.text(String(page), pageWidth - margin, pageHeight - 28, { align: "right" });
  }

  return Buffer.from(doc.output("arraybuffer"));
}
