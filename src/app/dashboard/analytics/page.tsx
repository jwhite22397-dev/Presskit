import Link from "next/link";
import { canUseAnalytics } from "@/config/plans";
import { audienceStory } from "@/lib/analytics";
import { AnalyticsPanel } from "@/components/dashboard/analytics-panel";
import { getSessionUser } from "@/server/auth";
import { analyticsForUser } from "@/server/artists";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const user = await getSessionUser();
  if (!user) return null;
  const result = await analyticsForUser(user.id, user.plan);
  if (!result.ok) return <p>{result.error}</p>;
  const story = audienceStory(result.events, 7);
  const extended = canUseAnalytics(user.plan);
  return (
    <main>
      <h1 className="display text-5xl">Your audience</h1>
      <p className="mt-3 max-w-xl text-muted">
        {story.visits > 0
          ? `${story.visitors} people visited in the last 7 days. ${story.actions} took an action.`
          : "When people open your page, this is where you see what they did."}
      </p>
      <p className="mt-2 max-w-xl text-sm text-muted">Fan action rate is the share of visitors who listened, watched, followed, or checked a date. We store a random id in the browser. No fingerprinting.</p>
      <div className="mt-8">
        <AnalyticsPanel events={result.events} extended={extended} />
      </div>
      {extended ? null : (
        <p className="mt-8 text-sm text-muted">
          Free includes this 7-day snapshot. <Link href="/dashboard/account" className="text-accent underline">Pro</Link> adds 30 and 90 days, plus where visits came from.
        </p>
      )}
    </main>
  );
}
