import { prisma } from "@/lib/prisma";
import { CereriClient } from "./cereri-client";

export default async function CereriPage() {
  const cereri = await prisma.cerereCazare.findMany({
    orderBy: { aprobatLa: "desc" },
    include: {
      rezervare: {
        include: {
          cursant: { select: { nume: true, prenume: true, email: true, telefon: true } },
          camera: { select: { numar: true, tip: true } },
        },
      },
    },
  });

  const [cursuri, cursanti] = await Promise.all([
    prisma.curs.findMany({ where: { activ: true }, select: { id: true, denumire: true } }),
    prisma.cursant.findMany({ select: { id: true, nume: true, prenume: true, email: true } }),
  ]);

  return (
    <CereriClient
      cereri={cereri.map(c => ({
        id: c.id,
        rezervareId: c.rezervareId,
        cursant: `${c.rezervare.cursant.nume} ${c.rezervare.cursant.prenume}`,
        email: c.rezervare.cursant.email || "-",
        telefon: c.rezervare.cursant.telefon || "-",
        camera: c.rezervare.camera.numar,
        tipCamera: c.rezervare.camera.tip === "APARTAMENT" ? "Apartament" : "Standard",
        checkIn: c.rezervare.checkIn.toLocaleDateString("ro-RO"),
        checkOut: c.rezervare.checkOut.toLocaleDateString("ro-RO"),
        status: c.status,
        dataCerere: c.aprobatLa?.toLocaleDateString("ro-RO") || "-",
      }))}
      cursanti={cursanti.map(c => ({ id: c.id, nume: `${c.nume} ${c.prenume}`, email: c.email || "" }))}
      cursuri={cursuri}
    />
  );
}
