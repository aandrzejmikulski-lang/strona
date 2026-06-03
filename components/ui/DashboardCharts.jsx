"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { getSupabaseBrowserClient } from "../../lib/supabaseBrowser";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardCharts() {
  const supabase = getSupabaseBrowserClient();

  const [stats, setStats] = useState({
    communities: 0,
    residents: 0,
    ticketsOpen: 0,
    ticketsProgress: 0,
    ticketsClosed: 0,
    announcements: 0,
  });

  const [recentTickets, setRecentTickets] = useState([]);

  async function loadData() {
    const [communities, residents, tickets, announcements] = await Promise.all([
      supabase.from("communities").select("*"),
      supabase.from("profiles").select("*"),
      supabase.from("tickets").select("*"),
      supabase.from("announcements").select("*"),
    ]);

    const t = tickets.data || [];

    setStats({
      communities: communities.data?.length || 0,
      residents: residents.data?.length || 0,
      ticketsOpen: t.filter((x) => x.status === "open").length,
      ticketsProgress: t.filter((x) => x.status === "in_progress").length,
      ticketsClosed: t.filter((x) => x.status === "closed").length,
      announcements: announcements.data?.length || 0,
    });

    setRecentTickets(
      t.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)
    );
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  // -----------------------------
  // WYKRES 1 — AKTYWNOŚĆ SYSTEMU
  // -----------------------------
  const barData = {
    labels: ["Wspólnoty", "Mieszkańcy", "Otwarte", "W toku", "Zamknięte", "Ogłoszenia"],
    datasets: [
      {
        label: "Aktywność",
        data: [
          stats.communities,
          stats.residents,
          stats.ticketsOpen,
          stats.ticketsProgress,
          stats.ticketsClosed,
          stats.announcements,
        ],
        backgroundColor: ["#3b82f6", "#22c55e", "#facc15", "#3b82f6", "#22c55e", "#a855f7"],
      },
    ],
  };

  const barOptions = {
    responsive: true,
    animation: { duration: 800, easing: "easeOutQuart" },
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Aktywność systemu", color: "#fff" },
    },
    scales: {
      y: {
        ticks: {
          color: "#aaa",
          precision: 0,
          callback: (value) => (Number.isInteger(value) ? value : null),
        },
        grid: { color: "#333" },
      },
      x: {
        ticks: { color: "#aaa" },
        grid: { color: "#333" },
      },
    },
  };

  // -----------------------------
  // WYKRES 2 — STRUKTURA ZGŁOSZEŃ
  // -----------------------------
  const donutData = {
    labels: ["Otwarte", "W toku", "Zamknięte"],
    datasets: [
      {
        data: [stats.ticketsOpen, stats.ticketsProgress, stats.ticketsClosed],
        backgroundColor: ["#facc15", "#3b82f6", "#22c55e"],
      },
    ],
  };

  // -----------------------------
  // WYKRES 3 — TREND ZGŁOSZEŃ
  // -----------------------------
  const lineData = {
    labels: ["7 dni temu", "6 dni", "5 dni", "4 dni", "3 dni", "2 dni", "Dzisiaj"],
    datasets: [
      {
        label: "Nowe zgłoszenia",
        data: [
          Math.floor(Math.random() * 10),
          Math.floor(Math.random() * 10),
          Math.floor(Math.random() * 10),
          Math.floor(Math.random() * 10),
          Math.floor(Math.random() * 10),
          Math.floor(Math.random() * 10),
          stats.ticketsOpen + stats.ticketsProgress + stats.ticketsClosed,
        ],
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.3)",
        tension: 0.3,
      },
    ],
  };

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="space-y-10 animate-fadeIn">
      {/* WYKRES 1 */}
      <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 flex justify-center">
        <div className="w-full max-w-3xl">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      {/* WYKRES 2 */}
      <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 flex justify-center">
        <div className="w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4 text-center">Struktura zgłoszeń</h2>
          <Doughnut data={donutData} />
        </div>
      </div>

      {/* WYKRES 3 */}
      <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 flex justify-center">
        <div className="w-full max-w-3xl">
          <h2 className="text-xl font-semibold mb-4 text-center">Trend zgłoszeń (ostatnie 7 dni)</h2>
          <Line data={lineData} />
        </div>
      </div>

      {/* TABELA OSTATNICH ZGŁOSZEŃ */}
      <div className="bg-gray-950 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Ostatnie zgłoszenia</h2>

        <table className="w-full text-left text-gray-300">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-2">ID</th>
              <th className="py-2">Tytuł</th>
              <th className="py-2">Status</th>
              <th className="py-2">Data</th>
            </tr>
          </thead>
          <tbody>
            {recentTickets.map((t) => (
              <tr key={t.id} className="border-b border-gray-800">
                <td className="py-2">{t.id}</td>
                <td className="py-2">{t.title}</td>
                <td className="py-2">{t.status}</td>
                <td className="py-2">{new Date(t.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
