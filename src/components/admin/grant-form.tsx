"use client";

import { useState, useTransition } from "react";
import type { Plan } from "@/types";
import { grantPlanAction } from "@/app/actions";

export function GrantForm({ userId }: { userId: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();
  function grant(plan: Plan) {
    start(async () => {
      const result = await grantPlanAction(userId, plan);
      setMessage(result.ok ? plan : result.error ?? "Failed");
    });
  }
  return (
    <div className="flex gap-2">
      <button type="button" disabled={pending} className="text-xs underline" onClick={() => grant("pro")}>Pro</button>
      <button type="button" disabled={pending} className="text-xs underline" onClick={() => grant("lifetime")}>Lifetime</button>
      <button type="button" disabled={pending} className="text-xs underline" onClick={() => grant("free")}>Free</button>
      {message ? <span className="text-xs text-muted">{message}</span> : null}
    </div>
  );
}
