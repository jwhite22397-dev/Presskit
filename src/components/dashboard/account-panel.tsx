"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import type { Plan } from "@/types";
import { PLANS, formatPrice } from "@/config/plans";
import { artistUrl } from "@/lib/utils";
import { changePasswordAction, checkoutAction, deleteAccountAction, domainAction, portalAction, simulatePlanAction, updateAccountAction } from "@/app/actions";

export function AccountPanel({
  name,
  email,
  plan,
  slug,
  published,
  simulate,
}: {
  name: string;
  email: string;
  plan: Plan;
  slug: string;
  published: boolean;
  simulate: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const url = published && !slug.startsWith("draft-") ? artistUrl(slug) : "";

  function run(task: () => Promise<{ ok: boolean; error?: string; message?: string; url?: string }>) {
    setError(null);
    setMessage(null);
    start(async () => {
      const result = await task();
      if (!result.ok) setError(result.error ?? "Something went wrong.");
      else {
        if (result.url) window.location.href = result.url;
        if (result.message) setMessage(result.message);
        router.refresh();
      }
    });
  }

  return (
    <div className="grid max-w-xl gap-10">
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {message ? <p className="text-sm text-accent">{message}</p> : null}
      <form className="grid gap-3" onSubmit={(event) => { event.preventDefault(); run(() => updateAccountAction(String(new FormData(event.currentTarget).get("name")))); }}>
        <h2 className="text-xs uppercase tracking-[0.2em] text-muted">Profile</h2>
        <input name="name" defaultValue={name} className="border border-line bg-transparent px-3 py-3" />
        <p className="text-sm text-muted">{email}</p>
        <button className="justify-self-start border border-white px-4 py-2 text-sm" disabled={pending}>Save name</button>
      </form>

      <form className="grid gap-3" onSubmit={(event) => { event.preventDefault(); run(() => changePasswordAction(String(new FormData(event.currentTarget).get("password")))); }}>
        <h2 className="text-xs uppercase tracking-[0.2em] text-muted">Password</h2>
        <input name="password" type="password" minLength={8} required className="border border-line bg-transparent px-3 py-3" placeholder="New password" />
        <button className="justify-self-start border border-white px-4 py-2 text-sm">Update password</button>
      </form>

      <section>
        <h2 className="text-xs uppercase tracking-[0.2em] text-muted">Plan · {PLANS[plan].name}</h2>
        <div className="mt-4 grid gap-3">
          <button type="button" className="border border-line px-4 py-3 text-left" onClick={() => run(() => checkoutAction("monthly"))}>Pro monthly · {formatPrice(PLANS.pro.price.monthly ?? 0)}</button>
          <button type="button" className="border border-line px-4 py-3 text-left" onClick={() => run(() => checkoutAction("yearly"))}>Pro yearly · {formatPrice(PLANS.pro.price.yearly ?? 0)}</button>
          <button type="button" className="border border-accent px-4 py-3 text-left" onClick={() => run(() => checkoutAction("lifetime"))}>Founding artist · {formatPrice(PLANS.lifetime.price.lifetime ?? 0)} once</button>
          <button type="button" className="text-left text-sm underline" onClick={() => run(() => portalAction())}>Manage billing</button>
        </div>
        <p className="mt-3 text-xs text-muted">Take your EPK anywhere with Pro: PDF export, analytics, premium templates, and branding removal.</p>
      </section>

      {simulate ? (
        <section className="border border-dashed border-line p-4">
          <h2 className="text-sm">Development billing</h2>
          <p className="mt-2 text-xs text-muted">Local demo only. This switch is hidden in production.</p>
          <div className="mt-3 flex gap-2">
            {(["free", "pro", "lifetime"] as Plan[]).map((item) => (
              <button key={item} type="button" className="border border-line px-3 py-2 text-sm" onClick={() => run(() => simulatePlanAction(item))}>{item}</button>
            ))}
          </div>
        </section>
      ) : null}

      <form className="grid gap-3" onSubmit={(event) => { event.preventDefault(); run(() => domainAction(String(new FormData(event.currentTarget).get("hostname")))); }}>
        <h2 className="text-xs uppercase tracking-[0.2em] text-muted">Custom domain</h2>
        <input name="hostname" placeholder="music.yourname.com" className="border border-line bg-transparent px-3 py-3" />
        <button className="justify-self-start border border-white px-4 py-2 text-sm">Request domain</button>
        <p className="text-xs text-muted">Pro only. Automated DNS provisioning is not turned on yet. We save the request and connect it with you.</p>
      </form>

      {url ? (
        <section>
          <h2 className="text-xs uppercase tracking-[0.2em] text-muted">Share</h2>
          <div className="mt-3 inline-block bg-white p-3"><QRCodeSVG value={url} size={128} /></div>
          <p className="mt-2 text-sm">{url}</p>
          <a className="mt-3 inline-block text-sm underline" href="/api/export">Download your data (JSON)</a>
        </section>
      ) : null}

      <form className="grid gap-3 border border-red-400/30 p-4" onSubmit={(event) => {
        event.preventDefault();
        const confirmation = String(new FormData(event.currentTarget).get("confirmation"));
        run(() => deleteAccountAction(confirmation));
      }}>
        <h2 className="text-sm">Delete account</h2>
        <p className="text-xs text-muted">Type DELETE. This removes the account, site content, and uploaded files we control.</p>
        <input name="confirmation" className="border border-line bg-transparent px-3 py-3" placeholder="DELETE" />
        <button className="justify-self-start text-sm text-red-300">Delete account</button>
      </form>
    </div>
  );
}
