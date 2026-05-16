import { prisma } from "@/lib/prisma";
import { DocumenteClient } from "./documente-client";

export default async function DocumentePage() {
  const cereri = await prisma.cerereCazare.findMany({
    orderBy: { aprobatLa: "desc" },
    include: {
      rezervare: {
        include: {
          cursant: { select: { nume: true, prenume: true } },
          camera: { select: { numar: true } },
        },
      },
      documente: true,
    },
    take: 20,
  });

  return (
    <DocumenteClient
      cereri={cereri.map(c => ({
        id: c.id,
        cursant: `${c.rezervare.cursant.nume} ${c.rezervare.cursant.prenume}`,
        camera: c.rezervare.camera.numar,
        documente: c.documente.map(d => ({ id: d.id, tip: d.tip, numeFisier: d.numeFisier })),
        status: c.status,
      }))}
    />
  );
}
