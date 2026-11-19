import { expect, test } from "@playwright/test";

import { apiBaseURL } from "./support/smoke";

function freshPassword(): string {
  return `Aa1${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`;
}

function freshEmail(): string {
  return `qa-${crypto.randomUUID()}@example.com`;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

async function registerAndSignIn(page: import("@playwright/test").Page) {
  const email = freshEmail();
  const password = freshPassword();
  await page.goto("/sign-in");
  await page.getByRole("tab", { name: "Create account" }).click();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account →" }).click();
  await page.waitForURL(/\/dashboard$/);
  return { email, password };
}

async function addCategory(page: import("@playwright/test").Page, name: string) {
  await page.goto("/categories");
  await page.getByLabel("New category name").fill(name);
  await page.getByRole("button", { name: /add category/i }).click();
  await expect(page.getByRole("row", { name: new RegExp(name) })).toBeVisible();
}

test.describe("[AC-019]-[AC-023] category create, rename and guarded delete", () => {
  test("[AC-019] creating a category with a unique non-blank name shows it in the list and in the expense form's category select", async ({
    page,
  }) => {
    await registerAndSignIn(page);
    const name = `QA Cat ${crypto.randomUUID().slice(0, 8)}`;
    await addCategory(page, name);

    await page.goto("/expenses");
    await page.getByRole("button", { name: /add expense/i }).click();
    const dialog = page.getByRole("dialog");
    const options = await dialog
      .getByLabel(/category/i)
      .locator("option")
      .allTextContents();
    expect(options).toContain(name);
  });

  test("[AC-019] a blank category name shows a validation message and creates nothing", async ({
    page,
  }) => {
    await registerAndSignIn(page);
    await page.goto("/categories");
    await page.getByLabel("New category name").fill("   ");
    await page.getByRole("button", { name: /add category/i }).click();

    await expect(page.getByText(/name cannot be blank/i)).toBeVisible();
    await expect(page.getByRole("table")).toHaveCount(0);
  });

  test("[AC-019] a duplicate category name shows a validation message and creates a second nothing", async ({
    page,
  }) => {
    await registerAndSignIn(page);
    const name = `QA Cat ${crypto.randomUUID().slice(0, 8)}`;
    await addCategory(page, name);

    await page.getByLabel("New category name").fill(name);
    await page.getByRole("button", { name: /add category/i }).click();

    await expect(page.getByText(/already taken/i)).toBeVisible();
    await expect(page.getByRole("row", { name: new RegExp(name) })).toHaveCount(1);
  });

  test("[AC-023] renaming a category to a valid unique name updates the list and the category name shown on an assigned expense", async ({
    page,
  }) => {
    await registerAndSignIn(page);
    const name = `QA Cat ${crypto.randomUUID().slice(0, 8)}`;
    const renamed = `${name} Renamed`;
    await addCategory(page, name);

    const today = todayIso();
    const description = `QA expense ${crypto.randomUUID().slice(0, 8)}`;
    await page.goto("/expenses");
    await page.getByRole("button", { name: /add expense/i }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel(/amount/i).fill("10.00");
    await dialog.getByLabel(/date/i).fill(today);
    await dialog.getByLabel(/category/i).selectOption({ label: name });
    await dialog.getByLabel(/description/i).fill(description);
    await dialog.getByRole("button", { name: /save/i }).click();
    await expect(page.getByText(description)).toBeVisible();

    await page.goto("/categories");
    const row = page.getByRole("row", { name: new RegExp(name) });
    await row.getByRole("button", { name: new RegExp(`rename ${name}`, "i") }).click();
    const renameInput = row.getByRole("textbox");
    await renameInput.fill(renamed);
    await row.getByRole("button", { name: /save/i }).click();
    await expect(page.getByRole("row", { name: new RegExp(renamed) })).toBeVisible();

    await page.goto("/expenses");
    const expenseRow = page.getByRole("row", { name: new RegExp(description) });
    await expect(expenseRow).toContainText(renamed);
  });

  test("[AC-036] deleting a category with no expenses removes it from the list immediately", async ({
    page,
  }) => {
    await registerAndSignIn(page);
    const name = `QA Cat ${crypto.randomUUID().slice(0, 8)}`;
    await addCategory(page, name);

    const row = page.getByRole("row", { name: new RegExp(name) });
    await row.getByRole("button", { name: new RegExp(`delete ${name}`, "i") }).click();

    await expect(page.getByRole("row", { name: new RegExp(name) })).toHaveCount(0);
  });

  test("[AC-036] deleting a category that has an expense assigned removes the category, and the expense remains but is now uncategorised", async ({
    page,
  }) => {
    await registerAndSignIn(page);
    const name = `QA Cat ${crypto.randomUUID().slice(0, 8)}`;
    await addCategory(page, name);

    const today = todayIso();
    const description = `QA expense ${crypto.randomUUID().slice(0, 8)}`;
    await page.goto("/expenses");
    await page.getByRole("button", { name: /add expense/i }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel(/amount/i).fill("5.00");
    await dialog.getByLabel(/date/i).fill(today);
    await dialog.getByLabel(/category/i).selectOption({ label: name });
    await dialog.getByLabel(/description/i).fill(description);
    await dialog.getByRole("button", { name: /save/i }).click();
    await expect(page.getByText(description)).toBeVisible();

    await page.goto("/categories");
    const row = page.getByRole("row", { name: new RegExp(name) });
    await row.getByRole("button", { name: new RegExp(`delete ${name}`, "i") }).click();

    await expect(page.getByRole("row", { name: new RegExp(name) })).toHaveCount(0);

    await page.goto("/expenses");
    const expenseRow = page.getByRole("row", { name: new RegExp(description) });
    await expect(expenseRow).toBeVisible();
    await expect(expenseRow).toContainText(/uncategorised/i);
  });

  test("[AC-019] one user's categories are never visible to a second signed-in user", async ({
    page,
    request,
  }) => {
    await registerAndSignIn(page);
    const name = `QA Cat ${crypto.randomUUID().slice(0, 8)}`;
    await addCategory(page, name);

    const secondEmail = freshEmail();
    const secondPassword = freshPassword();
    const registered = await request.post(`${apiBaseURL()}/auth/register`, {
      data: { email: secondEmail, password: secondPassword },
    });
    expect(registered.ok()).toBeTruthy();

    await page.goto("/sign-in");
    await page.getByLabel("Email").fill(secondEmail);
    await page.getByLabel("Password").fill(secondPassword);
    await page.getByRole("button", { name: "Sign in →" }).click();
    await page.waitForURL(/\/dashboard$/);

    await page.goto("/categories");
    await expect(page.getByText(name)).toHaveCount(0);
    await expect(page.getByRole("row", { name: new RegExp(name) })).toHaveCount(0);
  });
});
