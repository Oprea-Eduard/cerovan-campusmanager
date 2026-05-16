-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CONDUCERE', 'ADMINISTRATIV', 'RECEPTIE', 'PROGRAMARE', 'CONTABILITATE', 'CAMERISTA');

-- CreateEnum
CREATE TYPE "StatusPlataCurs" AS ENUM ('NEACHITAT', 'PARTIAL', 'ACHITAT', 'RESTITUIT');

-- CreateEnum
CREATE TYPE "TipCamera" AS ENUM ('SINGLE_STANDARD', 'APARTAMENT');

-- CreateEnum
CREATE TYPE "StatusCamera" AS ENUM ('DISPONIBILA', 'REZERVATA_PLATA_ASTEPTARE', 'REZERVATA_SI_ACHITATA', 'INDISPONIBILA_TEMPORAR', 'OCUPATA');

-- CreateEnum
CREATE TYPE "StareBun" AS ENUM ('BUN', 'UZAT', 'DEFECT', 'LIPSA');

-- CreateEnum
CREATE TYPE "StatusRezervare" AS ENUM ('PLATA_ASTEPTARE', 'ACHITATA', 'CHECKIN_EFFECTUAT', 'CHECKOUT_EFFECTUAT', 'ANULATA');

-- CreateEnum
CREATE TYPE "StatusCerere" AS ENUM ('IN_ASTEPTARE', 'APROBATA', 'RESPINSA');

-- CreateEnum
CREATE TYPE "TipDocument" AS ENUM ('COPIE_CI', 'DOVADA_INSCRIERE', 'DOVADA_PLATA_CURS', 'ALTE_DOCUMENTE');

-- CreateEnum
CREATE TYPE "MetodaPlata" AS ENUM ('ORDIN_PLATA', 'TRANSFER_BANCAR', 'CASIERIE', 'ALTUL');

-- CreateEnum
CREATE TYPE "StatusPlata" AS ENUM ('NECONFIRMATA', 'CONFIRMATA', 'RESTITUITA');

-- CreateEnum
CREATE TYPE "StatusCuratenie" AS ENUM ('MURDAR', 'IN_LUCRU', 'CURAT', 'VERIFICAT');

-- CreateEnum
CREATE TYPE "StatusCheie" AS ENUM ('LA_RECEPTIE', 'PREDATA_CURSANT', 'PIERDUTA');

-- CreateEnum
CREATE TYPE "ActiuneCheie" AS ENUM ('PREDAT', 'PRIMIT', 'PIERDUT');

-- CreateEnum
CREATE TYPE "StatusParcare" AS ENUM ('LIBER', 'OCUPAT', 'REZERVAT');

