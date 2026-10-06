import { cookies } from "next/headers";
import { isDemoMode } from "@/lib/env";
import { isAdminUser, sessionSecret } from "@/lib/server-env";
import { DEMO_COOKIE, signUserId, verifySignedUserId } from "@/lib/session";
import type { Plan } from "@/types";
import { readState, updateState, type DemoUser } from "@/server/demo-store";
import { hashPassword, verifyPassword } from "@/server/passwords";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase/server";
import { appUrl } from "@/lib/utils";

export interface SessionUser {
  id: string;
  email: string;
  displayName: string | null;
  plan: Plan;
  planSource: DemoUser["plan_source"];
  subscriptionStatus: string | null;
  isAdmin: boolean;
}

function toSession(user: DemoUser): SessionUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    plan: user.plan,
    planSource: user.plan_source,
    subscriptionStatus: user.subscription_status,
    isAdmin: isAdminUser(user.id),
  };
}

export async function setDemoCookie(userId: string) {
  const token = await signUserId(userId, sessionSecret());
  const store = await cookies();
  store.set(DEMO_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearDemoCookie() {
  const store = await cookies();
  store.delete(DEMO_COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  if (isDemoMode()) {
    const store = await cookies();
    const userId = await verifySignedUserId(store.get(DEMO_COOKIE)?.value, sessionSecret());
    if (!userId) return null;
    const state = await readState();
    const user = state.users.find((item) => item.id === userId);
    return user ? toSession(user) : null;
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, plan, plan_source, subscription_status")
    .eq("id", data.user.id)
    .maybeSingle();
  return {
    id: data.user.id,
    email: data.user.email ?? "",
    displayName: profile?.display_name ?? null,
    plan: (profile?.plan as Plan) ?? "free",
    planSource: (profile?.plan_source as DemoUser["plan_source"]) ?? "default",
    subscriptionStatus: profile?.subscription_status ?? null,
    isAdmin: isAdminUser(data.user.id),
  };
}

export async function userCreatedAt(userId: string) {
  if (isDemoMode()) {
    const state = await readState();
    return state.users.find((item) => item.id === userId)?.created_at ?? null;
  }
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("profiles").select("created_at").eq("id", userId).maybeSingle();
  return (data?.created_at as string | undefined) ?? null;
}

export async function signupWithPassword(input: { name: string; email: string; password: string; referredBySlug?: string | null }) {
  const referredBy = input.referredBySlug || null;
  if (isDemoMode()) {
    const existing = await readState();
    if (existing.users.some((user) => user.email === input.email)) {
      return { ok: false as const, error: "An account with that email already exists." };
    }
    const now = new Date().toISOString();
    const user: DemoUser = {
      id: crypto.randomUUID(),
      email: input.email,
      password_hash: await hashPassword(input.password),
      display_name: input.name,
      plan: "free",
      plan_source: "default",
      stripe_customer_id: null,
      stripe_subscription_id: null,
      subscription_status: null,
      referred_by_slug: referredBy,
      referral_source: referredBy ? "artist_page" : null,
      referred_at: referredBy ? now : null,
      onboarding_started_at: now,
      created_at: now,
      updated_at: now,
    };
    await updateState((state) => {
      state.users.push(user);
    });
    await setDemoCookie(user.id);
    return { ok: true as const, userId: user.id };
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: { display_name: input.name },
      emailRedirectTo: `${appUrl()}/auth/callback`,
    },
  });
  if (error) return { ok: false as const, error: error.message };
  const userId = data.user?.id ?? "";
  if (userId) {
    try {
      const admin = createServiceSupabase();
      await admin.from("profiles").update({
        referred_by_slug: referredBy,
        referral_source: referredBy ? "artist_page" : null,
        referred_at: referredBy ? new Date().toISOString() : null,
        onboarding_started_at: new Date().toISOString(),
      }).eq("id", userId);
    } catch {
      // Service role is required to write referral columns. The signup still succeeds.
    }
  }
  if (!data.session) {
    return { ok: true as const, userId, needsConfirmation: true };
  }
  return { ok: true as const, userId };
}

export async function loginWithPassword(input: { email: string; password: string }) {
  if (isDemoMode()) {
    const state = await readState();
    const user = state.users.find((item) => item.email === input.email);
    if (!user || !(await verifyPassword(input.password, user.password_hash))) {
      return { ok: false as const, error: "Email or password is incorrect." };
    }
    await setDemoCookie(user.id);
    return { ok: true as const };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword(input);
  if (error) return { ok: false as const, error: "Email or password is incorrect." };
  return { ok: true as const };
}

export async function logout() {
  if (isDemoMode()) {
    await clearDemoCookie();
    return;
  }
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
}

export async function requestPasswordReset(email: string) {
  if (isDemoMode()) {
    if (process.env.NODE_ENV === "production") {
      return { ok: false as const, error: "Password reset email is not configured in this demo deployment." };
    }
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 1000 * 60 * 30).toISOString();
    const found = await updateState((state) => {
      const user = state.users.find((item) => item.email === email);
      if (!user) return false;
      user.reset_token = token;
      user.reset_expires = expires;
      return true;
    });
    if (!found) return { ok: true as const, message: "If that email exists, a reset link is ready." };
    return {
      ok: true as const,
      message: "Demo mode has no email service. Use this one-time link:",
      resetPath: `/reset-password?token=${token}`,
    };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl()}/auth/callback?next=/reset-password`,
  });
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, message: "If that email exists, we sent a reset link." };
}

export async function resetDemoPassword(token: string, password: string) {
  const ok = await updateState((state) => {
    const user = state.users.find((item) => item.reset_token === token);
    if (!user || !user.reset_expires || user.reset_expires < new Date().toISOString()) return false;
    return user.id;
  });
  if (!ok) return { ok: false as const, error: "That reset link is invalid or expired." };
  const userId = ok;
  await updateState(async (state) => {
    const user = state.users.find((item) => item.id === userId);
    if (!user) return;
    user.password_hash = await hashPassword(password);
    user.reset_token = null;
    user.reset_expires = null;
    user.updated_at = new Date().toISOString();
  });
  await setDemoCookie(userId);
  return { ok: true as const };
}

export async function updateOwnPassword(password: string) {
  if (isDemoMode()) {
    const session = await getSessionUser();
    if (!session) return { ok: false as const, error: "Sign in again." };
    await updateState(async (state) => {
      const user = state.users.find((item) => item.id === session.id);
      if (!user) return;
      user.password_hash = await hashPassword(password);
      user.updated_at = new Date().toISOString();
    });
    return { ok: true as const };
  }
  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function updateDisplayName(name: string) {
  const session = await getSessionUser();
  if (!session) return { ok: false as const, error: "Sign in again." };
  if (isDemoMode()) {
    await updateState((state) => {
      const user = state.users.find((item) => item.id === session.id);
      if (!user) return;
      user.display_name = name;
      user.updated_at = new Date().toISOString();
    });
    return { ok: true as const };
  }
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("profiles").update({ display_name: name }).eq("id", session.id);
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function deleteOwnAccount() {
  const session = await getSessionUser();
  if (!session) return { ok: false as const, error: "Sign in again." };
  if (isDemoMode()) {
    await updateState((state) => {
      const site = state.sites.find((item) => item.user_id === session.id);
      state.users = state.users.filter((item) => item.id !== session.id);
      if (!site) return;
      const releaseIds = new Set(state.releases.filter((item) => item.site_id === site.id).map((item) => item.id));
      state.sites = state.sites.filter((item) => item.id !== site.id);
      state.releases = state.releases.filter((item) => item.site_id !== site.id);
      state.releaseLinks = state.releaseLinks.filter((item) => !releaseIds.has(item.release_id));
      state.videos = state.videos.filter((item) => item.site_id !== site.id);
      state.shows = state.shows.filter((item) => item.site_id !== site.id);
      state.press = state.press.filter((item) => item.site_id !== site.id);
      state.gallery = state.gallery.filter((item) => item.site_id !== site.id);
      state.socials = state.socials.filter((item) => item.site_id !== site.id);
      state.links = state.links.filter((item) => item.site_id !== site.id);
      state.highlights = state.highlights.filter((item) => item.site_id !== site.id);
      state.events = state.events.filter((item) => item.site_id !== site.id);
      state.redirects = state.redirects.filter((item) => item.site_id !== site.id);
      state.domains = state.domains.filter((item) => item.site_id !== site.id);
    });
    await clearDemoCookie();
    return { ok: true as const };
  }

  try {
    const admin = createServiceSupabase();
    const { error } = await admin.auth.admin.deleteUser(session.id);
    if (error) return { ok: false as const, error: error.message };
    await logout();
    return { ok: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Account deletion needs the Supabase service role.";
    return { ok: false as const, error: message };
  }
}
