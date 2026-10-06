import type { PublicArtistData } from "@/lib/serialize";
import { frameStyle, heroLinks, visibleSectionIds } from "@/components/artist/content";
import { MadeWith, SectionBlock, SocialRow } from "@/components/artist/sections";
import { AnalyticsBeacon, ShareBar, TrackedLink } from "@/components/artist/widgets";

function HeroMedia({ src, alt }: { src: string | null; alt: string }) {
  if (!src) return <div className="h-full w-full bg-neutral-800" />;
  return <img src={src} alt={alt} className="h-full w-full object-cover" />;
}

export function ArtistSite({ data, preview = false }: { data: PublicArtistData; preview?: boolean }) {
  const theme = data.site.theme;
  return (
    <>
      {theme === "night" ? <Night data={data} /> : null}
      {theme === "editorial" ? <Editorial data={data} /> : null}
      {theme === "minimal" ? <Minimal data={data} /> : null}
      {theme === "neon" ? <Neon data={data} /> : null}
      {preview ? null : <AnalyticsBeacon slug={data.site.slug} />}
    </>
  );
}

function Night({ data }: { data: PublicArtistData }) {
  const site = data.site;
  const links = heroLinks(data);
  const sections = visibleSectionIds(data);
  return (
    <article style={frameStyle(site.font_pairing, site.accent_color, "#f4f1ea")} className="min-h-screen bg-[#070707] text-[#f6f3ec]">
      <header className="relative min-h-[100svh]">
        <div className="absolute inset-0">
          <HeroMedia src={site.hero_image_url || site.profile_image_url} alt="" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-[#070707]/55 to-black/25" />
        <div className="relative z-10 flex items-center justify-between px-5 py-5 text-xs uppercase tracking-[0.28em] md:px-12">
          <span>{site.city}</span>
          <div className="flex items-center gap-5">
            <a href={`/a/${site.slug}/epk`}>EPK</a>
            <ShareBar slug={site.slug} name={site.artist_name} className="uppercase tracking-[0.28em]" />
          </div>
        </div>
        <div className="relative z-10 flex min-h-[calc(100svh-68px)] flex-col justify-end px-5 pb-12 md:px-12 md:pb-16">
          <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--pk-accent)]">{[site.genre, site.city].filter(Boolean).join("  ·  ")}</p>
          <h1 className="pk-heading mt-3 max-w-5xl text-[clamp(3.4rem,12vw,8.5rem)] leading-[0.84]">{site.artist_name}</h1>
          {site.tagline ? <p className="mt-5 max-w-xl text-lg text-white/80">{site.tagline}</p> : null}
          <div className="mt-8 flex flex-wrap gap-3">
            {links.map((link, index) => (
              <TrackedLink
                key={link.id}
                slug={site.slug}
                href={link.url}
                eventType="custom_link_click"
                label={link.label}
                className={index === 0 ? "bg-[var(--pk-accent)] px-5 py-3 text-sm font-medium text-black" : "border border-white/40 px-5 py-3 text-sm"}
              >
                {link.label}
              </TrackedLink>
            ))}
          </div>
        </div>
      </header>
      {sections.map((id) => <SectionBlock key={id} id={id} data={data} look="night" />)}
      <footer className="flex flex-col gap-6 border-t border-white/10 px-5 py-10 md:px-12">
        <SocialRow data={data} className="flex flex-wrap gap-x-5 gap-y-2" />
        <MadeWith plan={data.plan} />
      </footer>
    </article>
  );
}

function Editorial({ data }: { data: PublicArtistData }) {
  const site = data.site;
  const links = heroLinks(data);
  const sections = visibleSectionIds(data);
  return (
    <article style={frameStyle(site.font_pairing, site.accent_color, "#111111")} className="min-h-screen bg-white text-[#111]">
      <header className="grid min-h-[100svh] md:grid-cols-2">
        <div className="order-2 flex flex-col justify-between px-5 py-8 md:order-1 md:px-12 md:py-10">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.28em]">
            <span>{site.genre}</span>
            <a href={`/a/${site.slug}/epk`}>EPK</a>
          </div>
          <div className="py-16">
            <h1 className="pk-heading text-[clamp(4rem,8vw,7.5rem)] leading-[0.82]">{site.artist_name}</h1>
            {site.tagline ? <p className="mt-6 max-w-md text-xl leading-snug">{site.tagline}</p> : null}
            <p className="mt-4 text-sm uppercase tracking-[0.22em] text-neutral-500">{site.city}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {links.map((link, index) => (
                <TrackedLink key={link.id} slug={site.slug} href={link.url} eventType="custom_link_click" label={link.label} className={index === 0 ? "bg-black px-5 py-3 text-sm text-white" : "border border-black px-5 py-3 text-sm"}>
                  {link.label}
                </TrackedLink>
              ))}
            </div>
          </div>
          <ShareBar slug={site.slug} name={site.artist_name} className="self-start text-[11px] uppercase tracking-[0.28em]" />
        </div>
        <div className="order-1 min-h-[70svh] md:order-2 md:min-h-screen">
          <HeroMedia src={site.hero_image_url || site.profile_image_url} alt={`${site.artist_name} press photo`} />
        </div>
      </header>
      {sections.map((id) => <SectionBlock key={id} id={id} data={data} look="editorial" />)}
      <footer className="bg-black px-5 py-10 text-white md:px-12">
        <SocialRow data={data} className="flex flex-wrap gap-x-5 gap-y-2" />
        <MadeWith plan={data.plan} />
      </footer>
    </article>
  );
}

