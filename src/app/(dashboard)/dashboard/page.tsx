import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const role = session.user.role;

  const [
    totalCamere,
    camereDisponibile,
    camereOcupate,
    camereIndisponibile,
    totalCursanti,
    rezervariAzi,
    platiNeconfirmate,
    cursuriActive,
  ] = await Promise.all([
    prisma.camera.count(),
    prisma.camera.count({ where: { status: "DISPONIBILA" } }),
    prisma.camera.count({ where: { status: "OCUPATA" } }),
    prisma.camera.count({ where: { status: "INDISPONIBILA_TEMPORAR" } }),
    prisma.cursant.count(),
    prisma.rezervare.count({
      where: {
        checkIn: { lte: new Date() },
        checkOut: { gte: new Date() },
        status: { in: ["ACHITATA", "CHECKIN_EFFECTUAT"] },
      },
    }),
    prisma.plata.count({ where: { status: "NECONFIRMATA" } }),
    prisma.curs.count({ where: { activ: true } }),
  ]);

  const recentRezervari = await prisma.rezervare.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      cursant: { select: { nume: true, prenume: true } },
      camera: { select: { numar: true } },
    },
  });

  return (
    <DashboardClient
      role={role}
      stats={{
        totalCamere,
        camereDisponibile,
        camereOcupate,
        camereIndisponibile,
        totalCursanti,
        rezervariAzi,
        platiNeconfirmate,
        cursuriActive,
      }}
      recentRezervari={recentRezervari.map((r) => ({
        id: r.id,
        cursant: `${r.cursant.nume} ${r.cursant.prenume}`,
        camera: r.camera.numar,
        checkIn: r.checkIn.toLocaleDateString("ro-RO"),
        checkOut: r.checkOut.toLocaleDateString("ro-RO"),
        status: r.status,
      }))}
    />
  );
}
