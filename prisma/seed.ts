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

  // Create sample cursuri
  const cursuri = [
    "STCW - Formare de bază",
    "Operator radar",
    "Manevra navei",
    "Comunicatii maritime",
    "Securitate și sănătate în muncă",
  ];
  for (const c of cursuri) {
    await prisma.curs.upsert({
      where: { denumire: c },
      update: {},
      create: { denumire: c, durataZile: Math.floor(Math.random() * 10) + 3 },
    });
  }
  console.log(`  ✓ ${cursuri.length} cursuri create`);

  // Create keys for each room
  const allCamere = await prisma.camera.findMany();
  for (const c of allCamere) {
    await prisma.cheie.create({
      data: {
        cameraId: c.id,
        cod: `K-${c.numar}`,
      },
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
