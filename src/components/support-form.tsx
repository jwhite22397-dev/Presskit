"use client";

import { useActionState } from "react";
import { supportAction, type ActionState } from "@/app/actions";

const initial: ActionState = { ok: false };

export function SupportForm({ topicDefault = "General" }: { topicDefault?: string }) {
  const [state, action, pending] = useActionState(supportAction, initial);
  return (
    <form action={action} className="mt-8 grid gap-3">
      <input name="name" required placeholder="Name" className="border border-line bg-transparent px-3 py-3" />
      <input name="email" type="email" required placeholder="Email" className="border border-line bg-transparent px-3 py-3" />
      <input name="topic" defaultValue={topicDefault} className="border border-line bg-transparent px-3 py-3" />
      <textarea name="message" required minLength={10} rows={5} placeholder="How can we help?" className="border border-line bg-transparent px-3 py-3" />
      {state.error ? <p className="text-sm text-red-300">{state.error}</p> : null}
      {state.ok && state.message ? <p className="text-sm text-accent">{state.message}</p> : null}
      <button disabled={pending} className="justify-self-start bg-accent px-4 py-3 text-sm text-black">Send</button>
    </form>
  );
}
