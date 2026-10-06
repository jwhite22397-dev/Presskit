"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canSimulateBilling, isAdminUser } from "@/lib/server-env";
import { trackProductEvent } from "@/lib/product-analytics";
import { sendTransactionalEmail } from "@/server/email";
import {
  aboutSchema,
  contactSchema,
  customLinkSchema,
  highlightSchema,
  identitySchema,
  loginSchema,
  parseAccent,
  parseOptionalEmail,
  parseOptionalUrl,
  parseRequiredUrl,
  parseSlugInput,
  passwordSchema,
  pressSchema,
  releaseSchema,
  seoSchema,
  showSchema,
  signupSchema,
  socialSchema,
  styleSchema,
  supportSchema,
  videoSchema,
} from "@/lib/validation";
import {
  deleteOwnAccount,
  getSessionUser,
  loginWithPassword,
  logout,
  requestPasswordReset,
  resetDemoPassword,
  signupWithPassword,
  updateDisplayName,
  updateOwnPassword,
} from "@/server/auth";
import {
  addCustomLink,
  addGalleryImage,
  addHighlight,
  addPress,
  addShow,
  addSocial,
  addVideo,
  changeSlug,
  deleteById,
  getOwnedArtist,
  moveGallery,
  patchOwnedSite,
  requestCustomDomain,
  saveRelease,
  saveSupportMessage,
  setPublished,
  setUserPlan,
  storeImage,
  themeError,
} from "@/server/artists";
import { createCheckout, createPortal, simulatePlan } from "@/server/billing";
import type { Plan, ThemeName } from "@/types";

export interface ActionState {
  ok: boolean;
  error?: string;
  message?: string;
  resetPath?: string;
  needsConfirmation?: boolean;
  url?: string;
}

function issue(error: { issues: { message: string }[] }) {
  return { ok: false, error: error.issues[0]?.message ?? "Check the form and try again." };
}

async function requireSession() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

function refresh(slug?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/onboarding");
  if (slug && !slug.startsWith("draft-")) {
    revalidatePath(`/a/${slug}`);
    revalidatePath(`/a/${slug}/epk`);
  }
}

function safeNext(value: FormDataEntryValue | null) {
  const next = String(value ?? "");
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/login")) return "/dashboard";
  return next;
}

export async function signupAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  trackProductEvent("signup_started");
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return issue(parsed.error);
  const result = await signupWithPassword(parsed.data);
  if (!result.ok) return result;
  trackProductEvent("signup_completed");
  await sendTransactionalEmail({ to: parsed.data.email, template: "welcome", variables: { name: parsed.data.name } });
  if ("needsConfirmation" in result && result.needsConfirmation) {
    return { ok: true, needsConfirmation: true, message: "Check your email to confirm your account, then sign in." };
  }
  redirect("/onboarding");
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return issue(parsed.error);
  const result = await loginWithPassword(parsed.data);
  if (!result.ok) return result;
  redirect(safeNext(formData.get("next")));
}

export async function logoutAction() {
  await logout();
  redirect("/");
}

export async function forgotPasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "");
  const parsed = loginSchema.pick({ email: true }).safeParse({ email });
  if (!parsed.success) return issue(parsed.error);
  const result = await requestPasswordReset(parsed.data.email);
  if (!result.ok) return result;
  return { ok: true, message: result.message, resetPath: "resetPath" in result ? result.resetPath : undefined };
}

export async function resetPasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = passwordSchema.safeParse(formData.get("password"));
  if (!parsed.success) return issue(parsed.error);
  const token = String(formData.get("token") ?? "");
  if (token) {
    const result = await resetDemoPassword(token, parsed.data);
    if (!result.ok) return result;
    redirect("/dashboard");
  }
  const result = await updateOwnPassword(parsed.data);
  if (!result.ok) return result;
  redirect("/dashboard/account");
}

export async function saveIdentityAction(input: unknown): Promise<ActionState> {
  const user = await requireSession();
  const parsed = identitySchema.safeParse(input);
  if (!parsed.success) return issue(parsed.error);
  const artist = await getOwnedArtist(user.id, user.plan, user.displayName);
  const result = await patchOwnedSite(user.id, {
    artist_name: parsed.data.artist_name,
    real_name: parsed.data.real_name || null,
    city: parsed.data.city || null,
    genre: parsed.data.genre || null,
    tagline: parsed.data.tagline || null,
  });
  if (!result.ok) return result;
  refresh(artist.site.slug);
  return { ok: true };
}

