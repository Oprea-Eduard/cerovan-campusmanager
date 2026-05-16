"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { confirmPlata, adaugaPlata, genereazaNotaPlata } from "@/lib/actions/operatiuni";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { genereazaPDFNotaPlata } from "@/lib/pdf";
import { DollarSign, CheckCircle, FileText, Plus } from "lucide-react";

interface RezervarePlata {
  id: string;
  cursant: string;
  camera: string;
  nopti: number;
  tarif: number;
  totalPlatit: number;
  status: string;
}

interface PlataNeconfirmata {
  id: string;
  cursant: string;
  camera: string;
  suma: number;
  metoda: string;
  dataPlata: string;
}

export function PlatiClient({
  incasariLuna,
  rezervari,
  platiNeconfirmate,
}: {
  incasariLuna: number;
  rezervari: RezervarePlata[];
  platiNeconfirmate: PlataNeconfirmata[];
}) {
  const [showAddPlata, setShowAddPlata] = useState<string | null>(null);
  const [suma, setSuma] = useState("");
  const [metoda, setMetoda] = useState("TRANSFER_BANCAR");

  const handleConfirm = async (id: string) => {
    try {
      await confirmPlata(id);
      toast.success("Plată confirmată");
    } catch {
      toast.error("Eroare la confirmare");
    }
  };

  const handleAddPlata = async (rezervareId: string) => {
    if (!suma) return toast.error("Introdu o sumă");
    try {
      await adaugaPlata(rezervareId, parseFloat(suma), metoda);
      toast.success("Plată adăugată");
      setShowAddPlata(null);
      setSuma("");
    } catch {
      toast.error("Eroare la adăugare");
    }
  };

  const handleGenereazaNota = async (rezervareId: string) => {
    try {
      const nota = await genereazaNotaPlata(rezervareId);
      genereazaPDFNotaPlata(nota);
      toast.success(`PDF Notă de plată ${nota.nr} generat: ${nota.total} lei`);
    } catch {
      toast.error("Eroare la generare");
    }
  };

  const totalDeIncasat = rezervari
    .filter(r => r.status === "PLATA_ASTEPTARE")
    .reduce((s, r) => s + r.nopti * r.tarif, 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Plăți</h1>
        <p className="text-muted-foreground">Gestionare plăți și facturi cazare</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Încasări luna curentă</p>
            <p className="text-2xl font-bold text-green-600">{incasariLuna} lei</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Plăți neconfirmate</p>
            <p className="text-2xl font-bold text-yellow-600">{platiNeconfirmate.length}</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">De încasat (în așteptare)</p>
            <p className="text-2xl font-bold text-blue-600">{totalDeIncasat} lei</p>
          </CardContent>
        </Card>
      </div>

      {platiNeconfirmate.length > 0 && (
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-yellow-600" />
              <span>Plăți neconfirmate</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {platiNeconfirmate.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded border bg-yellow-50">
                  <div>
                    <p className="font-medium text-sm">{p.cursant}</p>
                    <p className="text-xs text-muted-foreground">
                      Camera {p.camera} · {p.suma} lei prin {p.metoda === "TRANSFER_BANCAR" ? "transfer" : "ordin de plată"} · {p.dataPlata}
                    </p>
                  </div>
                  <Button size="sm" className="bg-green-600" onClick={() => handleConfirm(p.id)}>
                    <CheckCircle className="h-4 w-4 mr-1" /> Confirmă
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rezervări și plăți</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Cursant</th>
                  <th className="pb-2 font-medium">Camera</th>
                  <th className="pb-2 font-medium">Nopți</th>
                  <th className="pb-2 font-medium">Tarif</th>
                  <th className="pb-2 font-medium">Total</th>
                  <th className="pb-2 font-medium">Plătit</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {rezervari.map((r) => {
                  const total = r.nopti * r.tarif;
                  const rest = total - r.totalPlatit;
                  return (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-2">{r.cursant}</td>
                      <td className="py-2">{r.camera}</td>
                      <td className="py-2">{r.nopti}</td>
                      <td className="py-2">{r.tarif} lei</td>
                      <td className="py-2">{total} lei</td>
                      <td className="py-2">{r.totalPlatit} lei</td>
                      <td className="py-2">
                        {r.status === "ACHITATA" ? (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Achitat</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            Rest: {rest} lei
                          </span>
                        )}
                      </td>
                      <td className="py-2">
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleGenereazaNota(r.id)}>
                            <FileText className="h-3 w-3 mr-1" /> Notă
                          </Button>
                          <Dialog open={showAddPlata === r.id} onOpenChange={(o) => { setShowAddPlata(o ? r.id : null); setSuma(""); }}>
                            <DialogTrigger>
                              <Button size="sm" variant="outline" className="h-7 text-xs">
                                <Plus className="h-3 w-3 mr-1" /> Plată
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Adaugă plată — {r.cursant}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Suma (lei)</Label>
                                  <Input type="number" placeholder={String(rest)} value={suma} onChange={e => setSuma(e.target.value)} />
                                </div>
                                <div>
                                  <Label>Metoda de plată</Label>
                                  <Select value={metoda} onValueChange={(v) => v && setMetoda(v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="TRANSFER_BANCAR">Transfer bancar</SelectItem>
                                      <SelectItem value="ORDIN_PLATA">Ordin de plată</SelectItem>
                                      <SelectItem value="CASIERIE">Casierie</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button className="w-full" onClick={() => handleAddPlata(r.id)}>
                                  <DollarSign className="h-4 w-4 mr-1" /> Înregistrează plata
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
