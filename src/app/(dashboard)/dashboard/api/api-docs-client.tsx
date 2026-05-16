"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Database, Server, Shield } from "lucide-react";

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = { GET: "bg-green-100 text-green-800", POST: "bg-blue-100 text-blue-800" };
  return <span className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${colors[method] || "bg-gray-100"}`}>{method}</span>;
}

export function ApiDocsClient({
  endpoints, serverActions, models, dbUrl,
}: {
  endpoints: { method: string; path: string; desc: string; auth: string }[];
  serverActions: { name: string; desc: string; roles: string }[];
  models: { nume: string; table: string; desc: string }[];
  dbUrl: string;
}) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Documentație API</h1>
        <p className="text-muted-foreground">Endpoint-uri, server actions și modelul datelor</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Server className="h-5 w-5" /> REST API</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {endpoints.map((e, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded border text-sm">
                  <MethodBadge method={e.method} />
                  <div className="flex-1 min-w-0">
                    <code className="text-xs font-mono">{e.path}</code>
                    <p className="text-xs text-muted-foreground">{e.desc}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{e.auth === "Da" ? "Auth" : "Public"}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Code className="h-5 w-5" /> Server Actions</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-[400px] overflow-y-auto">
              {serverActions.map((a, i) => (
                <div key={i} className="flex items-start justify-between p-1.5 text-xs border-b last:border-0">
                  <div className="min-w-0 flex-1">
                    <code className="font-medium">{a.name}</code>
                    <p className="text-muted-foreground">{a.desc}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] ml-2 flex-shrink-0">{a.roles}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Database className="h-5 w-5" /> Bază de date — 19 modele</CardTitle></CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            PostgreSQL 16 · URL: <code className="text-xs">{dbUrl}</code>
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {models.map((m, i) => (
              <div key={i} className="p-2 rounded border text-xs">
                <p className="font-medium">{m.nume}</p>
                <p className="text-muted-foreground">{m.table}</p>
                <p className="text-muted-foreground text-[10px]">{m.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Shield className="h-5 w-5" /> Securitate</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-2">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-2 rounded border"><p className="font-medium text-xs">Autentificare</p><p className="text-xs text-muted-foreground">NextAuth JWT, sesiune 8h</p></div>
            <div className="p-2 rounded border"><p className="font-medium text-xs">Autorizare</p><p className="text-xs text-muted-foreground">6 roluri, middleware per rută</p></div>
            <div className="p-2 rounded border"><p className="font-medium text-xs">Validare</p><p className="text-xs text-muted-foreground">Input validation pe server actions</p></div>
            <div className="p-2 rounded border"><p className="font-medium text-xs">Audit</p><p className="text-xs text-muted-foreground">Toate operațiunile logate</p></div>
            <div className="p-2 rounded border"><p className="font-medium text-xs">CSP</p><p className="text-xs text-muted-foreground">Content-Security-Policy headers</p></div>
            <div className="p-2 rounded border"><p className="font-medium text-xs">HTTPS</p><p className="text-xs text-muted-foreground">nginx + SSL (prod)</p></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
