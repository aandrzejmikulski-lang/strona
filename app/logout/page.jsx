"use client"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function LogoutPage() {
  const router = useRouter()

  const logout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <button onClick={logout}>
      Wyloguj
    </button>
  )
}
