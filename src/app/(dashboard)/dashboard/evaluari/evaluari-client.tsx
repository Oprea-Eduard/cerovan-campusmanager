"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MessageSquare } from "lucide-react";

interface Scor {
  total: number;
  medieCuratenie: number; medieConfort: number; medieDotari: number;
  mediePersonal: number; medieOrganizare: number;
}

interface EvalItem {
  id: string; cursant: string;
  curatenie: number; confort: number; dotari: number;
  personal: number; organizare: number; observatii: string;
}

function Bara({ label, scor, max = 4 }: { label: string; scor: number; max?: number }) {
  const pct = Math.round((scor / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{scor}/{max}</span>
      </div>
      <div className="h-2 bg-muted rounded overflow-hidden">
        <div className="h-full bg-blue-500 rounded transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function EvaluariClient({ stats, evaluari }: { stats: Scor; evaluari: EvalItem[] }) {
  const notaGenerala = stats.medieCuratenie > 0
    ? ((stats.medieCuratenie + stats.medieConfort + stats.medieDotari + stats.mediePersonal + stats.medieOrganizare) / 5).toFixed(1)
    : "—";

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Evaluări satisfacție</h1>
        <p className="text-muted-foreground">Feedback de la cursanții cazați</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Scoruri medii</CardTitle></CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <p className="text-4xl font-bold text-blue-600">{notaGenerala}</p>
            <p className="text-sm text-muted-foreground">Nota generală / 4.0</p>
            <p className="text-xs text-muted-foreground">Din {stats.total} evaluări</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Bara label="Curățenie" scor={stats.medieCuratenie} />
            <Bara label="Confort" scor={stats.medieConfort} />
            <Bara label="Dotări" scor={stats.medieDotari} />
            <Bara label="Personal" scor={stats.mediePersonal} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Evaluări recente</CardTitle></CardHeader>
        <CardContent>
          {evaluari.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Nu există evaluări încă</p>
          ) : (
            <div className="space-y-3">
              {evaluari.map((e) => (
                <div key={e.id} className="p-3 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">{e.cursant}</p>
                    <div className="flex gap-3 text-xs">
                      <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" />{e.curatenie}</span>
                      <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" />{e.confort}</span>
                      <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" />{e.dotari}</span>
                      <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" />{e.personal}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" /> {e.observatii}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
