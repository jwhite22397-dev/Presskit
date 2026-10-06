import { videoEmbed } from "@/lib/embeds";
import type { PublicArtistData } from "@/lib/serialize";
import { formatDate } from "@/lib/utils";
import { splitShows } from "@/lib/shows";
import { PLATFORM_LABELS, type SectionId } from "@/components/artist/content";
import { canRemoveBranding } from "@/config/plans";
import { releaseEyebrow, isUnreleased } from "@/lib/releases";
import { GalleryGrid, MadeWithPresskit, TrackedLink } from "@/components/artist/widgets";
import type { AnalyticsEventType } from "@/types";

export type Look = "editorial" | "night" | "minimal" | "neon";

function headingClass(look: Look) {
  if (look === "editorial") return "font-[family-name:var(--pk-heading)] text-5xl leading-none md:text-7xl";
  if (look === "minimal") return "font-[family-name:var(--pk-heading)] text-3xl font-medium tracking-tight";
  if (look === "neon") return "font-[family-name:var(--pk-heading)] text-4xl uppercase tracking-wide md:text-6xl";
  return "font-[family-name:var(--pk-heading)] text-4xl tracking-tight md:text-6xl";
}

function labelClass() {
  return "text-[11px] uppercase tracking-[0.28em] opacity-60";
}

export function SectionBlock({ id, data, look }: { id: SectionId; data: PublicArtistData; look: Look }) {
  if (id === "music") return <Music data={data} look={look} />;
  if (id === "videos") return <Videos data={data} look={look} />;
  if (id === "about") return <About data={data} look={look} />;
  if (id === "shows") return <Shows data={data} look={look} />;
  if (id === "press") return <Press data={data} look={look} />;
  if (id === "gallery") return <Gallery data={data} look={look} />;
  if (id === "highlights") return <Highlights data={data} look={look} />;
  return <Contact data={data} look={look} />;
}

