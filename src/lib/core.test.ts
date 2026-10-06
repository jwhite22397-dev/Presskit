import { describe, expect, it } from "vitest";
import { aggregateAnalytics, audienceStory } from "@/lib/analytics";
import { calculateCompleteness } from "@/lib/completeness";
import { videoEmbed, spotifyEmbed } from "@/lib/embeds";
import { assessFoundingCode } from "@/lib/founding";
import { DeterministicArtistOptimizationService, FutureAIArtistOptimizationService } from "@/lib/optimization";
import { referralSlug } from "@/lib/referral";
import { releaseEyebrow, releaseStatus } from "@/lib/releases";
import { explainPresskitScore } from "@/lib/score";
import { canDownloadPDF, canRemoveBranding, canUseAnalytics, canUsePremiumTheme } from "@/config/plans";
import { isReservedSlug, normalizeSlug, validateSlug } from "@/lib/slug";
import { toPublicArtist } from "@/lib/serialize";
import { sanitizeUrl } from "@/lib/urls";
import { demoArtistData } from "@/data/demo";
import type { AnalyticsEvent } from "@/types";

describe("slugs", () => {
  it("normalizes names into addresses", () => {
    expect(normalizeSlug("Jaylen Saint")).toBe("jaylen-saint");
    expect(normalizeSlug("  Café___Noir!! ")).toBe("cafe-noir");
  });

  it("rejects reserved routes", () => {
    expect(isReservedSlug("dashboard")).toBe(true);
    expect(validateSlug("login")).toEqual({ ok: false, reason: "That address is reserved." });
    expect(validateSlug("ab")).toEqual({ ok: false, reason: "Use at least 3 characters." });
    expect(validateSlug("saint")).toEqual({ ok: true, slug: "saint" });
  });
});

describe("plans", () => {
  it("keeps pro features off the free plan", () => {
    expect(canUseAnalytics("free")).toBe(false);
    expect(canDownloadPDF("free")).toBe(false);
    expect(canRemoveBranding("free")).toBe(false);
    expect(canUsePremiumTheme("free", "neon")).toBe(false);
    expect(canUsePremiumTheme("free", "editorial")).toBe(true);
    expect(canUseAnalytics("pro")).toBe(true);
    expect(canDownloadPDF("lifetime")).toBe(true);
    expect(canUsePremiumTheme("lifetime", "neon")).toBe(true);
  });
});

describe("urls and embeds", () => {
  it("blocks unsafe urls", () => {
    expect(sanitizeUrl("javascript:alert(1)")).toBeNull();
    expect(sanitizeUrl("https://example.com/path")).toBe("https://example.com/path");
    expect(sanitizeUrl("https://user:pass@example.com")).toBeNull();
  });

  it("builds provider embeds only from known urls", () => {
    expect(videoEmbed("https://www.youtube.com/watch?v=aqz-KE-bpKQ")?.src).toBe("https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ");
    expect(videoEmbed("https://youtu.be/aqz-KE-bpKQ")?.src).toBe("https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ");
    expect(videoEmbed("https://vimeo.com/123456")?.src).toBe("https://player.vimeo.com/video/123456");
    expect(videoEmbed("https://evil.example/watch?v=aqz-KE-bpKQ")).toBeNull();
    expect(spotifyEmbed("https://open.spotify.com/track/6rqhFgbbKwnb9MLmUQDhG6")?.src).toContain("/embed/track/6rqhFgbbKwnb9MLmUQDhG6");
  });
});

describe("completeness and privacy", () => {
  it("scores a finished profile", () => {
    const result = calculateCompleteness(demoArtistData);
    expect(result.percentage).toBe(100);
    expect(result.items.every((item) => item.completed)).toBe(true);
  });

  it("recommends a booking email when missing", () => {
    const result = calculateCompleteness({
      ...demoArtistData,
      site: {
        ...demoArtistData.site,
        artist_name: "",
        booking_email: null,
        profile_image_url: null,
        hero_image_url: null,
        short_bio: null,
        full_bio: null,
      },
      releases: [],
      socials: [],
      shows: [],
      gallery: [],
      videos: [],
      highlights: [],
    });
    expect(result.percentage).toBe(0);
    expect(result.items.find((item) => item.key === "booking")?.recommendation).toMatch(/promoters/i);
  });

  it("strips owner ids from public payloads", () => {
    const pub = toPublicArtist(demoArtistData);
    expect(pub.site.user_id).toBeUndefined();
    expect(JSON.stringify(pub)).not.toContain("stripe");
    expect(pub.plan).toBe("pro");
  });
});

