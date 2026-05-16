import { prisma } from "@/lib/prisma";
import { CursantiList } from "./cursanti-list";

export default async function CursantiPage() {
  const cursanti = await prisma.cursant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { inscrieri: true, rezervari: true } },
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cursanți</h1>
        <p className="text-muted-foreground">Gestionare cursanți CERONAV</p>
      </div>
      <CursantiList cursanti={cursanti.map(c => ({
        id: c.id,
        nume: `${c.nume} ${c.prenume}`,
        email: c.email || "-",
        telefon: c.telefon || "-",
        firma: c.firma || "-",
        inscrieriCount: c._count.inscrieri,
        rezervariCount: c._count.rezervari,
        createdAt: c.createdAt.toLocaleDateString("ro-RO"),
      }))} />
    </div>
  );
}
