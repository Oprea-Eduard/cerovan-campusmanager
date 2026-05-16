"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Bed } from "lucide-react";

interface CameraRoomPlan {
  id: string;
  numar: string;
  tip: string;
  tipRaw: string;
  etaj: number;
  status: string;
  statusLabel: string;
  capacitate: number;
  color: string;
  cheieStatus: string | null;
}

export function RoomPlan({ camere, etaje }: { camere: CameraRoomPlan[]; etaje: number[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Plan camere</h2>
      {etaje.map((etaj) => {
        const camereEtaj = camere.filter((c) => c.etaj === etaj);
        return (
          <div key={etaj}>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Etaj {etaj}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {camereEtaj.map((camera) => (
                <Tooltip key={camera.id}>
                  <TooltipTrigger>
                    <Card
                      className={`${camera.color} cursor-pointer hover:shadow-md transition-shadow`}
                    >
                      <CardContent className="p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm">{camera.numar}</span>
                          <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                            {camera.tip === "Apartament" ? "AP" : "STD"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Bed className="h-3 w-3" />
                          <span>{camera.capacitate} locuri</span>
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="w-48">
                    <div className="space-y-1 text-xs">
                      <p className="font-medium">{camera.numar}</p>
                      <p>Tip: {camera.tip}</p>
                      <p>Capacitate: {camera.capacitate} persoane</p>
                      <p>Status: {camera.statusLabel}</p>
                      {camera.cheieStatus && (
                        <p>Cheie: {camera.cheieStatus === "LA_RECEPTIE" ? "La recepție" : camera.cheieStatus === "PREDATA_CURSANT" ? "Predată cursant" : "Pierdută"}</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
