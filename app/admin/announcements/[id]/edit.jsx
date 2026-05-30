"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter, useParams } from "next/navigation"

export default function EditAnnouncementPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [visibility, setVisibility] = useState("all")
  const [communities, setCommunities] = useState([])
  const [selectedCommunities, setSelectedCommunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: announcement } = await supabase
      .from("announcements")
      .select(`
        *,
        announcement_communities (community_id)
      `)
      .eq("id", id)
      .single()

    if (!announcement) {
      setError("Nie znaleziono ogłoszenia")
      return
    }

    setTitle(announcement.title)
    setContent(announcement.content)
    setStartDate(announcement.start_date)
    setEndDate(announcement.end_date || "")
    setVisibility(announcement.visibility)
    setSelectedCommunities(
      announcement.announcement_communities.map((ac) => ac.community_id)
    )

    const { data: comms } = await supabase
      .from("communities")
      .select("*")
      .order("name", { ascending: true })

    setCommunities(comms || [])
    setLoading(false)
  }

  const toggleCommunity = (id) => {
    if (selectedCommunities.includes(id)) {
      setSelectedCommunities(selectedCommunities.filter((c) => c !== id))
    } else {
      setSelectedCommunities([...selectedCommunities, id])
    }
  }

  const saveAnnouncement = async (e) => {
    e.preventDefault()

    const { error: updateError } = await supabase
      .from("announcements")
      .update({
        title,
        content,
        start_date: startDate,
        end_date: endDate || null,
        visibility
      })
      .eq("id", id)

    if (updateError) {
      setError("Nie udało się zapisać zmian")
      return
    }

    // Usuwamy stare powiązania
    await supabase
      .from("announcement_communities")
      .delete()
      .eq("announcement_id", id)

    // Dodajemy nowe powiązania
    if (visibility === "selected") {
      for (const communityId of selectedCommunities) {
        await supabase.from("announcement_communities").insert({
          announcement_id: id,
          community_id: communityId
        })
      }
    }

    router.push("/admin/announcements")
  }

  if (loading) return <p>Ładowanie...</p>

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h2>Edytuj ogłoszenie</h2>

      <form onSubmit={saveAnnouncement}>
        <input
          type="text"
          placeholder="Tytuł"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />

        <textarea
          placeholder="Treść ogłoszenia"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />

        <label>Data od:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />

        <label>Data do (opcjonalnie):</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />

        <label>Widoczność:</label>
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        >
          <option value="all">Dla wszystkich wspólnot</option>
          <option value="selected">Dla wybranych wspólnot</option>
        </select>

        {visibility === "selected" && (
          <div style={{ marginBottom: 20 }}>
            <h4>Wybierz wspólnoty:</h4>
            {communities.map((c) => (
              <label key={c.id} style={{ display: "block" }}>
                <input
                  type="checkbox"
                  checked={selectedCommunities.includes(c.id)}
                  onChange={() => toggleCommunity(c.id)}
                />
                {c.name}
              </label>
            ))}
          </div>
        )}

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit">Zapisz zmiany</button>
      </form>
    </div>
  )
}
