import type { AnalyticsEvent, AnalyticsEventType, AnalyticsSummary } from "@/types";

const CLICK_TYPES = new Set<AnalyticsEventType>([
  "music_click",
  "social_click",
  "booking_click",
  "ticket_click",
  "custom_link_click",
  "video_click",
]);

export function startOfRange(days: number, now = new Date()) {
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  return start;
}

export function aggregateAnalytics(events: AnalyticsEvent[], days: number, now = new Date()): AnalyticsSummary {
  const start = startOfRange(days, now);
  const inRange = events.filter((event) => new Date(event.created_at) >= start);
  const views = inRange.filter((event) => event.event_type === "page_view");
  const visitors = new Set(
    views
      .map((event) => {
        const id = event.event_data && typeof event.event_data.visitor_id === "string" ? event.event_data.visitor_id : null;
        return id;
      })
      .filter((id): id is string => Boolean(id)),
  );

  const clicks = inRange.filter((event) => CLICK_TYPES.has(event.event_type));
  const counts = new Map<string, number>();
  for (const event of clicks) {
    const label = event.event_data && typeof event.event_data.label === "string" ? event.event_data.label : event.event_type;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  const viewsByDay: { date: string; views: number }[] = [];
  for (let i = 0; i < days; i += 1) {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() + i);
    const key = day.toISOString().slice(0, 10);
    viewsByDay.push({
      date: key,
      views: views.filter((event) => event.created_at.slice(0, 10) === key).length,
    });
  }

  const sources = new Map<string, number>();
  for (const event of views) {
    if (!event.referrer) continue;
    sources.set(event.referrer, (sources.get(event.referrer) ?? 0) + 1);
  }

  return {
    total_views: views.length,
    unique_visitors: visitors.size,
    total_clicks: clicks.length,
    epk_views: inRange.filter((event) => event.event_type === "epk_view").length,
    pdf_downloads: inRange.filter((event) => event.event_type === "pdf_download").length,
    top_links: [...counts.entries()]
      .map(([label, count]) => ({ label, clicks: count }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 6),
    views_by_day: viewsByDay,
    sources: [...sources.entries()]
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
  };
}
