import { prisma } from "@/lib/prisma";
import { ObiecteClient } from "./obiecte-client";

export default async function ObiectePierdutePage() {
  const obiecte = await prisma.obiectPierdut.findMany({
    orderBy: { gasitLa: "desc" },
  });

  const camere = await prisma.camera.findMany({
    select: { id: true, numar: true },
    orderBy: { numar: "asc" },
  });

  const cameraMap = new Map(camere.map(c => [c.id, c.numar]));

  return (
    <ObiecteClient
      obiecte={obiecte.map(o => ({
        id: o.id,
        descriere: o.descriere,
        camera: o.cameraId ? cameraMap.get(o.cameraId) || null : null,
        gasitLa: o.gasitLa.toLocaleDateString("ro-RO"),
        predatLa: o.predatLa?.toLocaleDateString("ro-RO") || null,
        dataLimita: new Date(o.gasitLa.getTime() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString("ro-RO"),
        status: o.status,
      }))}
      camere={camere.map(c => ({ id: c.id, numar: c.numar }))}
    />
  );
}