function Minimal({ data }: { data: PublicArtistData }) {
  const site = data.site;
  const links = heroLinks(data);
  const sections = visibleSectionIds(data);
  return (
    <article style={frameStyle(site.font_pairing, site.accent_color, "#171717")} className="min-h-screen bg-[#f6f5f2] text-[#1a1a1a]">
      <header className="mx-auto flex min-h-[100svh] max-w-xl flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-8 flex w-full items-center justify-between text-[11px] uppercase tracking-[0.28em] text-neutral-500">
          <a href={`/a/${site.slug}/epk`}>EPK</a>
          <ShareBar slug={site.slug} name={site.artist_name} />
        </div>
        {site.profile_image_url || site.hero_image_url ? (
          <img src={site.profile_image_url || site.hero_image_url || ""} alt="" className="h-36 w-36 rounded-full object-cover" />
        ) : null}
        <p className="mt-8 text-[11px] uppercase tracking-[0.32em] text-neutral-500">{[site.genre, site.city].filter(Boolean).join(" · ")}</p>
        <h1 className="pk-heading mt-4 text-5xl font-medium tracking-tight">{site.artist_name}</h1>
        {site.tagline ? <p className="mt-4 text-lg text-neutral-600">{site.tagline}</p> : null}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {links.map((link) => (
            <TrackedLink key={link.id} slug={site.slug} href={link.url} eventType="custom_link_click" label={link.label} className="border border-neutral-900 px-4 py-2 text-sm">
              {link.label}
            </TrackedLink>
          ))}
        </div>
      </header>
      {sections.map((id) => <SectionBlock key={id} id={id} data={data} look="minimal" />)}
      <footer className="mx-auto max-w-xl px-6 py-12 text-center">
        <SocialRow data={data} className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-neutral-500" />
        <MadeWith plan={data.plan} />
      </footer>
    </article>
  );
}

function Neon({ data }: { data: PublicArtistData }) {
  const site = data.site;
  const links = heroLinks(data);
  const sections = visibleSectionIds(data);
  return (
    <article style={frameStyle(site.font_pairing, site.accent_color, "#7ef9ff")} className="min-h-screen bg-[#070614] text-[#f7f7ff]">
      <header className="relative overflow-hidden px-5 pb-16 pt-6 md:px-12 md:pt-8">
        <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="relative flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-cyan-100">
          <span>{site.city}</span>
          <div className="flex items-center gap-4">
            <a href={`/a/${site.slug}/epk`}>EPK</a>
            <ShareBar slug={site.slug} name={site.artist_name} />
          </div>
        </div>
        <div className="relative mt-10 grid items-end gap-8 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[var(--pk-accent)]">{site.genre}</p>
            <h1 className="pk-heading mt-3 text-[clamp(4rem,11vw,8rem)] uppercase leading-[0.82]">{site.artist_name}</h1>
            {site.tagline ? <p className="mt-5 max-w-lg text-lg text-white/75">{site.tagline}</p> : null}
            <div className="mt-8 flex flex-wrap gap-3">
              {links.map((link, index) => (
                <TrackedLink key={link.id} slug={site.slug} href={link.url} eventType="custom_link_click" label={link.label} className={index === 0 ? "bg-[var(--pk-accent)] px-5 py-3 text-sm font-semibold text-black" : "border border-cyan-200/40 px-5 py-3 text-sm"}>
                  {link.label}
                </TrackedLink>
              ))}
            </div>
          </div>
          <div className="aspect-[4/5] overflow-hidden rounded-3xl border border-cyan-200/20">
            <HeroMedia src={site.hero_image_url || site.profile_image_url} alt="" />
          </div>
        </div>
      </header>
      {sections.map((id) => <SectionBlock key={id} id={id} data={data} look="neon" />)}
      <footer className="border-t border-cyan-200/15 px-5 py-10 md:px-12">
        <SocialRow data={data} className="flex flex-wrap gap-x-5 gap-y-2 text-cyan-100" />
        <MadeWith plan={data.plan} />
      </footer>
    </article>
  );
}
