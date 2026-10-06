import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { demoArtistData } from "@/data/demo";
import { canUsePremiumTheme, FREE_LIMITS, isPro } from "@/config/plans";
import { isDemoMode } from "@/lib/env";
import { isAdminUser } from "@/lib/server-env";
import type {
  AnalyticsEventType,
  ArtistData,
  ArtistSite,
  CareerHighlight,
  CustomLink,
  GalleryImage,
  Plan,
  PressItem,
  Release,
  ReleaseLink,
  Show,
  SocialLink,
  ThemeName,
  Video,
} from "@/types";
import { hostnameFromReferrer } from "@/lib/urls";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase/server";
import { hydrate, nextOrder, readState, updateState, type AppState } from "@/server/demo-store";

export type PublicLookup =
  | { type: "artist"; data: ArtistData }
  | { type: "redirect"; to: string }
  | { type: "none" };

const SECTION_ORDER = ["music", "videos", "about", "shows", "press", "gallery", "highlights", "contact"];

function nowIso() {
  return new Date().toISOString();
}

function emptySite(userId: string, name: string, plan: Plan): ArtistSite {
  const id = crypto.randomUUID();
  const now = nowIso();
  return {
    id,
    user_id: userId,
    slug: `draft-${id.slice(0, 8)}`,
    status: "draft",
    onboarding_completed: false,
    artist_name: name || "New artist",
    real_name: null,
    city: null,
    genre: null,
    tagline: null,
    short_bio: null,
    full_bio: null,
    profile_image_url: null,
    hero_image_url: null,
    booking_email: null,
    management_email: null,
    press_email: null,
    theme: "editorial",
    accent_color: "theme",
    font_pairing: "editorial",
    section_order: SECTION_ORDER,
    hidden_sections: [],
    meta_title: null,
    meta_description: null,
    public_plan: plan,
    published_at: null,
    created_at: now,
    updated_at: now,
  };
}

function owned(state: AppState, userId: string) {
  return state.sites.find((site) => site.user_id === userId) ?? null;
}

export async function lookupPublic(slug: string): Promise<PublicLookup> {
  if (isDemoMode()) {
    const state = await readState();
    const site = state.sites.find((item) => item.slug === slug);
    if (site) {
      if (site.status !== "published") return { type: "none" };
      return { type: "artist", data: hydrate(state, site) };
    }
    const redirect = state.redirects.find((item) => item.from_slug === slug);
    if (redirect) return { type: "redirect", to: redirect.to_slug };
    if (slug === "jaylensaint") return { type: "artist", data: demoArtistData };
    return { type: "none" };
  }

  const supabase = await createServerSupabase();
  const { data: site } = await supabase.from("artist_sites").select("*").eq("slug", slug).maybeSingle();
  if (site) {
    if (site.status !== "published") return { type: "none" };
    return { type: "artist", data: await supabaseBundle(supabase, site as ArtistSite) };
  }
  const { data: redirect } = await supabase.from("slug_redirects").select("to_slug").eq("from_slug", slug).maybeSingle();
  if (redirect?.to_slug) return { type: "redirect", to: redirect.to_slug };
  if (slug === "jaylensaint") return { type: "artist", data: demoArtistData };
  return { type: "none" };
}

export async function getOwnedArtist(userId: string, plan: Plan, name: string | null): Promise<ArtistData> {
  if (isDemoMode()) {
    return updateState((state) => {
      let site = owned(state, userId);
      if (!site) {
        site = emptySite(userId, name || "New artist", plan);
        state.sites.push(site);
      }
      site.public_plan = plan;
      return hydrate(state, site);
    });
  }

  const supabase = await createServerSupabase();
  const { data: existing } = await supabase.from("artist_sites").select("*").eq("user_id", userId).maybeSingle();
  if (existing) return supabaseBundle(supabase, existing as ArtistSite);
  const site = emptySite(userId, name || "New artist", plan);
  const { error } = await supabase.from("artist_sites").insert(site);
  if (error) throw new Error(error.message);
  return { site, releases: [], videos: [], shows: [], press: [], gallery: [], socials: [], links: [], highlights: [], plan };
}

