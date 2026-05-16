"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { efectueazaCheckIn, efectueazaCheckOut } from "@/lib/actions/operatiuni";
import { LogIn, LogOut, ClipboardList } from "lucide-react";

interface RezervareItem {
  id: string;
  cursant: string;
  camera: string;
  etaj: number;
  checkIn: string;
  checkOut: string;
  dataCheckin?: string;
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
    } catch {
      toast.error("Eroare la efectuarea Check-In");
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
    } catch {
      toast.error("Eroare la efectuarea Check-Out");
    }
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
              <p className="text-sm text-muted-foreground text-center py-4">Nu există rezervări în așteptare pentru check-in</p>
            ) : (
              <div className="space-y-2">
                {pendingCheckin.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded border bg-green-50">
                    <div>
                      <p className="font-medium text-sm">{r.cursant}</p>
                      <p className="text-xs text-muted-foreground">
                        Camera {r.camera} (etaj {r.etaj}) · {r.checkIn} → {r.checkOut}
                      </p>
                    </div>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleCheckIn(r.id)}>
                      <LogIn className="h-4 w-4 mr-1" /> Check-In
                    </Button>
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
                  <div key={r.id} className="flex items-center justify-between p-3 rounded border bg-blue-50">
                    <div>
                      <p className="font-medium text-sm">{r.cursant}</p>
                      <p className="text-xs text-muted-foreground">
                        Camera {r.camera} (etaj {r.etaj}) · Check-In: {r.dataCheckin} · Check-Out: {r.checkOut}
                      </p>
                    </div>
                    <Dialog>
                      <DialogTrigger>
                        <Button size="sm" variant="outline" className="border-blue-300" onClick={() => setCheckoutId(r.id)}>
                          <LogOut className="h-4 w-4 mr-1" /> Check-Out
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Check-Out — {r.cursant}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Starea camerei</Label>
                            <Textarea
                              placeholder="Descrieți starea camerei la predare..."
                              value={checkoutStare}
                              onChange={(e) => setCheckoutStare(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Daune constatate (opțional)</Label>
                            <Textarea
                              placeholder="Descrieți eventualele daune..."
                              value={checkoutDaune}
                              onChange={(e) => setCheckoutDaune(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Cost estimat daune (lei)</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={checkoutCost}
                              onChange={(e) => setCheckoutCost(e.target.value)}
                            />
                          </div>
                          <Button className="w-full" onClick={handleCheckOut}>
                            <LogOut className="h-4 w-4 mr-1" /> Finalizează Check-Out
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
