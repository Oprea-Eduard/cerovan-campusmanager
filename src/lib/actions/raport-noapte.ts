"use server";

import { prisma } from "@/lib/prisma";

export async function genereazaRaportNoapte() {
  const azi = new Date();
  azi.setHours(0, 0, 0, 0);
  const maine = new Date(azi);
  maine.setDate(maine.getDate() + 1);

  const [sosiri, plecari, camereOcupate, platiAzi, venitAzi] = await Promise.all([
    prisma.rezervare.findMany({
      where: {
        checkIn: { gte: azi, lt: maine },
        status: { in: ["ACHITATA", "CHECKIN_EFFECTUAT"] },
      },
      include: { cursant: { select: { nume: true, prenume: true } }, camera: { select: { numar: true } } },
    }),
    prisma.rezervare.findMany({
      where: {
        checkOut: { gte: azi, lt: maine },
        status: "CHECKOUT_EFFECTUAT",
      },
      include: { cursant: { select: { nume: true, prenume: true } }, camera: { select: { numar: true } } },
    }),
    prisma.camera.count({ where: { status: "OCUPATA" } }),
    prisma.plata.findMany({
      where: {
        dataPlata: { gte: azi, lt: maine },
        status: "CONFIRMATA",
      },
    }),
    prisma.plata.aggregate({
      _sum: { suma: true },
      where: {
        dataConfirmare: { gte: azi, lt: maine },
        status: "CONFIRMATA",
      },
    }),
  ]);

  const raport = {
    data: azi.toLocaleDateString("ro-RO"),
    generatLa: new Date().toLocaleString("ro-RO"),
    sosiri: sosiri.map(s => ({ cursant: `${s.cursant.nume} ${s.cursant.prenume}`, camera: s.camera.numar })),
    plecari: plecari.map(p => ({ cursant: `${p.cursant.nume} ${p.cursant.prenume}`, camera: p.camera.numar })),
    camereOcupate,
    camereTotale: await prisma.camera.count(),
    platiAzi: platiAzi.length,
    venitAzi: Number(venitAzi._sum.suma) || 0,
  };

  return raport;
}
