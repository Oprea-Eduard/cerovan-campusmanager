"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateHousekeepingStatus } from "@/lib/actions/operatiuni";
import { RotateCcw, CheckCircle, PlayCircle } from "lucide-react";

interface HousekeepingProps {
  stats: { murdar: number; inLucru: number; curat: number; verificat: number };
  camere: { id: string; numar: string; etaj: number; statusCuratenie: string }[];
}

export function HousekeepingList({ stats, camere }: HousekeepingProps) {
  const [updating, setUpdating] = useState<string | null>(null);

  const handleUpdate = useCallback(async (cameraId: string, status: string) => {
    setUpdating(cameraId);
    try {
      await updateHousekeepingStatus(cameraId, status);
      toast.success(`Camera marcată ca ${status === "CURAT" ? "curată" : status === "IN_LUCRU" ? "în lucru" : "murdară"}`);
    } catch {
      toast.error("Eroare la actualizare");
    }
    setUpdating(null);
  }, []);

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      MURDAR: "bg-red-50 border-red-300",
      IN_LUCRU: "bg-yellow-50 border-yellow-300",
      CURAT: "bg-green-50 border-green-300",
      VERIFICAT: "bg-blue-50 border-blue-300",
    };
    return map[s] || "bg-gray-50";
  };

  const statusLabel: Record<string, string> = {
    MURDAR: "Murdar",
    IN_LUCRU: "În lucru",
    CURAT: "Curat",
    VERIFICAT: "Verificat",
  };

  const statusDot = (s: string) => {
    const map: Record<string, string> = {
      MURDAR: "bg-red-500",
      IN_LUCRU: "bg-yellow-500",
      CURAT: "bg-green-500",
      VERIFICAT: "bg-blue-500",
    };
    return map[s] || "bg-gray-500";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-red-200">
          <CardContent className="p-4 text-center cursor-pointer hover:bg-red-50 transition-colors" onClick={() => document.getElementById("hk-grid")?.querySelectorAll("[data-status='MURDAR']")[0]?.scrollIntoView({ behavior: "smooth" })}>
            <p className="text-2xl font-bold text-red-600">{stats.murdar}</p>
            <p className="text-xs text-muted-foreground">Murdare</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.inLucru}</p>
            <p className="text-xs text-muted-foreground">În lucru</p>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.curat}</p>
            <p className="text-xs text-muted-foreground">Curate</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.verificat}</p>
            <p className="text-xs text-muted-foreground">Verificate</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status curățenie per cameră</CardTitle>
        </CardHeader>
        <CardContent>
          <div id="hk-grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {camere.map((c) => (
              <div
                key={c.id}
                data-status={c.statusCuratenie}
                className={`p-3 rounded border text-sm ${statusColor(c.statusCuratenie)}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold">{c.numar}</span>
                  <span className={`w-2 h-2 rounded-full ${statusDot(c.statusCuratenie)}`} />
                </div>
                <p className="text-xs text-muted-foreground mb-2">{statusLabel[c.statusCuratenie]}</p>

                {c.statusCuratenie === "MURDAR" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-7 text-xs"
                    onClick={() => handleUpdate(c.id, "IN_LUCRU")}
                    disabled={updating === c.id}
                  >
                    <PlayCircle className="h-3 w-3 mr-1" /> Începe
                  </Button>
                )}
                {c.statusCuratenie === "IN_LUCRU" && (
                  <Button
                    size="sm"
                    className="w-full h-7 text-xs bg-green-600 hover:bg-green-700"
                    onClick={() => handleUpdate(c.id, "CURAT")}
                    disabled={updating === c.id}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" /> Finalizat
                  </Button>
                )}
                {c.statusCuratenie === "CURAT" && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-7 text-xs"
                      onClick={() => handleUpdate(c.id, "MURDAR")}
                      disabled={updating === c.id}
                    >
                      <RotateCcw className="h-3 w-3 mr-1" /> Revino
                    </Button>
                  </div>
                )}
                {c.statusCuratenie === "VERIFICAT" && (
                  <p className="text-xs text-center text-blue-600 font-medium">Verificat</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
