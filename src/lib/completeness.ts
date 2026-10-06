import type { ArtistData, CompletenessItem, ProfileCompleteness } from "@/types";
import { todayISODate } from "@/lib/utils";

export function calculateCompleteness(data: Pick<ArtistData, "site" | "releases" | "socials" | "shows" | "gallery" | "videos" | "highlights">): ProfileCompleteness {
  const named = Boolean(data.site.artist_name.trim()) && data.site.artist_name !== "New artist";
  const upcoming = data.shows.some((show) => show.date >= todayISODate());
  const items: CompletenessItem[] = [
    {
      key: "name",
      label: "Artist name",
      completed: named,
      recommendation: "Add the name fans should see.",
      href: "/dashboard/site",
    },
    {
      key: "photo",
      label: "Hero photo",
      completed: Boolean(data.site.profile_image_url || data.site.hero_image_url),
      recommendation: "Add a photo so the page feels like you.",
      href: "/dashboard/site",
    },
    {
      key: "music",
      label: "Music",
      completed: data.releases.length > 0,
      recommendation: "Add a release with the links you already have.",
      href: "/dashboard/content?tab=Music",
    },
    {
      key: "socials",
      label: "Socials",
      completed: data.socials.length > 0,
      recommendation: "Add Instagram, TikTok, or wherever people follow you.",
      href: "/dashboard/content?tab=Links",
    },
    {
      key: "bio",
      label: "Bio",
      completed: Boolean(data.site.short_bio || data.site.full_bio),
      recommendation: "A couple of sentences is enough.",
      href: "/dashboard/site",
    },
    {
      key: "booking",
      label: "Booking contact",
      completed: Boolean(data.site.booking_email),
      recommendation: "Artists with clear booking information are easier for promoters to contact.",
      href: "/dashboard/site",
    },
    {
      key: "video",
      label: "Video",
      completed: data.videos.length > 0,
      recommendation: "Add a video, especially live footage.",
      href: "/dashboard/content?tab=Videos",
    },
    {
      key: "show",
      label: "Upcoming show",
      completed: upcoming,
      recommendation: "Add your next show so fans know where to find you.",
      href: "/dashboard/content?tab=Shows",
    },
    {
      key: "gallery",
      label: "Press photos",
      completed: data.gallery.length > 0,
      recommendation: "Upload a few photos people can use.",
      href: "/dashboard/content?tab=Photos",
    },
    {
      key: "highlights",
      label: "Career highlights",
      completed: data.highlights.length > 0,
      recommendation: "Add one thing you are proud of.",
      href: "/dashboard/content?tab=Highlights",
    },
  ];

  const completed = items.filter((item) => item.completed).length;
  return {
    percentage: Math.round((completed / items.length) * 100),
    items,
  };
}
