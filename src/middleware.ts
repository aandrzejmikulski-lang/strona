import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(req) {
  const res = NextResponse.next()

  // Tworzymy klienta Supabase (SSR)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value
        },
        set(name, value, options) {
          res.cookies.set(name, value, options)
        },
        remove(name, options) {
          res.cookies.delete(name, options)
        }
      }
    }
  )

  // Pobieramy sesję
  const {
    data: { user }
  } = await supabase.auth.getUser()

  const url = req.nextUrl.pathname

  // Jeśli user nie jest zalogowany → redirect do logowania
  if (!user && (url.startsWith("/user") || url.startsWith("/admin"))) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Jeśli user jest zalogowany → pobieramy jego profil
  let profile = null

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    profile = data
  }

  // 🔥 BLOKADA: konto nieaktywne
  if (profile && profile.is_active === false) {
    return NextResponse.redirect(new URL("/pending-approval", req.url))
  }

  // 🔥 BLOKADA: user aktywny, ale nie wybrał wspólnoty
  if (
    profile &&
    profile.is_active === true &&
    profile.wspolnota_id === null &&
    url !== "/select-community"
  ) {
    return NextResponse.redirect(new URL("/select-community", req.url))
  }

  // 🔥 BLOKADA: tylko admin może wejść do /admin/*
  if (url.startsWith("/admin")) {
    if (!profile || profile.role !== "admin") {
      return NextResponse.redirect(new URL("/user/dashboard", req.url))
    }
  }

  return res
}

export const config = {
  matcher: ["/user/:path*", "/admin/:path*"]
}
