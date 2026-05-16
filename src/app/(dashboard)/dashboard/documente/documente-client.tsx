"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FileText, Upload } from "lucide-react";

interface DocumentInfo {
  id: string;
  tip: string;
  numeFisier: string;
}

interface CerereInfo {
  id: string;
  cursant: string;
  camera: string;
  documente: DocumentInfo[];
  status: string;
}

export function DocumenteClient({ cereri }: { cereri: CerereInfo[] }) {
  const [files, setFiles] = useState<FileList | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const tipDocLabels: Record<string, string> = {
    COPIE_CI: "Copie CI/Pașaport",
    DOVADA_INSCRIERE: "Dovadă înscriere curs",
    DOVADA_PLATA_CURS: "Dovadă plată curs",
    ALTE_DOCUMENTE: "Alte documente",
  };

  const handleUpload = async (cerereId: string) => {
    if (!files || files.length === 0) {
      toast.error("Selectați un fișier");
      return;
    }

    const formData = new FormData();
    formData.append("cerereId", cerereId);
    Array.from(files).forEach(f => formData.append("files", f));

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload eșuat");
      toast.success("Documente încărcate");
      setFiles(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch {
      toast.error("Eroare la upload");
    }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      IN_ASTEPTARE: "bg-yellow-100 text-yellow-800",
      APROBATA: "bg-green-100 text-green-800",
      RESPINSA: "bg-red-100 text-red-800",
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[s] || ""}`}>
        {s === "IN_ASTEPTARE" ? "În așteptare" : s === "APROBATA" ? "Aprobată" : "Respinsă"}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Documente</h1>
        <p className="text-muted-foreground">Gestionare documente pentru cererile de cazare</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {cereri.map((c) => (
          <Card key={c.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{c.cursant}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Camera {c.camera} · {statusBadge(c.status)}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {c.documente.length > 0 && (
                <div className="mb-3 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Documente încărcate:</p>
                  {c.documente.map((d) => (
                    <div key={d.id} className="flex items-center gap-2 text-sm p-1.5 rounded bg-muted/50">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="flex-1">{tipDocLabels[d.tip] || d.tip}</span>
                      <span className="text-xs text-muted-foreground">{d.numeFisier}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label className="text-xs">Încarcă documente</Label>
                  <Input
                    ref={fileRef}
                    type="file"
                    multiple
                    className="text-xs"
                    onChange={(e) => setFiles(e.target.files)}
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpload(c.id)}
                  disabled={!files || files.length === 0}
                >
                  <Upload className="h-4 w-4 mr-1" /> Upload
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {cereri.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Nu există cereri de cazare</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
