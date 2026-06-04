import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          res.cookies.set(name, value, options);
        },
        remove(name, options) {
          res.cookies.delete(name, options);
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = req.nextUrl.pathname;

  // 🔒 1. Brak sesji → login
  if (!user) {
    if (!path.startsWith("/login")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return res;
  }

  // 🔍 2. Pobierz profil
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = String(profile.role).trim().toLowerCase();

  // ============================================================
  // 🔥 3. ADMIN
  // ============================================================

  if (role === "admin") {
    // Admin NIE może wejść na user dashboard
    if (path.startsWith("/user") || path.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    // Admin ma pełny dostęp
    return res;
  }

  // ============================================================
  // 🔥 4. USER
  // ============================================================

  // User NIE może wejść na /admin/*
  if (path.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/403", req.url));
  }

  // User NIEAKTYWNY
  if (!profile.is_active) {
    if (!path.startsWith("/pending-approval")) {
      return NextResponse.redirect(new URL("/pending-approval", req.url));
    }
    return res;
  }

  // User AKTYWNY, ALE BEZ WSPÓLNOTY
  if (!profile.community_id) {
    if (!path.startsWith("/select-community")) {
      return NextResponse.redirect(new URL("/select-community", req.url));
    }
    return res;
  }

  // User wchodzi na /dashboard → przekieruj na /user/dashboard
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
    "/",
  ],
};
