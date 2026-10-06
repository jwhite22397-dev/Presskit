export type ProductEventName =
  | "landing_view"
  | "signup_started"
  | "signup_completed"
  | "artist_name_entered"
  | "slug_claimed"
  | "photo_uploaded"
  | "music_added"
  | "social_added"
  | "page_published"
  | "site_published"
  | "time_to_publish"
  | "profile_completion_percentage"
  | "artist_page_viewed"
  | "epk_viewed"
  | "artist_shared_page"
  | "artist_copied_link"
  | "made_with_presskit_clicked"
  | "referral_signup"
  | "bio_link_intent"
  | "pro_upgrade_started"
  | "pro_upgrade_completed"
  | "upgrade_started"
  | "upgrade_completed"
  | "release_added"
  | "epk_downloaded"
  | "founding_code_redeemed";

export type ProductProperties = Record<string, string | number | boolean | null>;

const PUBLIC_EVENTS = new Set<ProductEventName>([
  "landing_view",
  "made_with_presskit_clicked",
  "artist_shared_page",
  "artist_copied_link",
  "bio_link_intent",
]);

export function isPublicProductEvent(name: string): name is ProductEventName {
  return PUBLIC_EVENTS.has(name as ProductEventName);
}

export function trackProductEvent(name: ProductEventName, properties?: ProductProperties) {
  const safe = sanitizeProperties(properties);
  console.info(
    JSON.stringify({
      source: "presskit.product",
      event: name,
      properties: safe,
      at: new Date().toISOString(),
    }),
  );
  if (typeof window !== "undefined") return;
  void import("@/server/product-events")
    .then((module) => module.persistProductEvent(name, safe))
    .catch(() => undefined);
}

export function sanitizeProperties(properties?: ProductProperties): ProductProperties {
  const safe: ProductProperties = {};
  if (!properties) return safe;
  for (const [key, value] of Object.entries(properties)) {
    if (!/^[a-z0-9_]{1,40}$/.test(key)) continue;
    if (typeof value === "string") safe[key] = value.slice(0, 120);
    else if (typeof value === "number" && Number.isFinite(value)) safe[key] = value;
    else if (typeof value === "boolean" || value === null) safe[key] = value;
  }
  return safe;
}
