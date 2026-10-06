import { AccountPanel } from "@/components/dashboard/account-panel";
import { canSimulateBilling } from "@/lib/server-env";
import { getSessionUser } from "@/server/auth";
import { getOwnedArtist } from "@/server/artists";

export const dynamic = "force-dynamic";

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ billing?: string }> }) {
  const user = await getSessionUser();
  if (!user) return null;
  const artist = await getOwnedArtist(user.id, user.plan, user.displayName);
  const billing = (await searchParams).billing;
  return (
    <main>
      <h1 className="display text-5xl">Account</h1>
      {billing === "success" ? <p className="mt-4 text-sm text-accent">Payment received. Your plan updates when Stripe confirms the webhook.</p> : null}
      {billing === "cancelled" ? <p className="mt-4 text-sm text-muted">Checkout canceled.</p> : null}
      <div className="mt-8">
        <AccountPanel
          name={user.displayName || artist.site.artist_name}
          email={user.email}
          plan={user.plan}
          slug={artist.site.slug}
          published={artist.site.status === "published"}
          simulate={canSimulateBilling()}
        />
      </div>
    </main>
  );
}
