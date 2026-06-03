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

  // 🔒 Brak sesji → login
  if (!user) {
    if (!req.nextUrl.pathname.startsWith("/login")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return res;
  }

  // 🔍 Pobierz profil
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = String(profile.role).trim().toLowerCase();

  // 🔥 ADMIN → pełny dostęp, żadnych redirectów
  if (role === "admin") {
    return res;
  }

  // 🔥 USER → poprawka przekierowania
  // Jeśli user wejdzie na /dashboard → przekieruj na /user/dashboard
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/user/dashboard", req.url));
  }

  // 🔥 USER NIEAKTYWNY
  if (!profile.is_active) {
    if (!req.nextUrl.pathname.startsWith("/pending-approval")) {
      return NextResponse.redirect(new URL("/pending-approval", req.url));
    }
    return res;
  }

  // 🔥 USER AKTYWNY, ALE BEZ WSPÓLNOTY
  if (!profile.community_id) {
    if (!req.nextUrl.pathname.startsWith("/select-community")) {
      return NextResponse.redirect(new URL("/select-community", req.url));
    }
    return res;
  }

  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/user/:path*",
  ],
};
