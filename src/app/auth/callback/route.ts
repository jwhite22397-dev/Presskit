import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/env";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/onboarding";
  const destination = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  if (code && !isDemoMode()) {
    const supabase = await createServerSupabase();
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(new URL(destination, url.origin));
}
