"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { efectueazaCheckIn, efectueazaCheckOut } from "@/lib/actions/operatiuni";
import { LogIn, LogOut, ClipboardList, GraduationCap, Mail, Phone, Building2 } from "lucide-react";

interface CursInfo {
  denumire: string;
  perioada: string;
}

interface RezervareItem {
  id: string;
  cursant: string;
  email?: string;
  telefon?: string;
  firma?: string;
  camera: string;
  etaj: number;
  checkIn: string;
  checkOut: string;
  dataCheckin?: string;
  cursuri: CursInfo[];
}

interface CheckoutItem extends RezervareItem {
  dataCheckin: string;
  dataCheckout: string;
  areNote: boolean;
}

export function CheckInOutClient({
  pendingCheckin,
  activeCheckin,
  recentCheckout,
}: {
  pendingCheckin: RezervareItem[];
  activeCheckin: RezervareItem[];
  recentCheckout: CheckoutItem[];
}) {
  const [checkoutStare, setCheckoutStare] = useState("");
  const [checkoutDaune, setCheckoutDaune] = useState("");
  const [checkoutCost, setCheckoutCost] = useState("");
  const [checkoutId, setCheckoutId] = useState<string | null>(null);

  const handleCheckIn = async (id: string) => {
    try {
      await efectueazaCheckIn(id);
      toast.success("Check-In efectuat cu succes");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Eroare la efectuarea Check-In");
    }
  };

  const handleCheckOut = async () => {
    if (!checkoutId) return;
    try {
      await efectueazaCheckOut(
        checkoutId,
        checkoutStare,
        checkoutDaune || undefined,
        checkoutCost ? parseFloat(checkoutCost) : undefined
      );
      toast.success("Check-Out efectuat cu succes");
      setCheckoutId(null);
      setCheckoutStare("");
      setCheckoutDaune("");
      setCheckoutCost("");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Eroare la efectuarea Check-Out");
    }
  };

  const renderCursuri = (cursuri: CursInfo[]) => {
    if (!cursuri || cursuri.length === 0) return null;
    return (
      <div className="mt-1 space-y-0.5">
        {cursuri.map((c, i) => (
          <div key={i} className="flex items-center gap-1 text-xs text-blue-700">
            <GraduationCap className="h-3 w-3 flex-shrink-0" />
            <span className="font-medium truncate max-w-[180px]">{c.denumire}</span>
            <span className="text-muted-foreground">({c.perioada})</span>
          </div>
        ))}
      </div>
    );
  };

  const renderContact = (item: RezervareItem) => {
    if (!item.email && !item.telefon && !item.firma) return null;
    return (
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
        {item.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{item.email}</span>}
        {item.telefon && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{item.telefon}</span>}
        {item.firma && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{item.firma}</span>}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Check-In / Check-Out</h1>
        <p className="text-muted-foreground">Proces de cazare și eliberare a camerelor</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <LogIn className="h-5 w-5 text-green-600" />
              <span>Check-In (în așteptare)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingCheckin.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nu există rezervări în așteptare</p>
            ) : (
              <div className="space-y-2">
                {pendingCheckin.map((r) => (
                  <div key={r.id} className="p-3 rounded border bg-green-50">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm">{r.cursant}</p>
                        {renderContact(r)}
                        <p className="text-xs text-muted-foreground mt-1">
                          Camera {r.camera} (etaj {r.etaj}) · {r.checkIn} → {r.checkOut}
                        </p>
                        {renderCursuri(r.cursuri)}
                      </div>
                      <Button size="sm" className="ml-2 bg-green-600 hover:bg-green-700 flex-shrink-0" onClick={() => handleCheckIn(r.id)}>
                        <LogIn className="h-4 w-4 mr-1" /> Check-In
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <LogOut className="h-5 w-5 text-blue-600" />
              <span>Check-Out (camere ocupate)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeCheckin.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nu există camere ocupate</p>
            ) : (
              <div className="space-y-2">
                {activeCheckin.map((r) => (
                  <div key={r.id} className="p-3 rounded border bg-blue-50">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm">{r.cursant}</p>
                        {renderContact(r)}
                        <p className="text-xs text-muted-foreground mt-1">
                          Camera {r.camera} (etaj {r.etaj}) · Check-In: {r.dataCheckin} · Check-Out: {r.checkOut}
                        </p>
                        {renderCursuri(r.cursuri)}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="ml-2 border-blue-300 flex-shrink-0"
                        onClick={() => setCheckoutId(r.id)}
                      >
                        <LogOut className="h-4 w-4 mr-1" /> Check-Out
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {checkoutId && (() => {
        const r = [...pendingCheckin, ...activeCheckin].find(x => x.id === checkoutId);
        return (
          <Dialog open={true} onOpenChange={(o) => { if (!o) setCheckoutId(null); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Check-Out — {r?.cursant}</DialogTitle>
              </DialogHeader>
              {r && renderCursuri(r.cursuri)}
              <div className="space-y-4 mt-2">
                <div>
                  <Label>Starea camerei</Label>
                  <Textarea placeholder="Descrieți starea camerei la predare..." value={checkoutStare} onChange={(e) => setCheckoutStare(e.target.value)} />
                </div>
                <div>
                  <Label>Daune constatate (opțional)</Label>
                  <Textarea placeholder="Descrieți eventualele daune..." value={checkoutDaune} onChange={(e) => setCheckoutDaune(e.target.value)} />
                </div>
                <div>
                  <Label>Cost estimat daune (lei)</Label>
                  <Input type="number" placeholder="0" value={checkoutCost} onChange={(e) => setCheckoutCost(e.target.value)} />
                </div>
                <Button className="w-full" onClick={handleCheckOut}>
                  <LogOut className="h-4 w-4 mr-1" /> Finalizează Check-Out
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        );
      })()}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            <span>Check-Out-uri recente</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Cursant</th>
                  <th className="pb-2 font-medium">Camera</th>
                  <th className="pb-2 font-medium">Check-In</th>
                  <th className="pb-2 font-medium">Check-Out</th>
                  <th className="pb-2 font-medium">Note</th>
                </tr>
              </thead>
              <tbody>
                {recentCheckout.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="py-2">{r.cursant}</td>
                    <td className="py-2">{r.camera}</td>
                    <td className="py-2">{r.dataCheckin}</td>
                    <td className="py-2">{r.dataCheckout}</td>
                    <td className="py-2">
                      {r.areNote ? (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Daune</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
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
