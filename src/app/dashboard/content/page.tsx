import { ContentStudio } from "@/components/dashboard/content-studio";
import { getSessionUser } from "@/server/auth";
import { getOwnedArtist } from "@/server/artists";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const user = await getSessionUser();
  if (!user) return null;
  const artist = await getOwnedArtist(user.id, user.plan, user.displayName);
  return (
    <main>
      <h1 className="display text-5xl">Content</h1>
      <p className="mt-2 mb-8 text-muted">Add music, shows, press, and photos without starting over.</p>
      <ContentStudio data={artist} />
    </main>
  );
}
