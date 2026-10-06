import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { demoArtistData } from "@/data/demo";
import type {
  AnalyticsEvent,
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
  Video,
} from "@/types";
import { hashPassword } from "@/server/passwords";

export interface DemoUser {
  id: string;
  email: string;
  password_hash: string;
  display_name: string | null;
  plan: Plan;
  plan_source: "default" | "admin" | "simulated" | "stripe" | "founding";
  referred_by_slug: string | null;
  referral_source: string | null;
  referred_at: string | null;
  onboarding_started_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  reset_token?: string | null;
  reset_expires?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SlugRedirect {
  id: string;
  site_id: string;
  from_slug: string;
  to_slug: string;
  created_at: string;
}

export interface DomainRequest {
  id: string;
  site_id: string;
  hostname: string;
  status: "pending";
  created_at: string;
}

export interface SupportMessage {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  created_at: string;
}

export interface ProductEventRecord {
  id: string;
  name: string;
  properties: Record<string, string | number | boolean | null>;
  created_at: string;
}

export interface FoundingCode {
  id: string;
  code: string;
  entitlement: "pro" | "lifetime";
  max_redemptions: number;
  redemption_count: number;
  expires_at: string | null;
  active: boolean;
  created_by: string | null;
  created_at: string;
}

export interface FoundingRedemption {
  id: string;
  code_id: string;
  user_id: string;
  redeemed_at: string;
}

export interface AppState {
  users: DemoUser[];
  sites: ArtistSite[];
  releases: Release[];
  releaseLinks: ReleaseLink[];
  videos: Video[];
  shows: Show[];
  press: PressItem[];
  gallery: GalleryImage[];
  socials: SocialLink[];
  links: CustomLink[];
  highlights: CareerHighlight[];
  events: AnalyticsEvent[];
  redirects: SlugRedirect[];
  domains: DomainRequest[];
  messages: SupportMessage[];
  productEvents: ProductEventRecord[];
  foundingCodes: FoundingCode[];
  foundingRedemptions: FoundingRedemption[];
}

const STORE_PATH = path.join(process.cwd(), "data", "demo-store.json");
const DEMO_USER_ID = "11111111-1111-4111-8111-111111111111";

let memory: AppState | null = null;
let queue: Promise<unknown> = Promise.resolve();

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function rand(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(1664525, value) + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function seedEvents(siteId: string): AnalyticsEvent[] {
  const random = rand(20261006);
  const events: AnalyticsEvent[] = [];
  const now = new Date();
  const labels = ["Spotify", "Apple Music", "Instagram", "Get Tickets", "YouTube", "Book Me"];
  const types: AnalyticsEventType[] = ["music_click", "music_click", "social_click", "ticket_click", "video_click", "booking_click"];
  for (let day = 89; day >= 0; day -= 1) {
    const date = new Date(now);
    date.setUTCDate(now.getUTCDate() - day);
    const views = 6 + Math.floor(random() * 18);
    for (let i = 0; i < views; i += 1) {
      const stamp = new Date(date);
      stamp.setUTCHours(Math.floor(random() * 24), Math.floor(random() * 60), 0, 0);
      const visitor = `visitor-${day}-${Math.floor(random() * 8)}`;
      events.push({
        id: `evt-${day}-${i}`,
        site_id: siteId,
        event_type: "page_view",
        event_data: { visitor_id: visitor },
        referrer: random() > 0.55 ? "instagram.com" : random() > 0.5 ? "tiktok.com" : null,
        user_agent: null,
        country: null,
        created_at: stamp.toISOString(),
      });
      if (random() > 0.62) {
        const index = Math.floor(random() * labels.length);
        events.push({
          id: `clk-${day}-${i}`,
          site_id: siteId,
          event_type: types[index],
          event_data: { visitor_id: visitor, label: labels[index] },
          referrer: null,
          user_agent: null,
          country: null,
          created_at: stamp.toISOString(),
        });
      }
    }
  }
  return events;
}

async function seedState(): Promise<AppState> {
  const now = new Date().toISOString();
  const demo = clone(demoArtistData);
  const site: ArtistSite = { ...demo.site, user_id: DEMO_USER_ID };
  const releases: Release[] = [];
  const releaseLinks: ReleaseLink[] = [];
  for (const release of demo.releases) {
    const { links, ...rest } = release;
    releases.push(rest);
    releaseLinks.push(...links);
  }
  return {
    users: [
      {
        id: DEMO_USER_ID,
        email: "demo@presskit.app",
        password_hash: await hashPassword("demo1234"),
        display_name: "Jaylen Saint",
        plan: "pro",
        plan_source: "simulated",
        stripe_customer_id: null,
        stripe_subscription_id: null,
        subscription_status: "active",
        referred_by_slug: null,
        referral_source: null,
        referred_at: null,
        onboarding_started_at: now,
        created_at: now,
        updated_at: now,
      },
    ],
    sites: [site],
    releases,
    releaseLinks,
    videos: demo.videos,
    shows: demo.shows,
    press: demo.press,
    gallery: demo.gallery,
    socials: demo.socials,
    links: demo.links,
    highlights: demo.highlights,
    events: seedEvents(site.id),
    redirects: [],
    domains: [],
    messages: [],
    productEvents: [],
    foundingCodes: [],
    foundingRedemptions: [],
  };
}

function normalize(state: AppState): AppState {
  state.productEvents ??= [];
  state.foundingCodes ??= [];
  state.foundingRedemptions ??= [];
  state.messages ??= [];
  state.domains ??= [];
  state.redirects ??= [];
  for (const release of state.releases) {
    release.release_status ??= "released";
    if (release.announcement_date === undefined) release.announcement_date = null;
    if (release.prerelease_url === undefined) release.prerelease_url = null;
  }
  for (const user of state.users) {
    if (user.referred_by_slug === undefined) user.referred_by_slug = null;
    if (user.referral_source === undefined) user.referral_source = null;
    if (user.referred_at === undefined) user.referred_at = null;
    if (user.onboarding_started_at === undefined) user.onboarding_started_at = user.created_at;
  }
  return state;
}

async function loadState(): Promise<AppState> {
  if (memory) return memory;
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    memory = normalize(JSON.parse(raw) as AppState);
    return memory;
  } catch {
    const seeded = await seedState();
    await mkdir(path.dirname(STORE_PATH), { recursive: true });
    await writeFile(STORE_PATH, JSON.stringify(seeded, null, 2));
    memory = normalize(seeded);
    return memory;
  }
}

async function persist(state: AppState) {
  memory = state;
  await mkdir(path.dirname(STORE_PATH), { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(state));
}

export function updateState<T>(mutator: (state: AppState) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const state = await loadState();
    const result = await mutator(state);
    await persist(state);
    return result;
  });
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export async function readState() {
  return loadState();
}

export function hydrate(state: AppState, site: ArtistSite): ArtistData {
  const releases = state.releases
    .filter((release) => release.site_id === site.id)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((release) => ({
      ...release,
      links: state.releaseLinks.filter((link) => link.release_id === release.id).sort((a, b) => a.sort_order - b.sort_order),
    }));
  const sort = <T extends { sort_order: number }>(items: T[]) => [...items].sort((a, b) => a.sort_order - b.sort_order);
  return {
    site,
    releases,
    videos: sort(state.videos.filter((item) => item.site_id === site.id)),
    shows: sort(state.shows.filter((item) => item.site_id === site.id)),
    press: sort(state.press.filter((item) => item.site_id === site.id)),
    gallery: sort(state.gallery.filter((item) => item.site_id === site.id)),
    socials: sort(state.socials.filter((item) => item.site_id === site.id)),
    links: sort(state.links.filter((item) => item.site_id === site.id)),
    highlights: sort(state.highlights.filter((item) => item.site_id === site.id)),
    plan: site.public_plan,
  };
}

export function nextOrder(items: { sort_order: number }[]) {
  return items.reduce((max, item) => Math.max(max, item.sort_order), -1) + 1;
}

export const DEMO_ACCOUNT = {
  id: DEMO_USER_ID,
  email: "demo@presskit.app",
  password: "demo1234",
};
