"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { artistPath, artistUrl } from "@/lib/utils";
import { normalizeSlug } from "@/lib/slug";
import { CopyButton, ShareLinkButton } from "@/components/artist/widgets";
import {
  checkSlugAction,
  publishAction,
  saveAboutAction,
  saveIdentityAction,
  saveListeningLinksAction,
  saveSocialsAction,
  setPortraitAction,
  setSlugAction,
  uploadAction,
} from "@/app/actions";

const steps = ["name", "url", "photo", "music", "social", "bio"] as const;

const musicPlatforms = [
  ["spotify", "Spotify"],
  ["apple", "Apple Music"],
  ["youtube", "YouTube"],
  ["soundcloud", "SoundCloud"],
  ["bandcamp", "Bandcamp"],
] as const;

const socialPlatforms = [
  ["instagram", "Instagram"],
  ["tiktok", "TikTok"],
  ["youtube", "YouTube"],
  ["x", "X"],
  ["facebook", "Facebook"],
  ["threads", "Threads"],
] as const;

export function OnboardingWizard({ artistName, slug }: { artistName: string; slug: string }) {
  const router = useRouter();
  const named = Boolean(artistName.trim()) && artistName !== "New artist";
  const [step, setStep] = useState(named ? 1 : 0);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [name, setName] = useState(named ? artistName : "");
  const [address, setAddress] = useState(slug.startsWith("draft-") ? (named ? normalizeSlug(artistName) : "") : slug);
  const [availability, setAvailability] = useState<"available" | "yours" | "taken" | "invalid" | "checking" | null>(null);
  const suggested = normalizeSlug(name);
  const lookupTimer = useRef<number | null>(null);

  function queueCheck(value: string) {
    if (lookupTimer.current) window.clearTimeout(lookupTimer.current);
    if (value.trim().length < 3) {
      setAvailability(null);
      return;
    }
    setAvailability("checking");
    lookupTimer.current = window.setTimeout(() => {
      void checkSlugAction(value).then((result) => {
        setAvailability(result.status ?? "invalid");
        setError(result.status === "invalid" ? result.error ?? "That address will not work." : null);
      });
    }, 250);
  }

  function go(nextStep: number) {
    setError(null);
    setStep(nextStep);
  }

  function run(task: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) {
    setError(null);
    start(async () => {
      const result = await task();
      if (!result.ok) {
        setError(result.error ?? "Could not save.");
        return;
      }
      after?.();
    });
  }

  const current = steps[step];

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.28em] text-muted">Step {named ? step : step + 1} of {named ? steps.length - 1 : steps.length}</p>
      <div className="mt-3 h-1 bg-white/10" aria-hidden>
        <div className="h-1 bg-accent" style={{ width: `${((named ? step : step + 1) / (named ? steps.length - 1 : steps.length)) * 100}%` }} />
      </div>
      {error ? <p className="mt-4 text-sm text-red-300" role="alert">{error}</p> : null}

      {current === "name" ? (
        <form className="mt-8 grid gap-4" onSubmit={(event) => {
          event.preventDefault();
          const value = name.trim();
          run(() => saveIdentityAction({ artist_name: value, real_name: "", city: "", genre: "", tagline: "" }), () => {
            const next = address || normalizeSlug(value);
            if (!address) setAddress(next);
            queueCheck(next);
            go(1);
          });
        }}>
          <h1 className="display text-5xl leading-none">What&apos;s your artist name?</h1>
          <label className="mt-4 text-sm text-muted">
            Artist name
            <input name="artist_name" required value={name} onChange={(event) => setName(event.target.value)} autoComplete="nickname" className="mt-2 w-full border border-line bg-transparent px-3 py-4 text-lg text-foreground" />
          </label>
          <button className="bg-accent px-4 py-4 text-sm font-medium text-black" disabled={pending}>Continue</button>
        </form>
      ) : null}

      {current === "url" ? (
        <form className="mt-8 grid gap-4" onSubmit={(event) => {
          event.preventDefault();
          const value = (address || suggested).trim();
          run(() => setSlugAction(value), () => go(2));
        }}>
          <h1 className="display text-5xl leading-none">Claim your link.</h1>
          <p className="text-muted">This is the address that goes in your bio.</p>
          <label className="text-sm text-muted">
            presskit.app/
            <input
              value={address}
              autoFocus
              onFocus={() => {
                if (availability === null) queueCheck(address || suggested);
              }}
              onChange={(event) => {
                const next = event.target.value.toLowerCase();
                setAddress(next);
                queueCheck(next || suggested);
              }}
              placeholder={suggested || "artistname"}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="mt-2 w-full border border-line bg-transparent px-3 py-4 text-lg text-foreground"
            />
          </label>
          <p className="text-sm" aria-live="polite">
            {availability === "checking" ? "Checking…" : null}
            {availability === "available" || availability === "yours" ? "Available." : null}
            {availability === "taken" ? "That address is taken." : null}
          </p>
          <button className="bg-accent px-4 py-4 text-sm font-medium text-black" disabled={pending || availability === "taken" || availability === "invalid" || availability === "checking"}>
            Claim this link
          </button>
        </form>
      ) : null}

      {current === "photo" ? (
        <div className="mt-8 grid gap-4">
          <h1 className="display text-5xl leading-none">Show us who you are.</h1>
          <p className="text-muted">One photo becomes your profile and the top of the page. You can change it later.</p>
          <label className="block border border-line px-4 py-8 text-center text-sm">
            Upload a photo
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="mt-3 block w-full text-sm"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                const body = new FormData();
                body.set("file", file);
                run(async () => {
                  const uploaded = await uploadAction(body);
                  if (!uploaded.ok || !uploaded.url) return uploaded;
                  return setPortraitAction(uploaded.url);
                }, () => go(3));
              }}
            />
          </label>
          <button type="button" className="py-3 text-sm text-muted underline" onClick={() => go(3)}>Skip for now</button>
        </div>
      ) : null}

      {current === "music" ? (
        <form className="mt-8 grid gap-3" onSubmit={(event) => {
          event.preventDefault();
          const body = new FormData(event.currentTarget);
          const links = musicPlatforms.flatMap(([platform]) => {
            const url = String(body.get(platform) ?? "").trim();
            return url ? [{ platform, url }] : [];
          });
          if (!links.length) {
            go(4);
            return;
          }
          run(() => saveListeningLinksAction(links), () => go(4));
        }}>
          <h1 className="display text-5xl leading-none">Where can people listen?</h1>
          <p className="text-muted">Paste the links you already have. No streaming login.</p>
          {musicPlatforms.map(([platform, label]) => (
            <label key={platform} className="text-sm text-muted">
              {label}
              <input name={platform} inputMode="url" placeholder="https://" className="mt-2 w-full border border-line bg-transparent px-3 py-4 text-base text-foreground" />
            </label>
          ))}
          <button className="mt-2 bg-accent px-4 py-4 text-sm font-medium text-black" disabled={pending}>Save music</button>
          <button type="button" className="py-3 text-sm text-muted underline" onClick={() => go(4)}>Skip for now</button>
        </form>
      ) : null}

      {current === "social" ? (
        <form className="mt-8 grid gap-3" onSubmit={(event) => {
          event.preventDefault();
          const body = new FormData(event.currentTarget);
          const links = socialPlatforms.flatMap(([platform]) => {
            const url = String(body.get(platform) ?? "").trim();
            return url ? [{ platform, url }] : [];
          });
          if (!links.length) {
            go(5);
            return;
          }
          run(() => saveSocialsAction(links), () => go(5));
        }}>
          <h1 className="display text-5xl leading-none">Where can people follow you?</h1>
          {socialPlatforms.map(([platform, label]) => (
            <label key={platform} className="text-sm text-muted">
              {label}
              <input name={platform} inputMode="url" placeholder="https://" className="mt-2 w-full border border-line bg-transparent px-3 py-4 text-base text-foreground" />
            </label>
          ))}
          <button className="mt-2 bg-accent px-4 py-4 text-sm font-medium text-black" disabled={pending}>Save socials</button>
          <button type="button" className="py-3 text-sm text-muted underline" onClick={() => go(5)}>Skip for now</button>
        </form>
      ) : null}

      {current === "bio" ? (
        <form className="mt-8 grid gap-4" onSubmit={(event) => {
          event.preventDefault();
          const short_bio = String(new FormData(event.currentTarget).get("short_bio") ?? "");
          run(async () => {
            if (short_bio.trim()) {
              const saved = await saveAboutAction({ short_bio, full_bio: "" });
              if (!saved.ok) return saved;
            }
            return publishAction(true);
          }, () => router.push("/onboarding?live=1"));
        }}>
          <h1 className="display text-5xl leading-none">Tell people who you are.</h1>
          <p className="text-muted">Optional. You can publish without it.</p>
          <label className="text-sm text-muted">
            Short bio
            <textarea name="short_bio" rows={4} maxLength={400} className="mt-2 w-full border border-line bg-transparent px-3 py-4 text-base text-foreground" />
          </label>
          <button className="bg-accent px-4 py-4 text-sm font-medium text-black" disabled={pending}>{pending ? "Publishing…" : "Publish my page"}</button>
          <button type="button" className="py-3 text-sm text-muted underline" disabled={pending} onClick={() => run(() => publishAction(true), () => router.push("/onboarding?live=1"))}>
            Skip and publish
          </button>
        </form>
      ) : null}
    </div>
  );
}

export function YoureLive({ name, slug }: { name: string; slug: string }) {
  const url = artistUrl(slug);
  const display = url.replace(/^https?:\/\//, "");
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.28em] text-accent">Published</p>
      <h1 className="display mt-4 text-6xl leading-none">You&apos;re live.</h1>
      <p className="mt-6 break-all text-lg">{display}</p>
      <div className="mt-8 grid gap-3">
        <Link href={artistPath(slug)} className="bg-accent px-4 py-4 text-center text-sm font-medium text-black">View my page</Link>
        <CopyButton value={url} product="artist_copied_link" className="border border-white px-4 py-4 text-sm">Copy link</CopyButton>
        <ShareLinkButton url={url} title={name} className="border border-line px-4 py-4 text-sm">Share</ShareLinkButton>
        <Link href={`/a/${slug}/epk`} className="border border-line px-4 py-4 text-center text-sm">View my EPK</Link>
        <Link href="/dashboard" className="py-3 text-center text-sm text-muted underline">Keep going</Link>
      </div>
    </div>
  );
}
