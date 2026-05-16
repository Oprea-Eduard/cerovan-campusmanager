import { prisma } from "@/lib/prisma";
import { ParcareClient } from "./parcare-client";

export default async function ParcarePage() {
  const locuri = await prisma.parcare.findMany({
    orderBy: { numarLoc: "asc" },
    include: { camera: { select: { numar: true } } },
  });

  return (
    <ParcareClient
      locuri={locuri.map(l => ({
        id: l.id,
        numarLoc: l.numarLoc,
        status: l.status,
        camera: l.camera?.numar || null,
      }))}
      stats={{
        total: locuri.length,
        liber: locuri.filter(l => l.status === "LIBER").length,
        ocupat: locuri.filter(l => l.status === "OCUPAT").length,
        rezervat: locuri.filter(l => l.status === "REZERVAT").length,
      }}
    />
  );
}
