"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HousekeepingProps {
  stats: { murdar: number; inLucru: number; curat: number; verificat: number };
  camere: { id: string; numar: string; etaj: number; statusCuratenie: string }[];
}

export function HousekeepingList({ stats, camere }: HousekeepingProps) {
  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      MURDAR: "bg-red-100 border-red-300 text-red-800",
      IN_LUCRU: "bg-yellow-100 border-yellow-300 text-yellow-800",
      CURAT: "bg-green-100 border-green-300 text-green-800",
      VERIFICAT: "bg-blue-100 border-blue-300 text-blue-800",
    };
    return map[s] || "bg-gray-100";
  };

  const statusLabel: Record<string, string> = {
    MURDAR: "Murdar",
    IN_LUCRU: "În lucru",
    CURAT: "Curat",
    VERIFICAT: "Verificat",
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-red-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.murdar}</p>
            <p className="text-xs text-muted-foreground">Murdare</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.inLucru}</p>
            <p className="text-xs text-muted-foreground">În lucru</p>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.curat}</p>
            <p className="text-xs text-muted-foreground">Curate</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.verificat}</p>
            <p className="text-xs text-muted-foreground">Verificate</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status curățenie per cameră</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {camere.map((c) => (
              <div
                key={c.id}
                className={`p-2 rounded border text-xs font-medium ${statusColor(c.statusCuratenie)}`}
              >
                <span className="font-bold">{c.numar}</span>
                <span className="ml-2">{statusLabel[c.statusCuratenie]}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
