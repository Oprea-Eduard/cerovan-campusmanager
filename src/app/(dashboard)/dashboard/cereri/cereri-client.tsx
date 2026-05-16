"use client";

import { useState, useMemo, useCallback, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { createRezervare } from "@/lib/actions";
import { aprobaCerere, respingeCerere } from "@/lib/actions/cereri";
import { Plus, CheckCircle, XCircle, Search } from "lucide-react";

interface CerereItem {
  id: string; rezervareId: string; cursant: string; email: string;
  telefon: string; camera: string; tipCamera: string;
  checkIn: string; checkOut: string; status: string; dataCerere: string;
}

const CerereRow = memo(function CerereRow({
  c, onApprove, onReject
}: {
  c: CerereItem; onApprove: (id: string) => void; onReject: (id: string) => void;
}) {
  return (
    <tr className="border-b last:border-0 hover:bg-muted/50">
      <td className="py-2 font-medium">{c.cursant}</td>
      <td className="py-2">{c.email}</td>
      <td className="py-2">{c.camera} ({c.tipCamera})</td>
      <td className="py-2">{c.checkIn} → {c.checkOut}</td>
      <td className="py-2">
        {c.status === "IN_ASTEPTARE" ? (
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">În așteptare</span>
        ) : c.status === "APROBATA" ? (
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Aprobată</span>
        ) : (
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Respinsă</span>
        )}
      </td>
      <td className="py-2">
        {c.status === "IN_ASTEPTARE" && (
          <div className="flex gap-1">
            <Button size="sm" className="h-7 text-xs bg-green-600" onClick={() => onApprove(c.rezervareId)}>
              <CheckCircle className="h-3 w-3 mr-1" /> Aprobă
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs border-red-300 text-red-600" onClick={() => onReject(c.rezervareId)}>
              <XCircle className="h-3 w-3 mr-1" /> Respinge
            </Button>
          </div>
        )}
      </td>
    </tr>
  );
});

export function CereriClient({
  cereri, cursanti, cursuri
}: {
  cereri: CerereItem[];
  cursanti: { id: string; nume: string; email: string }[];
  cursuri: { id: string; denumire: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return cereri;
    const q = search.toLowerCase();
    return cereri.filter(c =>
      c.cursant.toLowerCase().includes(q) ||
      c.camera.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  }, [cereri, search]);

  const handleApprove = useCallback(async (id: string) => {
    try { await aprobaCerere(id); toast.success("Cerere aprobată"); }
    catch { toast.error("Eroare"); }
  }, []);

  const handleReject = useCallback(async (id: string) => {
    try { await respingeCerere(id); toast.success("Cerere respinsă"); }
    catch { toast.error("Eroare"); }
  }, []);

  const handleNew = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createRezervare(formData);
      toast.success("Cerere trimisă");
      setOpen(false);
      (e.target as HTMLFormElement).reset();
    } catch { toast.error("Eroare"); }
  };

  const stats = {
    total: cereri.length,
    inAsteptare: cereri.filter(c => c.status === "IN_ASTEPTARE").length,
    aprobate: cereri.filter(c => c.status === "APROBATA").length,
    respinse: cereri.filter(c => c.status === "RESPINSA").length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cereri cazare</h1>
          <p className="text-muted-foreground">Gestionare cereri de cazare primite</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Cerere nouă</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Cerere de cazare nouă</DialogTitle></DialogHeader>
            <form onSubmit={handleNew} className="space-y-4">
              <div className="space-y-1">
                <Label>Cursant *</Label>
                <select name="cursantId" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">— Selectează —</option>
                  {cursanti.map(c => <option key={c.id} value={c.id}>{c.nume}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Curs</Label>
                <select name="cursId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">— Selectează —</option>
                  {cursuri.map(c => <option key={c.id} value={c.id}>{c.denumire}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Camera</Label>
                <Input name="cameraId" placeholder="ID cameră (opțional)" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Check-In *</Label><Input name="checkIn" type="date" required /></div>
                <div className="space-y-1"><Label>Check-Out *</Label><Input name="checkOut" type="date" required /></div>
              </div>
              <Button type="submit" className="w-full">Trimite cerere</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
        <Card className="border-yellow-200"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-yellow-600">{stats.inAsteptare}</p><p className="text-xs text-muted-foreground">În așteptare</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{stats.aprobate}</p><p className="text-xs text-muted-foreground">Aprobate</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-600">{stats.respinse}</p><p className="text-xs text-muted-foreground">Respinse</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-lg">Listă cereri</CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Caută..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 w-48 text-sm" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Cursant</th>
                  <th className="pb-2 font-medium">Email</th>
                  <th className="pb-2 font-medium">Camera</th>
                  <th className="pb-2 font-medium">Perioada</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <CerereRow key={c.id} c={c} onApprove={handleApprove} onReject={handleReject} />
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="py-4 text-center text-muted-foreground">
                    {search ? "Niciun rezultat" : "Nu există cereri"}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
