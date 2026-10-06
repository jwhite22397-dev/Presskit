import type { Show } from "@/types";
import { todayISODate } from "@/lib/utils";

export function splitShows(shows: Show[], today = todayISODate()) {
  const upcoming = shows
    .filter((show) => show.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.event_name.localeCompare(b.event_name));
  const past = shows
    .filter((show) => show.date < today)
    .sort((a, b) => b.date.localeCompare(a.date));
  return { upcoming, past };
}
