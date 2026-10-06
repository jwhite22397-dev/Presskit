import { OnboardingWizard, YoureLive } from "@/components/onboarding/wizard";
import { getSessionUser } from "@/server/auth";
import { getOwnedArtist } from "@/server/artists";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ live?: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const artist = await getOwnedArtist(user.id, user.plan, user.displayName);
  const live = (await searchParams).live === "1";
  const published = artist.site.status === "published" && !artist.site.slug.startsWith("draft-");
  if (published && artist.site.onboarding_completed && !live) redirect("/dashboard");
  return (
    <main className="mx-auto min-h-screen max-w-xl px-5 py-8 pb-16">
      <p className="text-xs tracking-[0.35em]">PRESSKIT</p>
      <div className="mt-8">
        {published && live ? (
          <YoureLive name={artist.site.artist_name} slug={artist.site.slug} />
        ) : (
          <OnboardingWizard artistName={artist.site.artist_name} slug={artist.site.slug} />
        )}
      </div>
    </main>
  );
}
