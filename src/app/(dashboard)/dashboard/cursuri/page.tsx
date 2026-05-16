import { prisma } from "@/lib/prisma";
import { CursuriList } from "./cursuri-list";

export default async function CursuriPage() {
  const cursuri = await prisma.curs.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { inscrieri: true } },
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cursuri</h1>
        <p className="text-muted-foreground">Programe de pregătire CERONAV</p>
      </div>
      <CursuriList cursuri={cursuri.map(c => ({
        id: c.id,
        denumire: c.denumire,
        durataZile: c.durataZile,
        activ: c.activ,
        inscrieriCount: c._count.inscrieri,
        createdAt: c.createdAt.toLocaleDateString("ro-RO"),
      }))} />
    </div>
  );
}
