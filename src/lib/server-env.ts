import { isDemoMode } from "@/lib/env";

export function canSimulateBilling() {
  return isDemoMode() && process.env.NODE_ENV !== "production";
}

export function adminUserIds() {
  return (process.env.ADMIN_USER_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export function isAdminUser(userId: string) {
  return adminUserIds().includes(userId);
}

export function sessionSecret() {
  return process.env.DEMO_SESSION_SECRET || "presskit-local-demo-session-secret";
}

export function isStripeConfigured() {
  const secret = process.env.STRIPE_SECRET_KEY;
  const price = process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
  const publishable = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const configured = (value: string | undefined) => Boolean(value && !value.startsWith("your_"));
  return configured(secret) && configured(publishable) && configured(price);
}
