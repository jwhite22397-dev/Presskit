import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { EpkView } from "@/components/artist/epk-view";
import { toPublicArtist } from "@/lib/serialize";
import { artistUrl } from "@/lib/utils";
import { lookupPublic } from "@/server/artists";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const result = await lookupPublic(slug);
  if (result.type !== "artist") return { title: "EPK" };
  return {
    title: { absolute: `${result.data.site.artist_name} EPK` },
    description: result.data.site.short_bio || `${result.data.site.artist_name} electronic press kit`,
    alternates: { canonical: `${artistUrl(result.data.site.slug)}/epk` },
  };
}

export default async function EpkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await lookupPublic(slug);
  if (result.type === "redirect") redirect(`/a/${result.to}/epk`);
  if (result.type === "none") notFound();
  return <EpkView data={toPublicArtist(result.data)} />;
}
