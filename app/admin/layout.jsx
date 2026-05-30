"use client"

import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function AdminLayout({ children }) {
  const router = useRouter()

  const logout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div>
      <nav style={{ padding: 20, borderBottom: "1px solid #ddd" }}>
        <Link href="/admin/users" style={{ marginRight: 20 }}>Użytkownicy</Link>
        <Link href="/admin/communities" style={{ marginRight: 20 }}>Wspólnoty</Link>
        <Link href="/admin/tickets" style={{ marginRight: 20 }}>Zgłoszenia</Link>
        <Link href="/admin/announcements" style={{ marginRight: 20 }}>Ogłoszenia</Link>

        <button onClick={logout} style={{ marginLeft: 20 }}>
          Wyloguj
        </button>
      </nav>

      <div style={{ padding: 20 }}>
        {children}
      </div>
    </div>
  )
}
