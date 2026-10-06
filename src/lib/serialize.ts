import type { ArtistData, ArtistSite } from "@/types";

export interface PublicArtistSite extends Omit<ArtistSite, "user_id"> {
  user_id?: never;
}

export interface PublicArtistData extends Omit<ArtistData, "site"> {
  site: PublicArtistSite;
}

export function toPublicArtist(data: ArtistData): PublicArtistData {
  const site = { ...data.site };
  delete (site as { user_id?: string }).user_id;
  return {
    ...data,
    plan: data.site.public_plan,
    site: site as unknown as PublicArtistSite,
  };
}
