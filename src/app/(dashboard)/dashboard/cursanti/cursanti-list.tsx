"use client";

import { useState, useMemo, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createCursant, updateCursant, deleteCursant } from "@/lib/actions";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

interface CursantItem {
  id: string; nume: string; email: string; telefon: string; firma: string;
  inscrieriCount: number; rezervariCount: number; createdAt: string;
}

const CursantRow = memo(function CursantRow({
  c, onEdit, onDelete
}: {
  c: CursantItem;
  onEdit: (id: string) => void;
  onDelete: (id: string, nume: string) => void;
}) {
  return (
    <tr className="border-b last:border-0 hover:bg-muted/50">
      <td className="py-2 font-medium">{c.nume}</td>
      <td className="py-2 max-w-[150px] truncate">{c.email}</td>
      <td className="py-2">{c.telefon}</td>
      <td className="py-2 max-w-[100px] truncate">{c.firma}</td>
      <td className="py-2"><Badge variant="secondary">{c.inscrieriCount}</Badge></td>
      <td className="py-2"><Badge variant="secondary">{c.rezervariCount}</Badge></td>
      <td className="py-2">
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => onEdit(c.id)}>
            <Pencil className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500" onClick={() => onDelete(c.id, c.nume)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </td>
    </tr>
  );
});

export function CursantiList({ cursanti }: { cursanti: CursantItem[] }) {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return cursanti;
    const q = search.toLowerCase();
    return cursanti.filter(c =>
      c.nume.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.telefon.toLowerCase().includes(q) ||
      c.firma.toLowerCase().includes(q)
    );
  }, [cursanti, search]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createCursant(formData);
      toast.success("Cursant adăugat");
      setOpen(false);
      (e.target as HTMLFormElement).reset();
    } catch { toast.error("Eroare la salvare"); }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editId) return;
    const formData = new FormData(e.currentTarget);
    try {
      await updateCursant(editId, formData);
      toast.success("Cursant actualizat");
      setEditId(null);
    } catch { toast.error("Eroare la actualizare"); }
  };

  const handleDelete = async (id: string, nume: string) => {
    if (!confirm(`Ștergeți cursantul ${nume}?`)) return;
    try { await deleteCursant(id); toast.success("Cursant șters"); }
    catch { toast.error("Eroare la ștergere"); }
  };

  const editedCursant = editId ? cursanti.find(c => c.id === editId) : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
        <CardTitle className="text-lg">Toți cursanții ({filtered.length})</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Caută..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 w-48 text-sm"
            />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Cursant nou</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Adaugă cursant nou</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Nume *</Label><Input name="nume" required /></div>
                  <div className="space-y-1"><Label>Prenume *</Label><Input name="prenume" required /></div>
                </div>
                <div className="space-y-1"><Label>Email</Label><Input name="email" type="email" /></div>
                <div className="space-y-1"><Label>Telefon</Label><Input name="telefon" /></div>
                <div className="space-y-1"><Label>Firmă</Label><Input name="firma" /></div>
                <Button type="submit" className="w-full">Salvează</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 font-medium">Nume</th>
                <th className="pb-2 font-medium">Email</th>
                <th className="pb-2 font-medium">Telefon</th>
                <th className="pb-2 font-medium">Firmă</th>
                <th className="pb-2 font-medium">Înscrieri</th>
                <th className="pb-2 font-medium">Rezervări</th>
                <th className="pb-2 font-medium">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <CursantRow
                  key={c.id}
                  c={c}
                  onEdit={setEditId}
                  onDelete={handleDelete}
                />
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-4 text-center text-muted-foreground">
                  {search ? "Niciun rezultat" : "Nu există cursanți"}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      {editId && editedCursant && (
        <Dialog open={true} onOpenChange={(o) => !o && setEditId(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Editează cursant</DialogTitle></DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Nume</Label><Input name="nume" defaultValue={editedCursant.nume.split(" ")[0]} required /></div>
                <div className="space-y-1"><Label>Prenume</Label><Input name="prenume" defaultValue={editedCursant.nume.split(" ").slice(1).join(" ")} required /></div>
              </div>
              <div className="space-y-1"><Label>Email</Label><Input name="email" defaultValue={editedCursant.email} /></div>
              <div className="space-y-1"><Label>Telefon</Label><Input name="telefon" defaultValue={editedCursant.telefon} /></div>
              <div className="space-y-1"><Label>Firmă</Label><Input name="firma" defaultValue={editedCursant.firma} /></div>
              <Button type="submit" className="w-full">Salvează modificările</Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
