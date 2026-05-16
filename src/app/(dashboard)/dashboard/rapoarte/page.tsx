import { prisma } from "@/lib/prisma";
import { RapoarteClient } from "./rapoarte-client";

export default async function RapoartePage() {
  const [ocuparePerLuna, venituriPerLuna, topCamere, statisticaCursanti] = await Promise.all([
    prisma.rezervare.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.plata.aggregate({
      _sum: { suma: true },
      where: { status: "CONFIRMATA" },
    }),
    prisma.rezervare.groupBy({
      by: ["cameraId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),
    prisma.cursant.count(),
  ]);

  const topCamereCuDetalii = await Promise.all(
    topCamere.map(async (c) => {
      const camera = await prisma.camera.findUnique({ where: { id: c.cameraId } });
      return {
        numar: camera?.numar || "Necunoscut",
        count: c._count.id,
      };
    })
  );

  const [
    totalRezervari,
  ] = await Promise.all([
    prisma.rezervare.count(),
  ]);

  const camereTotale = await prisma.camera.count();
  const camereOcupate = await prisma.camera.count({ where: { status: "OCUPATA" } });
  const gradOcupare = camereTotale > 0 ? Math.round((camereOcupate / camereTotale) * 100) : 0;

  return (
    <RapoarteClient
      statsGenerale={{
        totalRezervari,
        venituriTotale: Number(venituriPerLuna._sum.suma) || 0,
        totalCursanti: statisticaCursanti,
        gradOcupare,
        camereOcupate,
        camereTotale,
      }}
      statusOcupare={ocuparePerLuna.map(o => ({
        status: o.status,
        count: o._count.id,
      }))}
      topCamere={topCamereCuDetalii}
    />
  );
}
