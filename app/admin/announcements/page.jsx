"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "../../../lib/supabaseBrowser";

export default function AdminAnnouncementsPage() {
  const supabase = getSupabaseBrowserClient();

  const [announcements, setAnnouncements] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [search, setSearch] = useState("");

  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  async function loadData() {
    const { data: anns } = await supabase.from("announcements").select("*");
    const { data: comms } = await supabase.from("communities").select("*");

    setAnnouncements(anns || []);
    setCommunities(comms || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const activeAnnouncements = announcements.filter(
    (a) =>
      a.is_archived === false &&
      a.start_date <= today &&
      a.end_date >= today
  );

  const archivedAnnouncements = announcements.filter(
    (a) =>
      a.is_archived === true ||
      a.end_date < today
  );

  const filteredAnnouncements = activeAnnouncements.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  async function addAnnouncement({
    title,
    content,
    start_date,
    end_date,
    visibility,
    selectedCommunities,
  }) {
    const user = (await supabase.auth.getUser()).data.user;

    const { data, error } = await supabase
      .from("announcements")
      .insert([
        {
          title,
          content,
          start_date,
          end_date,
          visibility,
          is_archived: false,
          created_by: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    if (visibility === "selected" && selectedCommunities.length > 0) {
      const rows = selectedCommunities.map((cid) => ({
        announcement_id: data.id,
        community_id: cid,
      }));
      await supabase.from("announcement_communities").insert(rows);
    }

    loadData();
  }

  async function updateAnnouncement(id, updates) {
    await supabase.from("announcements").update(updates).eq("id", id);
    loadData();
  }

  async function archiveAnnouncement(id) {
    await supabase.from("announcements").update({ is_archived: true }).eq("id", id);
    loadData();
  }

  async function pinAnnouncement(id) {
    await supabase.from("announcements").update({ visibility: "pinned" }).eq("id", id);
    loadData();
  }

  async function deleteAnnouncement(id) {
    await supabase.from("announcements").delete().eq("id", id);
    loadData();
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <h1 className="text-3xl font-bold mb-6">Zarządzanie ogłoszeniami</h1>

      {/* STATYSTYKI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard
          title="Aktywne ogłoszenia"
          value={activeAnnouncements.length}
          color="text-blue-400"
        />
        <StatCard
          title="Archiwalne"
          value={archivedAnnouncements.length}
          color="text-gray-400"
        />
        <StatCard
          title="Przypięte"
          value={announcements.filter((a) => a.visibility === "pinned").length}
          color="text-yellow-400"
        />
      </div>

      {/* FILTRY */}
      <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <input
            type="text"
            placeholder="Szukaj ogłoszenia..."
            className="bg-gray-900 border border-gray-700 rounded-lg p-3 w-full md:w-1/2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            className="px-4 py-2 bg-blue-600 rounded-lg"
            onClick={() => setShowAddModal(true)}
          >
            Dodaj ogłoszenie
          </button>
        </div>
      </div>

      {/* TABELA */}
      <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 overflow-x-auto">
        <table className="w-full text-left text-gray-300 min-w-[900px]">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-2">Tytuł</th>
              <th className="py-2">Widoczność</th>
              <th className="py-2">Ważność</th>
              <th className="py-2">Status</th>
              <th className="py-2">Akcje</th>
            </tr>
          </thead>

          <tbody>
            {filteredAnnouncements.map((a) => (
              <tr key={a.id} className="border-b border-gray-800">
                <td className="py-2">{a.title}</td>
                <td className="py-2">
                  {a.visibility === "all"
                    ? "Wszyscy"
                    : a.visibility === "selected"
                    ? "Wybrane wspólnoty"
                    : "Przypięte"}
                </td>
                <td className="py-2">
                  {a.start_date} – {a.end_date}
                </td>
                <td className="py-2">
                  {a.is_archived ? "Archiwalne" : "Aktywne"}
                </td>
                <td className="py-2 space-x-2">
                  <button
                    className="px-3 py-1 bg-purple-600 rounded"
                    onClick={() => {
                      setSelectedAnnouncement(a);
                      setShowEditModal(true);
                    }}
                  >
                    Edytuj
                  </button>
                  <button
                    className="px-3 py-1 bg-yellow-600 rounded"
                    onClick={() => pinAnnouncement(a.id)}
                  >
                    Przypnij
                  </button>
                  <button
                    className="px-3 py-1 bg-gray-600 rounded"
                    onClick={() => archiveAnnouncement(a.id)}
                  >
                    Archiwizuj
                  </button>
                  <button
                    className="px-3 py-1 bg-red-600 rounded"
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

      {/* MODALE */}
      {showAddModal && (
        <AddAnnouncementModal
          communities={communities}
          onClose={() => setShowAddModal(false)}
          onSave={addAnnouncement}
        />
      )}

      {showEditModal && (
        <EditAnnouncementModal
          announcement={selectedAnnouncement}
          onClose={() => setShowEditModal(false)}
          onSave={updateAnnouncement}
        />
      )}
    </div>
  );
}

// -----------------------------
// KOMPONENTY
// -----------------------------

function StatCard({ title, value, color }) {
  return (
    <div className="bg-gray-950 border border-gray-800 rounded-xl p-6">
      <p className="text-gray-400 text-sm">{title}</p>
      <p className={`text-4xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}

function AddAnnouncementModal({ onClose, onSave, communities }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [visibility, setVisibility] = useState("all");
  const [selectedCommunities, setSelectedCommunities] = useState([]);

  function toggleCommunity(id) {
    setSelectedCommunities((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <Modal title="Dodaj ogłoszenie" onClose={onClose}>
      <div className="space-y-4">
        <input
          className="bg-gray-800 border border-gray-700 rounded-lg p-3 w-full"
          placeholder="Tytuł"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="bg-gray-800 border border-gray-700 rounded-lg p-3 w-full h-32"
          placeholder="Treść ogłoszenia"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="flex gap-4">
          <input
            type="date"
            className="bg-gray-800 border border-gray-700 rounded-lg p-3 w-full"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="bg-gray-800 border border-gray-700 rounded-lg p-3 w-full"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <select
          className="bg-gray-800 border border-gray-700 rounded-lg p-3 w-full"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
        >
          <option value="all">Dla wszystkich</option>
          <option value="selected">Wybrane wspólnoty</option>
          <option value="pinned">Przypięte</option>
        </select>

        {visibility === "selected" && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 max-h-40 overflow-y-auto">
            {communities.map((c) => (
              <label key={c.id} className="flex items-center gap-2 py-1">
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
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button className="px-4 py-2 bg-gray-700 rounded" onClick={onClose}>
          Anuluj
        </button>
        <button
          className="px-4 py-2 bg-blue-600 rounded"
          onClick={() => {
            onSave({
              title,
              content,
              start_date: startDate,
              end_date: endDate,
              visibility,
              selectedCommunities,
            });
            onClose();
          }}
        >
          Zapisz
        </button>
      </div>
    </Modal>
  );
}

function EditAnnouncementModal({ announcement, onClose, onSave }) {
  const [title, setTitle] = useState(announcement.title);
  const [content, setContent] = useState(announcement.content);
  const [startDate, setStartDate] = useState(announcement.start_date);
  const [endDate, setEndDate] = useState(announcement.end_date);
  const [visibility, setVisibility] = useState(announcement.visibility);

  return (
    <Modal title="Edytuj ogłoszenie" onClose={onClose}>
      <div className="space-y-4">
        <input
          className="bg-gray-800 border border-gray-700 rounded-lg p-3 w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="bg-gray-800 border border-gray-700 rounded-lg p-3 w-full h-32"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="flex gap-4">
          <input
            type="date"
            className="bg-gray-800 border border-gray-700 rounded-lg p-3 w-full"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="bg-gray-800 border border-gray-700 rounded-lg p-3 w-full"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <select
          className="bg-gray-800 border border-gray-700 rounded-lg p-3 w-full"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
        >
          <option value="all">Dla wszystkich</option>
          <option value="selected">Wybrane wspólnoty</option>
          <option value="pinned">Przypięte</option>
        </select>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button className="px-4 py-2 bg-gray-700 rounded" onClick={onClose}>
          Anuluj
        </button>
        <button
          className="px-4 py-2 bg-purple-600 rounded"
          onClick={() => {
            onSave(announcement.id, {
              title,
              content,
              start_date: startDate,
              end_date: endDate,
              visibility,
            });
            onClose();
          }}
        >
          Zapisz
        </button>
      </div>
    </Modal>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-xl w-full max-w-lg border border-gray-700">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}
