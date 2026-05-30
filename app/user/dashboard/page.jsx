"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function UserDashboard() {
  const [profile, setProfile] = useState(null)
  const [tickets, setTickets] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    // Pobieramy usera
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) return

    // Pobieramy profil
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    setProfile(profileData)

    // Pobieramy zgłoszenia użytkownika
    const { data: ticketsData } = await supabase
      .from("tickets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    setTickets(ticketsData || [])

    // Pobieramy ogłoszenia
    const { data: announcementsData } = await supabase
      .from("announcements")
      .select("*")
      .eq("is_archived", false)
      .order("created_at", { ascending: false })

    setAnnouncements(announcementsData || [])

    setLoading(false)
  }

  if (loading) return <p>Ładowanie...</p>

  return (
    <div style={{ maxWidth: 900, margin: "40px auto" }}>
      <h2>Panel użytkownika</h2>

      <section style={{ marginBottom: 40 }}>
        <h3>Twój profil</h3>
        <p><strong>Imię i nazwisko:</strong> {profile.full_name}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Telefon:</strong> {profile.phone || "-"}</p>
        <p><strong>Wspólnota:</strong> {profile.wspolnota_id || "-"}</p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h3>Ogłoszenia</h3>
        {announcements.length === 0 && <p>Brak ogłoszeń</p>}

        <ul>
          {announcements.map((a) => (
            <li key={a.id} style={{ marginBottom: 10 }}>
              <strong>{a.title}</strong>
              <p>{a.content}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Twoje zgłoszenia</h3>
        {tickets.length === 0 && <p>Nie masz jeszcze zgłoszeń</p>}

        <ul>
          {tickets.map((t) => (
            <li key={t.id} style={{ marginBottom: 10 }}>
              <strong>{t.title}</strong> — {t.status}
              <p>{t.description}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
