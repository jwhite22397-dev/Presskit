import Link from "next/link";
import { canUseAnalytics } from "@/config/plans";
import { AnalyticsPanel } from "@/components/dashboard/analytics-panel";
import { getSessionUser } from "@/server/auth";
import { analyticsForUser } from "@/server/artists";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const user = await getSessionUser();
  if (!user) return null;
  if (!canUseAnalytics(user.plan)) {
    return (
      <main className="max-w-xl">
        <p className="text-xs uppercase tracking-[0.28em] text-accent">Pro</p>
        <h1 className="display mt-3 text-5xl">See who&apos;s checking you out.</h1>
        <p className="mt-4 text-muted">Upgrade to Pro to unlock visitor and link analytics. Free accounts still publish a full site.</p>
        <Link href="/dashboard/account" className="mt-6 inline-block bg-accent px-4 py-3 text-sm text-black">View plans</Link>
      </main>
    );
  }
  const result = await analyticsForUser(user.id, user.plan);
  if (!result.ok) return <p>{result.error}</p>;
  return (
    <main>
      <h1 className="display text-5xl">Analytics</h1>
      <p className="mt-2 mb-8 text-sm text-muted">First-party page views and clicks. No fingerprinting. Visitor counts use a random id stored in the browser.</p>
      <AnalyticsPanel events={result.events} />
    </main>
  );
}
