import { NextResponse } from "next/server";
import { canDownloadPDF } from "@/config/plans";
import { toPublicArtist } from "@/lib/serialize";
import { lookupPublic, recordEvent } from "@/server/artists";
import { renderEpkPdf } from "@/server/pdf";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const result = await lookupPublic(slug);
  if (result.type !== "artist") return NextResponse.json({ error: "Not found" }, { status: 404 });
  const data = toPublicArtist(result.data);
  if (!canDownloadPDF(data.plan)) {
    return NextResponse.json({ error: "PDF export is a Pro feature." }, { status: 402 });
  }
  const pdf = await renderEpkPdf(data);
  await recordEvent({ slug: data.site.slug, eventType: "pdf_download", label: "PDF" });
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${data.site.slug}-epk.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
