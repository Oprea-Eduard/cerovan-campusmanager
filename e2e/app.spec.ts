import { test, expect } from "@playwright/test";

test.describe("Autentificare", () => {
  test("login page se încarcă corect", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Campus Manager")).toBeVisible();
    await expect(page.getByText("CERONAV")).toBeVisible();
  });

  test("login cu credențiale valide", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "receptie@ceronav.ro");
    await page.fill('input[name="password"]', "parola123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText("Bun venit")).toBeVisible();
  });

  test("login cu parolă greșită", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "receptie@ceronav.ro");
    await page.fill('input[name="password"]', "gresita");
    await page.click('button[type="submit"]');
    await expect(page.getByText("Email sau parolă incorectă")).toBeVisible();
  });

  test("redirect la login dacă nu e autentificat", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Navigare sidebar", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "director@ceronav.ro");
    await page.fill('input[name="password"]', "parola123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
  });

  test("toate linkurile sidebar sunt vizibile pentru CONDUCERE", async ({ page }) => {
    const expectedLinks = [
      "Dashboard", "Camere", "Cursanți", "Cursuri", "Rezervări",
      "Plăți", "Check-In/Out", "Housekeeping", "Rapoarte",
      "Calendar", "Cereri cazare", "Night Audit",
      "Documente", "Evaluări", "Notificări",
      "Setări", "Parcare", "Obiecte pierdute", "Utilizatori",
    ];
    for (const link of expectedLinks) {
      await expect(page.getByText(link).first()).toBeVisible();
    }
  });
});

test.describe("Module funcționale", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "receptie@ceronav.ro");
    await page.fill('input[name="password"]', "parola123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
  });

  test("pagina Camere se încarcă cu room plan", async ({ page }) => {
    await page.click("text=Camere");
    await expect(page).toHaveURL(/\/camere/);
    await expect(page.getByText("Plan camere")).toBeVisible();
    await expect(page.getByText("Listă camere")).toBeVisible();
  });

  test("pagina Check-In/Out se încarcă", async ({ page }) => {
    await page.click("text=Check-In/Out");
    await expect(page).toHaveURL(/\/checkinout/);
    await expect(page.getByText("Check-In / Check-Out")).toBeVisible();
  });

  test("pagina Housekeeping se încarcă cu grid", async ({ page }) => {
    await page.click("text=Housekeeping");
    await expect(page).toHaveURL(/\/housekeeping/);
    await expect(page.getByText("Status curățenie per cameră")).toBeVisible();
  });
});

test.describe("Roluri și permisiuni", () => {
  test("camerista nu poate accesa Plăți", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "camerista@ceronav.ro");
    await page.fill('input[name="password"]', "parola123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
    await page.goto("/dashboard/plati");
    await expect(page).toHaveURL(/\/login/);
  });

  test("contabilitate poate accesa Plăți", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "contabilitate@ceronav.ro");
    await page.fill('input[name="password"]', "parola123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
    await page.goto("/dashboard/plati");
    await expect(page).toHaveURL(/\/plati/);
  });
});
