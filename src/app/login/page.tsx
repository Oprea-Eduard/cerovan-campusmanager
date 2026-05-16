"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      toast.error("Email sau parolă incorectă");
      setLoading(false);
      return;
    }
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950 relative overflow-hidden">
      {/* Wave decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute bottom-0 w-[200%] h-32 opacity-[0.04]" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0 C300,100 500,0 800,100 C1000,0 1100,100 1200,60 L1200,120 L0,120 Z"
            className="fill-teal-400 animate-wave" />
        </svg>
        <svg className="absolute bottom-0 w-[200%] h-24 opacity-[0.03]" style={{ animationDelay: "-3s" }} viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,60 C200,0 400,100 600,40 C800,0 900,80 1200,40 L1200,120 L0,120 Z"
            className="fill-teal-400 animate-wave" />
        </svg>
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: "linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      <Card className="w-full max-w-md mx-4 relative z-10 bg-navy-900/80 backdrop-blur-xl border-navy-700 shadow-2xl shadow-black/30">
        <CardHeader className="text-center pb-2">
          <div className="mb-4">
            <span className="text-4xl">⚓</span>
          </div>
          <CardTitle className="text-xl heading-serif text-stone-100">
            Campus Manager
          </CardTitle>
          <p className="text-xs text-stone-400 mt-1">
            Sistem intern de gestionare a cazării — CERONAV
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-stone-300">Email</Label>
              <Input id="email" type="email" placeholder="nume@ceronav.ro"
                value={email} onChange={(e) => setEmail(e.target.value)}
                required autoFocus
                className="bg-navy-800 border-navy-600 text-stone-100 placeholder:text-stone-500 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs text-stone-300">Parolă</Label>
              <Input id="password" type="password" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-navy-800 border-navy-600 text-stone-100 placeholder:text-stone-500 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 h-9 text-sm" />
            </div>
            <Button type="submit" disabled={loading}
              className="w-full h-9 text-sm font-medium bg-teal-500 hover:bg-teal-400 text-navy-950 transition-all active:scale-[0.98]">
              {loading ? "Se autentifică..." : "Autentificare"}
            </Button>
          </form>
          <p className="text-[10px] text-stone-600 text-center mt-4">
            © {new Date().getFullYear()} CERONAV — Toate drepturile rezervate
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
