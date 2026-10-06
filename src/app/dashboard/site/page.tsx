import { SiteEditor } from "@/components/dashboard/site-editor";
import { getSessionUser } from "@/server/auth";
import { getOwnedArtist } from "@/server/artists";

export const dynamic = "force-dynamic";

export default async function SitePage() {
  const user = await getSessionUser();
  if (!user) return null;
  const artist = await getOwnedArtist(user.id, user.plan, user.displayName);
  return (
    <main>
      <h1 className="display text-5xl">My page</h1>
      <p className="mt-2 text-muted">Update your profile. PRESSKIT handles the layout.</p>
      <div className="mt-8"><SiteEditor data={artist} plan={user.plan} /></div>
    </main>
  );
}
