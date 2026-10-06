import { NextResponse } from "next/server";
import { recordEvent } from "@/server/artists";
import type { AnalyticsEventType } from "@/types";

const TYPES = new Set<AnalyticsEventType>([
  "page_view",
  "music_click",
  "social_click",
  "booking_click",
  "ticket_click",
  "custom_link_click",
  "epk_view",
  "pdf_download",
  "video_click",
]);

export async function POST(request: Request) {
  let body: { slug?: string; event_type?: string; label?: string; visitor_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!body.slug || !body.event_type || !TYPES.has(body.event_type as AnalyticsEventType)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!/^[a-z0-9-]{3,40}$/.test(body.slug)) return NextResponse.json({ ok: false }, { status: 400 });
  await recordEvent({
    slug: body.slug,
    eventType: body.event_type as AnalyticsEventType,
    label: body.label,
    visitorId: body.visitor_id,
    referrer: request.headers.get("referer"),
  });
  return NextResponse.json({ ok: true });
}
