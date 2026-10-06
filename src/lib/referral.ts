export function referralSlug(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const slug = value.trim().toLowerCase();
  if (!/^[a-z0-9-]{3,40}$/.test(slug)) return null;
  if (slug.startsWith("draft-")) return null;
  return slug;
}
