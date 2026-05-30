"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"

export default function UserTicketsPage() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTickets()
  }, [])

  const loadTickets = async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser()

    const { data } = await supabase
      .from("tickets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    setTickets(data || [])
    setLoading(false)
  }

  if (loading) return <p>Ładowanie...</p>

  return (
    <div style={{ maxWidth: 800, margin: "40px auto" }}>
      <h2>Twoje zgłoszenia</h2>

      <Link href="/user/tickets/new">
        <button style={{ marginBottom: 20 }}>+ Dodaj zgłoszenie</button>
      </Link>

      {tickets.length === 0 && <p>Nie masz jeszcze zgłoszeń</p>}

      <ul>
        {tickets.map((t) => (
          <li key={t.id} style={{ marginBottom: 15 }}>
            <strong>{t.title}</strong> — {t.status}
            <p>{t.description}</p>
            {t.admin_comment && (
              <p><em>Komentarz admina: {t.admin_comment}</em></p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
