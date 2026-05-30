import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

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
        remove(name) {
          res.cookies.delete(name)
        }
      }
    }
  )

  const {
    data: { user }
  } = await supabase.auth.getUser()

  const url = req.nextUrl.pathname

  // Brak sesji → redirect do logowania
  if (!user && (url.startsWith("/user") || url.startsWith("/admin"))) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Admin-only
  if (url.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)   // ← teraz TS wie, że user istnieje
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/user/dashboard", req.url))
    }
  }

  return res
}

export const config = {
  matcher: ["/user/:path*", "/admin/:path*"]
}
