export type AppMode = "demo" | "supabase";

function looksConfigured(value: string | undefined) {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("your_")) return false;
  if (trimmed.includes("your_supabase")) return false;
  if (trimmed.includes("your_stripe")) return false;
  return true;
}

export function isSupabaseConfigured() {
  return looksConfigured(process.env.NEXT_PUBLIC_SUPABASE_URL) && looksConfigured(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function appMode(): AppMode {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return "demo";
  if (!isSupabaseConfigured()) return "demo";
  return "supabase";
}

export function isDemoMode() {
  return appMode() === "demo";
}

export function requireServerEnv(name: string) {
  const value = process.env[name];
  if (!looksConfigured(value)) {
    throw new Error(`Missing required environment variable ${name}. See .env.example.`);
  }
  return value as string;
}
