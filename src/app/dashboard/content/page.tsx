import { ContentStudio } from "@/components/dashboard/content-studio";
import { getSessionUser } from "@/server/auth";
import { getOwnedArtist } from "@/server/artists";

export const dynamic = "force-dynamic";

export default async function ContentPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const user = await getSessionUser();
  if (!user) return null;
  const artist = await getOwnedArtist(user.id, user.plan, user.displayName);
  const tab = (await searchParams).tab;
  return (
    <main>
      <h1 className="display text-5xl">Content</h1>
      <p className="mt-2 mb-8 text-muted">Releases, videos, shows, and the rest of your profile. The page updates itself.</p>
      <ContentStudio data={artist} initialTab={tab} />
    </main>
  );
}
