// /middleware.ts
import { NextResponse, NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Profile } from "./types/supabase-types";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const path = req.nextUrl.pathname;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res.cookies.set(name, value, options);
        },
        remove(name: string, options: any) {
          res.cookies.delete(name, options);
        },
      },
    }
  );

  // 🔥 Pobierz usera
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 🔥 Brak usera → login
  if (!user) {
    if (!path.startsWith("/login")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return res;
  }

  // 🔥 Pobierz profil
  const { data: profile } = (await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()) as { data: Profile | null };

  // 🔥 Brak profilu → complete-profile
  if (!profile) {
    if (!path.startsWith("/complete-profile")) {
      return NextResponse.redirect(new URL("/complete-profile", req.url));
    }
    return res;
  }

  const role = String(profile.role).trim().toLowerCase();

  // 🔥 ADMIN → pełny dostęp, ale nie do user/dashboard
  if (role === "admin") {
    if (path.startsWith("/user") || path.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return res;
  }

  // 🔥 USER → blokada wejścia do /admin
  if (path.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/403", req.url));
  }

  // 🔥 USER nieaktywny → pending-approval
  if (!profile.is_active) {
    if (!path.startsWith("/pending-approval")) {
      return NextResponse.redirect(new URL("/pending-approval", req.url));
    }
    return res;
  }

  // 🔥 USER aktywny, ale bez wspólnoty → select-community
  if (!profile.community_id) {
    if (!path.startsWith("/select-community")) {
      return NextResponse.redirect(new URL("/select-community", req.url));
    }
    return res;
  }

  // 🔥 USER → /dashboard przekieruj na /user/dashboard
  if (path.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/user/dashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/user/:path*",
    "/pending-approval",
    "/select-community",
    "/complete-profile",
    "/",
  ],
};
