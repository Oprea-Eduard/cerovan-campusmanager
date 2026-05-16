"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { createRezervare, anuleazaRezervare } from "@/lib/actions";
import { Plus, XCircle, Search } from "lucide-react";

interface RezervareItem {
  id: string;
  cursant: string;
  camera: string;
  checkIn: string;
  checkOut: string;
  status: string;
  totalPlati: number;
  statusPlata: string;
}

export function RezervariClient({
  rezervari,
  cursanti,
  camere,
}: {
  rezervari: RezervareItem[];
  cursanti: { id: string; nume: string }[];
  camere: { id: string; numar: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return rezervari;
    const q = search.toLowerCase();
    return rezervari.filter(r =>
      r.cursant.toLowerCase().includes(q) ||
      r.camera.toLowerCase().includes(q) ||
      r.checkIn.includes(q) ||
      r.statusPlata.toLowerCase().includes(q)
    );
  }, [rezervari, search]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createRezervare(formData);
      toast.success("Rezervare creată");
      setOpen(false);
    } catch {
      toast.error("Eroare la creare");
    }
  };

  const handleAnuleaza = async (id: string) => {
    try {
      await anuleazaRezervare(id);
      toast.success("Rezervare anulată");
    } catch {
      toast.error("Eroare la anulare");
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PLATA_ASTEPTARE: "bg-yellow-100 text-yellow-800",
      ACHITATA: "bg-green-100 text-green-800",
      CHECKIN_EFFECTUAT: "bg-blue-100 text-blue-800",
      CHECKOUT_EFFECTUAT: "bg-gray-100 text-gray-800",
      ANULATA: "bg-red-100 text-red-800",
    };
    const labels: Record<string, string> = {
      PLATA_ASTEPTARE: "Plată în așteptare",
      ACHITATA: "Achitată",
      CHECKIN_EFFECTUAT: "Check-In",
      CHECKOUT_EFFECTUAT: "Check-Out",
      ANULATA: "Anulată",
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[status] || ""}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rezervări</h1>
          <p className="text-muted-foreground">Gestionare rezervări camere</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Rezervare nouă
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Rezervare nouă</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <Label>Cursant *</Label>
                <select name="cursantId" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">— Selectează —</option>
                  {cursanti.map(c => <option key={c.id} value={c.id}>{c.nume}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Camera *</Label>
                <select name="cameraId" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">— Selectează —</option>
                  {camere.map(c => <option key={c.id} value={c.id}>{c.numar}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Check-In *</Label>
                  <Input name="checkIn" type="date" required />
                </div>
                <div className="space-y-1">
                  <Label>Check-Out *</Label>
                  <Input name="checkOut" type="date" required />
                </div>
              </div>
              <Button type="submit" className="w-full">Creează rezervare</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Caută..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 w-48 text-sm" />
          </div>
          <CardTitle className="text-lg">Toate rezervările ({filtered.length})</CardTitle>
        </div></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Cursant</th>
                  <th className="pb-2 font-medium">Camera</th>
                  <th className="pb-2 font-medium">Check-In</th>
                  <th className="pb-2 font-medium">Check-Out</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Total plată</th>
                  <th className="pb-2 font-medium">Status plată</th>
                  <th className="pb-2 font-medium">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-2 font-medium">{r.cursant}</td>
                    <td className="py-2">{r.camera}</td>
                    <td className="py-2">{r.checkIn}</td>
                    <td className="py-2">{r.checkOut}</td>
                    <td className="py-2">{statusBadge(r.status)}</td>
                    <td className="py-2">{r.totalPlati} lei</td>
                    <td className="py-2">{r.statusPlata}</td>
                    <td className="py-2">
                      {(r.status === "PLATA_ASTEPTARE" || r.status === "ACHITATA") && (
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-red-500" onClick={() => handleAnuleaza(r.id)}>
                          <XCircle className="h-3 w-3 mr-1" /> Anulează
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="py-4 text-center text-muted-foreground">{search ? "Nicio rezervare găsită" : "Nu există rezervări"}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
