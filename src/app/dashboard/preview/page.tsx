import Link from "next/link";
import { ArtistSite } from "@/components/artist/themes";
import { toPublicArtist } from "@/lib/serialize";
import { getSessionUser } from "@/server/auth";
import { getOwnedArtist } from "@/server/artists";

export const dynamic = "force-dynamic";

export default async function PreviewPage() {
  const user = await getSessionUser();
  if (!user) return null;
  const artist = await getOwnedArtist(user.id, user.plan, user.displayName);
  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">Preview · {artist.site.status}</p>
        <Link href="/dashboard/site" className="text-sm underline">Back to editor</Link>
      </div>
      <div className="overflow-hidden border border-line">
        <ArtistSite data={toPublicArtist(artist)} preview />
      </div>
    </div>
  );
}
