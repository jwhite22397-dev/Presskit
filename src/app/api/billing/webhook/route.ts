import { NextResponse } from "next/server";
import { applyStripeEvent } from "@/server/billing";
import { trackProductEvent } from "@/lib/product-analytics";

export async function POST(request: Request) {
  const body = await request.text();
  try {
    await applyStripeEvent(body, request.headers.get("stripe-signature"));
    trackProductEvent("pro_upgrade_completed");
    trackProductEvent("upgrade_completed");
    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook failed";
    console.error(JSON.stringify({ source: "presskit.billing", message }));
    return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
  }
}
