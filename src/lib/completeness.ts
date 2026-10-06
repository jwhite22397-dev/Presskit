import type { ArtistData, CompletenessItem, ProfileCompleteness } from "@/types";
import { todayISODate } from "@/lib/utils";

export function calculateCompleteness(data: Pick<ArtistData, "site" | "releases" | "socials" | "press" | "shows" | "gallery">): ProfileCompleteness {
  const upcoming = data.shows.some((show) => show.date >= todayISODate());
  const items: CompletenessItem[] = [
    {
      key: "photo",
      label: "Artist photo",
      completed: Boolean(data.site.profile_image_url || data.site.hero_image_url),
      recommendation: "Add a press photo so promoters recognize you immediately.",
    },
    {
      key: "bio",
      label: "Biography",
      completed: Boolean(data.site.short_bio || data.site.full_bio),
      recommendation: "Write a short bio. Two or three sentences is enough to start.",
    },
    {
      key: "music",
      label: "Music",
      completed: data.releases.length > 0,
      recommendation: "Add a release with streaming links.",
    },
    {
      key: "socials",
      label: "Social links",
      completed: data.socials.length > 0,
      recommendation: "Add the profiles fans already follow.",
    },
    {
      key: "booking",
      label: "Booking contact",
      completed: Boolean(data.site.booking_email),
      recommendation: "Artists with clear booking information are easier for promoters to contact.",
    },
    {
      key: "press",
      label: "Press quotes",
      completed: data.press.length > 0,
      recommendation: "Add a quote or article so the page feels established.",
    },
    {
      key: "show",
      label: "Upcoming show",
      completed: upcoming,
      recommendation: "Add your next show so fans and promoters know where to find you.",
    },
    {
      key: "gallery",
      label: "Gallery",
      completed: data.gallery.length > 0,
      recommendation: "Upload a few performance or press photos.",
    },
  ];

  const completed = items.filter((item) => item.completed).length;
  return {
    percentage: Math.round((completed / items.length) * 100),
    items,
  };
}
