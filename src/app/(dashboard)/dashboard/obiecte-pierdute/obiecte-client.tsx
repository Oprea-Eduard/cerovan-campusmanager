"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { createObiectPierdut, restituieObiect } from "@/lib/actions";
import { Plus, RotateCcw } from "lucide-react";

interface ObiectItem {
  id: string;
  descriere: string;
  camera: string | null;
  gasitLa: string;
  predatLa: string | null;
  dataLimita: string;
  status: string;
}

export function ObiecteClient({
  obiecte,
  camere,
}: {
  obiecte: ObiectItem[];
  camere: { id: string; numar: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("TOATE");

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createObiectPierdut(formData);
      toast.success("Obiect înregistrat");
      setOpen(false);
    } catch { toast.error("Eroare la salvare"); }
  };

  const handleRestituie = async (id: string) => {
    await restituieObiect(id);
    toast.success("Obiect marcat ca restituit");
  };

  const filtered = filter === "TOATE" ? obiecte : obiecte.filter(o => o.status === filter);

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      IN_CAUTARE: "bg-yellow-100 text-yellow-800",
      RESTITUIT: "bg-green-100 text-green-800",
      EXPIRAT: "bg-red-100 text-red-800",
    };
    return map[s] || "";
  };

  const statusLabel: Record<string, string> = {
    IN_CAUTARE: "În căutare",
    RESTITUIT: "Restituit",
    EXPIRAT: "Expirat",
  };

  const stats = {
    total: obiecte.length,
    inCautare: obiecte.filter(o => o.status === "IN_CAUTARE").length,
    restituit: obiecte.filter(o => o.status === "RESTITUIT").length,
    expirat: obiecte.filter(o => o.status === "EXPIRAT").length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Obiecte pierdute</h1>
          <p className="text-muted-foreground">Registru obiecte pierdute / găsite</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Înregistrează obiect</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Înregistrează obiect găsit</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <Label>Descriere *</Label>
                <Input name="descriere" placeholder="Telefon, chei, geantă..." required />
              </div>
              <div className="space-y-1">
                <Label>Camere (opțional)</Label>
                <select name="cameraId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                  <option value="">— Selectează camera —</option>
                  {camere.map(c => <option key={c.id} value={c.id}>{c.numar}</option>)}
                </select>
              </div>
              <Button type="submit" className="w-full">Salvează</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
        <Card className="border-yellow-200"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-yellow-600">{stats.inCautare}</p><p className="text-xs text-muted-foreground">În căutare</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{stats.restituit}</p><p className="text-xs text-muted-foreground">Restituite</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-600">{stats.expirat}</p><p className="text-xs text-muted-foreground">Expirate</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Înregistrări</CardTitle>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="h-8 rounded border border-input bg-background px-2 text-xs"
            >
              <option value="TOATE">Toate</option>
              <option value="IN_CAUTARE">În căutare</option>
              <option value="RESTITUIT">Restituite</option>
              <option value="EXPIRAT">Expirate</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Descriere</th>
                  <th className="pb-2 font-medium">Camera</th>
                  <th className="pb-2 font-medium">Găsit la</th>
                  <th className="pb-2 font-medium">Dată limită</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-2 font-medium">{o.descriere}</td>
                    <td className="py-2">{o.camera || "—"}</td>
                    <td className="py-2">{o.gasitLa}</td>
                    <td className="py-2">{o.dataLimita}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor(o.status)}`}>
                        {statusLabel[o.status]}
                      </span>
                    </td>
                    <td className="py-2">
                      {o.status === "IN_CAUTARE" && (
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleRestituie(o.id)}>
                          <RotateCcw className="h-3 w-3 mr-1" /> Restituie
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="py-4 text-center text-muted-foreground">Nu există înregistrări</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
