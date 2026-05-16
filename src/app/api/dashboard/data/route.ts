import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [totalCamere, camereDisponibile, camereOcupate, camereIndisponibile, totalCursanti, rezervariAzi, platiNeconfirmate, cursuriActive, recentRezervari] = await Promise.all([
    prisma.camera.count(),
    prisma.camera.count({ where: { status: "DISPONIBILA" } }),
    prisma.camera.count({ where: { status: "OCUPATA" } }),
    prisma.camera.count({ where: { status: "INDISPONIBILA_TEMPORAR" } }),
    prisma.cursant.count(),
    prisma.rezervare.count({ where: { checkIn: { lte: new Date() }, checkOut: { gte: new Date() }, status: { in: ["ACHITATA", "CHECKIN_EFFECTUAT"] } } }),
    prisma.plata.count({ where: { status: "NECONFIRMATA" } }),
    prisma.curs.count({ where: { activ: true } }),
    prisma.rezervare.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { cursant: { select: { nume: true, prenume: true } }, camera: { select: { numar: true } } },
    }),
  ]);

  return NextResponse.json({
    stats: { totalCamere, camereDisponibile, camereOcupate, camereIndisponibile, totalCursanti, rezervariAzi, platiNeconfirmate, cursuriActive },
    recentRezervari: recentRezervari.map(r => ({
      id: r.id, cursant: `${r.cursant.nume} ${r.cursant.prenume}`,
      camera: r.camera.numar, checkIn: r.checkIn.toLocaleDateString("ro-RO"),
      checkOut: r.checkOut.toLocaleDateString("ro-RO"), status: r.status,
    })),
  });
}
