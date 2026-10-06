"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { aggregateAnalytics } from "@/lib/analytics";
import type { AnalyticsEvent } from "@/types";

export function AnalyticsPanel({ events }: { events: AnalyticsEvent[] }) {
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const summary = useMemo(() => aggregateAnalytics(events, days), [events, days]);
  return (
    <div>
      <div className="flex gap-2">
        {[7, 30, 90].map((value) => (
          <button key={value} type="button" onClick={() => setDays(value as 7 | 30 | 90)} className={`px-3 py-2 text-sm ${days === value ? "bg-white text-black" : "border border-line"}`}>{value} days</button>
        ))}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <Metric label="Views" value={summary.total_views} />
        <Metric label="Visitors" value={summary.unique_visitors} />
        <Metric label="Clicks" value={summary.total_clicks} />
        <Metric label="EPK" value={summary.epk_views} />
      </div>
      <div className="mt-8 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={summary.views_by_day}>
            <XAxis dataKey="date" hide />
            <YAxis allowDecimals={false} width={32} stroke="#9c978e" />
            <Tooltip />
            <Area dataKey="views" stroke="#e4ff4a" fill="#e4ff4a33" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-xs uppercase tracking-[0.2em] text-muted">Top links</h2>
          <ul className="mt-3 text-sm">
            {summary.top_links.length ? summary.top_links.map((link) => (
              <li key={link.label} className="flex justify-between border-b border-line py-2"><span>{link.label}</span><span>{link.clicks}</span></li>
            )) : <li className="text-muted">No clicks in this range.</li>}
          </ul>
        </div>
        <div>
          <h2 className="text-xs uppercase tracking-[0.2em] text-muted">Sources</h2>
          <ul className="mt-3 text-sm">
            {summary.sources.length ? summary.sources.map((source) => (
              <li key={source.source} className="flex justify-between border-b border-line py-2"><span>{source.source}</span><span>{source.count}</span></li>
            )) : <li className="text-muted">Direct visits, or referrers not sent.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <article className="border border-line p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-2 text-3xl">{value}</p>
    </article>
  );
}
