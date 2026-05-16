"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RezervareItem {
  id: string;
  cursant: string;
  camera: string;
  checkIn: string;
  checkOut: string;
  status: string;
  totalPlati: number;
  statusPlata: string;
}

export function RezervariList({ rezervari }: { rezervari: RezervareItem[] }) {
  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PLATA_ASTEPTARE: "bg-yellow-100 text-yellow-800",
      ACHITATA: "bg-green-100 text-green-800",
      CHECKIN_EFFECTUAT: "bg-blue-100 text-blue-800",
      CHECKOUT_EFFECTUAT: "bg-gray-100 text-gray-800",
      ANULATA: "bg-red-100 text-red-800",
    };
    const labels: Record<string, string> = {
      PLATA_ASTEPTARE: "Plată în așteptare",
      ACHITATA: "Achitată",
      CHECKIN_EFFECTUAT: "Check-In efectuat",
      CHECKOUT_EFFECTUAT: "Check-Out efectuat",
      ANULATA: "Anulată",
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[status] || ""}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Toate rezervările</CardTitle>
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
                <th className="pb-2 font-medium">Total plată</th>
                <th className="pb-2 font-medium">Status plată</th>
              </tr>
            </thead>
            <tbody>
              {rezervari.map((r) => (
                <tr key={r.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="py-2 font-medium">{r.cursant}</td>
                  <td className="py-2">{r.camera}</td>
                  <td className="py-2">{r.checkIn}</td>
                  <td className="py-2">{r.checkOut}</td>
                  <td className="py-2">{statusBadge(r.status)}</td>
                  <td className="py-2">{r.totalPlati} lei</td>
                  <td className="py-2">{r.statusPlata}</td>
                </tr>
              ))}
              {rezervari.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-muted-foreground">
                    Nu există rezervări
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
