"use client"

import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function UserLayout({ children }) {
  const router = useRouter()

  const logout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div>
      <nav style={{ padding: 20, borderBottom: "1px solid #ddd" }}>
        <Link href="/user/dashboard" style={{ marginRight: 20 }}>Dashboard</Link>
        <Link href="/user/tickets" style={{ marginRight: 20 }}>Zgłoszenia</Link>
        <Link href="/user/tickets/new" style={{ marginRight: 20 }}>Nowe zgłoszenie</Link>

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
