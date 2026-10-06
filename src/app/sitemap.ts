import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/utils";
import { publishedSlugs } from "@/server/artists";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = appUrl();
  const slugs = await publishedSlugs();
  const staticRoutes = ["", "/privacy", "/terms", "/contact", "/support", "/signup", "/login"].map((path) => ({
    url: `${base}${path || "/"}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.4,
  }));
  const artists = slugs.flatMap((slug) => [
    { url: `${base}/a/${slug}`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${base}/a/${slug}/epk`, changeFrequency: "weekly" as const, priority: 0.6 },
  ]);
  return [...staticRoutes, ...artists];
}
