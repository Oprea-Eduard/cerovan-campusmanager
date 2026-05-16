import "dotenv/config";
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Create users for each role
  const users = [
    { email: "director@ceronav.ro", name: "Dan Pisică", role: "CONDUCERE" as const, password: "parola123" },
    { email: "administrativ@ceronav.ro", name: "Alexandru Scântee", role: "ADMINISTRATIV" as const, password: "parola123" },
    { email: "receptie@ceronav.ro", name: "Responsabil Recepție", role: "RECEPTIE" as const, password: "parola123" },
    { email: "programare@ceronav.ro", name: "Operator Programare", role: "PROGRAMARE" as const, password: "parola123" },
    { email: "contabilitate@ceronav.ro", name: "Contabil", role: "CONTABILITATE" as const, password: "parola123" },
    { email: "camerista@ceronav.ro", name: "Cameristă", role: "CAMERISTA" as const, password: "parola123" },
  ];

  for (const u of users) {
    const hashed = await hash(u.password, 12);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        password: hashed,
        role: u.role,
      },
    });
    console.log(`  ✓ User ${u.email} (${u.role})`);
  }

  // Create rooms (36 standard + 8 apartments)
  const rooms = [];
  for (let i = 1; i <= 36; i++) {
    rooms.push({
      numar: `${100 + i}`,
      tip: "SINGLE_STANDARD" as const,
      etaj: Math.ceil(i / 12),
      capacitate: 2,
    });
  }
  for (let i = 1; i <= 8; i++) {
    rooms.push({
      numar: `AP-${i}`,
      tip: "APARTAMENT" as const,
      etaj: 3 + Math.ceil(i / 4),
      capacitate: 3,
    });
  }

  for (const r of rooms) {
    await prisma.camera.upsert({
      where: { numar: r.numar },
      update: {},
      create: r,
    });
  }
  console.log(`  ✓ ${rooms.length} camere create`);

  // Create inventory items for a sample room
  const camera = await prisma.camera.findFirst({ where: { numar: "101" } });
  if (camera) {
    const inventoryItems = [
      { denumire: "Pat single", cantitate: 2 },
      { denumire: "Noptieră", cantitate: 2 },
      { denumire: "Dulap", cantitate: 1 },
      { denumire: "Masă", cantitate: 1 },
      { denumire: "Scaun", cantitate: 2 },
      { denumire: "Televizor", cantitate: 1 },
      { denumire: "Aer condiționat", cantitate: 1 },
      { denumire: "Prosoape", cantitate: 4 },
      { denumire: "Lenjerie pat", cantitate: 2 },
      { denumire: "Gel duș", cantitate: 2 },
      { denumire: "Șampon", cantitate: 2 },
      { denumire: "Hârtie igienică", cantitate: 2 },
    ];
    for (const item of inventoryItems) {
      await prisma.inventarCamera.create({
        data: { cameraId: camera.id, ...item },
      });
    }
    console.log(`  ✓ ${inventoryItems.length} inventar items for camera 101`);
  }

  // === Cursuri CERONAV reale ===
  // Structurate pe categorii: MARITIM, FLUVIAL, OFFSHORE, ONSHORE
  const cursuri: { denumire: string; durataZile: number; categorie: string }[] = [
    // === MARITIM - Personal maritim ===
    { denumire: "STCW Formare de bază (siguranță, STCW A-VI/1)", durataZile: 5, categorie: "MARITIM" },
    { denumire: "STCW Lupta contra incendiilor - nivel avansat", durataZile: 4, categorie: "MARITIM" },
    { denumire: "STCW Primul ajutor medical", durataZile: 3, categorie: "MARITIM" },
    { denumire: "STCW Îngrijiri medicale la bord", durataZile: 5, categorie: "MARITIM" },
    { denumire: "STCW Supraviețuire pe mare (barcă și plute)", durataZile: 3, categorie: "MARITIM" },
    { denumire: "STCW Operator GMDSS (ROC)", durataZile: 10, categorie: "MARITIM" },
    { denumire: "STCW Operator GMDSS (GOC)", durataZile: 15, categorie: "MARITIM" },
    { denumire: "STCW Radar NAVETIGARE (ARPA)", durataZile: 7, categorie: "MARITIM" },
    { denumire: "STCW Pod de navigație integrat (INS)", durataZile: 5, categorie: "MARITIM" },
    { denumire: "STCW SIGURANța navei și prevenirea poluării", durataZile: 4, categorie: "MARITIM" },
    { denumire: "STCW Marină militară - modul de bază", durataZile: 5, categorie: "MARITIM" },
    { denumire: "STCW Marină militară - modul avansat", durataZile: 5, categorie: "MARITIM" },
    { denumire: "STCW Securitate la bord (SSO)", durataZile: 3, categorie: "MARITIM" },
    { denumire: "Curs ofițer punte (nivel operațional)", durataZile: 30, categorie: "MARITIM" },
    { denumire: "Curs ofițer mecanic (nivel operațional)", durataZile: 30, categorie: "MARITIM" },
    { denumire: "Curs ofițer electrician", durataZile: 20, categorie: "MARITIM" },
    { denumire: "Curs marinar - matelot", durataZile: 10, categorie: "MARITIM" },
    { denumire: "Codul Răspunderii Civile (CLC - Oil Pollution)", durataZile: 2, categorie: "MARITIM" },
    { denumire: "Marpol - prevenirea poluării", durataZile: 3, categorie: "MARITIM" },
    { denumire: "Solas - siguranța vieții pe mare", durataZile: 3, categorie: "MARITIM" },
    { denumire: "ISPS - securitatea instalațiilor portuare", durataZile: 3, categorie: "MARITIM" },
    { denumire: "Management resurse punte (BRM)", durataZile: 4, categorie: "MARITIM" },
    { denumire: "Management resurse mașină (ERM)", durataZile: 4, categorie: "MARITIM" },
    { denumire: "Navigație în condiții de gheață", durataZile: 4, categorie: "MARITIM" },
    { denumire: "Operațiuni cu tancuri petroliere", durataZile: 5, categorie: "MARITIM" },
    { denumire: "Operațiuni cu tancuri chimice", durataZile: 5, categorie: "MARITIM" },
    { denumire: "Operațiuni cu tancuri GPL/GNL", durataZile: 5, categorie: "MARITIM" },
    { denumire: "EFT - ECDIS (hărți electronice)", durataZile: 5, categorie: "MARITIM" },
    { denumire: "Navigație generală și astronomică", durataZile: 10, categorie: "MARITIM" },
    { denumire: "Comunicații maritime în limba engleză", durataZile: 5, categorie: "MARITIM" },
    { denumire: "IMDG - transport mărfuri periculoase", durataZile: 4, categorie: "MARITIM" },
    { denumire: "Stabilitate navă și construcție navală", durataZile: 8, categorie: "MARITIM" },
    { denumire: "Electrică navală și automatizări", durataZile: 10, categorie: "MARITIM" },
    { denumire: "Conducere și operare macarale de bord", durataZile: 5, categorie: "MARITIM" },
    { denumire: "Sudură și întreținere bord", durataZile: 5, categorie: "MARITIM" },
    { denumire: "Refresher STCW - actualizare competențe", durataZile: 3, categorie: "MARITIM" },
    { denumire: "Training instructor maritim", durataZile: 5, categorie: "MARITIM" },
    { denumire: "Assessor maritim - evaluare competențe", durataZile: 4, categorie: "MARITIM" },
    // === FLUVIAL - Personal fluvial ===
    { denumire: "Navigație pe Dunăre - modul de bază", durataZile: 10, categorie: "FLUVIAL" },
    { denumire: "Navigație pe ape interioare - avansat", durataZile: 8, categorie: "FLUVIAL" },
    { denumire: "Radar fluvial - operare", durataZile: 5, categorie: "FLUVIAL" },
    { denumire: "Comunicații fluviale", durataZile: 3, categorie: "FLUVIAL" },
    { denumire: "Manevra navei pe fluviu", durataZile: 5, categorie: "FLUVIAL" },
    { denumire: "Regulament navigație pe Dunăre", durataZile: 3, categorie: "FLUVIAL" },
    { denumire: "ECDI - hărți electronice fluviale", durataZile: 5, categorie: "FLUVIAL" },
    { denumire: "Transport mărfuri periculoase pe ape interioare (ADN)", durataZile: 4, categorie: "FLUVIAL" },
    { denumire: "Siguranța navei pe fluviu", durataZile: 3, categorie: "FLUVIAL" },
    { denumire: "Ofițer fluvial - nivel operațional", durataZile: 25, categorie: "FLUVIAL" },
    { denumire: "Mecanic fluvial", durataZile: 25, categorie: "FLUVIAL" },
    { denumire: "Marinar fluvial", durataZile: 10, categorie: "FLUVIAL" },
    // === OFFSHORE ===
    { denumire: "BOSIET - Basic Offshore Safety (BOSIET)", durataZile: 4, categorie: "OFFSHORE" },
    { denumire: "HUET - Helicopter Underwater Escape Training", durataZile: 2, categorie: "OFFSHORE" },
    { denumire: "FOET - Further Offshore Emergency Training", durataZile: 2, categorie: "OFFSHORE" },
    { denumire: "H2S - Hydrogen Sulphide Awareness", durataZile: 2, categorie: "OFFSHORE" },
    { denumire: "Offshore medic prim ajutor", durataZile: 3, categorie: "OFFSHORE" },
    { denumire: "Lucru la înălțime - offshore", durataZile: 3, categorie: "OFFSHORE" },
    { denumire: "Operațiuni cu macarale offshore", durataZile: 5, categorie: "OFFSHORE" },
    { denumire: "Platform safety inductions", durataZile: 2, categorie: "OFFSHORE" },
    { denumire: "Confined space entry - offshore", durataZile: 3, categorie: "OFFSHORE" },
    { denumire: "Banksman & Slinger - offshore", durataZile: 3, categorie: "OFFSHORE" },
    // === ONSHORE ===
    { denumire: "SSM - Securitate și sănătate în muncă", durataZile: 3, categorie: "ONSHORE" },
    { denumire: "PSI - Prevenirea și stingerea incendiilor", durataZile: 2, categorie: "ONSHORE" },
    { denumire: "Management de mediu ISO 14001", durataZile: 3, categorie: "ONSHORE" },
    { denumire: "Managementul calității ISO 9001", durataZile: 3, categorie: "ONSHORE" },
    { denumire: "Auditor intern sisteme de management", durataZile: 4, categorie: "ONSHORE" },
    { denumire: "Leadership și management echipaj", durataZile: 4, categorie: "ONSHORE" },
    { denumire: "Comunicare și negociere în afaceri maritime", durataZile: 3, categorie: "ONSHORE" },
    { denumire: "Managementul riscului în transport maritim", durataZile: 3, categorie: "ONSHORE" },
    { denumire: "IT pentru navigație - aplicații maritime", durataZile: 3, categorie: "ONSHORE" },
    { denumire: "Limba engleză maritimă - avansat", durataZile: 10, categorie: "ONSHORE" },
    { denumire: "Instruire operare utilaje portuare", durataZile: 5, categorie: "ONSHORE" },
    { denumire: "Managementul securității cibernetice maritime", durataZile: 3, categorie: "ONSHORE" },
    { denumire: "Curs instructor șofat defensiv", durataZile: 3, categorie: "ONSHORE" },
    { denumire: "Managementul crizei și urgențelor", durataZile: 2, categorie: "ONSHORE" },
    { denumire: "First Aid la locul de muncă", durataZile: 2, categorie: "ONSHORE" },
  ];

  for (const c of cursuri) {
    await prisma.curs.upsert({
      where: { denumire: c.denumire },
      update: {},
      create: {
        denumire: c.denumire,
        durataZile: c.durataZile,
        categorie: c.categorie as any,
      },
    });
  }
  console.log(`  ✓ ${cursuri.length} cursuri create (MARITIM: ${cursuri.filter(c => c.categorie === "MARITIM").length}, FLUVIAL: ${cursuri.filter(c => c.categorie === "FLUVIAL").length}, OFFSHORE: ${cursuri.filter(c => c.categorie === "OFFSHORE").length}, ONSHORE: ${cursuri.filter(c => c.categorie === "ONSHORE").length})`);

  // Create keys for each room
  const allCamere = await prisma.camera.findMany();
  for (const c of allCamere) {
    await prisma.cheie.upsert({
      where: { cameraId: c.id },
      update: {},
      create: { cameraId: c.id, cod: `K-${c.numar}` },
    });
  }
  console.log(`  ✓ ${allCamere.length} chei create`);

  console.log("\n✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
