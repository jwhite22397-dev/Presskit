"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ArtistData } from "@/types";
import {
  addGalleryAction,
  deleteContentAction,
  moveGalleryAction,
  saveHighlightAction,
  saveLinkAction,
  savePressAction,
  saveReleaseAction,
  saveShowAction,
  saveSocialAction,
  saveVideoAction,
  setImageAction,
  uploadAction,
} from "@/app/actions";

const tabs = ["Music", "Videos", "Shows", "Press", "Photos", "Highlights", "Links"] as const;

export function ContentStudio({ data }: { data: ArtistData }) {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Music");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  function run(task: () => Promise<{ ok: boolean; error?: string }>, form?: HTMLFormElement) {
    setError(null);
    start(async () => {
      const result = await task();
      if (!result.ok) setError(result.error ?? "Could not save.");
      else {
        form?.reset();
        router.refresh();
      }
    });
  }

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-3">
        {tabs.map((item) => (
          <button key={item} type="button" onClick={() => setTab(item)} className={`shrink-0 px-3 py-2 text-sm ${tab === item ? "bg-white text-black" : "border border-line"}`}>{item}</button>
        ))}
      </div>
      {error ? <p className="mb-4 text-sm text-red-300">{error}</p> : null}
      {pending ? <p className="mb-4 text-sm text-muted">Saving…</p> : null}

      {tab === "Music" ? (
        <section className="grid gap-6">
          {data.releases.length === 0 ? <Empty title="No music yet" body="Add a single, EP, mixtape, or album with the links you already have." /> : null}
          <ul className="grid gap-3">
            {data.releases.map((release) => (
              <li key={release.id} className="flex items-center justify-between gap-3 border border-line px-3 py-3">
                <span>{release.title}{release.is_featured ? " · Featured" : ""}</span>
                <button type="button" className="text-sm text-muted" onClick={() => run(() => deleteContentAction("releases", release.id))}>Delete</button>
              </li>
            ))}
          </ul>
          <form className="grid gap-3" onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const body = new FormData(form);
            const links = ["spotify", "apple", "youtube", "soundcloud", "bandcamp"].flatMap((platform) => {
              const url = String(body.get(platform) ?? "").trim();
              return url ? [{ platform, url }] : [];
            });
            run(() => saveReleaseAction({
              title: body.get("title"),
              type: body.get("type"),
              release_date: body.get("release_date"),
              description: body.get("description"),
              is_featured: body.get("is_featured") === "on",
              links,
            }), form);
          }}>
            <input name="title" required placeholder="Title" className="border border-line bg-transparent px-3 py-3" />
            <select name="type" className="border border-line bg-black px-3 py-3"><option value="single">Single</option><option value="ep">EP</option><option value="mixtape">Mixtape</option><option value="album">Album</option></select>
            <input name="release_date" type="date" className="border border-line bg-transparent px-3 py-3" />
            <textarea name="description" placeholder="Description, optional" className="border border-line bg-transparent px-3 py-3" />
            {["spotify", "apple", "youtube", "soundcloud", "bandcamp"].map((platform) => (
              <input key={platform} name={platform} placeholder={`${platform} URL`} className="border border-line bg-transparent px-3 py-3" />
            ))}
            <label className="text-sm"><input type="checkbox" name="is_featured" className="mr-2" />Featured release</label>
            <button className="justify-self-start bg-accent px-4 py-2 text-sm text-black">Add release</button>
          </form>
        </section>
      ) : null}

      {tab === "Videos" ? (
        <section className="grid gap-4">
          {data.videos.length === 0 ? <Empty title="No videos yet" body="Paste a YouTube or Vimeo link. Other links become a clean card." /> : null}
          {data.videos.map((video) => (
            <div key={video.id} className="flex justify-between border border-line px-3 py-3"><span>{video.title}</span><button type="button" className="text-sm text-muted" onClick={() => run(() => deleteContentAction("videos", video.id))}>Delete</button></div>
          ))}
          <form className="grid gap-3" onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const body = new FormData(form);
            run(() => saveVideoAction({ title: body.get("title"), url: body.get("url"), is_featured: body.get("is_featured") === "on" }), form);
          }}>
            <input name="title" required placeholder="Title" className="border border-line bg-transparent px-3 py-3" />
            <input name="url" required placeholder="YouTube, Vimeo, or other URL" className="border border-line bg-transparent px-3 py-3" />
            <label className="text-sm"><input name="is_featured" type="checkbox" className="mr-2" />Featured</label>
            <button className="justify-self-start bg-accent px-4 py-2 text-sm text-black">Add video</button>
          </form>
        </section>
      ) : null}

      {tab === "Shows" ? (
        <section className="grid gap-4">
          {data.shows.length === 0 ? <Empty title="No shows yet" body="Playing somewhere soon? Add your next show so fans and promoters know where to find you." /> : null}
          {data.shows.map((show) => (
            <div key={show.id} className="flex justify-between border border-line px-3 py-3"><span>{show.date} · {show.event_name}</span><button type="button" className="text-sm text-muted" onClick={() => run(() => deleteContentAction("shows", show.id))}>Delete</button></div>
          ))}
          <form className="grid gap-3" onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const body = new FormData(form);
            run(() => saveShowAction({
              event_name: body.get("event_name"),
              venue: body.get("venue"),
              city: body.get("city"),
              state: body.get("state"),
              date: body.get("date"),
              time: body.get("time"),
              ticket_url: body.get("ticket_url"),
              is_sold_out: body.get("is_sold_out") === "on",
            }), form);
          }}>
            <input name="event_name" required placeholder="Event" className="border border-line bg-transparent px-3 py-3" />
            <input name="venue" required placeholder="Venue" className="border border-line bg-transparent px-3 py-3" />
            <div className="grid gap-3 md:grid-cols-2">
              <input name="city" required placeholder="City" className="border border-line bg-transparent px-3 py-3" />
              <input name="state" placeholder="State" className="border border-line bg-transparent px-3 py-3" />
            </div>
            <input name="date" required type="date" className="border border-line bg-transparent px-3 py-3" />
            <input name="time" placeholder="Time" className="border border-line bg-transparent px-3 py-3" />
            <input name="ticket_url" placeholder="Ticket URL" className="border border-line bg-transparent px-3 py-3" />
            <label className="text-sm"><input name="is_sold_out" type="checkbox" className="mr-2" />Sold out</label>
            <button className="justify-self-start bg-accent px-4 py-2 text-sm text-black">Add show</button>
          </form>
        </section>
      ) : null}

      {tab === "Press" ? (
        <section className="grid gap-4">
          {data.press.length === 0 ? <Empty title="No press yet" body="Add a real quote when you have one. PRESSKIT will not invent press for you." /> : null}
          {data.press.map((item) => (
            <div key={item.id} className="flex justify-between border border-line px-3 py-3"><span>{item.publication}</span><button type="button" className="text-sm text-muted" onClick={() => run(() => deleteContentAction("press", item.id))}>Delete</button></div>
          ))}
          <form className="grid gap-3" onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const body = new FormData(form);
            run(() => savePressAction({
              publication: body.get("publication"),
              headline: body.get("headline"),
              quote: body.get("quote"),
              article_url: body.get("article_url"),
              date: body.get("date"),
            }), form);
          }}>
            <input name="publication" required placeholder="Publication" className="border border-line bg-transparent px-3 py-3" />
            <input name="headline" placeholder="Headline" className="border border-line bg-transparent px-3 py-3" />
            <textarea name="quote" required placeholder="Quote" className="border border-line bg-transparent px-3 py-3" />
            <input name="article_url" placeholder="Article URL" className="border border-line bg-transparent px-3 py-3" />
            <input name="date" type="date" className="border border-line bg-transparent px-3 py-3" />
            <button className="justify-self-start bg-accent px-4 py-2 text-sm text-black">Add quote</button>
          </form>
        </section>
      ) : null}

      {tab === "Photos" ? (
        <section className="grid gap-4">
          {data.gallery.length === 0 ? <Empty title="No photos yet" body="Upload press and live shots. JPG, PNG, or WebP up to 5MB." /> : null}
          {data.gallery.map((image) => (
            <div key={image.id} className="flex items-center gap-3 border border-line px-3 py-3">
              <img src={image.url} alt={image.caption || ""} className="h-14 w-14 object-cover" />
              <span className="flex-1 text-sm">{image.caption}</span>
              <button type="button" className="text-sm" onClick={() => run(() => moveGalleryAction(image.id, "up"))}>Up</button>
              <button type="button" className="text-sm" onClick={() => run(() => moveGalleryAction(image.id, "down"))}>Down</button>
              <button type="button" className="text-sm text-muted" onClick={() => run(() => deleteContentAction("gallery", image.id))}>Delete</button>
            </div>
          ))}
          <form className="grid gap-3" onSubmit={async (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const body = new FormData(form);
            const file = body.get("file");
            if (!(file instanceof File) || file.size === 0) {
              setError("Choose an image.");
              return;
            }
            const uploadBody = new FormData();
            uploadBody.set("file", file);
            const uploaded = await uploadAction(uploadBody);
            if (!uploaded.ok || !uploaded.url) {
              setError(uploaded.error ?? "Upload failed.");
              return;
            }
            run(() => addGalleryAction(uploaded.url!, String(body.get("caption") ?? "")), form);
          }}>
            <input name="file" type="file" accept="image/jpeg,image/png,image/webp" required className="text-sm" />
            <input name="caption" placeholder="Caption, optional" className="border border-line bg-transparent px-3 py-3" />
            <button className="justify-self-start bg-accent px-4 py-2 text-sm text-black">Upload photo</button>
          </form>
          {(data.releases.find((release) => release.is_featured) ?? data.releases[0]) ? (
            <label className="text-sm text-muted">Cover for {(data.releases.find((release) => release.is_featured) ?? data.releases[0]).title}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block" onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                const body = new FormData();
                body.set("file", file);
                const uploaded = await uploadAction(body);
                if (!uploaded.ok || !uploaded.url) {
                  setError(uploaded.error ?? "Upload failed.");
                  return;
                }
                const release = data.releases.find((item) => item.is_featured) ?? data.releases[0];
                run(() => setImageAction("cover", uploaded.url!, release.id));
              }} />
            </label>
          ) : null}
        </section>
      ) : null}

      {tab === "Highlights" ? (
        <section className="grid gap-4">
          <p className="text-sm text-muted">These are artist-provided. PRESSKIT does not verify them.</p>
          {data.highlights.map((item) => (
            <div key={item.id} className="flex justify-between border border-line px-3 py-3"><span>{item.text}</span><button type="button" className="text-sm text-muted" onClick={() => run(() => deleteContentAction("highlights", item.id))}>Delete</button></div>
          ))}
          <form className="grid gap-3" onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            run(() => saveHighlightAction({ text: new FormData(form).get("text") }), form);
          }}>
            <input name="text" required placeholder="500K+ streams" className="border border-line bg-transparent px-3 py-3" />
            <button className="justify-self-start bg-accent px-4 py-2 text-sm text-black">Add highlight</button>
          </form>
        </section>
      ) : null}

      {tab === "Links" ? (
        <section className="grid gap-6">
          <div>
            <h3 className="text-sm">Social</h3>
            {data.socials.map((item) => (
              <div key={item.id} className="mt-2 flex justify-between border border-line px-3 py-3"><span className="capitalize">{item.platform}</span><button type="button" className="text-sm text-muted" onClick={() => run(() => deleteContentAction("socials", item.id))}>Delete</button></div>
            ))}
            <form className="mt-3 grid gap-3" onSubmit={(event) => {
              event.preventDefault();
              const form = event.currentTarget;
              const body = new FormData(form);
              run(() => saveSocialAction({ platform: body.get("platform"), url: body.get("url") }), form);
            }}>
              <select name="platform" className="border border-line bg-black px-3 py-3">
                {["instagram", "tiktok", "youtube", "x", "facebook", "threads", "spotify", "website"].map((platform) => <option key={platform} value={platform}>{platform}</option>)}
              </select>
              <input name="url" required placeholder="https://" className="border border-line bg-transparent px-3 py-3" />
              <button className="justify-self-start border border-white px-4 py-2 text-sm">Add social</button>
            </form>
          </div>
          <div>
            <h3 className="text-sm">Link hub</h3>
            {data.links.map((item) => (
              <div key={item.id} className="mt-2 flex justify-between border border-line px-3 py-3"><span>{item.label}</span><button type="button" className="text-sm text-muted" onClick={() => run(() => deleteContentAction("links", item.id))}>Delete</button></div>
            ))}
            <form className="mt-3 grid gap-3" onSubmit={(event) => {
              event.preventDefault();
              const form = event.currentTarget;
              const body = new FormData(form);
              run(() => saveLinkAction({ label: body.get("label"), url: body.get("url"), is_primary: true }), form);
            }}>
              <input name="label" required placeholder="Listen now" className="border border-line bg-transparent px-3 py-3" />
              <input name="url" required placeholder="https://" className="border border-line bg-transparent px-3 py-3" />
              <button className="justify-self-start bg-accent px-4 py-2 text-sm text-black">Add link</button>
            </form>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="border border-dashed border-line p-5">
      <p className="text-lg">{title}</p>
      <p className="mt-2 text-sm text-muted">{body}</p>
    </div>
  );
}
