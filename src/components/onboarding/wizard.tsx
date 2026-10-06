"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { THEMES } from "@/config/themes";
import { canUsePremiumTheme } from "@/config/plans";
import type { ArtistData, Plan, ThemeName } from "@/types";
import {
  completeOnboardingAction,
  publishAction,
  saveAboutAction,
  saveContactAction,
  saveIdentityAction,
  saveReleaseAction,
  saveSocialAction,
  saveStyleAction,
  setImageAction,
  setSlugAction,
  uploadAction,
} from "@/app/actions";

const labels = ["Identity", "About", "Music", "Social", "Media", "Contact", "Style", "Publish"];

export function OnboardingWizard({ data, plan }: { data: ArtistData; plan: Plan }) {
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeName>(data.site.theme);
  const [pending, start] = useTransition();
  const router = useRouter();
  const site = data.site;

  function next(task?: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    start(async () => {
      if (task) {
        const result = await task();
        if (!result.ok) {
          setError(result.error ?? "Could not save.");
          return;
        }
      }
      setStep((value) => Math.min(value + 1, labels.length - 1));
      router.refresh();
    });
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.28em] text-muted">Step {step + 1} of {labels.length}</p>
      <div className="mt-3 h-1 bg-white/10"><div className="h-1 bg-accent" style={{ width: `${((step + 1) / labels.length) * 100}%` }} /></div>
      <h1 className="display mt-6 text-5xl">{labels[step]}</h1>
      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

      {step === 0 ? (
        <form className="mt-8 grid gap-3" onSubmit={(event) => {
          event.preventDefault();
          const body = new FormData(event.currentTarget);
          next(() => saveIdentityAction({
            artist_name: body.get("artist_name"),
            real_name: body.get("real_name"),
            city: body.get("city"),
            genre: body.get("genre"),
            tagline: body.get("tagline"),
          }));
        }}>
          <input name="artist_name" required defaultValue={site.artist_name === "New artist" ? "" : site.artist_name} placeholder="Artist name" className="border border-line bg-transparent px-3 py-3" />
          <input name="real_name" defaultValue={site.real_name ?? ""} placeholder="Real name, optional" className="border border-line bg-transparent px-3 py-3" />
          <input name="city" defaultValue={site.city ?? ""} placeholder="City" className="border border-line bg-transparent px-3 py-3" />
          <input name="genre" defaultValue={site.genre ?? ""} placeholder="Genre" className="border border-line bg-transparent px-3 py-3" />
          <input name="tagline" defaultValue={site.tagline ?? ""} placeholder="One-line tagline" className="border border-line bg-transparent px-3 py-3" />
          <button className="mt-2 bg-accent px-4 py-3 text-sm text-black" disabled={pending}>Continue</button>
        </form>
      ) : null}

      {step === 1 ? (
        <form className="mt-8 grid gap-3" onSubmit={(event) => {
          event.preventDefault();
          const body = new FormData(event.currentTarget);
          next(() => saveAboutAction({ short_bio: body.get("short_bio"), full_bio: body.get("full_bio") }));
        }}>
          <p className="text-sm text-muted">Short bio: who you are, where you are, and the record people should hear. Full bio can wait.</p>
          <textarea name="short_bio" defaultValue={site.short_bio ?? ""} rows={4} placeholder="Short bio" className="border border-line bg-transparent px-3 py-3" />
          <textarea name="full_bio" defaultValue={site.full_bio ?? ""} rows={6} placeholder="Full bio, optional" className="border border-line bg-transparent px-3 py-3" />
          <button className="bg-accent px-4 py-3 text-sm text-black" disabled={pending}>Continue</button>
        </form>
      ) : null}

      {step === 2 ? (
        <form className="mt-8 grid gap-3" onSubmit={(event) => {
          event.preventDefault();
          const body = new FormData(event.currentTarget);
          const title = String(body.get("title") ?? "").trim();
          if (!title) {
            next();
            return;
          }
          const links = ["spotify", "apple", "youtube", "soundcloud", "bandcamp"].flatMap((platform) => {
            const url = String(body.get(platform) ?? "").trim();
            return url ? [{ platform, url }] : [];
          });
          next(() => saveReleaseAction({ title, type: body.get("type") || "single", release_date: "", description: "", is_featured: true, links }));
        }}>
          <p className="text-sm text-muted">Add one release now. You can add the rest later.</p>
          <input name="title" placeholder="Release title" className="border border-line bg-transparent px-3 py-3" />
          <select name="type" className="border border-line bg-black px-3 py-3"><option value="single">Single</option><option value="ep">EP</option><option value="album">Album</option></select>
          <input name="spotify" placeholder="Spotify URL" className="border border-line bg-transparent px-3 py-3" />
          <input name="apple" placeholder="Apple Music URL" className="border border-line bg-transparent px-3 py-3" />
          <input name="youtube" placeholder="YouTube URL" className="border border-line bg-transparent px-3 py-3" />
          <div className="flex gap-3">
            <button type="button" className="border border-white px-4 py-3 text-sm" onClick={() => next()}>Skip</button>
            <button className="bg-accent px-4 py-3 text-sm text-black" disabled={pending}>Continue</button>
          </div>
        </form>
      ) : null}

      {step === 3 ? (
        <form className="mt-8 grid gap-3" onSubmit={(event) => {
          event.preventDefault();
          const body = new FormData(event.currentTarget);
          const entries = ["instagram", "tiktok", "youtube", "x"].flatMap((platform) => {
            const url = String(body.get(platform) ?? "").trim();
            return url ? [{ platform, url }] : [];
          });
          next(async () => {
            for (const entry of entries) {
              const result = await saveSocialAction(entry);
              if (!result.ok) return result;
            }
            return { ok: true };
          });
        }}>
          {["instagram", "tiktok", "youtube", "x"].map((platform) => (
            <input key={platform} name={platform} placeholder={`${platform} URL`} className="border border-line bg-transparent px-3 py-3" />
          ))}
          <button className="bg-accent px-4 py-3 text-sm text-black" disabled={pending}>Continue</button>
        </form>
      ) : null}

      {step === 4 ? (
        <div className="mt-8 grid gap-4">
          <p className="text-sm text-muted">A face and a wider image. JPG, PNG, or WebP. 5MB max.</p>
          <label className="text-sm">Profile<input type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block" onChange={(event) => void uploadKind("profile", event.target.files?.[0])} /></label>
          <label className="text-sm">Hero<input type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block" onChange={(event) => void uploadKind("hero", event.target.files?.[0])} /></label>
          <button type="button" className="justify-self-start bg-accent px-4 py-3 text-sm text-black" onClick={() => next()}>Continue</button>
        </div>
      ) : null}

      {step === 5 ? (
        <form className="mt-8 grid gap-3" onSubmit={(event) => {
          event.preventDefault();
          const body = new FormData(event.currentTarget);
          next(() => saveContactAction({
            booking_email: body.get("booking_email"),
            management_email: body.get("management_email"),
            press_email: body.get("press_email"),
          }));
        }}>
          <p className="text-sm text-muted">Promoters need a booking address. Your account email is not shown.</p>
          <input name="booking_email" defaultValue={site.booking_email ?? ""} placeholder="Booking email" className="border border-line bg-transparent px-3 py-3" />
          <input name="management_email" placeholder="Management email, optional" className="border border-line bg-transparent px-3 py-3" />
          <input name="press_email" placeholder="Press email, optional" className="border border-line bg-transparent px-3 py-3" />
          <button className="bg-accent px-4 py-3 text-sm text-black">Continue</button>
        </form>
      ) : null}

      {step === 6 ? (
        <div className="mt-8 grid gap-3">
          {Object.values(THEMES).map((item) => (
            <button key={item.id} type="button" onClick={() => setTheme(item.id)} className={`border p-4 text-left ${theme === item.id ? "border-accent" : "border-line"}`}>
              <span className="text-xl">{item.name}</span>
              {!canUsePremiumTheme(plan, item.id) ? <span className="ml-2 text-xs text-accent">PRO</span> : null}
              <p className="mt-1 text-sm text-muted">{item.description}</p>
            </button>
          ))}
          <button type="button" className="bg-accent px-4 py-3 text-sm text-black" disabled={pending} onClick={() => next(() => saveStyleAction({ theme, accent_color: "theme", font_pairing: theme === "editorial" ? "editorial" : "modern", hidden_sections: [] }))}>Continue</button>
        </div>
      ) : null}

      {step === 7 ? (
        <form className="mt-8 grid gap-3" onSubmit={(event) => {
          event.preventDefault();
          const slug = String(new FormData(event.currentTarget).get("slug") ?? "");
          start(async () => {
            const saved = await setSlugAction(slug);
            if (!saved.ok) {
              setError(saved.error ?? "Choose another address.");
              return;
            }
            const published = await publishAction(true);
            if (!published.ok) {
              setError(published.error ?? "Could not publish.");
              return;
            }
            await completeOnboardingAction();
          });
        }}>
          <p className="text-sm text-muted">This is the link that goes in your bio.</p>
          <input name="slug" required placeholder="yourname" className="border border-line bg-transparent px-3 py-3" />
          <a href="/dashboard/preview" className="text-sm underline">Preview before publishing</a>
          <button className="bg-accent px-4 py-3 text-sm text-black" disabled={pending}>{pending ? "Publishing…" : "Publish"}</button>
        </form>
      ) : null}
    </div>
  );

  async function uploadKind(kind: "profile" | "hero", file?: File) {
    if (!file) return;
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
}
