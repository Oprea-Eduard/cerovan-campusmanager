"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createUser, toggleUserActiv } from "@/lib/actions/operatiuni";
import { ROLE_LABELS } from "@/lib/roles";
import { Plus, ToggleLeft, ToggleRight } from "lucide-react";

interface UserItem {
  id: string; email: string; name: string; role: string;
  isActive: boolean; lastLogin: string; createdAt: string;
}

export function UtilizatoriClient({ utilizatori }: { utilizatori: UserItem[] }) {
  const [open, setOpen] = useState(false);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createUser(formData);
      toast.success("Utilizator creat");
      setOpen(false);
      (e.target as HTMLFormElement).reset();
    } catch { toast.error("Eroare la creare"); }
  };

  const handleToggle = async (id: string, activ: boolean) => {
    try { await toggleUserActiv(id, activ); toast.success(`Utilizator ${!activ ? "activat" : "dezactivat"}`); }
    catch { toast.error("Eroare"); }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Utilizatori</h1>
          <p className="text-muted-foreground">Gestionare conturi de acces</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Utilizator nou</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Crează utilizator nou</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1"><Label>Nume *</Label><Input name="name" required /></div>
              <div className="space-y-1"><Label>Email *</Label><Input name="email" type="email" required /></div>
              <div className="space-y-1"><Label>Parolă *</Label><Input name="password" type="password" required /></div>
              <div className="space-y-1">
                <Label>Rol *</Label>
                <select name="role" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <Button type="submit" className="w-full">Crează</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Toți utilizatorii</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Nume</th>
                  <th className="pb-2 font-medium">Email</th>
                  <th className="pb-2 font-medium">Rol</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Ultimul login</th>
                  <th className="pb-2 font-medium">Creat</th>
                  <th className="pb-2 font-medium">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {utilizatori.map((u) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-2 font-medium">{u.name}</td>
                    <td className="py-2">{u.email}</td>
                    <td className="py-2"><Badge variant="outline">{ROLE_LABELS[u.role] || u.role}</Badge></td>
                    <td className="py-2">
                      {u.isActive
                        ? <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Activ</span>
                        : <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Inactiv</span>
                      }
                    </td>
                    <td className="py-2 text-muted-foreground">{u.lastLogin}</td>
                    <td className="py-2 text-muted-foreground">{u.createdAt}</td>
                    <td className="py-2">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleToggle(u.id, u.isActive)}>
                        {u.isActive ? <ToggleRight className="h-3 w-3" /> : <ToggleLeft className="h-3 w-3" />}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
