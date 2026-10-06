// =============================================================================
// PRESSKIT - Plans & Features Configuration
// =============================================================================
// Centralized plan definitions - do not scatter plan logic across UI files

import { Plan, ThemeName } from '@/types';

export interface PlanFeature {
  key: string;
  label: string;
  free: boolean;
  pro: boolean;
  lifetime: boolean;
}

export interface PlanConfig {
  id: Plan;
  name: string;
  description: string;
  price: {
    monthly: number | null;
    yearly: number | null;
    lifetime: number | null;
  };
  features: string[];
  highlighted?: boolean;
}

// -----------------------------------------------------------------------------
// Plan Definitions
// -----------------------------------------------------------------------------

export const PLANS: Record<Plan, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Get started with your artist presence',
    price: {
      monthly: 0,
      yearly: 0,
      lifetime: null,
    },
    features: [
      'PRESSKIT subdomain',
      'Basic themes',
      'Music streaming links',
      'Social media links',
      'Artist bio',
      'Basic EPK page',
      '7-day audience snapshot',
      'PRESSKIT branding',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'Everything you need to look professional',
    price: {
      monthly: 9.99,
      yearly: 79,
      lifetime: null,
    },
    features: [
      'All Free features',
      'Premium themes',
      'Remove PRESSKIT branding',
      'Extended audience history',
      'Downloadable PDF EPK',
      'Custom domain support',
      'Unlimited media uploads',
      'Advanced customization',
      'Priority support',
    ],
    highlighted: true,
  },
  lifetime: {
    id: 'lifetime',
    name: 'Founding Artist',
    description: 'One-time payment, lifetime access',
    price: {
      monthly: null,
      yearly: null,
      lifetime: 49,
    },
    features: [
      'All Pro features forever',
      'Founding Artist badge',
      'Early access to new features',
      'Direct founder support',
      'Never pay again',
    ],
  },
};

// -----------------------------------------------------------------------------
// Feature Flags by Plan
// -----------------------------------------------------------------------------

export const FEATURES: PlanFeature[] = [
  { key: 'basic_themes', label: 'Basic Themes', free: true, pro: true, lifetime: true },
  { key: 'premium_themes', label: 'Premium Themes', free: false, pro: true, lifetime: true },
  { key: 'remove_branding', label: 'Remove PRESSKIT Branding', free: false, pro: true, lifetime: true },
  { key: 'basic_audience', label: '7-day audience snapshot', free: true, pro: true, lifetime: true },
  { key: 'analytics', label: 'Extended audience history', free: false, pro: true, lifetime: true },
  { key: 'pdf_export', label: 'PDF EPK Export', free: false, pro: true, lifetime: true },
  { key: 'custom_domain', label: 'Custom Domain', free: false, pro: true, lifetime: true },
  { key: 'unlimited_uploads', label: 'Unlimited Media Uploads', free: false, pro: true, lifetime: true },
  { key: 'advanced_customization', label: 'Advanced Customization', free: false, pro: true, lifetime: true },
];

// Free plan limits
export const FREE_LIMITS = {
  gallery_images: 6,
  releases: 5,
  videos: 3,
  highlights: 5,
};

// Premium themes that require Pro
export const PREMIUM_THEMES: ThemeName[] = ['neon'];
export const FREE_THEMES: ThemeName[] = ['editorial', 'night', 'minimal'];

// -----------------------------------------------------------------------------
// Plan Entitlement Helpers
// -----------------------------------------------------------------------------

export function canUseFeature(plan: Plan, feature: string): boolean {
  const featureConfig = FEATURES.find((f) => f.key === feature);
  if (!featureConfig) return false;
  return featureConfig[plan];
}

/** 30- and 90-day history plus traffic sources. Every plan can see a 7-day audience snapshot. */
export function canUseAnalytics(plan: Plan): boolean {
  return plan === 'pro' || plan === 'lifetime';
}

export function canRemoveBranding(plan: Plan): boolean {
  return plan === 'pro' || plan === 'lifetime';
}

export function canDownloadPDF(plan: Plan): boolean {
  return plan === 'pro' || plan === 'lifetime';
}

export function canUsePremiumTheme(plan: Plan, theme: ThemeName): boolean {
  if (!PREMIUM_THEMES.includes(theme)) return true;
  return plan === 'pro' || plan === 'lifetime';
}

export function canUseCustomDomain(plan: Plan): boolean {
  return plan === 'pro' || plan === 'lifetime';
}

export function getUploadLimit(plan: Plan): number {
  if (plan === 'free') return FREE_LIMITS.gallery_images;
  return Infinity;
}

export function isPro(plan: Plan): boolean {
  return plan === 'pro' || plan === 'lifetime';
}

// -----------------------------------------------------------------------------
// Pricing Display Helpers
// -----------------------------------------------------------------------------

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function getMonthlyEquivalent(yearlyPrice: number): number {
  return Math.round((yearlyPrice / 12) * 100) / 100;
}

export function getYearlySavings(): number {
  const monthlyTotal = PLANS.pro.price.monthly! * 12;
  const yearlyPrice = PLANS.pro.price.yearly!;
  return Math.round(monthlyTotal - yearlyPrice);
}
