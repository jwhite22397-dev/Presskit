# PRESSKIT

PRESSKIT is an artist's internet profile. Enter the career once. The same profile becomes the public website, the bio link, and the EPK. The promise: your artist website, live in about five minutes. No web design required.

This repository runs without Supabase or Stripe. Demo mode uses a local JSON store and a finished fictional artist, Jaylen Saint. Point the same app at Supabase and Stripe when you are ready to charge.

## Stack

- Next.js (App Router) and TypeScript
- Tailwind CSS
- Zod validation
- Supabase Auth, Postgres, Storage, and Row Level Security
- Stripe Checkout, Customer Portal, and webhooks
- jsPDF for the EPK one-sheet

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

Demo artist site: http://localhost:3000/a/jaylensaint

Demo EPK: http://localhost:3000/a/jaylensaint/epk

Demo login (created on first run):

- Email: `demo@presskit.app`
- Password: `demo1234`

That account owns the Jaylen Saint site so you can edit, unpublish, and view analytics. New signups start on Free.

Demo data is stored in `data/demo-store.json` (gitignored). Delete that file to reset the demo. Uploads go to `public/uploads/` (gitignored except `.gitkeep`).

## Scripts

```bash
npm run dev
npm run test
npm run typecheck
npm run lint
npm run build
npm start
```

## Environment variables

Copy `.env.example`. Nothing secret belongs in git.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Production | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Production billing, admin grants, account deletion | Server only. Never expose to the browser |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Production billing | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Production billing | Stripe secret |
| `STRIPE_WEBHOOK_SECRET` | Production billing | Webhook signing secret |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | Production billing | Price for $9.99/month |
| `STRIPE_PRO_YEARLY_PRICE_ID` | Production billing | Price for $79/year |
| `STRIPE_LIFETIME_PRICE_ID` | Production billing | Founding Artist one-time price |
| `NEXT_PUBLIC_APP_URL` | Yes | Canonical origin, no trailing slash |
| `NEXT_PUBLIC_DEMO_MODE` | Local | `true` forces the local store even if Supabase keys exist |
| `DEMO_BILLING_PLAN` | Docs only | Describes the simulated plan you pick in Account |
| `DEMO_SESSION_SECRET` | Production demo | Signs the demo session cookie. Change it if demo mode is deployed |
| `ADMIN_USER_IDS` | Founder grants | Comma-separated user ids allowed to open `/admin` |

If Supabase URL or anon key is missing or still a placeholder, the app stays in demo mode even when `NEXT_PUBLIC_DEMO_MODE` is unset.

## Supabase

1. Create a project.
2. Run `supabase/migrations/20261006000000_init.sql`, then `supabase/migrations/20261006120000_profile_flow.sql`, in the SQL editor.
3. In Authentication, decide whether email confirmation is on. If it is on, signup asks the artist to confirm before onboarding.
4. Put the URL, anon key, and service role key in `.env.local`.
5. Set `NEXT_PUBLIC_DEMO_MODE=false`.
6. Storage bucket `media` is created by the migration and is public-read. Writes are limited to a folder named with the user's id.

The migration enables RLS on every table. Artists can change only their rows. Anonymous visitors can read published sites and insert analytics events for published sites. Plan and Stripe columns on `profiles` are not updatable by the signed-in user; a trigger copies `profiles.plan` onto `artist_sites.public_plan` for the public page. Billing ids are not selected for the browser.

Password reset in Supabase mode uses Supabase email. Add `http://localhost:3000/auth/callback` (and your production origin) to the auth redirect allow list.

## Stripe

1. Create three prices: Pro monthly $9.99, Pro yearly $79, Founding Artist lifetime (the app displays $49; set the Stripe price to the amount you want to charge).
2. Put the price ids and API keys in the environment.
3. Point a webhook at `https://your-domain/api/billing/webhook` for `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted`.
4. Set `NEXT_PUBLIC_DEMO_MODE=false` and configure Supabase. Checkout updates `profiles` with the service role. The database trigger updates the public plan. Do not trust the browser.

Local development without Stripe: sign in and use **Development billing** on Account. It is rendered only when demo mode is on and `NODE_ENV` is not `production`.

## Founder sales

Set `ADMIN_USER_IDS` to your Supabase user id (or the demo user id after you copy it from `/admin` once listed). Open `/admin` and grant `pro` or `lifetime`. That path uses the service role in Supabase mode and the local store in demo mode. It is not a client-side flag.

The same screen issues Founding Artist codes (`FOUNDING-XXXX`). Redemption happens on Account and is checked on the server: active, unexpired, under the redemption cap, and not already used by that account. A valid code sets `plan_source` to `founding` and grants Pro or Lifetime. The dashboard thanks founding artists. There is no public badge.

## Custom domains

