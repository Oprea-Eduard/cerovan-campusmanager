"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateTarif } from "@/lib/actions/operatiuni";
import { DollarSign } from "lucide-react";

interface TarifItem {
  id: string; tipCamera: string; valoare: number; activ: boolean; updatedAt: string;
}

export function SetariClient({
  tarife, activeStandard, activeApartament,
}: {
  tarife: TarifItem[]; activeStandard: number; activeApartament: number;
}) {
  const [std, setStd] = useState(String(activeStandard));
  const [apt, setApt] = useState(String(activeApartament));

  const handleSave = async (tip: string, val: string) => {
    const nr = parseFloat(val);
    if (isNaN(nr) || nr <= 0) { toast.error("Valoare invalidă"); return; }
    try {
      await updateTarif(tip, nr);
      toast.success("Tarif actualizat");
    } catch { toast.error("Eroare"); }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Setări</h1>
        <p className="text-muted-foreground">Configurare tarife și parametri sistem</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><DollarSign className="h-5 w-5" /> Tarife cazare</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 p-4 rounded border">
              <h3 className="font-medium text-sm">Cameră Standard</h3>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label>Tarif / noapte (lei)</Label>
                  <Input type="number" value={std} onChange={e => setStd(e.target.value)} />
                </div>
                <Button onClick={() => handleSave("SINGLE_STANDARD", std)}>Salvează</Button>
              </div>
            </div>
            <div className="space-y-3 p-4 rounded border">
              <h3 className="font-medium text-sm">Apartament</h3>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label>Tarif / noapte (lei)</Label>
                  <Input type="number" value={apt} onChange={e => setApt(e.target.value)} />
                </div>
                <Button onClick={() => handleSave("APARTAMENT", apt)}>Salvează</Button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Istoric tarife</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Tip cameră</th>
                  <th className="pb-2 font-medium">Tarif</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Actualizat</th>
                </tr>
              </thead>
              <tbody>
                {tarife.map(t => (
                  <tr key={t.id} className="border-b last:border-0">
                    <td className="py-2">{t.tipCamera}</td>
                    <td className="py-2">{t.valoare} lei</td>
                    <td className="py-2">
                      {t.activ
                        ? <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Activ</span>
                        : <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Inactiv</span>
                      }
                    </td>
                    <td className="py-2 text-muted-foreground">{t.updatedAt}</td>
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