async function supabaseBundle(supabase: Awaited<ReturnType<typeof createServerSupabase>>, site: ArtistSite): Promise<ArtistData> {
  const siteId = site.id;
  const [releasesRes, videosRes, showsRes, pressRes, galleryRes, socialsRes, linksRes, highlightsRes] = await Promise.all([
    supabase.from("releases").select("*, release_links(*)").eq("site_id", siteId).order("sort_order"),
    supabase.from("videos").select("*").eq("site_id", siteId).order("sort_order"),
    supabase.from("shows").select("*").eq("site_id", siteId).order("sort_order"),
    supabase.from("press_items").select("*").eq("site_id", siteId).order("sort_order"),
    supabase.from("gallery_images").select("*").eq("site_id", siteId).order("sort_order"),
    supabase.from("social_links").select("*").eq("site_id", siteId).order("sort_order"),
    supabase.from("custom_links").select("*").eq("site_id", siteId).order("sort_order"),
    supabase.from("career_highlights").select("*").eq("site_id", siteId).order("sort_order"),
  ]);
  const releases = (releasesRes.data ?? []).map((release) => {
    const { release_links, ...rest } = release as Release & { release_links?: ReleaseLink[] };
    return { ...rest, links: release_links ?? [] };
  });
  return {
    site,
    releases,
    videos: (videosRes.data ?? []) as Video[],
    shows: (showsRes.data ?? []) as Show[],
    press: (pressRes.data ?? []) as PressItem[],
    gallery: (galleryRes.data ?? []) as GalleryImage[],
    socials: (socialsRes.data ?? []) as SocialLink[],
    links: (linksRes.data ?? []) as CustomLink[],
    highlights: (highlightsRes.data ?? []) as CareerHighlight[],
    plan: site.public_plan,
  };
}

function touch(site: ArtistSite) {
  site.updated_at = nowIso();
}

const SITE_PATCH_KEYS = [
  "artist_name",
  "real_name",
  "city",
  "genre",
  "tagline",
  "short_bio",
  "full_bio",
  "booking_email",
  "management_email",
  "press_email",
  "theme",
  "accent_color",
  "font_pairing",
  "hidden_sections",
  "section_order",
  "meta_title",
  "meta_description",
  "profile_image_url",
  "hero_image_url",
  "onboarding_completed",
] as const;

