"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ROLE_LABELS } from "@/lib/roles";
import {
  Building2, Users, DollarSign,
  Bed, Clock,
} from "lucide-react";

interface Stats {
  totalCamere: number; camereDisponibile: number; camereOcupate: number;
  camereIndisponibile: number; totalCursanti: number; rezervariAzi: number;
  platiNeconfirmate: number; cursuriActive: number; venitTotal: number;
  rezervariInAsteptare: number;
}

interface Rezervare {
  id: string; cursant: string; camera: string;
  checkIn: string; checkOut: string; status: string;
}

const STATUS_STYLES: Record<string, string> = {
  PLATA_ASTEPTARE: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  ACHITATA: "bg-teal-500/15 text-teal-300 border-teal-500/30",
  CHECKIN_EFFECTUAT: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  CHECKOUT_EFFECTUAT: "bg-stone-500/15 text-stone-300 border-stone-500/30",
  ANULATA: "bg-red-500/15 text-red-300 border-red-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  PLATA_ASTEPTARE: "Plată în așteptare", ACHITATA: "Achitată",
  CHECKIN_EFFECTUAT: "Check-In", CHECKOUT_EFFECTUAT: "Check-Out",
  ANULATA: "Anulată",
};

function StatCard({ icon, label, value, sub, accent }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; accent?: string;
}) {
  return (
    <Card className="card-maritime animate-in">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[11px] text-stone-400 tracking-wide uppercase font-medium">{label}</p>
            <p className={`text-2xl heading-serif ${accent || "text-stone-100"}`}>{value}</p>
            {sub && <p className="text-[11px] text-stone-500">{sub}</p>}
          </div>
          <div className={`p-2 rounded-lg ${accent ? `${accent.replace("text-", "bg-").replace("stone-100", "teal-500/10").replace("teal-300", "teal-500/10").replace("amber-300", "amber-500/10")}/10` : "bg-teal-500/10"}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardClient({ role, stats, recentRezervari }: { role: string; stats: Stats; recentRezervari: Rezervare[] }) {
  const [data, setData] = useState(stats);
  const [recent, setRecent] = useState(recentRezervari);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/data");
      if (!res.ok) return;
      const d = await res.json();
      if (d.stats) setData(prev => ({ ...prev, ...d.stats }));
      if (d.recentRezervari) setRecent(d.recentRezervari);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  const ocuparePct = data.totalCamere > 0 ? Math.round((data.camereOcupate / data.totalCamere) * 100) : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="animate-in">
        <h1 className="text-xl heading-serif text-stone-100">
          Bun venit, <span className="text-teal-400">{ROLE_LABELS[role] || role}</span>
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">Panou de control — Campus Manager</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        <div className="animate-in animate-in-delay-1">
          <StatCard icon={<Building2 className="h-4 w-4 text-teal-300" />}
            label="Camere" value={`${data.camereOcupate}/${data.totalCamere}`}
            sub={`${data.camereDisponibile} libere · ${data.camereIndisponibile} înmentenanță`}
            accent="text-teal-300" />
        </div>
        <div className="animate-in animate-in-delay-2">
          <StatCard icon={<Users className="h-4 w-4 text-blue-300" />}
            label="Cursanți" value={data.totalCursanti}
            sub={`${data.cursuriActive} cursuri active`} accent="text-blue-300" />
        </div>
        <div className="animate-in animate-in-delay-3">
          <StatCard icon={<Bed className="h-4 w-4 text-emerald-300" />}
            label="Ocupare" value={`${ocuparePct}%`}
            sub={`${data.rezervariAzi} cazați azi`} accent="text-emerald-300" />
        </div>
        <div className="animate-in animate-in-delay-4">
          <StatCard icon={<DollarSign className="h-4 w-4 text-amber-300" />}
            label="Venit total" value={`${data.venitTotal} lei`}
            sub={`${data.platiNeconfirmate} plăți în așteptare`} accent="text-amber-300" />
        </div>
        <div className="animate-in animate-in-delay-4">
          <StatCard icon={<Clock className="h-4 w-4 text-stone-300" />}
            label="În așteptare" value={data.rezervariInAsteptare}
            sub="rezervări neachitate" accent="text-stone-300" />
        </div>
      </div>

      {/* Recent reservations */}
      <div className="animate-in animate-in-delay-4">
        <Card className="card-maritime">
          <div className="px-5 py-3.5 border-b border-navy-700 flex items-center justify-between">
            <h2 className="text-sm heading-serif text-stone-100">Rezervări recente</h2>
            <button onClick={refresh} className="text-[10px] text-stone-500 hover:text-stone-300 transition-colors">
              Reîmprospătează
            </button>
          </div>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-navy-700/50">
                    <th className="text-left py-3 px-5 font-medium text-stone-400 tracking-wider uppercase">Cursant</th>
                    <th className="text-left py-3 px-5 font-medium text-stone-400 tracking-wider uppercase">Camera</th>
                    <th className="text-left py-3 px-5 font-medium text-stone-400 tracking-wider uppercase">Check-In</th>
                    <th className="text-left py-3 px-5 font-medium text-stone-400 tracking-wider uppercase">Check-Out</th>
                    <th className="text-right py-3 px-5 font-medium text-stone-400 tracking-wider uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r, i) => (
                    <tr key={r.id}
                      className="border-b border-navy-700/30 hover:bg-white/[0.02] transition-colors"
                      style={{ animationDelay: `${i * 0.03}s` }}>
                      <td className="py-3 px-5 text-stone-200 font-medium">{r.cursant}</td>
                      <td className="py-3 px-5 text-stone-400">{r.camera}</td>
                      <td className="py-3 px-5 text-stone-400">{r.checkIn}</td>
                      <td className="py-3 px-5 text-stone-400">{r.checkOut}</td>
                      <td className="py-3 px-5 text-right">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${STATUS_STYLES[r.status] || "bg-stone-500/15 text-stone-300"}`}>
                          {STATUS_LABELS[r.status] || r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recent.length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-stone-500 text-xs">Nu există rezervări recente</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
