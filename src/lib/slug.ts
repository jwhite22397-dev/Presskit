const RESERVED_SLUGS = new Set([
  "a",
  "admin",
  "api",
  "account",
  "analytics",
  "auth",
  "billing",
  "blog",
  "contact",
  "dashboard",
  "demo",
  "docs",
  "epk",
  "example",
  "faq",
  "forgot-password",
  "help",
  "home",
  "login",
  "logout",
  "onboarding",
  "pricing",
  "privacy",
  "settings",
  "signup",
  "support",
  "terms",
  "themes",
  "www",
]);

export function normalizeSlug(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 40)
    .replace(/-+$/g, "");
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug);
}

export type SlugValidation =
  | { ok: true; slug: string }
  | { ok: false; reason: string };

export function validateSlug(input: string): SlugValidation {
  const slug = normalizeSlug(input);
  if (!slug) return { ok: false, reason: "Use letters or numbers." };
  if (slug.length < 3) return { ok: false, reason: "Use at least 3 characters." };
  if (isReservedSlug(slug)) return { ok: false, reason: "That address is reserved." };
  return { ok: true, slug };
}

export function reservedSlugs() {
  return [...RESERVED_SLUGS];
}
