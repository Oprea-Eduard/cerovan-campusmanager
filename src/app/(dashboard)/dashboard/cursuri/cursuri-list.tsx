"use client";

import { useState, useMemo, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createCurs, updateCurs, deleteCurs, toggleCursActiv } from "@/lib/actions";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Search } from "lucide-react";

interface CursItem {
  id: string; denumire: string; durataZile: number;
  activ: boolean; inscrieriCount: number; createdAt: string;
}

const CursRow = memo(function CursRow({
  c, onToggle, onEdit, onDelete
}: {
  c: CursItem;
  onToggle: (id: string, activ: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, denumire: string) => void;
}) {
  return (
    <tr className="border-b last:border-0 hover:bg-muted/50">
      <td className="py-2 font-medium">{c.denumire}</td>
      <td className="py-2">{c.durataZile} zile</td>
      <td className="py-2">
        {c.activ
          ? <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Activ</span>
          : <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Inactiv</span>
        }
      </td>
      <td className="py-2"><Badge variant="secondary">{c.inscrieriCount}</Badge></td>
      <td className="py-2 text-muted-foreground">{c.createdAt}</td>
      <td className="py-2">
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => onToggle(c.id, c.activ)}>
            {c.activ ? <ToggleRight className="h-3 w-3" /> : <ToggleLeft className="h-3 w-3" />}
          </Button>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => onEdit(c.id)}>
            <Pencil className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500" onClick={() => onDelete(c.id, c.denumire)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </td>
    </tr>
  );
});

export function CursuriList({ cursuri }: { cursuri: CursItem[] }) {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return cursuri;
    const q = search.toLowerCase();
    return cursuri.filter(c => c.denumire.toLowerCase().includes(q));
  }, [cursuri, search]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try { await createCurs(formData); toast.success("Curs adăugat"); setOpen(false); (e.target as HTMLFormElement).reset(); }
    catch { toast.error("Eroare la salvare"); }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editId) return;
    const formData = new FormData(e.currentTarget);
    try { await updateCurs(editId, formData); toast.success("Curs actualizat"); setEditId(null); }
    catch { toast.error("Eroare"); }
  };

  const handleDelete = async (id: string, denumire: string) => {
    if (!confirm(`Ștergeți cursul "${denumire}"?`)) return;
    try { await deleteCurs(id); toast.success("Curs șters"); }
    catch { toast.error("Eroare"); }
  };

  const handleToggle = async (id: string, activ: boolean) => {
    try { await toggleCursActiv(id, activ); toast.success(`Curs ${!activ ? "activat" : "dezactivat"}`); }
    catch { toast.error("Eroare"); }
  };

  const editedCurs = editId ? cursuri.find(c => c.id === editId) : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
        <CardTitle className="text-lg">Toate cursurile ({filtered.length})</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Caută..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 w-48 text-sm" />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Curs nou</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Adaugă curs nou</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1"><Label>Denumire *</Label><Input name="denumire" required /></div>
                <div className="space-y-1"><Label>Durată (zile)</Label><Input name="durataZile" type="number" defaultValue={5} /></div>
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
                <th className="pb-2 font-medium">Denumire</th>
                <th className="pb-2 font-medium">Durată</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Înscrieri</th>
                <th className="pb-2 font-medium">Creat</th>
                <th className="pb-2 font-medium">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <CursRow key={c.id} c={c} onToggle={handleToggle} onEdit={setEditId} onDelete={handleDelete} />
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="py-4 text-center text-muted-foreground">
                  {search ? "Niciun rezultat" : "Nu există cursuri"}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      {editId && editedCurs && (
        <Dialog open={true} onOpenChange={(o) => !o && setEditId(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Editează curs</DialogTitle></DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-1"><Label>Denumire</Label><Input name="denumire" defaultValue={editedCurs.denumire} required /></div>
              <div className="space-y-1"><Label>Durată (zile)</Label><Input name="durataZile" type="number" defaultValue={editedCurs.durataZile} /></div>
              <Button type="submit" className="w-full">Salvează</Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
