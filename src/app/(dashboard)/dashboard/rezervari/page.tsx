import { prisma } from "@/lib/prisma";
import { RezervariClient } from "./rezervari-client";

export default async function RezervariPage() {
  const [rezervari, cursanti, camere] = await Promise.all([
    prisma.rezervare.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        cursant: { select: { nume: true, prenume: true } },
        camera: { select: { numar: true } },
        plati: true,
      },
    }),
    prisma.cursant.findMany({ orderBy: { nume: "asc" } }),
    prisma.camera.findMany({
      where: { status: { in: ["DISPONIBILA", "REZERVATA_PLATA_ASTEPTARE"] } },
      orderBy: { numar: "asc" },
    }),
  ]);

  return (
    <RezervariClient
      rezervari={rezervari.map(r => ({
        id: r.id,
        cursant: `${r.cursant.nume} ${r.cursant.prenume}`,
        camera: r.camera.numar,
        checkIn: r.checkIn.toLocaleDateString("ro-RO"),
        checkOut: r.checkOut.toLocaleDateString("ro-RO"),
        status: r.status,
        totalPlati: r.plati.reduce((sum, p) => sum + Number(p.suma), 0),
        statusPlata: r.plati.some(p => p.status === "CONFIRMATA") ? "Achitat" : "Neachitat",
      }))}
      cursanti={cursanti.map(c => ({ id: c.id, nume: `${c.nume} ${c.prenume}` }))}
      camere={camere.map(c => ({ id: c.id, numar: c.numar }))}
    />
  );
}
