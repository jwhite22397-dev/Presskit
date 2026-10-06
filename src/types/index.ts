// =============================================================================
// PRESSKIT - Core Type Definitions
// =============================================================================

export type Plan = 'free' | 'pro' | 'lifetime';

export type ThemeName = 'editorial' | 'night' | 'minimal' | 'neon';

export type ReleaseType = 'single' | 'ep' | 'mixtape' | 'album' | 'other';

export type ReleaseStatus = 'released' | 'announced' | 'prerelease';

export type PublishStatus = 'draft' | 'published';

// -----------------------------------------------------------------------------
// User & Profile Types
// -----------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  plan: Plan;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  created_at: string;
  updated_at: string;
}

// -----------------------------------------------------------------------------
// Artist Site Types
// -----------------------------------------------------------------------------

export interface ArtistSite {
  id: string;
  user_id: string;
  slug: string;
  status: PublishStatus;
  onboarding_completed: boolean;
  
  // Identity
  artist_name: string;
  real_name: string | null;
  city: string | null;
  genre: string | null;
  tagline: string | null;
  
  // Content
  short_bio: string | null;
  full_bio: string | null;
  profile_image_url: string | null;
  hero_image_url: string | null;
  booking_email: string | null;
  management_email: string | null;
  press_email: string | null;
  
  // Theme & Customization
  theme: ThemeName;
  accent_color: string;
  font_pairing: string;
  section_order: string[];
  hidden_sections: string[];
  
  // SEO
  meta_title: string | null;
  meta_description: string | null;

  // Cached plan used for public entitlements (branding, PDF). No billing IDs.
  public_plan: Plan;
  
  // Timestamps
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Release {
  id: string;
  site_id: string;
  title: string;
  type: ReleaseType;
  cover_url: string | null;
  release_date: string | null;
  description: string | null;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  /** Future prerelease fields. Missing values mean the release is already out. */
  release_status?: ReleaseStatus;
  announcement_date?: string | null;
  prerelease_url?: string | null;
}

export interface ReleaseLink {
  id: string;
  release_id: string;
  platform: string;
  url: string;
  sort_order: number;
  created_at: string;
}

export interface Video {
  id: string;
  site_id: string;
  title: string;
  url: string;
  thumbnail_url: string | null;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Show {
  id: string;
  site_id: string;
  event_name: string;
  venue: string;
  city: string;
  state: string | null;
  country: string;
  date: string;
  time: string | null;
  ticket_url: string | null;
  is_sold_out: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PressItem {
  id: string;
  site_id: string;
  publication: string;
  headline: string | null;
  quote: string;
  article_url: string | null;
  date: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface GalleryImage {
  id: string;
  site_id: string;
  url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export interface SocialLink {
  id: string;
  site_id: string;
  platform: string;
  url: string;
  sort_order: number;
  created_at: string;
}

export interface CustomLink {
  id: string;
  site_id: string;
  label: string;
  url: string;
  icon: string | null;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CareerHighlight {
  id: string;
  site_id: string;
  text: string;
  sort_order: number;
  created_at: string;
}

// -----------------------------------------------------------------------------
// Analytics Types
// -----------------------------------------------------------------------------

export type AnalyticsEventType = 
  | 'page_view'
  | 'music_click'
  | 'social_click'
  | 'booking_click'
  | 'ticket_click'
  | 'custom_link_click'
  | 'epk_view'
  | 'pdf_download'
  | 'video_click';

export interface AnalyticsEvent {
  id: string;
  site_id: string;
  event_type: AnalyticsEventType;
  event_data: Record<string, unknown> | null;
  referrer: string | null;
  user_agent: string | null;
  country: string | null;
  created_at: string;
}

export interface AnalyticsSummary {
  total_views: number;
  unique_visitors: number;
  total_clicks: number;
  epk_views: number;
  pdf_downloads: number;
  top_links: { label: string; clicks: number }[];
  views_by_day: { date: string; views: number }[];
  sources: { source: string; count: number }[];
}

// -----------------------------------------------------------------------------
// Complete Artist Data (for public pages)
// -----------------------------------------------------------------------------

export interface ArtistData {
  site: ArtistSite;
  releases: (Release & { links: ReleaseLink[] })[];
  videos: Video[];
  shows: Show[];
  press: PressItem[];
  gallery: GalleryImage[];
  socials: SocialLink[];
  links: CustomLink[];
  highlights: CareerHighlight[];
  plan: Plan;
}

// -----------------------------------------------------------------------------
// Profile Completeness
// -----------------------------------------------------------------------------

export interface CompletenessItem {
  key: string;
  label: string;
  completed: boolean;
  recommendation?: string;
  href?: string;
}

export interface ProfileCompleteness {
  percentage: number;
  items: CompletenessItem[];
}

// -----------------------------------------------------------------------------
// Onboarding
// -----------------------------------------------------------------------------

export interface OnboardingData {
  step: number;
  artist_name: string;
  real_name: string;
  city: string;
  genre: string;
  tagline: string;
  short_bio: string;
  full_bio: string;
  music_links: { platform: string; url: string }[];
  social_links: { platform: string; url: string }[];
  profile_image: File | null;
  hero_image: File | null;
  booking_email: string;
  management_email: string;
  press_email: string;
  theme: ThemeName;
  slug: string;
}
