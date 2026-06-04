import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req) {
  const res = NextResponse.next();
  const path = req.nextUrl.pathname;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  // ============================================================
  // 1. BRAK SESJI → /login
  // ============================================================
  if (!user) {
    if (!path.startsWith("/login")) {
      return NextResponse.redirect("/login");
    }
    return res;
  }

  // ============================================================
  // 2. POBIERZ PROFIL
  // ============================================================
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.redirect("/login");
  }

  const role = String(profile.role).trim().toLowerCase();

  // ============================================================
  // 3. ADMIN
  // ============================================================
  if (role === "admin") {
    if (path.startsWith("/user") || path.startsWith("/dashboard")) {
      return NextResponse.redirect("/admin");
    }
    return res;
  }

  // ============================================================
  // 4. USER
  // ============================================================

  // User NIE może wejść na /admin/*
  if (path.startsWith("/admin")) {
    return NextResponse.redirect("/403");
  }

  // User NIEAKTYWNY
  if (!profile.is_active) {
    if (!path.startsWith("/pending-approval")) {
      return NextResponse.redirect("/pending-approval");
    }
    return res;
  }

  // User AKTYWNY, ALE BEZ WSPÓLNOTY
  if (!profile.community_id) {
    if (!path.startsWith("/select-community")) {
      return NextResponse.redirect("/select-community");
    }
    return res;
  }

  // /dashboard → /user/dashboard
  if (path.startsWith("/dashboard")) {
    return NextResponse.redirect("/user/dashboard");
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
