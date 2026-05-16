import { describe, it, expect } from "vitest";

describe("ROLE_LABELS", () => {
  it("should have all 6 roles defined", async () => {
    const { ROLE_LABELS } = await import("@/lib/roles");
    expect(Object.keys(ROLE_LABELS)).toHaveLength(6);
    expect(ROLE_LABELS.CONDUCERE).toBe("Conducere");
    expect(ROLE_LABELS.RECEPTIE).toBe("Recepție");
    expect(ROLE_LABELS.CAMERISTA).toBe("Cameristă");
  });
});

describe("PDF Notă de plată", () => {
  it("should generate a PDF without errors", async () => {
    const { genereazaPDFNotaPlata } = await import("@/lib/pdf");

    const data = {
      nr: "NP-TEST1234",
      cursant: "Ion Popescu",
      camera: "101",
      tipCamera: "Standard",
      checkIn: "15.05.2026",
      checkOut: "20.05.2026",
      nopti: 5,
      tarif: 120,
      total: 600,
    };

    expect(() => genereazaPDFNotaPlata(data)).not.toThrow();
  });
});

describe("Utils", () => {
  it("should merge class names correctly", async () => {
    const { cn } = await import("@/lib/utils");
    expect(cn("a", "b")).toBe("a b");
    expect(cn("a", false && "b")).toBe("a");
    expect(cn("a", undefined, "b")).toBe("a b");
  });
});
