"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function AdminCommunitiesPage() {
  const [communities, setCommunities] = useState([])
  const [newName, setNewName] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadCommunities()
  }, [])

  const loadCommunities = async () => {
    const { data, error } = await supabase
      .from("communities")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      setError("Błąd podczas pobierania wspólnot")
    } else {
      setCommunities(data)
    }

    setLoading(false)
  }

  const addCommunity = async () => {
    if (!newName.trim()) return

    const { error } = await supabase
      .from("communities")
      .insert({ name: newName })

    if (error) {
      setError("Nie udało się dodać wspólnoty")
      return
    }

    setNewName("")
    loadCommunities()
  }

  const deleteCommunity = async (id) => {
    await supabase.from("communities").delete().eq("id", id)
    loadCommunities()
  }

  if (loading) return <p>Ładowanie...</p>

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h2>Wspólnoty</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Nazwa nowej wspólnoty"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          style={{ padding: 8, width: "70%", marginRight: 10 }}
        />
        <button onClick={addCommunity}>Dodaj</button>
      </div>

      <table width="100%" border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Nazwa</th>
            <th>Akcje</th>
          </tr>
        </thead>

        <tbody>
          {communities.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>
                <button onClick={() => deleteCommunity(c.id)}>Usuń</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
