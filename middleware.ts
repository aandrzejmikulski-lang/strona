import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req) {
  const res = NextResponse.next();
  const path = req.nextUrl.pathname;

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

  if (!user) {
    if (!path.startsWith("/login")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return res;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // PROFIL NIE ISTNIEJE → UZUPEŁNIENIE PROFILU
  if (!profile) {
    if (!path.startsWith("/complete-profile")) {
      return NextResponse.redirect(new URL("/complete-profile", req.url));
    }
    return res;
  }

  const role = String(profile.role).trim().toLowerCase();

  if (role === "admin") {
    if (path.startsWith("/user") || path.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return res;
  }

  if (path.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/403", req.url));
  }

  if (!profile.is_active) {
    if (!path.startsWith("/pending-approval")) {
      return NextResponse.redirect(new URL("/pending-approval", req.url));
    }
    return res;
  }

  if (!profile.community_id) {
    if (!path.startsWith("/select-community")) {
      return NextResponse.redirect(new URL("/select-community", req.url));
    }
    return res;
  }

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