export async function saveAboutAction(input: unknown): Promise<ActionState> {
  const user = await requireSession();
  const parsed = aboutSchema.safeParse(input);
  if (!parsed.success) return issue(parsed.error);
  const artist = await getOwnedArtist(user.id, user.plan, user.displayName);
  const result = await patchOwnedSite(user.id, {
    short_bio: parsed.data.short_bio || null,
    full_bio: parsed.data.full_bio || null,
  });
  if (!result.ok) return result;
  refresh(artist.site.slug);
  return { ok: true };
}

export async function saveContactAction(input: unknown): Promise<ActionState> {
  const user = await requireSession();
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return issue(parsed.error);
  try {
    const artist = await getOwnedArtist(user.id, user.plan, user.displayName);
    const result = await patchOwnedSite(user.id, {
      booking_email: parseOptionalEmail(parsed.data.booking_email),
      management_email: parseOptionalEmail(parsed.data.management_email),
      press_email: parseOptionalEmail(parsed.data.press_email),
    });
    if (!result.ok) return result;
    refresh(artist.site.slug);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Invalid email." };
  }
}

export async function saveStyleAction(input: unknown): Promise<ActionState> {
  const user = await requireSession();
  const parsed = styleSchema.safeParse(input);
  if (!parsed.success) return issue(parsed.error);
  const themeProblem = themeError(user.plan, parsed.data.theme as ThemeName);
  if (themeProblem) return { ok: false, error: themeProblem };
  try {
    const accent = parseAccent(parsed.data.accent_color);
    const artist = await getOwnedArtist(user.id, user.plan, user.displayName);
    const result = await patchOwnedSite(user.id, {
      theme: parsed.data.theme,
      accent_color: accent,
      font_pairing: parsed.data.font_pairing,
      hidden_sections: parsed.data.hidden_sections,
    });
    if (!result.ok) return result;
    refresh(artist.site.slug);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not save style." };
  }
}

export async function saveSeoAction(input: unknown): Promise<ActionState> {
  const user = await requireSession();
  const parsed = seoSchema.safeParse(input);
  if (!parsed.success) return issue(parsed.error);
  const artist = await getOwnedArtist(user.id, user.plan, user.displayName);
  const result = await patchOwnedSite(user.id, {
    meta_title: parsed.data.meta_title || null,
    meta_description: parsed.data.meta_description || null,
  });
  if (!result.ok) return result;
  refresh(artist.site.slug);
  return { ok: true };
}

export async function setSlugAction(slugInput: string): Promise<ActionState> {
  const user = await requireSession();
  try {
    const slug = parseSlugInput(slugInput);
    const artist = await getOwnedArtist(user.id, user.plan, user.displayName);
    const result = await changeSlug(user.id, slug);
    if (!result.ok) return result;
    refresh(artist.site.slug);
    refresh(slug);
    return { ok: true, message: slug };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "That address is not available." };
  }
}

export async function publishAction(published: boolean): Promise<ActionState> {
  const user = await requireSession();
  const artist = await getOwnedArtist(user.id, user.plan, user.displayName);
  const result = await setPublished(user.id, published);
  if (!result.ok) return result;
  if (published) trackProductEvent("site_published", { slug: artist.site.slug });
  refresh(artist.site.slug);
  return { ok: true };
}

export async function uploadAction(formData: FormData): Promise<ActionState & { url?: string }> {
  const user = await requireSession();
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "Choose an image." };
  const stored = await storeImage(user.id, file);
  if (!stored.ok) return stored;
  return { ok: true, url: stored.url };
}

export async function setImageAction(kind: "profile" | "hero" | "cover", url: string, releaseId?: string): Promise<ActionState> {
  const user = await requireSession();
  const artist = await getOwnedArtist(user.id, user.plan, user.displayName);
  if (kind === "cover") {
    const release = artist.releases.find((item) => item.id === releaseId);
    if (!release) return { ok: false, error: "Release not found." };
    const result = await saveRelease(user.id, user.plan, {
      id: release.id,
      title: release.title,
      type: release.type,
      release_date: release.release_date,
      description: release.description,
      is_featured: release.is_featured,
      cover_url: url,
      links: release.links.map((link) => ({ platform: link.platform, url: link.url })),
    });
    if (!result.ok) return result;
  } else {
    const result = await patchOwnedSite(user.id, kind === "profile" ? { profile_image_url: url } : { hero_image_url: url });
    if (!result.ok) return result;
  }
  refresh(artist.site.slug);
  return { ok: true, url };
}

