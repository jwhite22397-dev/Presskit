"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { aggregateAnalytics, audienceStory } from "@/lib/analytics";
import type { AnalyticsEvent } from "@/types";

export function AnalyticsPanel({ events, extended }: { events: AnalyticsEvent[]; extended: boolean }) {
  const [days, setDays] = useState<7 | 30 | 90>(7);
  const range = extended ? days : 7;
  const summary = useMemo(() => aggregateAnalytics(events, range), [events, range]);
  const story = useMemo(() => audienceStory(events, range), [events, range]);
  return (
    <div>
      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <Line label="Visited" value={`${story.visitors} people`} />
        <Line label="Took an action" value={String(story.actions)} />
        <Line label="Listened" value={String(story.listened)} />
        <Line label="Watched a video" value={String(story.watched)} />
        <Line label="Opened Instagram" value={String(story.instagram)} />
        <Line label="Checked booking" value={String(story.booking)} />
      </div>
      {story.topDestination ? <p className="mt-4 text-sm">{story.topDestination} was the #1 destination.</p> : null}
      {story.fanActionRate !== null ? <p className="mt-2 text-sm"><span className="uppercase tracking-[0.16em] text-muted">Fan action rate </span>{story.fanActionRate}%</p> : null}

      <div className="mt-8 flex gap-2">
        {(extended ? [7, 30, 90] : [7]).map((value) => (
          <button key={value} type="button" onClick={() => setDays(value as 7 | 30 | 90)} className={`px-3 py-2 text-sm ${range === value ? "bg-white text-black" : "border border-line"}`}>{value} days</button>
        ))}
      </div>
      <div className="mt-6 h-48">
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
          <h2 className="text-xs uppercase tracking-[0.2em] text-muted">Destinations</h2>
          <ul className="mt-3 text-sm">
            {summary.top_links.length ? summary.top_links.map((link) => (
              <li key={link.label} className="flex justify-between border-b border-line py-2"><span>{link.label}</span><span>{link.clicks}</span></li>
            )) : <li className="text-muted">No actions in this range.</li>}
          </ul>
        </div>
        {extended ? (
          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] text-muted">Where they came from</h2>
            <ul className="mt-3 text-sm">
              {summary.sources.length ? summary.sources.map((source) => (
                <li key={source.source} className="flex justify-between border-b border-line py-2"><span>{source.source}</span><span>{source.count}</span></li>
              )) : <li className="text-muted">Direct visits, or the last site did not share a referrer.</li>}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <p className="border border-line px-3 py-3">
      <span className="block text-xs uppercase tracking-[0.16em] text-muted">{label}</span>
      <span className="mt-1 block text-xl">{value}</span>
    </p>
  );
}
