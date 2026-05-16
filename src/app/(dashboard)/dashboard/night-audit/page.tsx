"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { genereazaRaportNoapte } from "@/lib/actions/raport-noapte";
import { Moon, Sun, Bed, DollarSign, LogIn, LogOut } from "lucide-react";

interface RaportNoapte {
  data: string;
  generatLa: string;
  sosiri: { cursant: string; camera: string }[];
  plecari: { cursant: string; camera: string }[];
  camereOcupate: number;
  camereTotale: number;
  platiAzi: number;
  venitAzi: number;
}

export default function NightAuditPage() {
  const [raport, setRaport] = useState<RaportNoapte | null>(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const r = await genereazaRaportNoapte();
      setRaport(r);
      setGenerated(true);
      toast.success("Raport de noapte generat");
    } catch {
      toast.error("Eroare la generare");
    }
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Night Audit</h1>
          <p className="text-muted-foreground">Raport de închidere a zilei hoteliere</p>
        </div>
        <div className="flex gap-2">
          {!generated && (
            <Button onClick={handleGenerate} disabled={loading}>
              <Moon className="h-4 w-4 mr-1" />
              {loading ? "Se generează..." : "Generează raport"}
            </Button>
          )}
          {raport && (
            <Button variant="outline" onClick={handlePrint}>
              <Sun className="h-4 w-4 mr-1" /> Printează
            </Button>
          )}
        </div>
      </div>

      {!raport && !generated && (
        <Card>
          <CardContent className="p-12 text-center">
            <Moon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold mb-2">Raport de noapte</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Generează raportul de închidere a zilei pentru a centraliza sosirile, plecările,
              plățile și gradul de ocupare.
            </p>
            <Button onClick={handleGenerate} disabled={loading}>
              <Moon className="h-4 w-4 mr-1" />
              {loading ? "Se generează..." : "Generează raport"}
            </Button>
          </CardContent>
        </Card>
      )}

      {raport && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Raport închidere zi — {raport.data}</CardTitle>
              <p className="text-xs text-muted-foreground">Generat la: {raport.generatLa}</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-3 rounded border text-center">
                  <LogIn className="h-5 w-5 mx-auto mb-1 text-green-600" />
                  <p className="text-2xl font-bold text-green-600">{raport.sosiri.length}</p>
                  <p className="text-xs text-muted-foreground">Sosiri</p>
                </div>
                <div className="p-3 rounded border text-center">
                  <LogOut className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                  <p className="text-2xl font-bold text-blue-600">{raport.plecari.length}</p>
                  <p className="text-xs text-muted-foreground">Plecări</p>
                </div>
                <div className="p-3 rounded border text-center">
                  <Bed className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                  <p className="text-2xl font-bold text-purple-600">
                    {raport.camereOcupate}/{raport.camereTotale}
                  </p>
                  <p className="text-xs text-muted-foreground">Camere ocupate</p>
                </div>
                <div className="p-3 rounded border text-center">
                  <DollarSign className="h-5 w-5 mx-auto mb-1 text-green-600" />
                  <p className="text-2xl font-bold text-green-600">{raport.venitAzi} lei</p>
                  <p className="text-xs text-muted-foreground">Venit azi</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
                    <LogIn className="h-4 w-4 text-green-600" /> Sosiri
                  </h3>
                  {raport.sosiri.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nicio sosire</p>
                  ) : (
                    <div className="space-y-1">
                      {raport.sosiri.map((s, i) => (
                        <div key={i} className="flex justify-between text-sm p-1.5 rounded bg-green-50">
                          <span>{s.cursant}</span>
                          <span className="text-muted-foreground">Camera {s.camera}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
                    <LogOut className="h-4 w-4 text-blue-600" /> Plecări
                  </h3>
                  {raport.plecari.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nicio plecare</p>
                  ) : (
                    <div className="space-y-1">
                      {raport.plecari.map((p, i) => (
                        <div key={i} className="flex justify-between text-sm p-1.5 rounded bg-blue-50">
                          <span>{p.cursant}</span>
                          <span className="text-muted-foreground">Camera {p.camera}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rezumat financiar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 border-b">
                  <span>Plăți procesate azi</span>
                  <span className="font-medium">{raport.platiAzi}</span>
                </div>
                <div className="flex justify-between p-2 border-b">
                  <span>Venit total azi</span>
                  <span className="font-medium text-green-600">{raport.venitAzi} lei</span>
                </div>
                <div className="flex justify-between p-2 border-b">
                  <span>Ocupare</span>
                  <span className="font-medium">
                    {Math.round((raport.camereOcupate / raport.camereTotale) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between p-2">
                  <span>Total camere</span>
                  <span className="font-medium">{raport.camereTotale}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
