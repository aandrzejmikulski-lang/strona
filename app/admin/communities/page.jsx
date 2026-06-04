"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "../../../lib/supabaseBrowser";

export default function AdminCommunitiesPage() {
  const supabase = getSupabaseBrowserClient();

  const [communities, setCommunities] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [tickets, setTickets] = useState([]);

  const [search, setSearch] = useState("");

  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  async function loadData() {
    const { data: comms } = await supabase.from("communities").select("*");
    const { data: profs } = await supabase.from("profiles").select("*");
    const { data: tks } = await supabase.from("tickets").select("*");

    setCommunities(comms || []);
    setProfiles(profs || []);
    setTickets(tks || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredCommunities = communities.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  async function addCommunity({ name, city, address, postal_code, nip }) {
    await supabase.from("communities").insert([
      { name, city, address, postal_code, nip },
    ]);
    loadData();
  }

  async function updateCommunity(id, { name, city, address, postal_code, nip }) {
    await supabase
      .from("communities")
      .update({ name, city, address, postal_code, nip })
      .eq("id", id);

    loadData();
  }

  async function deleteCommunity(id) {
    const residents = profiles.filter((p) => p.community_id === id);

    if (residents.length > 0) {
      alert("Nie można usunąć wspólnoty — są przypisani mieszkańcy.");
      return;
    }

    await supabase.from("communities").delete().eq("id", id);
    loadData();
  }

  async function assignUserToCommunity(userId, communityId) {
    await supabase
      .from("profiles")
      .update({ community_id: communityId })
      .eq("id", userId);

    loadData();
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <h1 className="text-3xl font-bold mb-6">Zarządzanie wspólnotami</h1>

      {/* STATYSTYKI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard
          title="Wszystkie wspólnoty"
          value={communities.length}
          color="text-blue-400"
        />
        <StatCard
          title="Łącznie mieszkańców"
          value={profiles.filter((p) => p.community_id).length}
          color="text-green-400"
        />
        <StatCard
          title="Łącznie zgłoszeń"
          value={tickets.length}
          color="text-yellow-400"
        />
      </div>

      {/* FILTRY */}
      <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <input
            type="text"
            placeholder="Szukaj wspólnoty..."
            className="bg-gray-900 border border-gray-700 rounded-lg p-3 w-full md:w-1/2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            className="px-4 py-2 bg-blue-600 rounded-lg"
            onClick={() => setShowAddModal(true)}
          >
            Dodaj wspólnotę
          </button>
        </div>
      </div>

      {/* TABELA */}
      <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 overflow-x-auto">
        <table className="w-full text-left text-gray-300 min-w-[900px]">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-2">Nazwa</th>
              <th className="py-2">Adres</th>
              <th className="py-2">Mieszkańcy</th>
              <th className="py-2">Zgłoszenia</th>
              <th className="py-2">Akcje</th>
            </tr>
          </thead>

          <tbody>
            {filteredCommunities.map((c) => {
              const residents = profiles.filter((p) => p.community_id === c.id);
              const commTickets = tickets.filter((t) => t.community_id === c.id);

              return (
                <tr key={c.id} className="border-b border-gray-800">
                  <td className="py-2">{c.name}</td>
                  <td className="py-2">
                    {c.city}, {c.address}, {c.postal_code}
                  </td>
                  <td className="py-2">{residents.length}</td>
                  <td className="py-2">{commTickets.length}</td>

                  <td className="py-2 space-x-2">
                    <button
                      className="px-3 py-1 bg-purple-600 rounded"
                      onClick={() => {
                        setSelectedCommunity(c);
                        setShowEditModal(true);
                      }}
                    >
                      Edytuj
                    </button>

                    <button
                      className="px-3 py-1 bg-yellow-600 rounded"
                      onClick={() => {
                        setSelectedCommunity(c);
                        setShowAssignModal(true);
                      }}
                    >
                      Przypisz mieszkańca
                    </button>

                    <button
                      className="px-3 py-1 bg-red-600 rounded"
                      onClick={() => deleteCommunity(c.id)}
                    >
                      Usuń
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODALE */}
      {showAddModal && (
        <AddCommunityModal
          onClose={() => setShowAddModal(false)}
          onSave={addCommunity}
        />
      )}

      {showEditModal && (
        <EditCommunityModal
          community={selectedCommunity}
          onClose={() => setShowEditModal(false)}
          onSave={updateCommunity}
        />
      )}

      {showAssignModal && (
        <AssignUserModal
          community={selectedCommunity}
          users={profiles}
          onClose={() => setShowAssignModal(false)}
          onSave={assignUserToCommunity}
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

function AddCommunityModal({ onClose, onSave }) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [nip, setNip] = useState("");

  return (
    <Modal title="Dodaj wspólnotę" onClose={onClose}>
      <div className="space-y-4">
        <input
          className="bg-gray-800 border border-gray-700 rounded-lg p-3 w-full"
          placeholder="Nazwa wspólnoty"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="bg-gray-800 border border-gray-700 rounded-lg p-3 w-full"
          placeholder="Miejscowość"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <input
          className="bg-gray-800 border border-gray-700 rounded-lg p-3 w-full"
          placeholder="Adres"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <input
          className="bg-gray-800 border border-gray-700 rounded-lg p-3 w-full"
          placeholder="Kod pocztowy"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
        />

        <input
          className="bg-gray-800 border border-gray-700 rounded-lg p-3 w-full"
          placeholder="NIP"
          value={nip}
          onChange={(e) => setNip(e.target.value)}
        />
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button className="px-4 py-2 bg-gray-700 rounded" onClick={onClose}>
          Anuluj
        </button>
        <button
          className="px-4 py-2 bg-blue-600 rounded"
          onClick={() => {
            onSave({
              name,
              city,
              address,
              postal_code: postalCode,
              nip,
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

function EditCommunityModal({ community, onClose, onSave }) {
  const [name, setName] = useState(community.name);
  const [city, setCity] = useState(community.city ?? "");
  const [address, setAddress] = useState(community.address ?? "");
  const [postalCode, setPostalCode] = useState(community.postal_code ?? "");
  const [nip, setNip] = useState(community.nip ?? "");

  return (
    <Modal title="Edytuj wspólnotę" onClose={onClose}>
      <div className="space-y-4">
        <input
          className="bg-gray-800 border border-gray-700 rounded-lg p-3 w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="bg-gray-800 border border-gray-700 rounded-lg p-3 w-full"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <input
          className="bg-gray-800 border border-gray-700 rounded-lg p-3 w-full"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <input
          className="bg-gray-800 border border-gray-700 rounded-lg p-3 w-full"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
        />

        <input
          className="bg-gray-800 border border-gray-700 rounded-lg p-3 w-full"
          value={nip}
          onChange={(e) => setNip(e.target.value)}
        />
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button className="px-4 py-2 bg-gray-700 rounded" onClick={onClose}>
          Anuluj
        </button>
        <button
          className="px-4 py-2 bg-purple-600 rounded"
          onClick={() => {
            onSave(community.id, {
              name,
              city,
              address,
              postal_code: postalCode,
              nip,
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

function AssignUserModal({ community, users, onClose, onSave }) {
  const [selectedUser, setSelectedUser] = useState("");

  const freeUsers = users.filter((u) => !u.community_id);

  return (
    <Modal title="Przypisz mieszkańca" onClose={onClose}>
      <select
        className="bg-gray-800 border border-gray-700 rounded-lg p-3 w-full"
        value={selectedUser}
        onChange={(e) => setSelectedUser(e.target.value)}
      >
        <option value="">Wybierz mieszkańca</option>
        {freeUsers.map((u) => (
          <option key={u.id} value={u.id}>
            {u.full_name} ({u.email})
          </option>
        ))}
      </select>

      <div className="flex justify-end space-x-3 mt-6">
        <button className="px-4 py-2 bg-gray-700 rounded" onClick={onClose}>
          Anuluj
        </button>
        <button
          className="px-4 py-2 bg-yellow-600 rounded"
          onClick={() => {
            onSave(selectedUser, community.id);
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
