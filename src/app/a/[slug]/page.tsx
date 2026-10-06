import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ArtistSite } from "@/components/artist/themes";
import { toPublicArtist } from "@/lib/serialize";
import { artistUrl } from "@/lib/utils";
import { lookupPublic } from "@/server/artists";

export const dynamic = "force-dynamic";

async function load(slug: string) {
  return lookupPublic(slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const result = await load(slug);
  if (result.type !== "artist") return { title: "Artist" };
  const site = result.data.site;
  const title = site.meta_title || site.artist_name;
  const description = site.meta_description || site.short_bio || site.tagline || `${site.artist_name} artist site and EPK`;
  const image = site.hero_image_url || site.profile_image_url || undefined;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: artistUrl(site.slug) },
    openGraph: { title, description, url: artistUrl(site.slug), images: image ? [{ url: image }] : undefined },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
  };
}

export default async function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await load(slug);
  if (result.type === "redirect") redirect(`/a/${result.to}`);
  if (result.type === "none") notFound();
  const data = toPublicArtist(result.data);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: data.site.artist_name,
    genre: data.site.genre,
    url: artistUrl(data.site.slug),
    image: data.site.hero_image_url || data.site.profile_image_url,
    description: data.site.short_bio,
    location: data.site.city,
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ArtistSite data={data} />
    </>
  );
}