function Music({ data, look }: { data: PublicArtistData; look: Look }) {
  const featured = data.releases.find((release) => release.is_featured) ?? data.releases[0];
  const rest = data.releases.filter((release) => release.id !== featured?.id);
  return (
    <section className="px-5 py-16 md:px-12 md:py-24">
      <p className={labelClass()}>Music</p>
      {featured ? (
        <div className={featured.cover_url ? (look === "minimal" ? "mt-8 grid gap-8 md:grid-cols-[180px_1fr]" : "mt-8 grid gap-8 md:grid-cols-[minmax(0,280px)_1fr] md:items-end") : "mt-8"}>
          {featured.cover_url ? (
            <div className={look === "minimal" ? "aspect-square overflow-hidden rounded-full" : look === "neon" ? "aspect-square overflow-hidden rounded-2xl border border-cyan-300/30" : "aspect-square overflow-hidden"}>
              <img src={featured.cover_url} alt="" className="h-full w-full object-cover" />
            </div>
          ) : null}
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--pk-accent)]">{releaseEyebrow(featured)}</p>
            <h2 className={`mt-3 ${headingClass(look)}`}>{featured.title}</h2>
            {featured.description ? <p className="mt-4 max-w-xl text-base leading-relaxed opacity-75">{featured.description}</p> : null}
            <div className="mt-6 flex flex-wrap gap-2">
              {isUnreleased(featured) && featured.prerelease_url ? (
                <TrackedLink
                  slug={data.site.slug}
                  href={featured.prerelease_url}
                  eventType="music_click"
                  label={featured.title}
                  className={look === "night" || look === "neon" ? "border border-white/30 px-4 py-2 text-sm hover:bg-white hover:text-black" : "border border-black px-4 py-2 text-sm hover:bg-black hover:text-white"}
                >
                  Details
                </TrackedLink>
              ) : null}
              {featured.links.map((link) => (
                <TrackedLink
                  key={link.id}
                  slug={data.site.slug}
                  href={link.url}
                  eventType="music_click"
                  label={PLATFORM_LABELS[link.platform] ?? link.platform}
                  className={look === "night" || look === "neon" ? "border border-white/30 px-4 py-2 text-sm hover:bg-white hover:text-black" : "border border-black px-4 py-2 text-sm hover:bg-black hover:text-white"}
                >
                  {PLATFORM_LABELS[link.platform] ?? link.platform}
                </TrackedLink>
              ))}
            </div>
          </div>
        </div>
      ) : null}
      {rest.length ? (
        <ul className="mt-12 divide-y divide-current/15 border-t border-current/15">
          {rest.map((release, index) => (
            <li key={release.id} className="flex items-center gap-4 py-4">
              <span className="w-8 text-xs opacity-50">{String(index + 2).padStart(2, "0")}</span>
              {release.cover_url ? <img src={release.cover_url} alt="" className="h-14 w-14 object-cover" /> : null}
              <div className="min-w-0 flex-1">
                <p className="truncate font-[family-name:var(--pk-heading)] text-2xl">{release.title}</p>
                <p className="text-xs uppercase tracking-[0.18em] opacity-60">{releaseEyebrow(release)}</p>
              </div>
              {release.links[0] ? (
                <TrackedLink slug={data.site.slug} href={release.links[0].url} eventType="music_click" label={release.title} className="text-sm underline">
                  Play
                </TrackedLink>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function Videos({ data, look }: { data: PublicArtistData; look: Look }) {
  return (
    <section className="px-5 py-16 md:px-12">
      <p className={labelClass()}>Video</p>
      <div className={look === "editorial" ? "mt-8 grid gap-10" : "mt-8 grid gap-6 md:grid-cols-2"}>
        {data.videos.map((video) => {
          const embed = videoEmbed(video.url);
          return (
            <figure key={video.id}>
              {embed ? (
                <div className="aspect-video overflow-hidden bg-black">
                  <iframe
                    src={embed.src}
                    title={video.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              ) : (
                <TrackedLink slug={data.site.slug} href={video.url} eventType="video_click" label={video.title} className="group block">
                  <div className="relative aspect-video overflow-hidden bg-black">
                    {video.thumbnail_url ? <img src={video.thumbnail_url} alt="" className="h-full w-full object-cover opacity-80 transition group-hover:scale-105" /> : null}
                    <span className="absolute bottom-4 left-4 text-sm text-white">Play</span>
                  </div>
                </TrackedLink>
              )}
              <figcaption className="mt-3 text-lg">{video.title}</figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}

function About({ data, look }: { data: PublicArtistData; look: Look }) {
  return (
    <section className={look === "minimal" ? "mx-auto max-w-2xl px-5 py-16" : "grid gap-10 px-5 py-16 md:grid-cols-[180px_1fr] md:px-12 md:py-24"}>
      <p className={labelClass()}>About</p>
      <div>
        {data.site.short_bio ? <p className={`${look === "editorial" ? "font-[family-name:var(--pk-heading)] text-3xl leading-snug md:text-4xl" : "text-xl leading-relaxed md:text-2xl"}`}>{data.site.short_bio}</p> : null}
        {data.site.full_bio ? <div className="mt-8 max-w-3xl space-y-4 text-base leading-7 opacity-80">{data.site.full_bio.split(/\n\n+/).map((paragraph) => <p key={paragraph.slice(0, 24)}>{paragraph}</p>)}</div> : null}
      </div>
    </section>
  );
}

function Shows({ data, look }: { data: PublicArtistData; look: Look }) {
  const { upcoming, past } = splitShows(data.shows);
  const rows = [...upcoming, ...past.slice(0, 3)];
  return (
    <section className="px-5 py-16 md:px-12">
      <p className={labelClass()}>Shows</p>
      <ul className="mt-8">
        {rows.map((show) => {
          const pastShow = show.date < new Date().toISOString().slice(0, 10);
          return (
            <li key={show.id} className="grid grid-cols-1 gap-2 border-t border-current/15 py-5 md:grid-cols-[140px_1fr_auto] md:items-center">
              <p className={look === "neon" ? "text-cyan-200" : ""}>{formatDate(show.date)}</p>
              <div>
                <p className="text-xl">{show.event_name}{show.is_sold_out ? " · Sold out" : ""}</p>
                <p className="text-sm opacity-65">{show.venue} · {[show.city, show.state].filter(Boolean).join(", ")}{pastShow ? " · Past" : ""}</p>
              </div>
              {show.ticket_url && !pastShow ? (
                <TrackedLink slug={data.site.slug} href={show.ticket_url} eventType="ticket_click" label={show.event_name} className="text-sm underline">
                  Tickets
                </TrackedLink>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Press({ data, look }: { data: PublicArtistData; look: Look }) {
  return (
    <section className="px-5 py-16 md:px-12 md:py-24">
      <p className={labelClass()}>Press</p>
      <div className="mt-8 grid gap-12">
        {data.press.map((item) => (
          <blockquote key={item.id}>
            <p className={look === "minimal" ? "text-2xl leading-snug" : "font-[family-name:var(--pk-heading)] text-3xl leading-tight md:text-5xl"}>“{item.quote}”</p>
            <footer className="mt-4 text-sm uppercase tracking-[0.18em] opacity-70">
              {item.article_url ? (
                <TrackedLink slug={data.site.slug} href={item.article_url} eventType="custom_link_click" label={item.publication}>
                  {item.publication}
                </TrackedLink>
              ) : item.publication}
              {item.headline ? ` — ${item.headline}` : ""}
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}

function Gallery({ data, look }: { data: PublicArtistData; look: Look }) {
  return (
    <section className="px-5 py-16 md:px-12">
      <p className={labelClass()}>Photos</p>
      <GalleryGrid
        images={data.gallery}
        className={look === "editorial" ? "mt-8 grid grid-cols-2 gap-3 md:grid-cols-3" : "mt-8 grid grid-cols-2 gap-2 md:grid-cols-3"}
        tileClass="aspect-[4/5] overflow-hidden bg-black/20 text-left"
      />
    </section>
  );
}

function Highlights({ data }: { data: PublicArtistData; look: Look }) {
  return (
    <section className="px-5 py-16 md:px-12">
      <p className={labelClass()}>Highlights</p>
      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {data.highlights.map((item) => (
          <li key={item.id} className="border border-current/15 px-4 py-5 text-lg">{item.text}</li>
        ))}
      </ul>
    </section>
  );
}

function Contact({ data }: { data: PublicArtistData; look: Look }) {
  const rows: { label: string; email: string | null; event: AnalyticsEventType }[] = [
    { label: "Booking", email: data.site.booking_email, event: "booking_click" },
    { label: "Management", email: data.site.management_email, event: "booking_click" },
    { label: "Press", email: data.site.press_email, event: "booking_click" },
  ];
  return (
    <section className="px-5 py-16 md:px-12 md:py-24">
      <p className={labelClass()}>Contact</p>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {rows.filter((row) => row.email).map((row) => (
          <div key={row.label}>
            <p className="text-xs uppercase tracking-[0.22em] opacity-60">{row.label}</p>
            <TrackedLink slug={data.site.slug} href={`mailto:${row.email}`} eventType={row.event} label={row.label} className="mt-2 block text-lg underline decoration-current/30">
              {row.email}
            </TrackedLink>
          </div>
        ))}
      </div>
    </section>
  );
}

export function MadeWith({ plan, slug }: { plan: PublicArtistData["plan"]; slug: string }) {
  if (canRemoveBranding(plan)) return null;
  return <MadeWithPresskit slug={slug} />;
}

export function SocialRow({ data, className }: { data: PublicArtistData; className?: string }) {
  if (!data.socials.length) return null;
  return (
    <div className={className}>
      {data.socials.map((social) => (
        <TrackedLink key={social.id} slug={data.site.slug} href={social.url} eventType="social_click" label={PLATFORM_LABELS[social.platform] ?? social.platform} className="text-xs uppercase tracking-[0.18em]">
          {PLATFORM_LABELS[social.platform] ?? social.platform}
        </TrackedLink>
      ))}
    </div>
  );
}
