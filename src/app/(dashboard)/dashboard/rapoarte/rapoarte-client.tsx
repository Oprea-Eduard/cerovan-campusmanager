"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, Users, DollarSign, Building2 } from "lucide-react";

const COLORS = {
  PLATA_ASTEPTARE: "#facc15",
  ACHITATA: "#22c55e",
  CHECKIN_EFFECTUAT: "#3b82f6",
  CHECKOUT_EFFECTUAT: "#6b7280",
  ANULATA: "#ef4444",
};

const STATUS_LABELS: Record<string, string> = {
  PLATA_ASTEPTARE: "În așteptare",
  ACHITATA: "Achitată",
  CHECKIN_EFFECTUAT: "Check-In",
  CHECKOUT_EFFECTUAT: "Check-Out",
  ANULATA: "Anulată",
};

export function RapoarteClient({
  statsGenerale,
  statusOcupare,
  topCamere,
}: {
  statsGenerale: {
    totalRezervari: number;
    venituriTotale: number;
    totalCursanti: number;
    gradOcupare: number;
    camereOcupate: number;
    camereTotale: number;
  };
  statusOcupare: { status: string; count: number }[];
  topCamere: { numar: string; count: number }[];
}) {
  const pieData = statusOcupare.map(o => ({
    name: STATUS_LABELS[o.status] || o.status,
    value: o.count,
    color: COLORS[o.status as keyof typeof COLORS] || "#94a3b8",
  }));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Rapoarte</h1>
        <p className="text-muted-foreground">Analize și statistici — Conducere</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <p className="text-sm text-muted-foreground">Grad ocupare</p>
            </div>
            <p className="text-2xl font-bold">{statsGenerale.gradOcupare}%</p>
            <p className="text-xs text-muted-foreground">{statsGenerale.camereOcupate} din {statsGenerale.camereTotale} camere</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <p className="text-sm text-muted-foreground">Venituri totale</p>
            </div>
            <p className="text-2xl font-bold">{statsGenerale.venituriTotale} lei</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              <p className="text-sm text-muted-foreground">Cursanți</p>
            </div>
            <p className="text-2xl font-bold">{statsGenerale.totalCursanti}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-orange-600" />
              <p className="text-sm text-muted-foreground">Rezervări totale</p>
            </div>
            <p className="text-2xl font-bold">{statsGenerale.totalRezervari}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuția rezervărilor</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top camere solicitate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCamere}>
                <XAxis dataKey="numar" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Statistici rapide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded border text-center">
              <p className="text-2xl font-bold text-blue-600">{statsGenerale.totalRezervari}</p>
              <p className="text-xs text-muted-foreground">Rezervări totale</p>
            </div>
            <div className="p-3 rounded border text-center">
              <p className="text-2xl font-bold text-green-600">{statsGenerale.totalCursanti}</p>
              <p className="text-xs text-muted-foreground">Cursanți înregistrați</p>
            </div>
            <div className="p-3 rounded border text-center">
              <p className="text-2xl font-bold text-purple-600">{statsGenerale.venituriTotale}</p>
              <p className="text-xs text-muted-foreground">Venituri (lei)</p>
            </div>
            <div className="p-3 rounded border text-center">
              <p className="text-2xl font-bold text-orange-600">{statsGenerale.gradOcupare}%</p>
              <p className="text-xs text-muted-foreground">Grad de ocupare</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