describe("analytics", () => {
  it("aggregates views, uniques, and clicks inside the window", () => {
    const now = new Date("2026-10-06T12:00:00.000Z");
    const events: AnalyticsEvent[] = [
      event("page_view", "2026-10-06T01:00:00.000Z", { visitor_id: "11111111-1111-4111-8111-111111111111" }),
      event("page_view", "2026-10-06T02:00:00.000Z", { visitor_id: "11111111-1111-4111-8111-111111111111" }),
      event("page_view", "2026-10-05T02:00:00.000Z", { visitor_id: "22222222-2222-4222-8222-222222222222" }, "instagram.com"),
      event("music_click", "2026-10-06T03:00:00.000Z", { label: "Spotify" }),
      event("page_view", "2026-01-01T00:00:00.000Z", { visitor_id: "33333333-3333-4333-8333-333333333333" }),
    ];
    const summary = aggregateAnalytics(events, 7, now);
    expect(summary.total_views).toBe(3);
    expect(summary.unique_visitors).toBe(2);
    expect(summary.total_clicks).toBe(1);
    expect(summary.top_links[0]).toEqual({ label: "Spotify", clicks: 1 });
    expect(summary.views_by_day).toHaveLength(7);
    expect(summary.sources[0]?.source).toBe("instagram.com");
  });

  it("tells the audience story in musician language", () => {
    const now = new Date("2026-10-06T12:00:00.000Z");
    const events: AnalyticsEvent[] = [
      event("page_view", "2026-10-06T01:00:00.000Z", { visitor_id: "11111111-1111-4111-8111-111111111111" }),
      event("music_click", "2026-10-06T01:10:00.000Z", { label: "Spotify" }),
      event("video_click", "2026-10-06T01:20:00.000Z", { label: "Live" }),
      event("social_click", "2026-10-06T01:30:00.000Z", { label: "Instagram" }),
      event("booking_click", "2026-10-06T01:40:00.000Z", { label: "Booking" }),
    ];
    const story = audienceStory(events, 7, now);
    expect(story.visitors).toBe(1);
    expect(story.listened).toBe(1);
    expect(story.watched).toBe(1);
    expect(story.instagram).toBe(1);
    expect(story.booking).toBe(1);
    expect(story.topDestination).toBe("Spotify");
    expect(story.actions).toBe(4);
    expect(story.fanActionRate).toBe(100);
  });
});

describe("referrals, founding codes, and releases", () => {
  it("accepts only public artist slugs as referrals", () => {
    expect(referralSlug("jaylensaint")).toBe("jaylensaint");
    expect(referralSlug("Draft-abc")).toBeNull();
    expect(referralSlug("../admin")).toBeNull();
    expect(referralSlug("ab")).toBeNull();
  });

  it("rejects expired, inactive, and exhausted founding codes", () => {
    const base = { active: true, expires_at: null, redemption_count: 0, max_redemptions: 1, alreadyRedeemed: false };
    expect(assessFoundingCode(base, new Date("2026-10-06")).ok).toBe(true);
    expect(assessFoundingCode({ ...base, active: false }).ok).toBe(false);
    expect(assessFoundingCode({ ...base, expires_at: "2026-01-01T00:00:00.000Z" }, new Date("2026-10-06")).ok).toBe(false);
    expect(assessFoundingCode({ ...base, redemption_count: 1 }).ok).toBe(false);
    expect(assessFoundingCode({ ...base, alreadyRedeemed: true }).ok).toBe(false);
  });

  it("treats a missing release status as already out", () => {
    expect(releaseStatus({})).toBe("released");
    expect(releaseEyebrow({ type: "single", release_date: "2026-11-01", release_status: "announced" })).toMatch(/Coming/);
    expect(releaseEyebrow({ type: "single", release_date: null, release_status: "released" })).toBe("single");
  });
});

describe("future optimization", () => {
  it("gives a reason for each deterministic recommendation", () => {
    const tips = new DeterministicArtistOptimizationService().recommend({
      ...demoArtistData,
      site: { ...demoArtistData.site, booking_email: null, short_bio: null, full_bio: null },
      releases: [],
      videos: [],
      shows: [],
      gallery: [],
      socials: [],
      press: [],
      highlights: [],
    });
    expect(tips.length).toBeGreaterThan(0);
    expect(tips.every((tip) => tip.reason.length > 10 && tip.href.startsWith("/dashboard"))).toBe(true);
  });

  it("does not pretend the future model is available", () => {
    expect(() => new FutureAIArtistOptimizationService().recommend(demoArtistData)).toThrow(/not enabled/);
  });

  it("leaves fan conversion empty until there is enough traffic", () => {
    const score = explainPresskitScore({
      completeness: 40,
      hasBooking: false,
      hasPress: false,
      hasPhotos: false,
      hasBio: false,
      visitors: 3,
      fanActionRate: 100,
      hasMusic: true,
      hasSocials: false,
      hasHero: false,
    });
    expect(score.dimensions.find((item) => item.key === "fan_conversion")?.score).toBeNull();
    expect(JSON.stringify(score)).not.toMatch(/better than/i);
  });
});

function event(type: AnalyticsEvent["event_type"], created_at: string, data: Record<string, unknown>, referrer: string | null = null): AnalyticsEvent {
  return {
    id: created_at + type,
    site_id: "site",
    event_type: type,
    event_data: data,
    referrer,
    user_agent: null,
    country: null,
    created_at,
  };
}
