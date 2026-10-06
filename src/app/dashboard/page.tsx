import Link from "next/link";
import { canUseAnalytics } from "@/config/plans";
import { calculateCompleteness } from "@/lib/completeness";
import { aggregateAnalytics } from "@/lib/analytics";
import { artistPath, formatDate } from "@/lib/utils";
import { getSessionUser } from "@/server/auth";
import { analyticsForUser, getOwnedArtist } from "@/server/artists";
import { CopyButton } from "@/components/artist/widgets";
import { artistUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const user = await getSessionUser();
  if (!user) return null;
  const artist = await getOwnedArtist(user.id, user.plan, user.displayName);
  const completeness = calculateCompleteness(artist);
  const nextItem = completeness.items.find((item) => !item.completed);
  const analytics = canUseAnalytics(user.plan) ? await analyticsForUser(user.id, user.plan) : null;
  const summary = analytics && analytics.ok ? aggregateAnalytics(analytics.events, 30) : null;
  const published = artist.site.status === "published";
  const activity = [
    ...artist.releases.map((item) => ({ label: `Release · ${item.title}`, at: item.created_at })),
    ...artist.shows.map((item) => ({ label: `Show · ${item.event_name}`, at: item.created_at })),
    ...artist.press.map((item) => ({ label: `Press · ${item.publication}`, at: item.created_at })),
  ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 5);

  return (
    <main>
      <p className="text-xs uppercase tracking-[0.28em] text-muted">{published ? "Published" : "Draft"}</p>
      <h1 className="display mt-3 text-5xl">{artist.site.artist_name}</h1>
      <p className="mt-3 text-muted">{completeness.percentage}% complete{artist.site.updated_at ? ` · Updated ${formatDate(artist.site.updated_at)}` : ""}</p>

      <section className="mt-8 border border-line p-5">
        <div className="h-1 bg-white/10"><div className="h-1 bg-accent" style={{ width: `${completeness.percentage}%` }} /></div>
        <ul className="mt-4 grid gap-2 text-sm md:grid-cols-2">
          {completeness.items.map((item) => (
            <li key={item.key} className={item.completed ? "text-foreground" : "text-muted"}>{item.completed ? "✓" : "○"} {item.label}</li>
          ))}
        </ul>
        {nextItem?.recommendation ? <p className="mt-4 text-sm text-muted">{nextItem.recommendation}</p> : null}
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link href="/dashboard/site" className="border border-line px-4 py-4">Edit site</Link>
        <Link href="/dashboard/content" className="border border-line px-4 py-4">Add music or a show</Link>
        <Link href="/dashboard/preview" className="border border-line px-4 py-4">Preview</Link>
        {published ? <Link href={artistPath(artist.site.slug)} className="border border-line px-4 py-4">View public site</Link> : <Link href="/dashboard/site" className="border border-line px-4 py-4">Publish</Link>}
      </section>

      {published ? (
        <div className="mt-4">
          <CopyButton value={artistUrl(artist.site.slug)} className="border border-line px-4 py-3 text-sm">Copy link</CopyButton>
        </div>
      ) : null}

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Stat label="Views, 30 days" value={summary ? String(summary.total_views) : "Pro"} hint={summary ? `${summary.unique_visitors} visitors` : "Upgrade to see who is checking you out."} />
        <Stat label="Link clicks" value={summary ? String(summary.total_clicks) : "—"} hint={summary?.top_links[0]?.label} />
        <Stat label="EPK views" value={summary ? String(summary.epk_views) : "—"} hint={summary ? `${summary.pdf_downloads} PDF downloads` : undefined} />
      </section>
      {!summary ? <Link href="/dashboard/account" className="mt-4 inline-block text-sm text-accent underline">Upgrade to Pro for analytics</Link> : null}

      <section className="mt-10">
        <h2 className="text-xs uppercase tracking-[0.22em] text-muted">Recent activity</h2>
        {activity.length ? (
          <ul className="mt-3 divide-y divide-line border-y border-line text-sm">
            {activity.map((item) => <li key={item.label} className="flex justify-between gap-4 py-3"><span>{item.label}</span><span className="text-muted">{formatDate(item.at)}</span></li>)}
          </ul>
        ) : <p className="mt-3 text-sm text-muted">Nothing added yet. Start with a release or a short bio.</p>}
      </section>
    </main>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <article className="border border-line p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-2 text-3xl">{value}</p>
      {hint ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}
    </article>
  );
}
