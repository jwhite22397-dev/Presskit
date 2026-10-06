import { OnboardingWizard } from "@/components/onboarding/wizard";
import { getSessionUser } from "@/server/auth";
import { getOwnedArtist } from "@/server/artists";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const artist = await getOwnedArtist(user.id, user.plan, user.displayName);
  if (artist.site.onboarding_completed && artist.site.status === "published") redirect("/dashboard");
  return (
    <main className="mx-auto min-h-screen max-w-xl px-5 py-10">
      <p className="text-xs tracking-[0.35em]">PRESSKIT</p>
      <div className="mt-8">
        <OnboardingWizard data={artist} plan={user.plan} />
      </div>
    </main>
  );
}
