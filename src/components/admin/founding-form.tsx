"use client";

import { useState, useTransition } from "react";
import { createFoundingCodeAction } from "@/app/actions";

export function FoundingCodeForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      className="grid gap-3 border border-line p-4"
      onSubmit={(event) => {
        event.preventDefault();
        const body = new FormData(event.currentTarget);
        start(async () => {
          const result = await createFoundingCodeAction({
            code: String(body.get("code") ?? ""),
            entitlement: body.get("entitlement") === "pro" ? "pro" : "lifetime",
            maxRedemptions: Number(body.get("max") ?? 1),
            expiresAt: String(body.get("expires") ?? ""),
          });
          setMessage(result.ok ? `Issued ${result.message}` : result.error ?? "Could not create the code.");
        });
      }}
    >
      <h2 className="text-sm uppercase tracking-[0.18em]">Issue a founding code</h2>
      <input name="code" placeholder="FOUNDING-AB12, or leave blank" className="border border-line bg-transparent px-3 py-3" />
      <select name="entitlement" className="border border-line bg-black px-3 py-3">
        <option value="lifetime">Lifetime Pro</option>
        <option value="pro">Pro</option>
      </select>
      <input name="max" type="number" min={1} max={500} defaultValue={1} className="border border-line bg-transparent px-3 py-3" />
      <input name="expires" type="date" className="border border-line bg-transparent px-3 py-3" />
      <button className="justify-self-start bg-accent px-4 py-3 text-sm text-black" disabled={pending}>{pending ? "Saving…" : "Create code"}</button>
      {message ? <p className="text-sm">{message}</p> : null}
    </form>
  );
}
