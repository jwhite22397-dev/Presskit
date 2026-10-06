"use client";

import Link from "next/link";
import { useActionState } from "react";
import { forgotPasswordAction, loginAction, resetPasswordAction, signupAction, type ActionState } from "@/app/actions";

const initial: ActionState = { ok: false };

function Field({ label, name, type = "text", autoComplete }: { label: string; name: string; type?: string; autoComplete?: string }) {
  return (
    <label className="block text-sm">
      <span className="text-muted">{label}</span>
      <input name={name} type={type} autoComplete={autoComplete} required className="mt-2 w-full border border-line bg-transparent px-3 py-3 text-base" />
    </label>
  );
}

export function SignupForm({ referral }: { referral?: string | null }) {
  const [state, action, pending] = useActionState(signupAction, initial);
  return (
    <form action={action} className="grid gap-4">
      {referral ? <input type="hidden" name="ref" value={referral} /> : null}
      <Field label="Artist name" name="name" autoComplete="nickname" />
      <Field label="Email" name="email" type="email" autoComplete="email" />
      <Field label="Password" name="password" type="password" autoComplete="new-password" />
      {state.error ? <p className="text-sm text-red-300">{state.error}</p> : null}
      {state.needsConfirmation ? <p className="text-sm text-accent">{state.message}</p> : null}
      <button disabled={pending} className="bg-accent px-4 py-3 text-sm font-medium text-black disabled:opacity-60">{pending ? "Creating…" : "Create account"}</button>
    </form>
  );
}

export function LoginForm({ next, showDemo = false }: { next?: string; showDemo?: boolean }) {
  const [state, action, pending] = useActionState(loginAction, initial);
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="next" value={next || "/dashboard"} />
      <Field label="Email" name="email" type="email" autoComplete="email" />
      <Field label="Password" name="password" type="password" autoComplete="current-password" />
      {state.error ? <p className="text-sm text-red-300">{state.error}</p> : null}
      <button disabled={pending} className="bg-accent px-4 py-3 text-sm font-medium text-black disabled:opacity-60">{pending ? "Signing in…" : "Log in"}</button>
      <Link href="/forgot-password" className="text-sm text-muted underline">Forgot password</Link>
      {showDemo ? <p className="text-xs text-muted">Demo artist: demo@presskit.app / demo1234</p> : null}
    </form>
  );
}

export function ForgotForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, initial);
  return (
    <form action={action} className="grid gap-4">
      <Field label="Email" name="email" type="email" autoComplete="email" />
      {state.error ? <p className="text-sm text-red-300">{state.error}</p> : null}
      {state.message ? <p className="text-sm">{state.message}</p> : null}
      {state.resetPath ? <Link href={state.resetPath} className="text-sm text-accent underline">Reset password</Link> : null}
      <button disabled={pending} className="bg-accent px-4 py-3 text-sm font-medium text-black">{pending ? "Sending…" : "Send reset link"}</button>
    </form>
  );
}

export function ResetForm({ token }: { token?: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, initial);
  return (
    <form action={action} className="grid gap-4">
      {token ? <input type="hidden" name="token" value={token} /> : null}
      <Field label="New password" name="password" type="password" autoComplete="new-password" />
      {state.error ? <p className="text-sm text-red-300">{state.error}</p> : null}
      <button disabled={pending} className="bg-accent px-4 py-3 text-sm font-medium text-black">Update password</button>
    </form>
  );
}