-- CreateEnum
CREATE TYPE "StatusObiect" AS ENUM ('IN_CAUTARE', 'RESTITUIT', 'EXPIRAT');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'RECEPTIE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cursanti" (
    "id" TEXT NOT NULL,
    "nume" TEXT NOT NULL,
    "prenume" TEXT NOT NULL,
    "telefon" TEXT,
    "email" TEXT,
    "ciSerie" TEXT,
    "ciNumar" TEXT,
    "pasaport" TEXT,
    "firma" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cursanti_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cursuri" (
    "id" TEXT NOT NULL,
    "denumire" TEXT NOT NULL,
    "descriere" TEXT,
    "durataZile" INTEGER NOT NULL DEFAULT 1,
    "activ" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cursuri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscrieri_curs" (
    "id" TEXT NOT NULL,
    "cursantId" TEXT NOT NULL,
    "cursId" TEXT NOT NULL,
    "dataStart" TIMESTAMP(3) NOT NULL,
    "dataEnd" TIMESTAMP(3) NOT NULL,
    "statusPlataCurs" "StatusPlataCurs" NOT NULL DEFAULT 'NEACHITAT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inscrieri_curs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "camere" (
    "id" TEXT NOT NULL,
    "numar" TEXT NOT NULL,
    "tip" "TipCamera" NOT NULL,
    "etaj" INTEGER NOT NULL,
    "capacitate" INTEGER NOT NULL DEFAULT 2,
    "status" "StatusCamera" NOT NULL DEFAULT 'DISPONIBILA',
    "motivIndisponibil" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "camere_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventar_camera" (
    "id" TEXT NOT NULL,
    "cameraId" TEXT NOT NULL,
    "denumire" TEXT NOT NULL,
    "cantitate" INTEGER NOT NULL DEFAULT 1,
    "stare" "StareBun" NOT NULL DEFAULT 'BUN',
    "observatii" TEXT,

    CONSTRAINT "inventar_camera_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rezervari" (
    "id" TEXT NOT NULL,
    "cursantId" TEXT NOT NULL,
    "cameraId" TEXT NOT NULL,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3) NOT NULL,
    "status" "StatusRezervare" NOT NULL DEFAULT 'PLATA_ASTEPTARE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rezervari_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cereri_cazare" (
    "id" TEXT NOT NULL,
    "rezervareId" TEXT NOT NULL,
    "aprobatDe" TEXT,
    "aprobatLa" TIMESTAMP(3),
    "status" "StatusCerere" NOT NULL DEFAULT 'IN_ASTEPTARE',

    CONSTRAINT "cereri_cazare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documente_atasate" (
    "id" TEXT NOT NULL,
    "cerereId" TEXT NOT NULL,
    "tip" "TipDocument" NOT NULL,
    "numeFisier" TEXT NOT NULL,
    "caleFisier" TEXT NOT NULL,

    CONSTRAINT "documente_atasate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plati" (
    "id" TEXT NOT NULL,
    "rezervareId" TEXT NOT NULL,
    "suma" DECIMAL(10,2) NOT NULL,
    "metoda" "MetodaPlata" NOT NULL,
    "status" "StatusPlata" NOT NULL DEFAULT 'NECONFIRMATA',
    "referinta" TEXT,
    "dataPlata" TIMESTAMP(3),
    "dataConfirmare" TIMESTAMP(3),

    CONSTRAINT "plati_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkinout" (
    "id" TEXT NOT NULL,
    "rezervareId" TEXT NOT NULL,
    "dataCheckin" TIMESTAMP(3) NOT NULL,
    "dataCheckout" TIMESTAMP(3),
    "receptionerCheckinId" TEXT NOT NULL,
    "receptionerCheckoutId" TEXT,
    "cheiePredata" BOOLEAN NOT NULL DEFAULT false,
    "cheiePrimita" BOOLEAN NOT NULL DEFAULT false,
    "stareCameraPreCheckout" TEXT,
    "regulamentAcceptat" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "checkinout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "note_constatare" (
    "id" TEXT NOT NULL,
    "checkInOutId" TEXT NOT NULL,
    "descriere" TEXT NOT NULL,
    "costEstimat" DECIMAL(10,2),
    "poze" TEXT[],
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "note_constatare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluari" (
    "id" TEXT NOT NULL,
    "checkInOutId" TEXT NOT NULL,
    "curatenie" INTEGER,
    "confort" INTEGER,
    "dotari" INTEGER,
    "personal" INTEGER,
    "organizare" INTEGER,
    "observatii" TEXT,

    CONSTRAINT "evaluari_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "housekeeping" (
    "id" TEXT NOT NULL,
    "cameraId" TEXT NOT NULL,
    "cameristaId" TEXT,
    "status" "StatusCuratenie" NOT NULL DEFAULT 'MURDAR',
    "asignatLa" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completatLa" TIMESTAMP(3),
    "verificatDe" TEXT,
    "verificatLa" TIMESTAMP(3),

    CONSTRAINT "housekeeping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chei" (
    "id" TEXT NOT NULL,
    "cameraId" TEXT NOT NULL,
    "cod" TEXT NOT NULL,
    "status" "StatusCheie" NOT NULL DEFAULT 'LA_RECEPTIE',

    CONSTRAINT "chei_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "istoric_chei" (
    "id" TEXT NOT NULL,
    "cheieId" TEXT NOT NULL,
    "actiune" "ActiuneCheie" NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "observatii" TEXT,

    CONSTRAINT "istoric_chei_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parcare" (
    "id" TEXT NOT NULL,
    "numarLoc" TEXT NOT NULL,
    "status" "StatusParcare" NOT NULL DEFAULT 'LIBER',
    "cameraId" TEXT,

    CONSTRAINT "parcare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "obiecte_pierdute" (
    "id" TEXT NOT NULL,
    "descriere" TEXT NOT NULL,
    "gasitLa" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cameraId" TEXT,
    "predatLa" TIMESTAMP(3),
    "contactProprietar" TEXT,
    "status" "StatusObiect" NOT NULL DEFAULT 'IN_CAUTARE',

    CONSTRAINT "obiecte_pierdute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "actiune" VARCHAR(500) NOT NULL,
    "detalii" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "cursanti_nume_prenume_idx" ON "cursanti"("nume", "prenume");

-- CreateIndex
CREATE INDEX "inscrieri_curs_cursantId_idx" ON "inscrieri_curs"("cursantId");

-- CreateIndex
CREATE INDEX "inscrieri_curs_cursId_idx" ON "inscrieri_curs"("cursId");

-- CreateIndex
CREATE UNIQUE INDEX "camere_numar_key" ON "camere"("numar");

-- CreateIndex
CREATE INDEX "camere_status_idx" ON "camere"("status");

-- CreateIndex
CREATE INDEX "camere_etaj_idx" ON "camere"("etaj");

-- CreateIndex
CREATE INDEX "inventar_camera_cameraId_idx" ON "inventar_camera"("cameraId");

-- CreateIndex
CREATE INDEX "rezervari_cursantId_idx" ON "rezervari"("cursantId");

-- CreateIndex
CREATE INDEX "rezervari_cameraId_idx" ON "rezervari"("cameraId");

-- CreateIndex
CREATE INDEX "rezervari_status_idx" ON "rezervari"("status");

-- CreateIndex
CREATE INDEX "rezervari_checkIn_checkOut_idx" ON "rezervari"("checkIn", "checkOut");

-- CreateIndex
CREATE UNIQUE INDEX "cereri_cazare_rezervareId_key" ON "cereri_cazare"("rezervareId");

-- CreateIndex
CREATE INDEX "plati_rezervareId_idx" ON "plati"("rezervareId");

-- CreateIndex
CREATE UNIQUE INDEX "checkinout_rezervareId_key" ON "checkinout"("rezervareId");

-- CreateIndex
CREATE UNIQUE INDEX "evaluari_checkInOutId_key" ON "evaluari"("checkInOutId");

-- CreateIndex
CREATE INDEX "housekeeping_cameraId_idx" ON "housekeeping"("cameraId");

-- CreateIndex
CREATE INDEX "housekeeping_status_idx" ON "housekeeping"("status");

-- CreateIndex
CREATE UNIQUE INDEX "chei_cameraId_key" ON "chei"("cameraId");

-- CreateIndex
CREATE UNIQUE INDEX "parcare_numarLoc_key" ON "parcare"("numarLoc");

-- CreateIndex
CREATE INDEX "audit_log_userId_idx" ON "audit_log"("userId");

-- CreateIndex
CREATE INDEX "audit_log_createdAt_idx" ON "audit_log"("createdAt");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscrieri_curs" ADD CONSTRAINT "inscrieri_curs_cursantId_fkey" FOREIGN KEY ("cursantId") REFERENCES "cursanti"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscrieri_curs" ADD CONSTRAINT "inscrieri_curs_cursId_fkey" FOREIGN KEY ("cursId") REFERENCES "cursuri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventar_camera" ADD CONSTRAINT "inventar_camera_cameraId_fkey" FOREIGN KEY ("cameraId") REFERENCES "camere"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rezervari" ADD CONSTRAINT "rezervari_cursantId_fkey" FOREIGN KEY ("cursantId") REFERENCES "cursanti"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rezervari" ADD CONSTRAINT "rezervari_cameraId_fkey" FOREIGN KEY ("cameraId") REFERENCES "camere"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cereri_cazare" ADD CONSTRAINT "cereri_cazare_rezervareId_fkey" FOREIGN KEY ("rezervareId") REFERENCES "rezervari"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documente_atasate" ADD CONSTRAINT "documente_atasate_cerereId_fkey" FOREIGN KEY ("cerereId") REFERENCES "cereri_cazare"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plati" ADD CONSTRAINT "plati_rezervareId_fkey" FOREIGN KEY ("rezervareId") REFERENCES "rezervari"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkinout" ADD CONSTRAINT "checkinout_rezervareId_fkey" FOREIGN KEY ("rezervareId") REFERENCES "rezervari"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkinout" ADD CONSTRAINT "checkinout_receptionerCheckinId_fkey" FOREIGN KEY ("receptionerCheckinId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkinout" ADD CONSTRAINT "checkinout_receptionerCheckoutId_fkey" FOREIGN KEY ("receptionerCheckoutId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_constatare" ADD CONSTRAINT "note_constatare_checkInOutId_fkey" FOREIGN KEY ("checkInOutId") REFERENCES "checkinout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluari" ADD CONSTRAINT "evaluari_checkInOutId_fkey" FOREIGN KEY ("checkInOutId") REFERENCES "checkinout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "housekeeping" ADD CONSTRAINT "housekeeping_cameraId_fkey" FOREIGN KEY ("cameraId") REFERENCES "camere"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "housekeeping" ADD CONSTRAINT "housekeeping_cameristaId_fkey" FOREIGN KEY ("cameristaId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chei" ADD CONSTRAINT "chei_cameraId_fkey" FOREIGN KEY ("cameraId") REFERENCES "camere"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "istoric_chei" ADD CONSTRAINT "istoric_chei_cheieId_fkey" FOREIGN KEY ("cheieId") REFERENCES "chei"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parcare" ADD CONSTRAINT "parcare_cameraId_fkey" FOREIGN KEY ("cameraId") REFERENCES "camere"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
