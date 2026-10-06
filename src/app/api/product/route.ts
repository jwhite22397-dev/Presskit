import { NextResponse } from "next/server";
import { isPublicProductEvent, trackProductEvent } from "@/lib/product-analytics";
import { referralSlug } from "@/lib/referral";

export async function POST(request: Request) {
  let body: { name?: string; slug?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!body.name || !isPublicProductEvent(body.name)) return NextResponse.json({ ok: false }, { status: 400 });
  const slug = referralSlug(body.slug);
  trackProductEvent(body.name, slug ? { slug } : {});
  return NextResponse.json({ ok: true });
}