export async function saveReleaseAction(input: unknown): Promise<ActionState> {
  const user = await requireSession();
  const parsed = releaseSchema.safeParse(input);
  if (!parsed.success) return issue(parsed.error);
  try {
    const links = parsed.data.links.map((link) => ({ platform: link.platform, url: parseRequiredUrl(link.url) }));
    const artist = await getOwnedArtist(user.id, user.plan, user.displayName);
    const result = await saveRelease(user.id, user.plan, {
      id: typeof input === "object" && input && "id" in input ? String((input as { id?: string }).id || "") || undefined : undefined,
      title: parsed.data.title,
      type: parsed.data.type,
      release_date: parsed.data.release_date || null,
      description: parsed.data.description || null,
      is_featured: Boolean(parsed.data.is_featured),
      links,
    });
    if (!result.ok) return result;
    trackProductEvent("release_added");
    refresh(artist.site.slug);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not save release." };
  }
}

export async function saveVideoAction(input: unknown): Promise<ActionState> {
  const user = await requireSession();
  const parsed = videoSchema.safeParse(input);
  if (!parsed.success) return issue(parsed.error);
  try {
    const artist = await getOwnedArtist(user.id, user.plan, user.displayName);
    const result = await addVideo(user.id, user.plan, { title: parsed.data.title, url: parseRequiredUrl(parsed.data.url), is_featured: parsed.data.is_featured });
    if (!result.ok) return result;
    refresh(artist.site.slug);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Enter a valid video URL." };
  }
}

export async function saveShowAction(input: unknown): Promise<ActionState> {
  const user = await requireSession();
  const parsed = showSchema.safeParse(input);
  if (!parsed.success) return issue(parsed.error);
  try {
    const artist = await getOwnedArtist(user.id, user.plan, user.displayName);
    const result = await addShow(user.id, {
      event_name: parsed.data.event_name,
      venue: parsed.data.venue,
      city: parsed.data.city,
      state: parsed.data.state || null,
      country: parsed.data.country || "USA",
      date: parsed.data.date,
      time: parsed.data.time || null,
      ticket_url: parseOptionalUrl(parsed.data.ticket_url),
      is_sold_out: Boolean(parsed.data.is_sold_out),
    });
    if (!result.ok) return result;
    refresh(artist.site.slug);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not save show." };
  }
}

export async function savePressAction(input: unknown): Promise<ActionState> {
  const user = await requireSession();
  const parsed = pressSchema.safeParse(input);
  if (!parsed.success) return issue(parsed.error);
  try {
    const artist = await getOwnedArtist(user.id, user.plan, user.displayName);
    const result = await addPress(user.id, {
      publication: parsed.data.publication,
      headline: parsed.data.headline || null,
      quote: parsed.data.quote,
      article_url: parseOptionalUrl(parsed.data.article_url),
      date: parsed.data.date || null,
    });
    if (!result.ok) return result;
    refresh(artist.site.slug);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not save press." };
  }
}

export async function saveHighlightAction(input: unknown): Promise<ActionState> {
  const user = await requireSession();
  const parsed = highlightSchema.safeParse(input);
  if (!parsed.success) return issue(parsed.error);
  const artist = await getOwnedArtist(user.id, user.plan, user.displayName);
  const result = await addHighlight(user.id, user.plan, parsed.data.text);
  if (!result.ok) return result;
  refresh(artist.site.slug);
  return { ok: true };
}

export async function saveSocialAction(input: unknown): Promise<ActionState> {
  const user = await requireSession();
  const parsed = socialSchema.safeParse(input);
  if (!parsed.success) return issue(parsed.error);
  try {
    const artist = await getOwnedArtist(user.id, user.plan, user.displayName);
    const result = await addSocial(user.id, { platform: parsed.data.platform, url: parseRequiredUrl(parsed.data.url) });
    if (!result.ok) return result;
    refresh(artist.site.slug);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Enter a valid URL." };
  }
}

