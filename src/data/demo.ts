// =============================================================================
// PRESSKIT - Demo Data (Jaylen Saint)
// =============================================================================
// Complete fictional artist for demonstrating the platform

import {
  ArtistSite,
  Release,
  ReleaseLink,
  Video,
  Show,
  PressItem,
  GalleryImage,
  SocialLink,
  CustomLink,
  CareerHighlight,
  ArtistData,
  Plan,
} from '@/types';

const DEMO_SITE_ID = 'demo-jaylen-saint';
const DEMO_USER_ID = 'demo-user';

// -----------------------------------------------------------------------------
// Artist Site
// -----------------------------------------------------------------------------

export const demoSite: ArtistSite = {
  id: DEMO_SITE_ID,
  user_id: DEMO_USER_ID,
  slug: 'jaylensaint',
  status: 'published',
  onboarding_completed: true,
  artist_name: 'Jaylen Saint',
  real_name: 'Jaylen Marcus Williams',
  city: 'Phoenix, AZ',
  genre: 'Alternative Hip-Hop',
  tagline: 'Where the desert meets the divine',
  short_bio: `Phoenix-born artist blending introspective lyricism with atmospheric production. Known for raw storytelling and genre-defying sound.`,
  full_bio: `Jaylen Saint emerged from the Arizona music scene in 2019 with a distinct vision: create hip-hop that felt like a desert sunset—vast, reflective, and impossible to ignore.

Growing up in South Phoenix, Jaylen found solace in music, drawing inspiration from artists like Kid Cudi, Frank Ocean, and Bon Iver. His sound defies easy categorization, weaving together hip-hop, alternative R&B, and ambient textures into something uniquely his own.

His debut EP "Mirage" caught the attention of music blogs nationwide, praised for its vulnerable lyrics and innovative production. The project explored themes of identity, mental health, and finding peace in chaos—themes that continue to define his work.

Since then, Jaylen has sold out shows across the Southwest, collaborated with producers from Los Angeles to London, and built a devoted fanbase that spans the globe. His live performances are known for their emotional intensity, transforming venues into shared spaces of catharsis and connection.

Currently working on his debut album, Jaylen Saint continues to push boundaries and challenge expectations. For him, music isn't just art—it's survival.`,
  profile_image_url: '/demo/jaylen-profile.jpg',
  hero_image_url: '/demo/jaylen-hero.jpg',
  booking_email: 'booking@jaylensaint.com',
  management_email: 'mgmt@jaylensaint.com',
  press_email: 'press@jaylensaint.com',
  theme: 'night',
  accent_color: 'theme',
  font_pairing: 'modern',
  section_order: ['hero', 'music', 'videos', 'about', 'shows', 'press', 'gallery', 'contact'],
  hidden_sections: [],
  meta_title: 'Jaylen Saint | Alternative Hip-Hop Artist',
  meta_description: 'Phoenix-born artist blending introspective lyricism with atmospheric production. Official website and EPK.',
  public_plan: 'pro',
  published_at: '2024-01-15T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-06-01T00:00:00Z',
};

// -----------------------------------------------------------------------------
// Releases
// -----------------------------------------------------------------------------

