"use client";

import { jsPDF } from "jspdf";

interface NotaPlataData {
  nr: string;
  cursant: string;
  camera: string;
  tipCamera: string;
  checkIn: string;
  checkOut: string;
  nopti: number;
  tarif: number;
  total: number;
}

export function genereazaPDFNotaPlata(data: NotaPlataData) {
  const doc = new jsPDF({ format: "a4", unit: "mm" });

  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("NOTĂ DE PLATĂ CAZARE", pageWidth / 2, 25, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Nr. ${data.nr} / ${new Date().toLocaleDateString("ro-RO")}`, pageWidth / 2, 33, { align: "center" });

  doc.line(20, 38, pageWidth - 20, 38);

  let y = 48;
  const leftX = 30;
  const labelX = 50;
  const valueX = 80;
  const lineH = 8;

  doc.setFont("helvetica", "bold");
  doc.text("Date rezervare:", leftX, y);
  y += lineH + 2;

  const rows: [string, string][] = [
    ["Cursant", data.cursant],
    ["Camera", `${data.camera} (${data.tipCamera})`],
    ["Check-In", data.checkIn],
    ["Check-Out", data.checkOut],
    ["Număr nopți", String(data.nopti)],
    ["Tarif unitar", `${data.tarif} lei / noapte`],
  ];

  doc.setFont("helvetica", "normal");
  for (const [label, value] of rows) {
    doc.text(label, labelX, y);
    doc.text(value, valueX, y);
    y += lineH;
  }

  y += 4;
  doc.line(20, y, pageWidth - 20, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`TOTAL DE PLATĂ: ${data.total} lei`, pageWidth / 2, y, { align: "center" });
  y += 14;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const note = [
    "NOTE:",
    "a) Prezentul document reprezintă Nota de Plată Cazare.",
    `b) Plata cazării se poate realiza în contul CERONAV (CUI 15566688) IBAN _____________________________`,
    `   sau la CASIERIA CERONAV în timpul programului de lucru.`,
    `c) Pentru finalizarea procedurii de rezervare a camerei, vă rugăm să achitați contravaloarea cazării`,
    `   în cel mult 72 de ore de la emiterea / primirea Notei de Plată, dar nu mai târziu de 24 ore`,
    `   înainte de CHECK-IN.`,
    `d) Vă informăm că la recepția căminului NU se poate realiza plata contravalorii cazării.`,
    `e) Neachitarea contravalorii cazării în termenele prezentate anterior va duce la anularea rezervării.`,
    `f) Retragerea de la cursul care a stat la baza rezervării cazării, duce la anularea cazării.`,
  ];

  for (const line of note) {
    doc.text(line, 20, y);
    y += 6;
  }

  y += 10;
  doc.setFontSize(10);
  doc.text("Data: ________________", leftX, y);
  doc.text("Semnătura: ________________", pageWidth - 80, y);

  doc.save(`Nota_Plata_${data.nr}.pdf`);
}
