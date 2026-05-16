import { requireAuth } from "@/lib/security";
import { ApiDocsClient } from "./api-docs-client";

export default async function ApiDocsPage() {
  await requireAuth();

  const endpoints = [
    { method: "GET", path: "/api/dashboard/data", desc: "Date dashboard (statistici live)", auth: "Da" },
    { method: "POST", path: "/api/upload", desc: "Upload documente pentru cerere cazare", auth: "Da" },
    { method: "POST", path: "/api/auth/[...nextauth]", desc: "Autentificare NextAuth (login, logout, session)", auth: "Nu" },
  ];

  const serverActions = [
    { name: "createCursant", desc: "Creare cursant nou", roles: "PROGRAMARE, ADMINISTRATIV, CONDUCERE" },
    { name: "updateCursant", desc: "Actualizare date cursant", roles: "PROGRAMARE, ADMINISTRATIV, CONDUCERE" },
    { name: "deleteCursant", desc: "Ștergere cursant", roles: "PROGRAMARE, ADMINISTRATIV" },
    { name: "createCurs", desc: "Creare curs nou", roles: "PROGRAMARE, CONDUCERE" },
    { name: "updateCurs", desc: "Actualizare curs", roles: "PROGRAMARE, CONDUCERE" },
    { name: "deleteCurs", desc: "Ștergere curs", roles: "PROGRAMARE, CONDUCERE" },
    { name: "toggleCursActiv", desc: "Activare/dezactivare curs", roles: "PROGRAMARE, CONDUCERE" },
    { name: "createInscriere", desc: "Înscriere cursant la curs", roles: "PROGRAMARE, ADMINISTRATIV" },
    { name: "createRezervare", desc: "Creare rezervare cameră", roles: "RECEPTIE, ADMINISTRATIV, PROGRAMARE" },
    { name: "anuleazaRezervare", desc: "Anulare rezervare", roles: "RECEPTIE, ADMINISTRATIV" },
    { name: "efectueazaCheckIn", desc: "Check-In cursant", roles: "RECEPTIE, ADMINISTRATIV" },
    { name: "efectueazaCheckOut", desc: "Check-Out cursant", roles: "RECEPTIE, ADMINISTRATIV" },
    { name: "updateHousekeepingStatus", desc: "Actualizare status curățenie", roles: "Toți" },
    { name: "confirmPlata", desc: "Confirmare plată", roles: "CONTABILITATE, ADMINISTRATIV, CONDUCERE" },
    { name: "adaugaPlata", desc: "Adăugare plată", roles: "CONTABILITATE, ADMINISTRATIV" },
    { name: "genereazaNotaPlata", desc: "Generare PDF Notă de Plată", roles: "Toți" },
    { name: "aprobaCerere", desc: "Aprobare cerere cazare", roles: "PROGRAMARE, ADMINISTRATIV" },
    { name: "respingeCerere", desc: "Respingere cerere cazare", roles: "PROGRAMARE, ADMINISTRATIV" },
    { name: "updateTarif", desc: "Actualizare tarif cameră", roles: "CONDUCERE, ADMINISTRATIV" },
    { name: "createUser", desc: "Creare utilizator nou", roles: "CONDUCERE" },
    { name: "toggleUserActiv", desc: "Activare/dezactivare utilizator", roles: "CONDUCERE" },
    { name: "genereazaRaportNoapte", desc: "Generare raport Night Audit", roles: "CONDUCERE, ADMINISTRATIV" },
  ];

  const models = [
    { nume: "User", table: "users", desc: "Utilizatori ai platformei" },
    { nume: "Cursant", table: "cursanti", desc: "Cursanți înregistrați" },
    { nume: "Curs", table: "cursuri", desc: "Cursuri CERONAV" },
    { nume: "InscriereCurs", table: "inscrieri_curs", desc: "Înscrieri cursanți la cursuri" },
    { nume: "Camera", table: "camere", desc: "Camere de cazare" },
    { nume: "InventarCamera", table: "inventar_camera", desc: "Inventar per cameră" },
    { nume: "Rezervare", table: "rezervari", desc: "Rezervări camere" },
    { nume: "CerereCazare", table: "cereri_cazare", desc: "Cereri de cazare" },
    { nume: "Plata", table: "plati", desc: "Plăți" },
    { nume: "CheckInOut", table: "checkinout", desc: "Istoric check-in/out" },
    { nume: "NotaConstatare", table: "note_constatare", desc: "Note de constatare daune" },
    { nume: "Housekeeping", table: "housekeeping", desc: "Status curățenie" },
    { nume: "Cheie", table: "chei", desc: "Chei camere" },
    { nume: "Parcare", table: "parcare", desc: "Locuri de parcare" },
    { nume: "ObiectPierdut", table: "obiecte_pierdute", desc: "Obiecte pierdute/găsite" },
    { nume: "Tarif", table: "tarife", desc: "Tarife cazare" },
    { nume: "Notificare", table: "notificari", desc: "Notificări sistem" },
    { nume: "Evaluare", table: "evaluari", desc: "Evaluări satisfacție" },
    { nume: "AuditLog", table: "audit_log", desc: "Jurnal audit" },
  ];

  return (
    <ApiDocsClient
      endpoints={endpoints}
      serverActions={serverActions}
      models={models}
      dbUrl={process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":****@") || "N/A"}
    />
  );
}
