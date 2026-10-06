import Link from "next/link";
import type { PublicArtistData } from "@/lib/serialize";
import { artistUrl, formatDate } from "@/lib/utils";
import { splitShows } from "@/lib/shows";
import { canDownloadPDF } from "@/config/plans";
import { MadeWith } from "@/components/artist/sections";
import { releaseEyebrow, isUnreleased } from "@/lib/releases";
import { AnalyticsBeacon, CopyButton, TrackedLink } from "@/components/artist/widgets";
import { PLATFORM_LABELS } from "@/components/artist/content";

export function EpkView({ data, preview = false }: { data: PublicArtistData; preview?: boolean }) {
  const site = data.site;
  const { upcoming } = splitShows(data.shows);
  const featured = data.releases.find((release) => release.is_featured) ?? data.releases[0];
  const allowed = canDownloadPDF(data.plan);
  return (
    <article className="min-h-screen bg-[#f3f0e8] text-[#161616]">
      {preview ? null : <AnalyticsBeacon slug={site.slug} eventType="epk_view" />}
      <div className="mx-auto max-w-5xl px-5 py-8 md:px-8 md:py-12">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-neutral-500">
          <span>Electronic press kit</span>
          <Link href={`/a/${site.slug}`}>Artist site</Link>
        </div>
        <header className="mt-8 grid gap-8 border-y border-black/15 py-8 md:grid-cols-[220px_1fr] md:items-start">
          {site.profile_image_url || site.hero_image_url ? (
            <img src={site.profile_image_url || site.hero_image_url || ""} alt="" className="aspect-[3/4] w-full object-cover" />
          ) : <div className="aspect-[3/4] bg-neutral-300" />}
          <div>
            <h1 className="pk-heading text-5xl leading-none md:text-7xl" style={{ fontFamily: "var(--font-instrument), serif" }}>{site.artist_name}</h1>
            <p className="mt-4 text-sm uppercase tracking-[0.22em] text-neutral-500">{[site.genre, site.city].filter(Boolean).join(" · ")}</p>
            {site.tagline ? <p className="mt-4 max-w-xl text-xl">{site.tagline}</p> : null}
            {site.short_bio ? <p className="mt-6 max-w-2xl text-base leading-7 text-neutral-700">{site.short_bio}</p> : null}
            <div className="mt-6 flex flex-wrap gap-3">
              {allowed ? (
                <a className="bg-black px-4 py-3 text-sm text-white" href={`/api/epk/${site.slug}/pdf`}>Download PDF</a>
              ) : (
                <Link className="border border-black px-4 py-3 text-sm" href="/signup">PDF export is a Pro feature</Link>
              )}
              <CopyButton value={artistUrl(site.slug)} className="border border-black px-4 py-3 text-sm">Copy site link</CopyButton>
            </div>
          </div>
        </header>

        {data.highlights.length ? (
          <section className="py-10">
            <h2 className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">Career highlights</h2>
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {data.highlights.map((item) => <li key={item.id} className="border border-black/10 bg-white px-4 py-4">{item.text}</li>)}
            </ul>
            <p className="mt-3 text-xs text-neutral-500">Highlights are provided by the artist.</p>
          </section>
        ) : null}

        {featured ? (
          <section className="border-t border-black/10 py-10">
            <h2 className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">Music</h2>
            <div className="mt-4 flex gap-4">
              {featured.cover_url ? <img src={featured.cover_url} alt="" className="h-24 w-24 object-cover" /> : null}
              <div>
                <p className="text-2xl" style={{ fontFamily: "var(--font-instrument), serif" }}>{featured.title}</p>
                <p className="text-sm uppercase tracking-[0.16em] text-neutral-500">{releaseEyebrow(featured)}</p>
                {isUnreleased(featured) && featured.prerelease_url ? (
                  <TrackedLink slug={site.slug} href={featured.prerelease_url} eventType="music_click" label={featured.title} className="mt-2 inline-block text-sm underline">Details</TrackedLink>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-3 text-sm">
                  {featured.links.map((link) => (
                    <TrackedLink key={link.id} slug={site.slug} href={link.url} eventType="music_click" label={PLATFORM_LABELS[link.platform] ?? link.platform} className="underline">
                      {PLATFORM_LABELS[link.platform] ?? link.platform}
                    </TrackedLink>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {data.press.length ? (
          <section className="border-t border-black/10 py-10">
            <h2 className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">Press</h2>
            <div className="mt-4 grid gap-6">
              {data.press.map((item) => (
                <blockquote key={item.id}>
                  <p className="text-2xl leading-snug" style={{ fontFamily: "var(--font-instrument), serif" }}>“{item.quote}”</p>
                  <footer className="mt-2 text-sm text-neutral-600">— {item.publication}{item.date ? `, ${formatDate(item.date)}` : ""}</footer>
                </blockquote>
              ))}
            </div>
          </section>
        ) : null}

        {upcoming.length ? (
          <section className="border-t border-black/10 py-10">
            <h2 className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">Upcoming</h2>
            <ul className="mt-4 divide-y divide-black/10">
              {upcoming.map((show) => (
                <li key={show.id} className="flex flex-col gap-1 py-3 md:flex-row md:justify-between">
                  <span>{formatDate(show.date)} · {show.event_name}</span>
                  <span className="text-neutral-600">{show.venue}, {show.city}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {site.booking_email || site.management_email || site.press_email ? (
          <section className="border-t border-black/10 py-10">
            <h2 className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">Contact</h2>
            <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
              {site.booking_email ? <p>Booking<br />{site.booking_email}</p> : null}
              {site.management_email ? <p>Management<br />{site.management_email}</p> : null}
              {site.press_email ? <p>Press<br />{site.press_email}</p> : null}
            </div>
            <p className="mt-8 text-xs text-neutral-500">{artistUrl(site.slug)}</p>
          </section>
        ) : (
          <p className="border-t border-black/10 py-8 text-xs text-neutral-500">{artistUrl(site.slug)}</p>
        )}
        <MadeWith plan={data.plan} slug={site.slug} />
      </div>
    </article>
  );
}
