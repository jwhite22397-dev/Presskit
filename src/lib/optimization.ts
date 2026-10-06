import { todayISODate } from "@/lib/utils";
import type { ArtistData } from "@/types";

export interface OptimizationRecommendation {
  id: string;
  title: string;
  reason: string;
  href: string;
}

export interface ArtistOptimizationService {
  recommend(data: ArtistData): OptimizationRecommendation[];
}

export class DeterministicArtistOptimizationService implements ArtistOptimizationService {
  recommend(data: ArtistData): OptimizationRecommendation[] {
    const upcoming = data.shows.some((show) => show.date >= todayISODate());
    const liveVideo = data.videos.some((video) => /live/i.test(video.title));
    const featured = data.releases.some((release) => release.is_featured);
    const items: OptimizationRecommendation[] = [];
    if (!data.site.booking_email) {
      items.push({
        id: "booking",
        title: "Add a booking contact",
        reason: "Promoters need a person to email.",
        href: "/dashboard/site",
      });
    }
    if (!data.site.short_bio && !data.site.full_bio) {
      items.push({
        id: "bio",
        title: "Add a short bio",
        reason: "Two or three sentences tell a booker who you are.",
        href: "/dashboard/site",
      });
    }
    if (!featured && data.releases.length > 0) {
      items.push({
        id: "featured-release",
        title: "Feature a release",
        reason: "The featured release is the first music people see.",
        href: "/dashboard/content?tab=Music",
      });
    }
    if (data.releases.length === 0) {
      items.push({
        id: "release",
        title: "Add a release",
        reason: "A page without music does not give fans a next step.",
        href: "/dashboard/content?tab=Music",
      });
    }
    if (!liveVideo) {
      items.push({
        id: "live-video",
        title: "Add a live video",
        reason: "Bookers look for footage of you in a room.",
        href: "/dashboard/content?tab=Videos",
      });
    }
    if (!upcoming) {
      items.push({
        id: "shows",
        title: "Add an upcoming show",
        reason: "A date gives fans a reason to come back.",
        href: "/dashboard/content?tab=Shows",
      });
    }
    if (data.gallery.length === 0) {
      items.push({
        id: "press-images",
        title: "Add press photos",
        reason: "High-resolution photos are what press and promoters download.",
        href: "/dashboard/content?tab=Photos",
      });
    }
    if (data.socials.length === 0) {
      items.push({
        id: "socials",
        title: "Add social links",
        reason: "People confirm an artist by finding them somewhere they already scroll.",
        href: "/dashboard/content?tab=Links",
      });
    }
    if (!data.press.length && !data.highlights.length && !data.site.booking_email) {
      items.push({
        id: "epk",
        title: "Add something for industry people",
        reason: "A quote, a highlight, or a booking email gives the EPK something to show.",
        href: "/dashboard/content?tab=Press",
      });
    }
    return items;
  }
}

/** Placeholder. Do not call this until a real model is configured. */
export class FutureAIArtistOptimizationService implements ArtistOptimizationService {
  recommend(data: ArtistData): OptimizationRecommendation[] {
    void data;
    throw new Error("PRESSKIT AI is not enabled.");
  }
}

export function optimizationService(): ArtistOptimizationService {
  return new DeterministicArtistOptimizationService();
}
