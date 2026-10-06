import Stripe from "stripe";
import { isDemoMode } from "@/lib/env";
import { isStripeConfigured } from "@/lib/server-env";
import { appUrl } from "@/lib/utils";
import type { Plan } from "@/types";
import { createServiceSupabase } from "@/lib/supabase/server";
import { setUserPlan } from "@/server/artists";
import { readState } from "@/server/demo-store";

function priceId(interval: "monthly" | "yearly" | "lifetime") {
  if (interval === "monthly") return process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
  if (interval === "yearly") return process.env.STRIPE_PRO_YEARLY_PRICE_ID;
  return process.env.STRIPE_LIFETIME_PRICE_ID;
}

export async function createCheckout(input: { userId: string; email: string; interval: "monthly" | "yearly" | "lifetime" }) {
  if (!isStripeConfigured() || isDemoMode()) {
    return {
      ok: false as const,
      error: "Stripe is not configured. In local development, simulate a plan from Account settings.",
    };
  }
  const price = priceId(input.interval);
  if (!price) return { ok: false as const, error: "Missing Stripe price id. Check .env.example." };
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const session = await stripe.checkout.sessions.create({
    mode: input.interval === "lifetime" ? "payment" : "subscription",
    customer_email: input.email,
    line_items: [{ price, quantity: 1 }],
    success_url: `${appUrl()}/dashboard/account?billing=success`,
    cancel_url: `${appUrl()}/dashboard/account?billing=cancelled`,
    client_reference_id: input.userId,
    metadata: {
      user_id: input.userId,
      plan: input.interval === "lifetime" ? "lifetime" : "pro",
    },
    allow_promotion_codes: true,
  });
  if (!session.url) return { ok: false as const, error: "Stripe did not return a checkout URL." };
  return { ok: true as const, url: session.url };
}

export async function createPortal(userId: string) {
  if (!isStripeConfigured() || isDemoMode()) {
    return { ok: false as const, error: "Billing portal is available once Stripe is configured." };
  }
  const admin = createServiceSupabase();
  const { data: profile } = await admin.from("profiles").select("stripe_customer_id").eq("id", userId).maybeSingle();
  if (!profile?.stripe_customer_id) return { ok: false as const, error: "No Stripe customer exists for this account yet." };
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${appUrl()}/dashboard/account`,
  });
  return { ok: true as const, url: session.url };
}

export async function applyStripeEvent(rawBody: string, signature: string | null) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("Stripe webhook is not configured.");
  }
  if (!signature) throw new Error("Missing Stripe signature.");
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  const admin = createServiceSupabase();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.user_id || session.client_reference_id;
    const plan = (session.metadata?.plan === "lifetime" ? "lifetime" : "pro") as Plan;
    if (userId) {
      await admin.from("profiles").update({
        plan,
        plan_source: "stripe",
        stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
        stripe_subscription_id: typeof session.subscription === "string" ? session.subscription : null,
        subscription_status: plan === "lifetime" ? "active" : "active",
      }).eq("id", userId);
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const customerId = typeof subscription.customer === "string" ? subscription.customer : null;
    if (!customerId) return { received: true };
    const active = subscription.status === "active" || subscription.status === "trialing";
    const { data: profile } = await admin.from("profiles").select("id, plan").eq("stripe_customer_id", customerId).maybeSingle();
    if (profile && profile.plan !== "lifetime") {
      await admin.from("profiles").update({
        plan: active ? "pro" : "free",
        subscription_status: subscription.status,
        stripe_subscription_id: subscription.id,
      }).eq("id", profile.id);
    }
  }

  return { received: true };
}

export async function simulatePlan(actorId: string, plan: Plan) {
  if (!isDemoMode() || process.env.NODE_ENV === "production") {
    return { ok: false as const, error: "Plan simulation is only available in local demo mode." };
  }
  const state = await readState();
  if (!state.users.some((user) => user.id === actorId)) return { ok: false as const, error: "User not found." };
  return setUserPlan(actorId, actorId, plan, "simulated");
}
