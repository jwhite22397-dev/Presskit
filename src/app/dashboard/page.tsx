import Link from "next/link";
import { canUseAnalytics } from "@/config/plans";
import { calculateCompleteness } from "@/lib/completeness";
import { aggregateAnalytics, audienceStory } from "@/lib/analytics";
import { artistPath, artistUrl, epkPath, formatDate } from "@/lib/utils";
import { optimizationService } from "@/lib/optimization";
import { getSessionUser } from "@/server/auth";
import { analyticsForUser, getOwnedArtist } from "@/server/artists";
import { CopyButton, ShareLinkButton } from "@/components/artist/widgets";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const user = await getSessionUser();
  if (!user) return null;
  const artist = await getOwnedArtist(user.id, user.plan, user.displayName);
  const completeness = calculateCompleteness(artist);
  const recommendation = optimizationService().recommend(artist)[0];
  const analytics = await analyticsForUser(user.id, user.plan);
  const story = analytics.ok ? audienceStory(analytics.events, 7) : null;
  const extended = analytics.ok && canUseAnalytics(user.plan) ? aggregateAnalytics(analytics.events, 30) : null;
  const published = artist.site.status === "published" && !artist.site.slug.startsWith("draft-");
  const featured = artist.releases.find((release) => release.is_featured) ?? artist.releases[0];
  const url = published ? artistUrl(artist.site.slug) : "";

  return (
    <main>
      {user.planSource === "founding" ? (
        <section className="mb-8 border border-accent/40 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.28em] text-accent">Founding Artist</p>
          <p className="mt-2 text-lg">{user.plan === "lifetime" ? "Lifetime PRESSKIT Pro" : "PRESSKIT Pro"}</p>
          <p className="mt-1 text-sm text-muted">Thank you for helping build PRESSKIT.</p>
        </section>
      ) : null}

      <p className="text-xs uppercase tracking-[0.28em] text-muted">{published ? "Live" : "Draft"}</p>
      <h1 className="display mt-3 text-5xl">{artist.site.artist_name}</h1>

      {published ? (
        <div className="mt-6 grid gap-3">
          <Link href={artistPath(artist.site.slug)} className="bg-accent px-4 py-4 text-center text-sm font-medium text-black">View my PRESSKIT</Link>
          <div className="grid grid-cols-2 gap-3">
            <CopyButton value={url} product="artist_copied_link" className="border border-white px-3 py-4 text-sm">Copy my link</CopyButton>
            <ShareLinkButton url={url} title={artist.site.artist_name} className="border border-line px-3 py-4 text-sm">Share</ShareLinkButton>
          </div>
          <Link href={epkPath(artist.site.slug)} className="border border-line px-4 py-4 text-center text-sm">View my EPK</Link>
        </div>
      ) : (
        <Link href="/onboarding" className="mt-6 block bg-accent px-4 py-4 text-center text-sm font-medium text-black">Finish and publish</Link>
      )}

      <section className="mt-8 border border-line p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">Your PRESSKIT</p>
        <p className="mt-2 text-3xl">{completeness.percentage}% complete</p>
        <div className="mt-4 h-1 bg-white/10"><div className="h-1 bg-accent" style={{ width: `${completeness.percentage}%` }} /></div>
        <ul className="mt-4 grid gap-2 text-sm">
          {completeness.items.map((item) => (
            <li key={item.key}>
              {item.completed ? (
                <span>✓ {item.label}</span>
              ) : (
                <Link href={item.href ?? "/dashboard"} className="text-muted">+ Add {item.label.toLowerCase()}</Link>
              )}
            </li>
          ))}
        </ul>
      </section>

      {recommendation ? (
        <section className="mt-4 border border-line p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-muted">Let&apos;s make your PRESSKIT even better</p>
          <p className="mt-3 text-lg">{recommendation.title}</p>
          <p className="mt-1 text-sm text-muted">{recommendation.reason}</p>
          <Link href={recommendation.href} className="mt-4 inline-block text-sm text-accent underline">Do this next</Link>
        </section>
      ) : null}

      {featured ? (
        <section className="mt-4 border border-line p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-muted">Featured release</p>
          <p className="mt-2 text-2xl">{featured.title}</p>
          <p className="text-sm uppercase tracking-[0.16em] text-muted">{featured.type}</p>
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="text-xs uppercase tracking-[0.22em] text-muted">Your audience · 7 days</h2>
        {story && story.visits > 0 ? (
          <div className="mt-4 grid gap-3">
            <p className="text-2xl">{story.visitors} people visited your PRESSKIT.</p>
            <p className="text-muted">{story.actions} took an action. {story.listened} listened to music. {story.watched} watched a video.</p>
            <p className="text-muted">{story.instagram} opened your Instagram. {story.booking} checked booking information.</p>
            {story.topDestination ? <p>{story.topDestination} was your #1 destination.</p> : null}
            {story.fanActionRate !== null ? (
              <p><span className="text-xs uppercase tracking-[0.18em] text-muted">Fan action rate </span>{story.fanActionRate}%</p>
            ) : null}
            <p className="text-xs text-muted">Fan action rate is the share of visitors who did something besides look. {extended ? `The last 30 days: ${extended.total_views} visits.` : "Longer history is part of Pro."}</p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">No visits in the last 7 days yet. Share your link and this fills in.</p>
        )}
        {!canUseAnalytics(user.plan) ? <Link href="/dashboard/account" className="mt-4 inline-block text-sm text-accent underline">Pro adds 30 and 90 days</Link> : null}
      </section>

      <section className="mt-8">
        <h2 className="text-xs uppercase tracking-[0.22em] text-muted">Quick actions</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <Link href="/dashboard/content?tab=Music" className="border border-line px-3 py-4">+ Add release</Link>
          <Link href="/dashboard/content?tab=Shows" className="border border-line px-3 py-4">+ Add show</Link>
          <Link href="/dashboard/content?tab=Videos" className="border border-line px-3 py-4">+ Add video</Link>
          <Link href="/dashboard/site" className="border border-line px-3 py-4">Edit profile</Link>
        </div>
      </section>

      <p className="mt-8 text-xs text-muted">Updated {formatDate(artist.site.updated_at)}</p>
    </main>
  );
}
