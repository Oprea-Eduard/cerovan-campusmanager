import { prisma } from "@/lib/prisma";
import { PlatiClient } from "./plati-client";

export default async function PlatiPage() {
  const rezervari = await prisma.rezervare.findMany({
    where: { status: { in: ["PLATA_ASTEPTARE", "ACHITATA"] } },
    include: {
      cursant: { select: { nume: true, prenume: true } },
      camera: { select: { numar: true, tip: true } },
      plati: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const platiNeconfirmate = await prisma.plata.findMany({
    where: { status: "NECONFIRMATA" },
    include: {
      rezervare: {
        include: {
          cursant: { select: { nume: true, prenume: true } },
          camera: { select: { numar: true } },
        },
      },
    },
    orderBy: { dataPlata: "desc" },
  });

  const incasariLuna = await prisma.plata.aggregate({
    where: {
      status: "CONFIRMATA",
      dataConfirmare: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
    },
    _sum: { suma: true },
  });

  return (
    <PlatiClient
      incasariLuna={Number(incasariLuna._sum.suma) || 0}
      rezervari={rezervari.map(r => ({
        id: r.id,
        cursant: `${r.cursant.nume} ${r.cursant.prenume}`,
        camera: r.camera.numar,
        nopti: Math.ceil((r.checkOut.getTime() - r.checkIn.getTime()) / (1000 * 60 * 60 * 24)),
        tarif: r.camera.tip === "APARTAMENT" ? 200 : 120,
        totalPlatit: r.plati.filter(p => p.status === "CONFIRMATA").reduce((s, p) => s + Number(p.suma), 0),
        status: r.status,
      }))}
      platiNeconfirmate={platiNeconfirmate.map(p => ({
        id: p.id,
        cursant: `${p.rezervare.cursant.nume} ${p.rezervare.cursant.prenume}`,
        camera: p.rezervare.camera.numar,
        suma: Number(p.suma),
        metoda: p.metoda,
        dataPlata: p.dataPlata?.toLocaleDateString("ro-RO") || "-",
      }))}
    />
  );
}
