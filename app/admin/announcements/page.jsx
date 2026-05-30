"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const loadAnnouncements = async () => {
    const { data, error } = await supabase
      .from("announcements")
      .select(`
        *,
        announcement_communities (
          community_id,
          communities (name)
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      setError("Błąd podczas pobierania ogłoszeń")
    } else {
      setAnnouncements(data)
    }

    setLoading(false)
  }

  const archiveAnnouncement = async (id) => {
    await supabase.from("announcements").update({ is_archived: true }).eq("id", id)
    loadAnnouncements()
  }

  const deleteAnnouncement = async (id) => {
    await supabase.from("announcements").delete().eq("id", id)
    loadAnnouncements()
  }

  if (loading) return <p>Ładowanie...</p>

  return (
    <div style={{ maxWidth: 900, margin: "40px auto" }}>
      <h2>Ogłoszenia</h2>

      <Link href="/admin/announcements/new">
        <button style={{ marginBottom: 20 }}>+ Dodaj ogłoszenie</button>
      </Link>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <table width="100%" border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Tytuł</th>
            <th>Widoczność</th>
            <th>Daty</th>
            <th>Wspólnoty</th>
            <th>Archiwum?</th>
            <th>Akcje</th>
          </tr>
        </thead>

        <tbody>
          {announcements.map((a) => (
            <tr key={a.id}>
              <td>{a.title}</td>

              <td>
                {a.visibility === "all" ? "Wszystkie wspólnoty" : "Wybrane wspólnoty"}
              </td>

              <td>
                od: {a.start_date}
                <br />
                do: {a.end_date || "—"}
              </td>

              <td>
                {a.visibility === "all" && "— (globalne)"}

                {a.visibility === "selected" &&
                  a.announcement_communities.map((ac) => (
                    <div key={ac.community_id}>{ac.communities.name}</div>
                  ))}
              </td>

              <td>{a.is_archived ? "TAK" : "NIE"}</td>

              <td>
                <Link href={`/admin/announcements/${a.id}/edit`}>
                  <button>Edytuj</button>
                </Link>

                {!a.is_archived && (
                  <button
                    style={{ marginLeft: 8 }}
                    onClick={() => archiveAnnouncement(a.id)}
                  >
                    Archiwizuj
                  </button>
                )}

                <button
                  style={{ marginLeft: 8 }}
                  onClick={() => deleteAnnouncement(a.id)}
                >
                  Usuń
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