export async function patchOwnedSite(userId: string, patch: Partial<ArtistSite>) {
  const safePatch: Partial<ArtistSite> = {};
  for (const key of SITE_PATCH_KEYS) {
    if (key in patch) (safePatch as Record<string, unknown>)[key] = patch[key];
  }
  if (isDemoMode()) {
    return updateState((state) => {
      const site = owned(state, userId);
      if (!site) return { ok: false as const, error: "Artist profile not found." };
      Object.assign(site, safePatch);
      touch(site);
      return { ok: true as const, data: hydrate(state, site) };
    });
  }
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("artist_sites").update({ ...safePatch, updated_at: nowIso() }).eq("user_id", userId);
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function changeSlug(userId: string, slug: string) {
  if (isDemoMode()) {
    return updateState((state) => {
      const site = owned(state, userId);
      if (!site) return { ok: false as const, error: "Artist profile not found." };
      const taken = state.sites.some((item) => item.slug === slug && item.id !== site.id);
      const redirected = state.redirects.some((item) => item.from_slug === slug && item.site_id !== site.id);
      if (taken || redirected) return { ok: false as const, error: "That address is taken." };
      if (site.slug !== slug && !site.slug.startsWith("draft-")) {
        state.redirects = state.redirects.filter((item) => item.from_slug !== site.slug);
        state.redirects.push({
          id: crypto.randomUUID(),
          site_id: site.id,
          from_slug: site.slug,
          to_slug: slug,
          created_at: nowIso(),
        });
      }
      state.redirects.forEach((item) => {
        if (item.site_id === site.id) item.to_slug = slug;
      });
      site.slug = slug;
      touch(site);
      return { ok: true as const, data: hydrate(state, site) };
    });
  }

  const supabase = await createServerSupabase();
  const { data: site, error: readError } = await supabase.from("artist_sites").select("id, slug").eq("user_id", userId).maybeSingle();
  if (readError || !site) return { ok: false as const, error: "Artist profile not found." };
  if (site.slug !== slug && !String(site.slug).startsWith("draft-")) {
    await supabase.from("slug_redirects").upsert({
      site_id: site.id,
      from_slug: site.slug,
      to_slug: slug,
    }, { onConflict: "from_slug" });
  }
  const { error } = await supabase.from("artist_sites").update({ slug }).eq("id", site.id);
  if (error) return { ok: false as const, error: error.code === "23505" ? "That address is taken." : error.message };
  return { ok: true as const };
}

export async function setPublished(userId: string, published: boolean) {
  if (isDemoMode()) {
    return updateState((state) => {
      const site = owned(state, userId);
      if (!site) return { ok: false as const, error: "Artist profile not found." };
      if (published && site.slug.startsWith("draft-")) return { ok: false as const, error: "Choose a public address before publishing." };
      if (published && !site.artist_name.trim()) return { ok: false as const, error: "Add an artist name before publishing." };
      site.status = published ? "published" : "draft";
      site.onboarding_completed = true;
      site.published_at = published ? site.published_at ?? nowIso() : site.published_at;
      touch(site);
      return { ok: true as const, data: hydrate(state, site) };
    });
  }
  const supabase = await createServerSupabase();
  const { data: site } = await supabase.from("artist_sites").select("slug, artist_name, published_at").eq("user_id", userId).maybeSingle();
  if (!site) return { ok: false as const, error: "Artist profile not found." };
  if (published && String(site.slug).startsWith("draft-")) return { ok: false as const, error: "Choose a public address before publishing." };
  const { error } = await supabase.from("artist_sites").update({
    status: published ? "published" : "draft",
    onboarding_completed: true,
    published_at: published ? site.published_at ?? nowIso() : site.published_at,
  }).eq("user_id", userId);
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

function assertTheme(plan: Plan, theme: ThemeName) {
  if (!canUsePremiumTheme(plan, theme)) {
    return "This template is Pro. Upgrade to publish with Neon, or choose Editorial, Night, or Minimal.";
  }
  return null;
}

export function themeError(plan: Plan, theme: ThemeName) {
  return assertTheme(plan, theme);
}

export async function saveRelease(userId: string, plan: Plan, input: Omit<Release, "id" | "site_id" | "sort_order" | "created_at" | "updated_at" | "cover_url"> & { id?: string; links: { platform: string; url: string }[]; cover_url?: string | null }) {
  if (!isPro(plan)) {
    const state = isDemoMode() ? await readState() : null;
    if (state) {
      const site = owned(state, userId);
      const count = state.releases.filter((item) => item.site_id === site?.id).length;
      if (!input.id && site && count >= FREE_LIMITS.releases) {
        return { ok: false as const, error: `Free includes ${FREE_LIMITS.releases} releases. Upgrade to Pro for more.` };
      }
    }
  }
  if (isDemoMode()) {
    return updateState((state) => {
      const site = owned(state, userId);
      if (!site) return { ok: false as const, error: "Artist profile not found." };
      if (!isPro(plan) && !input.id && state.releases.filter((item) => item.site_id === site.id).length >= FREE_LIMITS.releases) {
        return { ok: false as const, error: `Free includes ${FREE_LIMITS.releases} releases. Upgrade to Pro for more.` };
      }
      const now = nowIso();
      let release = input.id ? state.releases.find((item) => item.id === input.id && item.site_id === site.id) : undefined;
      if (input.id && !release) return { ok: false as const, error: "Release not found." };
      if (!release) {
        release = {
          id: crypto.randomUUID(),
          site_id: site.id,
          title: input.title,
          type: input.type,
          cover_url: input.cover_url ?? null,
          release_date: input.release_date,
          description: input.description,
          is_featured: Boolean(input.is_featured),
          sort_order: nextOrder(state.releases.filter((item) => item.site_id === site.id)),
          created_at: now,
          updated_at: now,
        };
        state.releases.push(release);
      } else {
        release.title = input.title;
        release.type = input.type;
        release.release_date = input.release_date;
        release.description = input.description;
        release.is_featured = Boolean(input.is_featured);
        if (input.cover_url !== undefined) release.cover_url = input.cover_url;
        release.updated_at = now;
      }
      if (release.is_featured) {
        state.releases.forEach((item) => {
          if (item.site_id === site.id && item.id !== release!.id) item.is_featured = false;
        });
      }
      state.releaseLinks = state.releaseLinks.filter((link) => link.release_id !== release!.id);
      input.links.forEach((link, index) => {
        state.releaseLinks.push({
          id: crypto.randomUUID(),
          release_id: release!.id,
          platform: link.platform,
          url: link.url,
          sort_order: index,
          created_at: now,
        });
      });
      touch(site);
      return { ok: true as const };
    });
  }
  return supabaseSaveRelease(userId, input);
}

async function supabaseSaveRelease(userId: string, input: { id?: string; title: string; type: Release["type"]; release_date: string | null; description: string | null; is_featured?: boolean; cover_url?: string | null; links: { platform: string; url: string }[] }) {
  const supabase = await createServerSupabase();
  const { data: site } = await supabase.from("artist_sites").select("id").eq("user_id", userId).maybeSingle();
  if (!site) return { ok: false as const, error: "Artist profile not found." };
  let releaseId = input.id;
  if (releaseId) {
    const { error } = await supabase.from("releases").update({
      title: input.title,
      type: input.type,
      release_date: input.release_date,
      description: input.description,
      is_featured: Boolean(input.is_featured),
      ...(input.cover_url !== undefined ? { cover_url: input.cover_url } : {}),
    }).eq("id", releaseId).eq("site_id", site.id);
    if (error) return { ok: false as const, error: error.message };
    await supabase.from("release_links").delete().eq("release_id", releaseId);
  } else {
    const { count } = await supabase.from("releases").select("id", { count: "exact", head: true }).eq("site_id", site.id);
    const { data, error } = await supabase.from("releases").insert({
      site_id: site.id,
      title: input.title,
      type: input.type,
      release_date: input.release_date,
      description: input.description,
      is_featured: Boolean(input.is_featured),
      cover_url: input.cover_url ?? null,
      sort_order: count ?? 0,
    }).select("id").single();
    if (error || !data) return { ok: false as const, error: error?.message ?? "Could not save release." };
    releaseId = data.id;
  }
  if (input.is_featured) {
    await supabase.from("releases").update({ is_featured: false }).eq("site_id", site.id).neq("id", releaseId);
    await supabase.from("releases").update({ is_featured: true }).eq("id", releaseId);
  }
  if (input.links.length) {
    const { error } = await supabase.from("release_links").insert(input.links.map((link, index) => ({
      release_id: releaseId,
      platform: link.platform,
      url: link.url,
      sort_order: index,
    })));
    if (error) return { ok: false as const, error: error.message };
  }
  return { ok: true as const };
}

export async function deleteById(userId: string, table: "releases" | "videos" | "shows" | "press" | "gallery" | "socials" | "links" | "highlights", id: string) {
  const key = {
    releases: "releases",
    videos: "videos",
    shows: "shows",
    press: "press",
    gallery: "gallery",
    socials: "socials",
    links: "links",
    highlights: "highlights",
  } as const;
  if (isDemoMode()) {
    return updateState((state) => {
      const site = owned(state, userId);
      if (!site) return { ok: false as const, error: "Artist profile not found." };
      const collection = state[key[table]] as { id: string; site_id?: string; release_id?: string }[];
      const index = collection.findIndex((item) => item.id === id && item.site_id === site.id);
      if (index === -1) return { ok: false as const, error: "Item not found." };
      collection.splice(index, 1);
      if (table === "releases") state.releaseLinks = state.releaseLinks.filter((link) => link.release_id !== id);
      touch(site);
      return { ok: true as const };
    });
  }
  const map = {
    releases: "releases",
    videos: "videos",
    shows: "shows",
    press: "press_items",
    gallery: "gallery_images",
    socials: "social_links",
    links: "custom_links",
    highlights: "career_highlights",
  } as const;
  const supabase = await createServerSupabase();
  const { data: site } = await supabase.from("artist_sites").select("id").eq("user_id", userId).maybeSingle();
  if (!site) return { ok: false as const, error: "Artist profile not found." };
  const { error } = await supabase.from(map[table]).delete().eq("id", id).eq("site_id", site.id);
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

async function insertChild<T extends { id: string; site_id: string; sort_order: number }>(userId: string, plan: Plan, kind: "videos" | "shows" | "press" | "gallery" | "socials" | "links" | "highlights", row: T, limit?: number) {
  if (isDemoMode()) {
    return updateState((state) => {
      const site = owned(state, userId);
      if (!site) return { ok: false as const, error: "Artist profile not found." };
      const list = state[kind] as unknown as T[];
      const count = list.filter((item) => item.site_id === site.id).length;
      if (limit && !isPro(plan) && count >= limit) return { ok: false as const, error: "Upgrade to Pro to add more." };
      row.sort_order = nextOrder(list.filter((item) => item.site_id === site.id));
      list.push(row);
      touch(site);
      return { ok: true as const };
    });
  }
  const map = {
    videos: "videos",
    shows: "shows",
    press: "press_items",
    gallery: "gallery_images",
    socials: "social_links",
    links: "custom_links",
    highlights: "career_highlights",
  } as const;
  const supabase = await createServerSupabase();
  const { data: site } = await supabase.from("artist_sites").select("id").eq("user_id", userId).maybeSingle();
  if (!site) return { ok: false as const, error: "Artist profile not found." };
  const { error } = await supabase.from(map[kind]).insert({ ...row, site_id: site.id });
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function addVideo(userId: string, plan: Plan, input: { title: string; url: string; is_featured?: boolean }) {
  const now = nowIso();
  const row: Video = {
    id: crypto.randomUUID(),
    site_id: "",
    title: input.title,
    url: input.url,
    thumbnail_url: null,
    is_featured: Boolean(input.is_featured),
    sort_order: 0,
    created_at: now,
    updated_at: now,
  };
  if (isDemoMode()) {
    return updateState((state) => {
      const site = owned(state, userId);
      if (!site) return { ok: false as const, error: "Artist profile not found." };
      if (!isPro(plan) && state.videos.filter((item) => item.site_id === site.id).length >= FREE_LIMITS.videos) {
        return { ok: false as const, error: `Free includes ${FREE_LIMITS.videos} videos.` };
      }
      row.site_id = site.id;
      row.sort_order = nextOrder(state.videos.filter((item) => item.site_id === site.id));
      if (row.is_featured) state.videos.forEach((item) => { if (item.site_id === site.id) item.is_featured = false; });
      state.videos.push(row);
      touch(site);
      return { ok: true as const };
    });
  }
  return insertChild(userId, plan, "videos", row, FREE_LIMITS.videos);
}

export async function addShow(userId: string, input: Omit<Show, "id" | "site_id" | "sort_order" | "created_at" | "updated_at">) {
  const now = nowIso();
  const row: Show = { ...input, id: crypto.randomUUID(), site_id: "pending", sort_order: 0, created_at: now, updated_at: now };
  if (isDemoMode()) {
    return updateState((state) => {
      const site = owned(state, userId);
      if (!site) return { ok: false as const, error: "Artist profile not found." };
      row.site_id = site.id;
      row.sort_order = nextOrder(state.shows.filter((item) => item.site_id === site.id));
      state.shows.push(row);
      touch(site);
      return { ok: true as const };
    });
  }
  return insertChild(userId, "pro", "shows", row);
}

export async function addPress(userId: string, input: Omit<PressItem, "id" | "site_id" | "sort_order" | "created_at" | "updated_at">) {
  const now = nowIso();
  const row: PressItem = { ...input, id: crypto.randomUUID(), site_id: "pending", sort_order: 0, created_at: now, updated_at: now };
  return insertOwned(userId, "press", row);
}

export async function addHighlight(userId: string, plan: Plan, text: string) {
  const row: CareerHighlight = { id: crypto.randomUUID(), site_id: "pending", text, sort_order: 0, created_at: nowIso() };
  if (isDemoMode()) {
    return updateState((state) => {
      const site = owned(state, userId);
      if (!site) return { ok: false as const, error: "Artist profile not found." };
      if (!isPro(plan) && state.highlights.filter((item) => item.site_id === site.id).length >= FREE_LIMITS.highlights) {
        return { ok: false as const, error: `Free includes ${FREE_LIMITS.highlights} highlights.` };
      }
      row.site_id = site.id;
      row.sort_order = nextOrder(state.highlights.filter((item) => item.site_id === site.id));
      state.highlights.push(row);
      touch(site);
      return { ok: true as const };
    });
  }
  return insertChild(userId, plan, "highlights", row, FREE_LIMITS.highlights);
}

export async function addSocial(userId: string, input: { platform: string; url: string }) {
  const row: SocialLink = { id: crypto.randomUUID(), site_id: "pending", platform: input.platform, url: input.url, sort_order: 0, created_at: nowIso() };
  return insertOwned(userId, "socials", row);
}

export async function addCustomLink(userId: string, input: { label: string; url: string; is_primary?: boolean }) {
  const now = nowIso();
  const row: CustomLink = {
    id: crypto.randomUUID(),
    site_id: "pending",
    label: input.label,
    url: input.url,
    icon: null,
    is_primary: Boolean(input.is_primary),
    sort_order: 0,
    created_at: now,
    updated_at: now,
  };
  return insertOwned(userId, "links", row);
}

async function insertOwned<T extends { id: string; site_id: string; sort_order: number }>(userId: string, kind: "press" | "socials" | "links" | "gallery", row: T) {
  if (isDemoMode()) {
    return updateState((state) => {
      const site = owned(state, userId);
      if (!site) return { ok: false as const, error: "Artist profile not found." };
      const list = state[kind] as unknown as T[];
      row.site_id = site.id;
      row.sort_order = nextOrder(list.filter((item) => item.site_id === site.id));
      list.push(row);
      touch(site);
      return { ok: true as const };
    });
  }
  return insertChild(userId, "pro", kind, row);
}

export async function addGalleryImage(userId: string, plan: Plan, url: string, caption: string | null) {
  const row: GalleryImage = { id: crypto.randomUUID(), site_id: "pending", url, caption, sort_order: 0, created_at: nowIso() };
  if (isDemoMode()) {
    return updateState((state) => {
      const site = owned(state, userId);
      if (!site) return { ok: false as const, error: "Artist profile not found." };
      if (!isPro(plan) && state.gallery.filter((item) => item.site_id === site.id).length >= FREE_LIMITS.gallery_images) {
        return { ok: false as const, error: `Free includes ${FREE_LIMITS.gallery_images} gallery photos.` };
      }
      row.site_id = site.id;
      row.sort_order = nextOrder(state.gallery.filter((item) => item.site_id === site.id));
      state.gallery.push(row);
      touch(site);
      return { ok: true as const };
    });
  }
  return insertChild(userId, plan, "gallery", row, FREE_LIMITS.gallery_images);
}

export async function moveGallery(userId: string, id: string, direction: "up" | "down") {
  if (!isDemoMode()) {
    const supabase = await createServerSupabase();
    const { data: site } = await supabase.from("artist_sites").select("id").eq("user_id", userId).maybeSingle();
    if (!site) return { ok: false as const, error: "Artist profile not found." };
    const { data: images } = await supabase.from("gallery_images").select("id, sort_order").eq("site_id", site.id).order("sort_order");
    const list = images ?? [];
    const index = list.findIndex((item) => item.id === id);
    const swap = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || swap < 0 || swap >= list.length) return { ok: true as const };
    await supabase.from("gallery_images").update({ sort_order: list[swap].sort_order }).eq("id", list[index].id);
    await supabase.from("gallery_images").update({ sort_order: list[index].sort_order }).eq("id", list[swap].id);
    return { ok: true as const };
  }
  return updateState((state) => {
    const site = owned(state, userId);
    if (!site) return { ok: false as const, error: "Artist profile not found." };
    const list = state.gallery.filter((item) => item.site_id === site.id).sort((a, b) => a.sort_order - b.sort_order);
    const index = list.findIndex((item) => item.id === id);
    const swap = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || swap < 0 || swap >= list.length) return { ok: true as const };
    const current = list[index].sort_order;
    list[index].sort_order = list[swap].sort_order;
    list[swap].sort_order = current;
    return { ok: true as const };
  });
}

const IMAGE_TYPES: Record<string, { ext: string; mime: string }> = {
  "image/jpeg": { ext: "jpg", mime: "image/jpeg" },
  "image/png": { ext: "png", mime: "image/png" },
  "image/webp": { ext: "webp", mime: "image/webp" },
};

function sniffImage(bytes: Uint8Array) {
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return IMAGE_TYPES["image/jpeg"];
  if (bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return IMAGE_TYPES["image/png"];
  if (bytes.length > 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return IMAGE_TYPES["image/webp"];
  }
  return null;
}

export async function storeImage(userId: string, file: File) {
  if (file.size > 5 * 1024 * 1024) return { ok: false as const, error: "Images must be 5MB or smaller." };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = sniffImage(bytes);
  if (!kind) return { ok: false as const, error: "Use a JPG, PNG, or WebP image." };
  const filename = `${crypto.randomUUID()}.${kind.ext}`;

  if (isDemoMode()) {
    const directory = path.join(process.cwd(), "public", "uploads", userId);
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, filename), bytes);
    return { ok: true as const, url: `/uploads/${userId}/${filename}` };
  }

  const supabase = await createServerSupabase();
  const objectPath = `${userId}/${filename}`;
  const { error } = await supabase.storage.from("media").upload(objectPath, bytes, { contentType: kind.mime, upsert: false });
  if (error) return { ok: false as const, error: error.message };
  const { data } = supabase.storage.from("media").getPublicUrl(objectPath);
  return { ok: true as const, url: data.publicUrl };
}

export async function removeLocalUpload(url: string | null) {
  if (!url || !url.startsWith("/uploads/")) return;
  const file = path.join(process.cwd(), "public", url);
  if (!file.startsWith(path.join(process.cwd(), "public", "uploads"))) return;
  await unlink(file).catch(() => undefined);
}

export async function recordEvent(input: { slug: string; eventType: AnalyticsEventType; label?: string; visitorId?: string; referrer?: string | null }) {
  const allowed: AnalyticsEventType[] = ["page_view", "music_click", "social_click", "booking_click", "ticket_click", "custom_link_click", "epk_view", "pdf_download", "video_click"];
  if (!allowed.includes(input.eventType)) return;
  const visitorId = input.visitorId && /^[0-9a-f-]{36}$/i.test(input.visitorId) ? input.visitorId : null;
  const label = input.label?.slice(0, 80) ?? null;
  if (isDemoMode()) {
    await updateState((state) => {
      const site = state.sites.find((item) => item.slug === input.slug && item.status === "published");
      if (!site) return;
      state.events.push({
        id: crypto.randomUUID(),
        site_id: site.id,
        event_type: input.eventType,
        event_data: { visitor_id: visitorId, label },
        referrer: hostnameFromReferrer(input.referrer ?? null),
        user_agent: null,
        country: null,
        created_at: nowIso(),
      });
      if (state.events.length > 20000) state.events = state.events.slice(-15000);
    });
    return;
  }
  const supabase = await createServerSupabase();
  const { data: site } = await supabase.from("artist_sites").select("id").eq("slug", input.slug).eq("status", "published").maybeSingle();
  if (!site) return;
  await supabase.from("analytics_events").insert({
    site_id: site.id,
    event_type: input.eventType,
    event_data: { visitor_id: visitorId, label },
    referrer: hostnameFromReferrer(input.referrer ?? null),
  });
}

export async function analyticsForUser(userId: string, plan: Plan) {
  if (!isPro(plan)) return { ok: false as const, error: "Analytics is a Pro feature." };
  if (isDemoMode()) {
    const state = await readState();
    const site = owned(state, userId);
    if (!site) return { ok: false as const, error: "Artist profile not found." };
    return { ok: true as const, events: state.events.filter((event) => event.site_id === site.id) };
  }
  const supabase = await createServerSupabase();
  const { data: site } = await supabase.from("artist_sites").select("id").eq("user_id", userId).maybeSingle();
  if (!site) return { ok: false as const, error: "Artist profile not found." };
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 90);
  const { data, error } = await supabase.from("analytics_events").select("*").eq("site_id", site.id).gte("created_at", since.toISOString()).limit(10000);
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, events: (data ?? []) as import("@/types").AnalyticsEvent[] };
}

