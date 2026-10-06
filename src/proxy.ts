import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isDemoMode, isSupabaseConfigured } from "@/lib/env";
import { referralSlug } from "@/lib/referral";
import { isAdminUser, sessionSecret } from "@/lib/server-env";
import { DEMO_COOKIE, REF_COOKIE, verifySignedUserId } from "@/lib/session";

function attachReferral(request: NextRequest, response: NextResponse) {
  const ref = referralSlug(request.nextUrl.searchParams.get("ref"));
  if (ref) {
    response.cookies.set(REF_COOKIE, ref, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const protectedPath = pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding") || pathname.startsWith("/admin");

  if (isDemoMode() || !isSupabaseConfigured()) {
    if (!protectedPath) return attachReferral(request, NextResponse.next());
    const userId = await verifySignedUserId(request.cookies.get(DEMO_COOKIE)?.value, sessionSecret());
    if (!userId) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return attachReferral(request, NextResponse.redirect(url));
    }
    if (pathname.startsWith("/admin") && !isAdminUser(userId)) {
      return attachReferral(request, NextResponse.redirect(new URL("/dashboard", request.url)));
    }
    return attachReferral(request, NextResponse.next());
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data } = await supabase.auth.getUser();
  if (protectedPath && !data.user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return attachReferral(request, NextResponse.redirect(url));
  }
  if (pathname.startsWith("/admin") && data.user && !isAdminUser(data.user.id)) {
    return attachReferral(request, NextResponse.redirect(new URL("/dashboard", request.url)));
  }
  return attachReferral(request, response);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
