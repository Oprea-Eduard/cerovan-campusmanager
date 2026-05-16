import { prisma } from "@/lib/prisma";
import { EvaluariClient } from "./evaluari-client";

export default async function EvaluariPage() {
  const evaluari = await prisma.evaluare.findMany({
    orderBy: { id: "desc" },
    take: 50,
    include: { checkInOut: { include: { rezervare: { include: { cursant: { select: { nume: true, prenume: true } } } } } } },
  });

  const stats = {
    total: evaluari.length,
    medieCuratenie: 0, medieConfort: 0, medieDotari: 0, mediePersonal: 0, medieOrganizare: 0,
  };
  const cuScor = evaluari.filter(e => e.curatenie !== null);
  if (cuScor.length > 0) {
    stats.medieCuratenie = Math.round(cuScor.reduce((s, e) => s + (e.curatenie || 0), 0) / cuScor.length * 10) / 10;
    stats.medieConfort = Math.round(cuScor.reduce((s, e) => s + (e.confort || 0), 0) / cuScor.length * 10) / 10;
    stats.medieDotari = Math.round(cuScor.reduce((s, e) => s + (e.dotari || 0), 0) / cuScor.length * 10) / 10;
    stats.mediePersonal = Math.round(cuScor.reduce((s, e) => s + (e.personal || 0), 0) / cuScor.length * 10) / 10;
    stats.medieOrganizare = Math.round(cuScor.reduce((s, e) => s + (e.organizare || 0), 0) / cuScor.length * 10) / 10;
  }

  return (
    <EvaluariClient
      stats={stats}
      evaluari={evaluari.map(e => ({
        id: e.id, cursant: `${e.checkInOut.rezervare.cursant.nume} ${e.checkInOut.rezervare.cursant.prenume}`,
        curatenie: e.curatenie || 0, confort: e.confort || 0, dotari: e.dotari || 0,
        personal: e.personal || 0, organizare: e.organizare || 0, observatii: e.observatii || "—",
      }))}
    />
  );
}