export const demoReleases: (Release & { links: ReleaseLink[] })[] = [
  {
    id: 'release-1',
    site_id: DEMO_SITE_ID,
    title: 'NOCTURNE',
    type: 'single',
    cover_url: '/demo/nocturne-cover.jpg',
    release_date: '2024-03-15',
    description: 'Late-night reflections on growth and letting go. Produced by VNCE.',
    is_featured: true,
    sort_order: 0,
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z',
    links: [
      { id: 'link-1a', release_id: 'release-1', platform: 'spotify', url: 'https://open.spotify.com/track/example', sort_order: 0, created_at: '2024-03-15T00:00:00Z' },
      { id: 'link-1b', release_id: 'release-1', platform: 'apple', url: 'https://music.apple.com/album/example', sort_order: 1, created_at: '2024-03-15T00:00:00Z' },
      { id: 'link-1c', release_id: 'release-1', platform: 'youtube', url: 'https://youtube.com/watch?v=example', sort_order: 2, created_at: '2024-03-15T00:00:00Z' },
      { id: 'link-1d', release_id: 'release-1', platform: 'soundcloud', url: 'https://soundcloud.com/jaylensaint/nocturne', sort_order: 3, created_at: '2024-03-15T00:00:00Z' },
    ],
  },
  {
    id: 'release-2',
    site_id: DEMO_SITE_ID,
    title: 'Mirage',
    type: 'ep',
    cover_url: '/demo/mirage-cover.jpg',
    release_date: '2023-06-20',
    description: 'Five tracks exploring identity, isolation, and finding yourself in the desert.',
    is_featured: false,
    sort_order: 1,
    created_at: '2023-06-01T00:00:00Z',
    updated_at: '2023-06-20T00:00:00Z',
    links: [
      { id: 'link-2a', release_id: 'release-2', platform: 'spotify', url: 'https://open.spotify.com/album/example', sort_order: 0, created_at: '2023-06-20T00:00:00Z' },
      { id: 'link-2b', release_id: 'release-2', platform: 'apple', url: 'https://music.apple.com/album/example', sort_order: 1, created_at: '2023-06-20T00:00:00Z' },
      { id: 'link-2c', release_id: 'release-2', platform: 'bandcamp', url: 'https://jaylensaint.bandcamp.com/album/mirage', sort_order: 2, created_at: '2023-06-20T00:00:00Z' },
    ],
  },
  {
    id: 'release-3',
    site_id: DEMO_SITE_ID,
    title: 'Heatwave',
    type: 'single',
    cover_url: '/demo/heatwave-cover.jpg',
    release_date: '2022-08-12',
    description: 'Summer anthem with a melancholic edge.',
    is_featured: false,
    sort_order: 2,
    created_at: '2022-08-01T00:00:00Z',
    updated_at: '2022-08-12T00:00:00Z',
    links: [
      { id: 'link-3a', release_id: 'release-3', platform: 'spotify', url: 'https://open.spotify.com/track/example', sort_order: 0, created_at: '2022-08-12T00:00:00Z' },
      { id: 'link-3b', release_id: 'release-3', platform: 'apple', url: 'https://music.apple.com/album/example', sort_order: 1, created_at: '2022-08-12T00:00:00Z' },
    ],
  },
];

// -----------------------------------------------------------------------------
// Videos
// -----------------------------------------------------------------------------

export const demoVideos: Video[] = [
  {
    id: 'video-1',
    site_id: DEMO_SITE_ID,
    title: 'NOCTURNE (Official Video)',
    url: 'https://video.example.com/jaylensaint/nocturne',
    thumbnail_url: '/demo/nocturne-video-thumb.jpg',
    is_featured: true,
    sort_order: 0,
    created_at: '2024-03-20T00:00:00Z',
    updated_at: '2024-03-20T00:00:00Z',
  },
  {
    id: 'video-2',
    site_id: DEMO_SITE_ID,
    title: 'Live at The Van Buren',
    url: 'https://video.example.com/jaylensaint/live-at-the-van-buren',
    thumbnail_url: '/demo/live-thumb.jpg',
    is_featured: false,
    sort_order: 1,
    created_at: '2023-11-15T00:00:00Z',
    updated_at: '2023-11-15T00:00:00Z',
  },
];

// -----------------------------------------------------------------------------
// Shows
// -----------------------------------------------------------------------------

const today = new Date();
const futureDate = (daysFromNow: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
};

