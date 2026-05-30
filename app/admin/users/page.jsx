"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      setError("Błąd podczas pobierania użytkowników")
    } else {
      setUsers(data)
    }

    setLoading(false)
  }

  const activateUser = async (id) => {
    await supabase.from("profiles").update({ is_active: true }).eq("id", id)
    loadUsers()
  }

  const deleteUser = async (id) => {
    await supabase.from("profiles").delete().eq("id", id)
    loadUsers()
  }

  const makeAdmin = async (id) => {
    await supabase.from("profiles").update({ role: "admin" }).eq("id", id)
    loadUsers()
  }

  const removeAdmin = async (id) => {
    await supabase.from("profiles").update({ role: "user" }).eq("id", id)
    loadUsers()
  }

  if (loading) return <p>Ładowanie...</p>

  return (
    <div style={{ maxWidth: 900, margin: "40px auto" }}>
      <h2>Użytkownicy</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <table width="100%" border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Imię i nazwisko</th>
            <th>Email</th>
            <th>Telefon</th>
            <th>Rola</th>
            <th>Aktywny?</th>
            <th>Wspólnota</th>
            <th>Akcje</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.full_name}</td>
              <td>{u.email}</td>
              <td>{u.phone || "-"}</td>
              <td>{u.role}</td>
              <td>{u.is_active ? "TAK" : "NIE"}</td>
              <td>{u.wspolnota_id ? u.wspolnota_id : "-"}</td>

              <td>
                {!u.is_active && (
                  <button onClick={() => activateUser(u.id)}>Akceptuj</button>
                )}

                <button
                  style={{ marginLeft: 8 }}
                  onClick={() => deleteUser(u.id)}
                >
                  Usuń
                </button>

                {u.role !== "admin" && (
                  <button
                    style={{ marginLeft: 8 }}
                    onClick={() => makeAdmin(u.id)}
                  >
                    Nadaj admina
                  </button>
                )}

                {u.role === "admin" && (
                  <button
                    style={{ marginLeft: 8 }}
                    onClick={() => removeAdmin(u.id)}
                  >
                    Usuń admina
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
