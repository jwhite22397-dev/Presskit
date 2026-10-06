"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ACCENT_COLORS, FONT_PAIRINGS, THEMES } from "@/config/themes";
import { canUsePremiumTheme } from "@/config/plans";
import type { ArtistData, Plan } from "@/types";
import { publishAction, saveAboutAction, saveContactAction, saveIdentityAction, saveSeoAction, saveStyleAction, setImageAction, setSlugAction, uploadAction } from "@/app/actions";

export function SiteEditor({ data, plan }: { data: ArtistData; plan: Plan }) {
  const site = data.site;
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [slug, setSlug] = useState(site.slug.startsWith("draft-") ? "" : site.slug);
  const [hidden, setHidden] = useState<string[]>(site.hidden_sections);
  const [theme, setTheme] = useState(site.theme);
  const [accent, setAccent] = useState(site.accent_color);
  const [font, setFont] = useState(site.font_pairing);

  function run(task: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    start(async () => {
      const result = await task();
      if (!result.ok) setError(result.error ?? "Could not save.");
      else router.refresh();
    });
  }

  async function onUpload(kind: "profile" | "hero", file: File) {
    const body = new FormData();
    body.set("file", file);
    const uploaded = await uploadAction(body);
    if (!uploaded.ok || !uploaded.url) {
      setError(uploaded.error ?? "Upload failed.");
      return;
    }
    const saved = await setImageAction(kind, uploaded.url);
    if (!saved.ok) setError(saved.error ?? "Could not save image.");
    else router.refresh();
  }

  return (
    <div className="grid gap-10">
      {error ? <p className="border border-red-400/40 px-3 py-2 text-sm text-red-200">{error}</p> : null}
      <form className="grid gap-3" onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        run(() => saveIdentityAction({
          artist_name: form.get("artist_name"),
          real_name: form.get("real_name"),
          city: form.get("city"),
          genre: form.get("genre"),
          tagline: form.get("tagline"),
        }));
      }}>
        <h2 className="text-xs uppercase tracking-[0.22em] text-muted">Identity</h2>
        <input name="artist_name" defaultValue={site.artist_name} className="border border-line bg-transparent px-3 py-3" placeholder="Artist name" />
        <input name="real_name" defaultValue={site.real_name ?? ""} className="border border-line bg-transparent px-3 py-3" placeholder="Real name, optional" />
        <div className="grid gap-3 md:grid-cols-2">
          <input name="city" defaultValue={site.city ?? ""} className="border border-line bg-transparent px-3 py-3" placeholder="City" />
          <input name="genre" defaultValue={site.genre ?? ""} className="border border-line bg-transparent px-3 py-3" placeholder="Genre" />
        </div>
        <input name="tagline" defaultValue={site.tagline ?? ""} className="border border-line bg-transparent px-3 py-3" placeholder="Short tagline" />
        <button className="justify-self-start border border-white px-4 py-2 text-sm" disabled={pending}>Save identity</button>
      </form>

      <form className="grid gap-3" onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        run(() => saveAboutAction({ short_bio: form.get("short_bio"), full_bio: form.get("full_bio") }));
      }}>
        <h2 className="text-xs uppercase tracking-[0.22em] text-muted">Biography</h2>
        <textarea name="short_bio" defaultValue={site.short_bio ?? ""} rows={3} className="border border-line bg-transparent px-3 py-3" placeholder="Short bio" />
        <textarea name="full_bio" defaultValue={site.full_bio ?? ""} rows={8} className="border border-line bg-transparent px-3 py-3" placeholder="Full bio" />
        <button className="justify-self-start border border-white px-4 py-2 text-sm" disabled={pending}>Save bio</button>
      </form>

      <form className="grid gap-3" onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        run(() => saveContactAction({
          booking_email: form.get("booking_email"),
          management_email: form.get("management_email"),
          press_email: form.get("press_email"),
        }));
      }}>
        <h2 className="text-xs uppercase tracking-[0.22em] text-muted">Contact</h2>
        <p className="text-sm text-muted">These are public. Your login email stays private.</p>
        <input name="booking_email" defaultValue={site.booking_email ?? ""} className="border border-line bg-transparent px-3 py-3" placeholder="Booking email" />
        <input name="management_email" defaultValue={site.management_email ?? ""} className="border border-line bg-transparent px-3 py-3" placeholder="Management email" />
        <input name="press_email" defaultValue={site.press_email ?? ""} className="border border-line bg-transparent px-3 py-3" placeholder="Press email" />
        <button className="justify-self-start border border-white px-4 py-2 text-sm" disabled={pending}>Save contact</button>
      </form>

      <section className="grid gap-3">
        <h2 className="text-xs uppercase tracking-[0.22em] text-muted">Photos</h2>
        <label className="text-sm">Profile photo<input type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full" onChange={(event) => { const file = event.target.files?.[0]; if (file) void onUpload("profile", file); }} /></label>
        <label className="text-sm">Hero image<input type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full" onChange={(event) => { const file = event.target.files?.[0]; if (file) void onUpload("hero", file); }} /></label>
      </section>

      <section className="grid gap-4">
        <h2 className="text-xs uppercase tracking-[0.22em] text-muted">Choose your vibe</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {Object.values(THEMES).map((item) => {
            const locked = !canUsePremiumTheme(plan, item.id);
            return (
              <button key={item.id} type="button" onClick={() => setTheme(item.id)} className={`border p-4 text-left ${theme === item.id ? "border-accent" : "border-line"}`}>
                <span className="text-lg">{item.vibe}</span>
                {item.isPremium ? <span className="ml-2 text-xs uppercase tracking-[0.16em] text-accent">Pro</span> : null}
                <p className="mt-2 text-sm text-muted">{locked ? "Bold is part of Pro." : item.name}</p>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2">
          {ACCENT_COLORS.map((color) => (
            <button key={color.id} type="button" onClick={() => setAccent(color.value)} className={`h-9 w-9 border ${accent === color.value ? "border-white" : "border-transparent"}`} style={{ background: color.value === "theme" ? "#e4ff4a" : color.value }} aria-label={color.label} />
          ))}
        </div>
        <details className="text-sm">
          <summary className="cursor-pointer text-muted">More options</summary>
          <label className="mt-3 block">Font pairing
            <select value={font} onChange={(event) => setFont(event.target.value)} className="mt-2 w-full border border-line bg-black px-3 py-3">
              {FONT_PAIRINGS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
          <fieldset className="mt-3 grid gap-2">
            <legend className="text-xs uppercase tracking-[0.18em] text-muted">Hide empty-looking sections</legend>
            {["music", "videos", "about", "shows", "press", "gallery", "highlights", "contact"].map((section) => (
              <label key={section} className="flex items-center gap-2 capitalize">
                <input type="checkbox" checked={hidden.includes(section)} onChange={(event) => setHidden((current) => event.target.checked ? [...current, section] : current.filter((item) => item !== section))} />
                {section}
              </label>
            ))}
          </fieldset>
        </details>
        <button type="button" className="justify-self-start bg-accent px-4 py-2 text-sm text-black" disabled={pending} onClick={() => run(() => saveStyleAction({ theme, accent_color: accent, font_pairing: font, hidden_sections: hidden }))}>Save style</button>
      </section>

      <section className="grid gap-3">
        <h2 className="text-xs uppercase tracking-[0.22em] text-muted">Public address</h2>
        <p className="text-sm text-muted">presskit.app/a/{slug || "your-name"}</p>
        <input value={slug} onChange={(event) => setSlug(event.target.value)} className="border border-line bg-transparent px-3 py-3" placeholder="jaylensaint" />
        <button type="button" className="justify-self-start border border-white px-4 py-2 text-sm" onClick={() => run(() => setSlugAction(slug))}>Check and save address</button>
      </section>

      <form className="grid gap-3" onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        run(() => saveSeoAction({ meta_title: form.get("meta_title"), meta_description: form.get("meta_description") }));
      }}>
        <h2 className="text-xs uppercase tracking-[0.22em] text-muted">Search and social preview</h2>
        <input name="meta_title" defaultValue={site.meta_title ?? ""} className="border border-line bg-transparent px-3 py-3" placeholder="Page title" />
        <textarea name="meta_description" defaultValue={site.meta_description ?? ""} rows={3} className="border border-line bg-transparent px-3 py-3" placeholder="Short description" />
        <button className="justify-self-start border border-white px-4 py-2 text-sm">Save SEO</button>
      </form>

      <section className="flex flex-wrap gap-3">
        <button type="button" className="bg-white px-4 py-3 text-sm text-black" disabled={pending} onClick={() => run(() => publishAction(true))}>Publish</button>
        <button type="button" className="border border-white px-4 py-3 text-sm" disabled={pending} onClick={() => run(() => publishAction(false))}>Unpublish</button>
        <a href="/dashboard/preview" className="border border-white px-4 py-3 text-sm">Preview</a>
      </section>
    </div>
  );
}