export async function saveLinkAction(input: unknown): Promise<ActionState> {
  const user = await requireSession();
  const parsed = customLinkSchema.safeParse(input);
  if (!parsed.success) return issue(parsed.error);
  try {
    const artist = await getOwnedArtist(user.id, user.plan, user.displayName);
    const result = await addCustomLink(user.id, { label: parsed.data.label, url: parseRequiredUrl(parsed.data.url), is_primary: parsed.data.is_primary });
    if (!result.ok) return result;
    refresh(artist.site.slug);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Enter a valid URL." };
  }
}

export async function deleteContentAction(table: "releases" | "videos" | "shows" | "press" | "gallery" | "socials" | "links" | "highlights", id: string): Promise<ActionState> {
  const user = await requireSession();
  const artist = await getOwnedArtist(user.id, user.plan, user.displayName);
  const result = await deleteById(user.id, table, id);
  if (!result.ok) return result;
  refresh(artist.site.slug);
  return { ok: true };
}

export async function addGalleryAction(url: string, caption: string): Promise<ActionState> {
  const user = await requireSession();
  const artist = await getOwnedArtist(user.id, user.plan, user.displayName);
  const result = await addGalleryImage(user.id, user.plan, url, caption || null);
  if (!result.ok) return result;
  refresh(artist.site.slug);
  return { ok: true };
}

export async function moveGalleryAction(id: string, direction: "up" | "down"): Promise<ActionState> {
  const user = await requireSession();
  const artist = await getOwnedArtist(user.id, user.plan, user.displayName);
  const result = await moveGallery(user.id, id, direction);
  if (!result.ok) return result;
  refresh(artist.site.slug);
  return { ok: true };
}

export async function completeOnboardingAction(): Promise<ActionState> {
  const user = await requireSession();
  const artist = await getOwnedArtist(user.id, user.plan, user.displayName);
  await patchOwnedSite(user.id, { onboarding_completed: true });
  refresh(artist.site.slug);
  redirect("/dashboard");
}

export async function updateAccountAction(name: string): Promise<ActionState> {
  const parsed = identitySchema.pick({ artist_name: true }).safeParse({ artist_name: name });
  if (!parsed.success) return { ok: false, error: "Enter your name." };
  const result = await updateDisplayName(parsed.data.artist_name);
  if (!result.ok) return result;
  revalidatePath("/dashboard/account");
  return { ok: true };
}

export async function changePasswordAction(password: string): Promise<ActionState> {
  const parsed = passwordSchema.safeParse(password);
  if (!parsed.success) return issue(parsed.error);
  return updateOwnPassword(parsed.data);
}

export async function deleteAccountAction(confirmation: string): Promise<ActionState> {
  if (confirmation !== "DELETE") return { ok: false, error: "Type DELETE to confirm." };
  const result = await deleteOwnAccount();
  if (!result.ok) return result;
  redirect("/");
}

export async function checkoutAction(interval: "monthly" | "yearly" | "lifetime"): Promise<ActionState> {
  const user = await requireSession();
  trackProductEvent("upgrade_started", { interval });
  const result = await createCheckout({ userId: user.id, email: user.email, interval });
  if (!result.ok) return result;
  return { ok: true, url: result.url };
}

export async function portalAction(): Promise<ActionState> {
  const user = await requireSession();
  const result = await createPortal(user.id);
  if (!result.ok) return result;
  return { ok: true, url: result.url };
}

export async function simulatePlanAction(plan: Plan): Promise<ActionState> {
  if (!canSimulateBilling()) return { ok: false, error: "Plan simulation is disabled." };
  const user = await requireSession();
  const result = await simulatePlan(user.id, plan);
  if (!result.ok) return result;
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function grantPlanAction(userId: string, plan: Plan): Promise<ActionState> {
  const user = await requireSession();
  if (!isAdminUser(user.id)) return { ok: false, error: "Admin access required." };
  const result = await setUserPlan(user.id, userId, plan, "admin");
  if (!result.ok) return result;
  revalidatePath("/admin");
  return { ok: true };
}

export async function domainAction(hostname: string): Promise<ActionState> {
  const user = await requireSession();
  const result = await requestCustomDomain(user.id, user.plan, hostname.trim().toLowerCase());
  if (!result.ok) return result;
  return { ok: true, message: "Request saved. Custom domain connection is handled with support for now." };
}

export async function supportAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = supportSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    topic: formData.get("topic"),
    message: formData.get("message"),
  });
  if (!parsed.success) return issue(parsed.error);
  await saveSupportMessage(parsed.data);
  return { ok: true, message: "Message received. We read every note." };
}