Pro accounts can submit a hostname from Account. The `domains` table stores `pending`. Automated Vercel domain attachment is intentionally not wired up. Connect the domain with the artist, then mark it active in the database when DNS is verified. Do not pretend a domain works before that.

## Done-for-you, later

Do not impersonate an artist with a shared password. The safe version is an `artist_grants` table (`artist_user_id`, `operator_user_id`, `role`) checked inside RLS with `auth.uid()`. The operator edits through the normal owner policies only when that grant exists. Out of scope for this MVP.

## Plans

Defined in `src/config/plans.ts`. UI should call `canUseAnalytics`, `canDownloadPDF`, `canRemoveBranding`, and `canUsePremiumTheme` instead of scattering plan names.

- Free: site, basic themes (Clean, Dark, Minimal), music and social links, basic EPK page, a 7-day audience snapshot, PRESSKIT credit.
- Pro: $9.99/month or $79/year. Bold vibe, no credit, 30- and 90-day audience history, PDF, custom-domain request, higher media limits.
- Founding Artist: one-time, same entitlements as Pro.

Free gallery limit is 6 images, 5 releases, 3 videos, 5 highlights.

## Public URLs

Artist sites live at `/a/[slug]` so they do not collide with app routes. Old slugs redirect when the address changes. Placeholder slugs start with `draft-` and cannot be published. Empty sections are omitted. Unpublished slugs 404.

## PDF

`GET /api/epk/[slug]/pdf` builds a letter-size one-sheet with jsPDF on the server. It checks the artist's plan, not the visitor's. The typeface is Times/Helvetica because jsPDF's built-in fonts do not load the site's webfonts. That is a deliberate trade for a deploy that does not need headless Chrome.

## Analytics

Public pages post to `/api/analytics`. Stored fields: event type, optional label, random visitor id from `localStorage`, and referrer hostname. No IP address and no fingerprint. Unique visitors are distinct visitor ids. Every artist sees a 7-day audience story (visits, listens, watches, Instagram, booking, fan action rate). Pro and Founding Artist also see 30 and 90 days and referrer hostnames.

Free pages show “Made with PRESSKIT / Create yours free,” linking to `/signup?ref={slug}`. The proxy stores that slug in an httpOnly cookie for 30 days. Signup saves `referred_by_slug`, `referral_source`, and `referred_at`. It does not expose the other artist’s private data.

Product events (onboarding, publish time, referral, founding redemption, upgrades, public page and EPK views) are structured server logs and, in demo mode, rows in the local store. In Supabase mode they insert with the service role into `product_events`, which has no client policies. Copying the public URL also records `bio_link_intent`. Transactional email is the same idea in `src/server/email.ts`: welcome is logged until you connect a provider. Password reset is handled by Supabase Auth.

`src/lib/optimization.ts` is a deterministic checklist (missing booking contact, bio, featured release, live video, and so on). `FutureAIArtistOptimizationService` throws until a model exists. `src/lib/score.ts` can explain completeness, industry readiness, fan conversion, discoverability, and brand. Fan conversion stays empty below 10 visitors. It never ranks an artist against other artists.

Releases can be `released`, `announced`, or `prerelease`, with an announcement date and a URL. The public page says “Coming” and links that URL. It does not invent a presave button.

## Deployment

Deploy the Next.js app to Vercel. Set the environment variables above. `NEXT_PUBLIC_APP_URL` must be the production origin. Demo mode is for local evaluation; Vercel's filesystem does not keep `data/demo-store.json`. Production needs Supabase.

Recommended Supabase backups: enable Point-in-Time Recovery on the paid plan, or schedule daily logical backups from the Supabase dashboard. This app does not ship a second backup system.

## Security model

- Dashboard, onboarding, and admin routes are gated in `src/proxy.ts` and again in server actions.
- Zod validates inputs. URLs must be `http` or `https` with no credentials. User text is rendered as text, not HTML.
- Images are sniffed for JPEG, PNG, or WebP magic bytes, capped at 5MB, and stored under a generated filename.
- RLS is the real boundary. The service role is limited to webhooks, admin plan grants, founding codes, product events, admin directory, and account deletion.
- Do not commit `.env.local`.

## Project map

- `src/app` routes, server actions, API
- `src/components/artist` public themes and EPK
- `src/components/dashboard` editing
- `src/config` plans and themes
- `src/server` demo store, Supabase access, billing, PDF
- `src/data/demo.ts` Jaylen Saint
- `supabase/migrations` schema and RLS

## What is intentionally unfinished

- Drag-and-drop section reordering. Artists can hide sections. Order follows the saved list, defaulting to a fixed sequence.
- In-place editing of an existing release or show. Delete and add again.
- Automated custom-domain provisioning.
- A delivered email provider. The interface is ready; messages currently log.
- Operator impersonation for done-for-you pages.
- Legal pages are drafts and say so.
