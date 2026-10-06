export interface ScoreDimension {
  key: "completeness" | "industry" | "fan_conversion" | "discoverability" | "brand";
  label: string;
  score: number | null;
  reason: string;
}

export interface PresskitScoreInput {
  completeness: number;
  hasBooking: boolean;
  hasPress: boolean;
  hasPhotos: boolean;
  hasBio: boolean;
  visitors: number | null;
  fanActionRate: number | null;
  hasMusic: boolean;
  hasSocials: boolean;
  hasHero: boolean;
}

function points(flags: boolean[]) {
  if (!flags.length) return 0;
  return Math.round((flags.filter(Boolean).length / flags.length) * 100);
}

/**
 * Explainable dimensions only. Scores stay null when the underlying data is too thin.
 * This never compares an artist to other artists.
 */
export function explainPresskitScore(input: PresskitScoreInput): { dimensions: ScoreDimension[] } {
  const industryFlags = [input.hasBooking, input.hasPress, input.hasPhotos, input.hasBio];
  const industryMissing = [
    !input.hasBooking ? "booking contact" : null,
    !input.hasPress ? "press" : null,
    !input.hasPhotos ? "press photos" : null,
    !input.hasBio ? "biography" : null,
  ].filter(Boolean);
  const enoughAudience = (input.visitors ?? 0) >= 10 && input.fanActionRate !== null;
  return {
    dimensions: [
      {
        key: "completeness",
        label: "Profile completeness",
        score: input.completeness,
        reason: "Share of the profile checklist that is filled in.",
      },
      {
        key: "industry",
        label: "Industry readiness",
        score: points(industryFlags),
        reason: industryMissing.length ? `Still open: ${industryMissing.join(", ")}.` : "Booking, press, photos, and bio are in place.",
      },
      {
        key: "fan_conversion",
        label: "Fan conversion",
        score: enoughAudience ? input.fanActionRate : null,
        reason: enoughAudience ? "Share of recent visitors who took an action." : "Needs at least 10 visitors before this can be calculated.",
      },
      {
        key: "discoverability",
        label: "Discoverability",
        score: points([input.hasMusic, input.hasSocials]),
        reason: "Music and social links are how people leave the page and find you.",
      },
      {
        key: "brand",
        label: "Brand presentation",
        score: input.hasHero ? 100 : 40,
        reason: input.hasHero ? "A hero image is set." : "A hero image is the main thing missing from the first screen.",
      },
    ],
  };
}
