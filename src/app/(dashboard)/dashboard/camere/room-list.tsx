"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CameraListItem {
  id: string;
  numar: string;
  tip: string;
  etaj: number;
  status: string;
  statusRaw: string;
  capacitate: number;
  rezervariCount: number;
}

export function RoomList({ camere }: { camere: CameraListItem[] }) {
  const statusColors: Record<string, string> = {
    DISPONIBILA: "bg-green-100 text-green-800",
    REZERVATA_PLATA_ASTEPTARE: "bg-yellow-100 text-yellow-800",
    REZERVATA_SI_ACHITATA: "bg-green-100 text-green-800",
    INDISPONIBILA_TEMPORAR: "bg-red-100 text-red-800",
    OCUPATA: "bg-blue-100 text-blue-800",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Listă camere</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 font-medium">Nr. cameră</th>
                <th className="pb-2 font-medium">Tip</th>
                <th className="pb-2 font-medium">Etaj</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Capacitate</th>
                <th className="pb-2 font-medium">Rezervări</th>
              </tr>
            </thead>
            <tbody>
              {camere.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="py-2 font-medium">{c.numar}</td>
                  <td className="py-2">{c.tip}</td>
                  <td className="py-2">{c.etaj}</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[c.statusRaw] || ""}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-2">{c.capacitate} locuri</td>
                  <td className="py-2">{c.rezervariCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
