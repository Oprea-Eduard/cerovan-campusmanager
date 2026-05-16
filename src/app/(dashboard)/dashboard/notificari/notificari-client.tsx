"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { citesteNotificare } from "@/lib/actions/operatiuni";
import { AlertCircle, Info, CalendarCheck, DollarSign, DoorOpen } from "lucide-react";

interface NotifItem {
  id: string; titlu: string; mesaj: string; tip: string;
  citita: boolean; createdAt: string; prioritate: string;
}

const TIP_ICON: Record<string, React.ReactNode> = {
  PLATA_SCADENTA: <DollarSign className="h-4 w-4 text-red-500" />,
  CHECKIN_ASTEPTARE: <DoorOpen className="h-4 w-4 text-blue-500" />,
  CERERE_NOUA: <AlertCircle className="h-4 w-4 text-yellow-500" />,
  CAZARE_FINALIZATA: <CalendarCheck className="h-4 w-4 text-green-500" />,
  SISTEM: <Info className="h-4 w-4 text-gray-500" />,
};

export function NotificariClient({ notificari, stat }: { notificari: NotifItem[]; stat: { total: number; necitite: number } }) {
  const handleCiteste = async (id: string) => {
    try { await citesteNotificare(id); toast.success("Marcată ca citită"); }
    catch { toast.error("Eroare"); }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notificări</h1>
          <p className="text-muted-foreground">Alerte și informări sistem</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{stat.total}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
        <Card className="border-blue-200"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-600">{stat.necitite}</p><p className="text-xs text-muted-foreground">Necitite</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Listă notificări</CardTitle></CardHeader>
        <CardContent>
          {notificari.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Nu există notificări</p>
          ) : (
            <div className="space-y-1">
              {notificari.map((n) => (
                <div key={n.id} className={`flex items-start gap-3 p-3 rounded border ${!n.citita ? "bg-blue-50 border-blue-200" : ""}`}>
                  <div className="mt-0.5">{TIP_ICON[n.tip] || <Info className="h-4 w-4" />}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium ${!n.citita ? "text-blue-800" : ""}`}>{n.titlu}</p>
                      {!n.citita && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{n.mesaj}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.createdAt} · {n.prioritate}</p>
                  </div>
                  {!n.citita && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs flex-shrink-0" onClick={() => handleCiteste(n.id)}>
                      Marchează citit
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
