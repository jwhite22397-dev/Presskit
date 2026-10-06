export type ProductEventName =
  | "signup_started"
  | "signup_completed"
  | "site_published"
  | "release_added"
  | "epk_downloaded"
  | "upgrade_started"
  | "upgrade_completed";

export function trackProductEvent(name: ProductEventName, properties?: Record<string, string | number | boolean | null>) {
  console.info(
    JSON.stringify({
      source: "presskit.product",
      event: name,
      properties: properties ?? {},
      at: new Date().toISOString(),
    }),
  );
}
