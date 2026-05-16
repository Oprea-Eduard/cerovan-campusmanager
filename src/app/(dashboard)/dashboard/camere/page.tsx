import { prisma } from "@/lib/prisma";
import { RoomPlan } from "./room-plan";
import { RoomList } from "./room-list";

export default async function CamerePage() {
  const camere = await prisma.camera.findMany({
    orderBy: [{ etaj: "asc" }, { numar: "asc" }],
    include: {
      _count: { select: { rezervari: true } },
      cheie: { select: { status: true } },
    },
  });

  const etaje = Array.from(new Set(camere.map((c) => c.etaj))).sort();

  const statusColors: Record<string, string> = {
    DISPONIBILA: "bg-white border-2 border-green-500 text-green-800",
    REZERVATA_PLATA_ASTEPTARE: "bg-yellow-100 border-2 border-yellow-500 text-yellow-800",
    REZERVATA_SI_ACHITATA: "bg-green-100 border-2 border-green-600 text-green-800",
    INDISPONIBILA_TEMPORAR: "bg-red-100 border-2 border-red-500 text-red-800",
    OCUPATA: "bg-blue-100 border-2 border-blue-500 text-blue-800",
  };

  const statusLabels: Record<string, string> = {
    DISPONIBILA: "Disponibilă",
    REZERVATA_PLATA_ASTEPTARE: "Rezervată (plată în așteptare)",
    REZERVATA_SI_ACHITATA: "Rezervată și achitată",
    INDISPONIBILA_TEMPORAR: "Indisponibilă",
    OCUPATA: "Ocupată",
  };

  const tipLabels: Record<string, string> = {
    SINGLE_STANDARD: "Standard",
    APARTAMENT: "Apartament",
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Camere</h1>
        <p className="text-muted-foreground">Gestionare spații de cazare</p>
      </div>

      <div className="flex gap-2">
        {Object.entries(statusColors).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1 text-xs">
            <div className={`w-3 h-3 rounded ${color.split(" ")[0]} border`} />
            <span>{statusLabels[status]}</span>
          </div>
        ))}
      </div>

      <RoomPlan camere={camere.map(c => ({
        id: c.id,
        numar: c.numar,
        tip: tipLabels[c.tip],
        tipRaw: c.tip,
        etaj: c.etaj,
        status: c.status,
        statusLabel: statusLabels[c.status],
        capacitate: c.capacitate,
        color: statusColors[c.status],
        cheieStatus: c.cheie?.status || null,
      }))} etaje={etaje} />

      <RoomList camere={camere.map(c => ({
        id: c.id,
        numar: c.numar,
        tip: tipLabels[c.tip],
        etaj: c.etaj,
        status: statusLabels[c.status],
        statusRaw: c.status,
        capacitate: c.capacitate,
        rezervariCount: c._count.rezervari,
      }))} />
    </div>
  );
}
