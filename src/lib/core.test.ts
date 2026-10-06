import { describe, expect, it } from "vitest";
import { aggregateAnalytics } from "@/lib/analytics";
import { calculateCompleteness } from "@/lib/completeness";
import { videoEmbed, spotifyEmbed } from "@/lib/embeds";
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
        booking_email: null,
        profile_image_url: null,
        hero_image_url: null,
        short_bio: null,
        full_bio: null,
      },
      releases: [],
      socials: [],
      press: [],
      shows: [],
      gallery: [],
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