export async function setUserPlan(actorId: string, targetUserId: string, plan: Plan, source: "admin" | "simulated") {
  if (source === "admin" && !isAdminUser(actorId)) return { ok: false as const, error: "Admin access required." };
  if (isDemoMode()) {
    await updateState((state) => {
      const user = state.users.find((item) => item.id === targetUserId);
      if (!user) return;
      user.plan = plan;
      user.plan_source = source;
      user.subscription_status = plan === "free" ? null : "active";
      user.updated_at = nowIso();
      state.sites.forEach((site) => {
        if (site.user_id === targetUserId) site.public_plan = plan;
      });
    });
    return { ok: true as const };
  }
  const admin = createServiceSupabase();
  const { error } = await admin.from("profiles").update({ plan, plan_source: source, subscription_status: plan === "free" ? null : "active" }).eq("id", targetUserId);
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function listDirectory() {
  if (isDemoMode()) {
    const state = await readState();
    return state.users.map((user) => {
      const site = state.sites.find((item) => item.user_id === user.id);
      return {
        id: user.id,
        email: user.email,
        name: user.display_name,
        plan: user.plan,
        slug: site?.slug ?? null,
        status: site?.status ?? null,
        created_at: user.created_at,
      };
    });
  }
  const admin = createServiceSupabase();
  const { data: profiles, error } = await admin.from("profiles").select("id, display_name, plan, created_at");
  if (error) throw new Error(error.message);
  const { data: sites } = await admin.from("artist_sites").select("user_id, slug, status");
  const { data: authUsers } = await admin.auth.admin.listUsers({ perPage: 200 });
  const emails = new Map((authUsers?.users ?? []).map((user) => [user.id, user.email]));
  return (profiles ?? []).map((profile) => {
    const site = (sites ?? []).find((item) => item.user_id === profile.id);
    return {
      id: profile.id as string,
      email: emails.get(profile.id as string) ?? "",
      name: profile.display_name as string | null,
      plan: profile.plan as Plan,
      slug: (site?.slug as string) ?? null,
      status: (site?.status as string) ?? null,
      created_at: profile.created_at as string,
    };
  });
}

export async function saveSupportMessage(input: { name: string; email: string; topic: string; message: string }) {
  if (!isDemoMode()) return;
  await updateState((state) => {
    state.messages.push({ id: crypto.randomUUID(), ...input, created_at: nowIso() });
  });
}

export async function requestCustomDomain(userId: string, plan: Plan, hostname: string) {
  if (!isPro(plan)) return { ok: false as const, error: "Custom domains are included with Pro." };
  if (!/^(?!-)[a-z0-9-]{1,63}(\.[a-z0-9-]{1,63})+$/i.test(hostname)) {
    return { ok: false as const, error: "Enter a domain like music.artist.com." };
  }
  if (isDemoMode()) {
    await updateState((state) => {
      const site = owned(state, userId);
      if (!site) return;
      state.domains.push({ id: crypto.randomUUID(), site_id: site.id, hostname: hostname.toLowerCase(), status: "pending", created_at: nowIso() });
    });
    return { ok: true as const };
  }
  const supabase = await createServerSupabase();
  const { data: site } = await supabase.from("artist_sites").select("id").eq("user_id", userId).maybeSingle();
  if (!site) return { ok: false as const, error: "Artist profile not found." };
  const { error } = await supabase.from("domains").insert({ site_id: site.id, hostname: hostname.toLowerCase(), status: "pending" });
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function publishedSlugs() {
  if (isDemoMode()) {
    const state = await readState();
    const slugs = state.sites.filter((site) => site.status === "published").map((site) => site.slug);
    if (!slugs.includes("jaylensaint")) slugs.push("jaylensaint");
    return slugs;
  }
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("artist_sites").select("slug").eq("status", "published");
  const slugs = (data ?? []).map((site) => site.slug as string);
  if (!slugs.includes("jaylensaint")) slugs.push("jaylensaint");
  return slugs;
}
