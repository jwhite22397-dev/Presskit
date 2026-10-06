import { z } from "zod";
import { sanitizeEmail, sanitizeUrl, safeHexColor } from "@/lib/urls";
import { validateSlug } from "@/lib/slug";

const trimmed = (max: number) => z.string().trim().max(max);

export const emailSchema = z
  .string()
  .trim()
  .email("Enter a valid email.")
  .max(200)
  .transform((value) => value.toLowerCase());

export const passwordSchema = z.string().min(8, "Use at least 8 characters.").max(200);

export const signupSchema = z.object({
  name: trimmed(80).min(1, "Enter your name."),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password.").max(200),
});

export const identitySchema = z.object({
  artist_name: trimmed(80).min(1, "Artist name is required."),
  real_name: trimmed(80).optional().or(z.literal("")),
  city: trimmed(80).optional().or(z.literal("")),
  genre: trimmed(60).optional().or(z.literal("")),
  tagline: trimmed(140).optional().or(z.literal("")),
});

export const aboutSchema = z.object({
  short_bio: trimmed(400).optional().or(z.literal("")),
  full_bio: trimmed(5000).optional().or(z.literal("")),
});

export const contactSchema = z.object({
  booking_email: z.string().trim().max(200).optional().or(z.literal("")),
  management_email: z.string().trim().max(200).optional().or(z.literal("")),
  press_email: z.string().trim().max(200).optional().or(z.literal("")),
});

export const styleSchema = z.object({
  theme: z.enum(["editorial", "night", "minimal", "neon"]),
  accent_color: z.string().trim().max(20),
  font_pairing: z.enum(["modern", "editorial", "bold", "elegant", "minimal"]),
  hidden_sections: z.array(z.enum(["music", "videos", "about", "shows", "press", "gallery", "highlights", "contact"])).max(8),
});

export const releaseSchema = z.object({
  title: trimmed(120).min(1, "Title is required."),
  type: z.enum(["single", "ep", "mixtape", "album", "other"]),
  release_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  description: trimmed(500).optional().or(z.literal("")),
  is_featured: z.boolean().optional(),
  release_status: z.enum(["released", "announced", "prerelease"]).optional(),
  announcement_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  prerelease_url: z.string().trim().max(500).optional().or(z.literal("")),
  links: z
    .array(
      z.object({
        platform: z.enum(["spotify", "apple", "youtube", "soundcloud", "bandcamp", "other"]),
        url: z.string().trim().min(1).max(500),
      }),
    )
    .max(8),
});

export const videoSchema = z.object({
  title: trimmed(140).min(1, "Title is required."),
  url: z.string().trim().min(1).max(500),
  is_featured: z.boolean().optional(),
});

export const showSchema = z.object({
  event_name: trimmed(140).min(1, "Event name is required."),
  venue: trimmed(140).min(1, "Venue is required."),
  city: trimmed(80).min(1, "City is required."),
  state: trimmed(80).optional().or(z.literal("")),
  country: trimmed(80).optional().or(z.literal("")),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date."),
  time: trimmed(20).optional().or(z.literal("")),
  ticket_url: z.string().trim().max(500).optional().or(z.literal("")),
  is_sold_out: z.boolean().optional(),
});

export const pressSchema = z.object({
  publication: trimmed(120).min(1, "Publication is required."),
  headline: trimmed(180).optional().or(z.literal("")),
  quote: trimmed(500).min(1, "Quote is required."),
  article_url: z.string().trim().max(500).optional().or(z.literal("")),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
});

export const highlightSchema = z.object({
  text: trimmed(120).min(1, "Highlight is required."),
});

export const customLinkSchema = z.object({
  label: trimmed(40).min(1, "Label is required."),
  url: z.string().trim().min(1).max(500),
  is_primary: z.boolean().optional(),
});

export const socialSchema = z.object({
  platform: z.enum(["instagram", "tiktok", "youtube", "x", "facebook", "threads", "spotify", "website", "other"]),
  url: z.string().trim().min(1).max(500),
});

export const seoSchema = z.object({
  meta_title: trimmed(70).optional().or(z.literal("")),
  meta_description: trimmed(160).optional().or(z.literal("")),
});

export const supportSchema = z.object({
  name: trimmed(80).min(1),
  email: emailSchema,
  topic: trimmed(80).min(1),
  message: trimmed(2000).min(10, "Tell us a bit more."),
});

export function parseOptionalEmail(value: string | undefined) {
  if (!value) return null;
  return sanitizeEmail(value);
}

export function parseRequiredUrl(value: string) {
  const url = sanitizeUrl(value);
  if (!url) throw new Error("Enter a valid http(s) URL.");
  return url;
}

export function parseOptionalUrl(value: string | undefined) {
  if (!value) return null;
  return parseRequiredUrl(value);
}

export function parseAccent(value: string) {
  const color = safeHexColor(value);
  if (!color) throw new Error("Choose a valid accent color.");
  return color;
}

export function parseSlugInput(value: string) {
  const result = validateSlug(value);
  if (!result.ok) throw new Error(result.reason);
  return result.slug;
}
