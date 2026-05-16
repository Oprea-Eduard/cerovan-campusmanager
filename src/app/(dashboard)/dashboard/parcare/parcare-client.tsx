"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { createParcare, toggleParcare, deleteParcare } from "@/lib/actions";
import { Car, Plus, Trash2, ParkingCircle } from "lucide-react";

interface LocParcare {
  id: string;
  numarLoc: string;
  status: string;
  camera: string | null;
}

export function ParcareClient({
  locuri,
  stats,
}: {
  locuri: LocParcare[];
  stats: { total: number; liber: number; ocupat: number; rezervat: number };
}) {
  const [open, setOpen] = useState(false);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createParcare(formData);
      toast.success("Loc parcare adăugat");
      setOpen(false);
    } catch { toast.error("Eroare la salvare"); }
  };

  const handleToggle = async (id: string, status: string) => {
    const newStatus = status === "LIBER" ? "OCUPAT" : "LIBER";
    await toggleParcare(id, newStatus);
    toast.success(`Loc ${newStatus === "LIBER" ? "eliberat" : "ocupat"}`);
  };

  const handleDelete = async (id: string) => {
    await deleteParcare(id);
    toast.success("Loc parcare șters");
  };

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      LIBER: "border-green-300 bg-green-50 text-green-800",
      OCUPAT: "border-red-300 bg-red-50 text-red-800",
      REZERVAT: "border-yellow-300 bg-yellow-50 text-yellow-800",
    };
    return map[s] || "";
  };

  const statusLabel: Record<string, string> = {
    LIBER: "Liber",
    OCUPAT: "Ocupat",
    REZERVAT: "Rezervat",
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Parcare</h1>
          <p className="text-muted-foreground">Gestionare locuri de parcare în Campus</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Adaugă loc</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Adaugă loc parcare</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <Label>Număr loc *</Label>
                <Input name="numarLoc" placeholder="ex: P-01" required />
              </div>
              <Button type="submit" className="w-full">Salvează</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{stats.liber}</p><p className="text-xs text-muted-foreground">Libere</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-600">{stats.ocupat}</p><p className="text-xs text-muted-foreground">Ocupate</p></CardContent></Card>
        <Card className="border-yellow-200"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-yellow-600">{stats.rezervat}</p><p className="text-xs text-muted-foreground">Rezervate</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Locuri de parcare</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {locuri.map((l) => (
              <div key={l.id} className={`p-3 rounded border text-center ${statusColor(l.status)}`}>
                <ParkingCircle className="h-5 w-5 mx-auto mb-1" />
                <p className="font-bold text-sm">{l.numarLoc}</p>
                <p className="text-xs">{statusLabel[l.status]}</p>
                {l.camera && <p className="text-xs text-muted-foreground">Camera {l.camera}</p>}
                <div className="flex gap-1 mt-2 justify-center">
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleToggle(l.id, l.status)}>
                    <Car className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-500" onClick={() => handleDelete(l.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
