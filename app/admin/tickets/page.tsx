"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadTickets()
  }, [])

  const loadTickets = async () => {
    const { data, error } = await supabase
      .from("tickets")
      .select(`
        *,
        profiles:profiles(full_name, email)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      setError("Błąd podczas pobierania zgłoszeń")
    } else {
      setTickets(data || [])
    }

    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("tickets").update({ status }).eq("id", id)
    loadTickets()
  }

  const updateComment = async (id: string, comment: string) => {
    await supabase.from("tickets").update({ admin_comment: comment }).eq("id", id)
    loadTickets()
  }

  const deleteTicket = async (id: string) => {
    await supabase.from("tickets").delete().eq("id", id)
    loadTickets()
  }

  if (loading) return <p>Ładowanie...</p>

  return (
    <div style={{ maxWidth: 1000, margin: "40px auto" }}>
      <h2>Zgłoszenia użytkowników</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <table
        style={{
          width: "100%",
          border: "1px solid black",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            <th>Tytuł</th>
            <th>Opis</th>
            <th>Użytkownik</th>
            <th>Status</th>
            <th>Komentarz admina</th>
            <th>Akcje</th>
          </tr>
        </thead>

        <tbody>
          {tickets.map((t) => (
            <tr key={t.id}>
              <td>{t.title}</td>
              <td>{t.description}</td>
              <td>
                {t.profiles?.full_name}
                <br />
                <small>{t.profiles?.email}</small>
              </td>

              <td>
                <select
                  value={t.status}
                  onChange={(e) => updateStatus(t.id, e.target.value)}
                >
                  <option value="new">Nowe</option>
                  <option value="in_progress">W trakcie</option>
                  <option value="done">Zakończone</option>
                  <option value="rejected">Odrzucone</option>
                </select>
              </td>

              <td>
                <textarea
                  defaultValue={t.admin_comment || ""}
                  onBlur={(e) => updateComment(t.id, e.target.value)}
                  style={{ width: "100%", height: 60 }}
                />
              </td>

              <td>
                <button onClick={() => deleteTicket(t.id)}>Usuń</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
