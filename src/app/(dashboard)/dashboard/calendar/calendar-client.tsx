"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CameraInfo {
  id: string;
  numar: string;
  etaj: number;
  tip: string;
}

interface RezervareInfo {
  cameraId: string;
  checkIn: string;
  checkOut: string;
  status: string;
}

const STATUS_CULORI: Record<string, string> = {
  ACHITATA: "bg-green-400",
  CHECKIN_EFFECTUAT: "bg-blue-400",
  PLATA_ASTEPTARE: "bg-yellow-300",
  CHECKOUT_EFFECTUAT: "bg-gray-300",
};

export function CalendarClient({
  camere,
  rezervari,
}: {
  camere: CameraInfo[];
  rezervari: RezervareInfo[];
}) {
  const azi = new Date();
  const [an, setAn] = useState(azi.getFullYear());
  const [luna, setLuna] = useState(azi.getMonth());

  const lunaNume = [
    "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
    "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie",
  ];

  const primaZi = new Date(an, luna, 1);
  const ultimaZi = new Date(an, luna + 1, 0);
  const zileInLuna = ultimaZi.getDate();
  const startDay = primaZi.getDay() || 7;

  const zile: Date[] = [];
  for (let d = 1; d <= zileInLuna; d++) {
    zile.push(new Date(an, luna, d));
  }

  const rezervariMap = new Map<string, Set<string>>();
  for (const r of rezervari) {
    const start = new Date(r.checkIn);
    const end = new Date(r.checkOut);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = `${r.cameraId}_${d.toISOString().split("T")[0]}`;
      if (!rezervariMap.has(key)) {
        rezervariMap.set(key, new Set());
      }
      rezervariMap.get(key)!.add(r.status);
    }
  }

  const getColor = (cameraId: string, zi: Date): string | null => {
    const ziStr = zi.toISOString().split("T")[0];
    const statuses = rezervariMap.get(`${cameraId}_${ziStr}`);
    if (!statuses || statuses.size === 0) return null;
    if (statuses.has("CHECKIN_EFFECTUAT")) return STATUS_CULORI.CHECKIN_EFFECTUAT;
    if (statuses.has("ACHITATA")) return STATUS_CULORI.ACHITATA;
    if (statuses.has("PLATA_ASTEPTARE")) return STATUS_CULORI.PLATA_ASTEPTARE;
    if (statuses.has("CHECKOUT_EFFECTUAT")) return STATUS_CULORI.CHECKOUT_EFFECTUAT;
    return null;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Calendar ocupare</h1>
        <p className="text-muted-foreground">Vizualizare lunară ocupare camere</p>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => { if (luna === 0) { setAn(an - 1); setLuna(11); } else { setLuna(luna - 1); } }}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">{lunaNume[luna]} {an}</h2>
        <Button variant="outline" size="sm" onClick={() => { if (luna === 11) { setAn(an + 1); setLuna(0); } else { setLuna(luna + 1); } }}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-4 text-xs mb-2">
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-400" /> Achitat</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-blue-400" /> Ocupat</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-300" /> Plată în așt.</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-gray-300" /> Check-out</div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 bg-white z-10 border-r p-1 text-left font-medium text-muted-foreground min-w-[70px]">Camera</th>
                {Array.from({ length: startDay - 1 }, (_, i) => (
                  <th key={`empty-${i}`} className="w-8 p-1 border" />
                ))}
                {zile.map((zi) => (
                  <th
                    key={zi.toISOString()}
                    className={`w-8 p-1 text-center font-medium border ${
                      zi.toDateString() === azi.toDateString() ? "bg-blue-50 text-blue-700" : "text-muted-foreground"
                    }`}
                  >
                    {zi.getDate()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {camere.map((camera) => (
                <tr key={camera.id}>
                  <td className="sticky left-0 bg-white z-10 border-r p-1 font-medium text-xs">
                    {camera.numar}
                  </td>
                  {Array.from({ length: startDay - 1 }, (_, i) => (
                    <td key={`empty-${i}`} className="w-8 p-0 border" />
                  ))}
                  {zile.map((zi) => {
                    const color = getColor(camera.id, zi);
                    return (
                      <td
                        key={zi.toISOString()}
                        className={`w-8 h-6 p-0 border ${
                          color || (zi.getDay() === 6 || zi.getDay() === 0 ? "bg-gray-50" : "")
                        }`}
                      >
                        {color && <div className={`w-full h-full ${color}`} />}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
