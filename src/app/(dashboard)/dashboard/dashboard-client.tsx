"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLE_LABELS } from "@/lib/roles";
import { Users, CalendarCheck, DollarSign, Building2 } from "lucide-react";

interface Stats {
  totalCamere: number; camereDisponibile: number; camereOcupate: number;
  camereIndisponibile: number; totalCursanti: number; rezervariAzi: number;
  platiNeconfirmate: number; cursuriActive: number;
}

interface Rezervare {
  id: string; cursant: string; camera: string;
  checkIn: string; checkOut: string; status: string;
}

const STATUS_UI = {
  PLATA_ASTEPTARE: "bg-yellow-100 text-yellow-800",
  ACHITATA: "bg-green-100 text-green-800",
  CHECKIN_EFFECTUAT: "bg-blue-100 text-blue-800",
  CHECKOUT_EFFECTUAT: "bg-gray-100 text-gray-800",
  ANULATA: "bg-red-100 text-red-800",
} as const;

const STATUS_LABELS: Record<string, string> = {
  PLATA_ASTEPTARE: "Plată în așteptare", ACHITATA: "Achitată",
  CHECKIN_EFFECTUAT: "Check-In efectuat", CHECKOUT_EFFECTUAT: "Check-Out efectuat", ANULATA: "Anulată",
};

export function DashboardClient({
  role, stats: initialStats, recentRezervari: initialRezervari,
}: {
  role: string; stats: Stats; recentRezervari: Rezervare[];
}) {
  const [stats, setStats] = useState(initialStats);
  const [recentRezervari, setRecentRezervari] = useState(initialRezervari);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/data");
      if (!res.ok) return;
      const data = await res.json();
      if (data.stats) setStats(data.stats);
      if (data.recentRezervari) setRecentRezervari(data.recentRezervari);
    } catch { /* silent fail */ }
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      setRefreshing(true);
      await fetchData();
      setRefreshing(false);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bun venit, {ROLE_LABELS[role] || role}</h1>
          <p className="text-muted-foreground">Panou de control Campus Manager</p>
        </div>
        <div className="flex items-center gap-2">
          {refreshing && <span className="text-xs text-muted-foreground animate-pulse">Se actualizează...</span>}
          <button
            onClick={fetchData}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Reîmprospătează
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Camere totale</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCamere}</div>
            <div className="flex gap-2 mt-1 text-xs">
              <span className="text-green-600">{stats.camereDisponibile} disponibile</span>
              <span className="text-blue-600">{stats.camereOcupate} ocupate</span>
              <span className="text-red-600">{stats.camereIndisponibile} indisponibile</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cursanți</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCursanti}</div>
            <p className="text-xs text-muted-foreground">Înregistrați în sistem</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rezervări active</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rezervariAzi}</div>
            <p className="text-xs text-muted-foreground">În desfășurare acum</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Plăți neconfirmate</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.platiNeconfirmate}</div>
            <p className="text-xs text-muted-foreground">Necesită verificare</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rezervări recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Cursant</th>
                  <th className="pb-2 font-medium">Camera</th>
                  <th className="pb-2 font-medium">Check-In</th>
                  <th className="pb-2 font-medium">Check-Out</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRezervari.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="py-2">{r.cursant}</td>
                    <td className="py-2">{r.camera}</td>
                    <td className="py-2">{r.checkIn}</td>
                    <td className="py-2">{r.checkOut}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_UI[r.status as keyof typeof STATUS_UI] || ""}`}>
                        {STATUS_LABELS[r.status] || r.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentRezervari.length === 0 && (
                  <tr><td colSpan={5} className="py-4 text-center text-muted-foreground">Nu există rezervări recente</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