const pastDate = (daysAgo: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

export const demoShows: Show[] = [
  {
    id: 'show-1',
    site_id: DEMO_SITE_ID,
    event_name: 'Desert Nights Festival',
    venue: 'Rawhide Western Town',
    city: 'Chandler',
    state: 'AZ',
    country: 'USA',
    date: futureDate(45),
    time: '8:00 PM',
    ticket_url: 'https://example.com/tickets',
    is_sold_out: false,
    sort_order: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'show-2',
    site_id: DEMO_SITE_ID,
    event_name: 'Jaylen Saint Live',
    venue: 'The Rebel Lounge',
    city: 'Phoenix',
    state: 'AZ',
    country: 'USA',
    date: futureDate(21),
    time: '9:00 PM',
    ticket_url: 'https://example.com/tickets',
    is_sold_out: true,
    sort_order: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'show-3',
    site_id: DEMO_SITE_ID,
    event_name: 'Summer Sounds Series',
    venue: 'The Van Buren',
    city: 'Phoenix',
    state: 'AZ',
    country: 'USA',
    date: futureDate(60),
    time: '7:30 PM',
    ticket_url: 'https://example.com/tickets',
    is_sold_out: false,
    sort_order: 2,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'show-4',
    site_id: DEMO_SITE_ID,
    event_name: 'NOCTURNE Release Show',
    venue: 'Crescent Ballroom',
    city: 'Phoenix',
    state: 'AZ',
    country: 'USA',
    date: pastDate(30),
    time: '8:00 PM',
    ticket_url: null,
    is_sold_out: true,
    sort_order: 3,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// -----------------------------------------------------------------------------
// Press
// -----------------------------------------------------------------------------

export const demoPress: PressItem[] = [
  {
    id: 'press-1',
    site_id: DEMO_SITE_ID,
    publication: 'Phoenix New Times',
    headline: 'Best New Artists 2024',
    quote: "Jaylen Saint represents the future of Arizona hip-hop—introspective, innovative, and impossible to ignore.",
    article_url: 'https://example.com/article',
    date: '2024-02-15',
    sort_order: 0,
    created_at: '2024-02-15T00:00:00Z',
    updated_at: '2024-02-15T00:00:00Z',
  },
  {
    id: 'press-2',
    site_id: DEMO_SITE_ID,
    publication: 'Pigeons & Planes',
    headline: null,
    quote: "The kind of artist who makes you stop scrolling and actually listen.",
    article_url: 'https://example.com/article',
    date: '2023-08-20',
    sort_order: 1,
    created_at: '2023-08-20T00:00:00Z',
    updated_at: '2023-08-20T00:00:00Z',
  },
  {
    id: 'press-3',
    site_id: DEMO_SITE_ID,
    publication: 'Ones to Watch',
    headline: 'Desert Dreamers: Artists Redefining Southwest Sound',
    quote: "Saint's ability to balance vulnerability with confidence is rare. 'Mirage' is a masterclass in emotional storytelling.",
    article_url: 'https://example.com/article',
    date: '2023-07-10',
    sort_order: 2,
    created_at: '2023-07-10T00:00:00Z',
    updated_at: '2023-07-10T00:00:00Z',
  },
];

// -----------------------------------------------------------------------------
// Gallery
// -----------------------------------------------------------------------------

export const demoGallery: GalleryImage[] = [
  { id: 'gallery-1', site_id: DEMO_SITE_ID, url: '/demo/gallery-1.jpg', caption: 'Live at Crescent Ballroom', sort_order: 0, created_at: '2024-01-01T00:00:00Z' },
  { id: 'gallery-2', site_id: DEMO_SITE_ID, url: '/demo/gallery-2.jpg', caption: 'Studio session', sort_order: 1, created_at: '2024-01-01T00:00:00Z' },
  { id: 'gallery-3', site_id: DEMO_SITE_ID, url: '/demo/gallery-3.jpg', caption: 'Desert photoshoot', sort_order: 2, created_at: '2024-01-01T00:00:00Z' },
  { id: 'gallery-4', site_id: DEMO_SITE_ID, url: '/demo/gallery-4.jpg', caption: 'NOCTURNE video behind the scenes', sort_order: 3, created_at: '2024-01-01T00:00:00Z' },
  { id: 'gallery-5', site_id: DEMO_SITE_ID, url: '/demo/gallery-5.jpg', caption: 'Festival performance', sort_order: 4, created_at: '2024-01-01T00:00:00Z' },
  { id: 'gallery-6', site_id: DEMO_SITE_ID, url: '/demo/gallery-6.jpg', caption: 'Press photo', sort_order: 5, created_at: '2024-01-01T00:00:00Z' },
];

// -----------------------------------------------------------------------------
// Social Links
// -----------------------------------------------------------------------------

export const demoSocials: SocialLink[] = [
  { id: 'social-1', site_id: DEMO_SITE_ID, platform: 'instagram', url: 'https://instagram.com/jaylensaint', sort_order: 0, created_at: '2024-01-01T00:00:00Z' },
  { id: 'social-2', site_id: DEMO_SITE_ID, platform: 'tiktok', url: 'https://tiktok.com/@jaylensaint', sort_order: 1, created_at: '2024-01-01T00:00:00Z' },
  { id: 'social-3', site_id: DEMO_SITE_ID, platform: 'youtube', url: 'https://youtube.com/@jaylensaint', sort_order: 2, created_at: '2024-01-01T00:00:00Z' },
  { id: 'social-4', site_id: DEMO_SITE_ID, platform: 'x', url: 'https://x.com/jaylensaint', sort_order: 3, created_at: '2024-01-01T00:00:00Z' },
  { id: 'social-5', site_id: DEMO_SITE_ID, platform: 'spotify', url: 'https://open.spotify.com/artist/example', sort_order: 4, created_at: '2024-01-01T00:00:00Z' },
];

// -----------------------------------------------------------------------------
// Custom Links
// -----------------------------------------------------------------------------

export const demoLinks: CustomLink[] = [
  { id: 'clink-1', site_id: DEMO_SITE_ID, label: 'Listen Now', url: 'https://open.spotify.com/artist/example', icon: 'music', is_primary: true, sort_order: 0, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'clink-2', site_id: DEMO_SITE_ID, label: 'Watch NOCTURNE', url: 'https://youtube.com/watch?v=example', icon: 'video', is_primary: true, sort_order: 1, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'clink-3', site_id: DEMO_SITE_ID, label: 'Get Tickets', url: 'https://example.com/tickets', icon: 'ticket', is_primary: true, sort_order: 2, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'clink-4', site_id: DEMO_SITE_ID, label: 'Merch', url: 'https://example.com/merch', icon: 'store', is_primary: false, sort_order: 3, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
];

// -----------------------------------------------------------------------------
// Career Highlights
// -----------------------------------------------------------------------------

export const demoHighlights: CareerHighlight[] = [
  { id: 'highlight-1', site_id: DEMO_SITE_ID, text: '500K+ Spotify Streams', sort_order: 0, created_at: '2024-01-01T00:00:00Z' },
  { id: 'highlight-2', site_id: DEMO_SITE_ID, text: 'Sold Out The Van Buren', sort_order: 1, created_at: '2024-01-01T00:00:00Z' },
  { id: 'highlight-3', site_id: DEMO_SITE_ID, text: 'Featured on Spotify\'s Fresh Finds', sort_order: 2, created_at: '2024-01-01T00:00:00Z' },
  { id: 'highlight-4', site_id: DEMO_SITE_ID, text: 'Phoenix New Times Best New Artist', sort_order: 3, created_at: '2024-01-01T00:00:00Z' },
];

// -----------------------------------------------------------------------------
// Complete Demo Artist Data
// -----------------------------------------------------------------------------

export const demoArtistData: ArtistData = {
  site: demoSite,
  releases: demoReleases,
  videos: demoVideos,
  shows: demoShows,
  press: demoPress,
  gallery: demoGallery,
  socials: demoSocials,
  links: demoLinks,
  highlights: demoHighlights,
  plan: 'pro' as Plan,
};

// -----------------------------------------------------------------------------
// Demo Analytics Data
// -----------------------------------------------------------------------------

export const demoAnalytics = {
  total_views: 12847,
  unique_visitors: 8234,
  total_clicks: 3421,
  epk_views: 456,
  pdf_downloads: 89,
  sources: [
    { source: 'instagram.com', count: 420 },
    { source: 'direct', count: 310 },
  ],
  top_links: [
    { label: 'Spotify', clicks: 1245 },
    { label: 'Instagram', clicks: 876 },
    { label: 'Get Tickets', clicks: 534 },
    { label: 'Apple Music', clicks: 423 },
    { label: 'YouTube', clicks: 343 },
  ],
  views_by_day: Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split('T')[0],
      views: Math.floor(Math.random() * 300) + 200 + (i > 20 ? 150 : 0),
    };
  }),
};
