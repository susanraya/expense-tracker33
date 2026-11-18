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

test.describe("[AC-011] recording a new expense", () => {
  test("[AC-011] a signed-in user adds an expense with amount, date, an existing category and a note, and it appears at the top of the list with those values", async ({
    page,
  }) => {
    await registerAndSignIn(page);
    const categoryName = `QA Cat ${crypto.randomUUID().slice(0, 8)}`;
    await addCategory(page, categoryName);

    const today = todayIso();
    const note = `QA note ${crypto.randomUUID().slice(0, 8)}`;

    await page.goto("/expenses");
    await page.getByRole("button", { name: /add expense/i }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel(/amount/i).fill("33.75");
    await dialog.getByLabel(/date/i).fill(today);
    await dialog.getByLabel(/category/i).selectOption({ label: categoryName });
    await dialog.getByLabel(/description/i).fill(note);
    await dialog.getByRole("button", { name: /save/i }).click();

    await expect(dialog).toHaveCount(0);
    const firstRow = page.getByRole("table").locator("tbody tr").first();
    await expect(firstRow).toContainText(today);
    await expect(firstRow).toContainText("$33.75");
    await expect(firstRow).toContainText(categoryName);
    await expect(firstRow).toContainText(note);
  });
});

test.describe("[AC-012] expense form validation", () => {
  async function openDialogWithCategory(page: import("@playwright/test").Page) {
    const categoryName = `QA Cat ${crypto.randomUUID().slice(0, 8)}`;
    await addCategory(page, categoryName);
    await page.goto("/expenses");
    await page.getByRole("button", { name: /add expense/i }).click();
    return { dialog: page.getByRole("dialog"), categoryName };
  }

  test("[AC-012] an empty amount shows a validation message and creates no expense", async ({
    page,
  }) => {
    await registerAndSignIn(page);
    const { dialog, categoryName } = await openDialogWithCategory(page);
    await dialog.getByLabel(/date/i).fill(todayIso());
    await dialog.getByLabel(/category/i).selectOption({ label: categoryName });
    await dialog.getByRole("button", { name: /save/i }).click();

    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(/enter an amount/i);
    await dialog.getByRole("button", { name: /cancel/i }).click();
    await expect(page.getByRole("table")).toHaveCount(0);
  });

  test("[AC-012] a non-positive amount shows a validation message and creates no expense", async ({
    page,
  }) => {
    await registerAndSignIn(page);
    const { dialog, categoryName } = await openDialogWithCategory(page);
    await dialog.getByLabel(/amount/i).fill("0");
    await dialog.getByLabel(/date/i).fill(todayIso());
    await dialog.getByLabel(/category/i).selectOption({ label: categoryName });
    await dialog.getByRole("button", { name: /save/i }).click();

    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(/greater than zero/i);
    await dialog.getByRole("button", { name: /cancel/i }).click();
    await expect(page.getByRole("table")).toHaveCount(0);
  });

  test("[AC-012] an empty date shows a validation message and creates no expense", async ({
    page,
  }) => {
    await registerAndSignIn(page);
    const { dialog, categoryName } = await openDialogWithCategory(page);
    await dialog.getByLabel(/amount/i).fill("10.00");
    await dialog.getByLabel(/date/i).fill("");
    await dialog.getByLabel(/category/i).selectOption({ label: categoryName });
    await dialog.getByRole("button", { name: /save/i }).click();

    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(/pick the date/i);
    await dialog.getByRole("button", { name: /cancel/i }).click();
    await expect(page.getByRole("table")).toHaveCount(0);
  });

  test("[AC-012] no category selected shows a validation message and creates no expense", async ({
    page,
  }) => {
    await registerAndSignIn(page);
    await page.goto("/expenses");
    await page.getByRole("button", { name: /add expense/i }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel(/amount/i).fill("10.00");
    await dialog.getByLabel(/date/i).fill(todayIso());
    await dialog.getByRole("button", { name: /save/i }).click();

    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(/pick a category/i);
    await dialog.getByRole("button", { name: /cancel/i }).click();
    await expect(page.getByRole("table")).toHaveCount(0);
  });
});

test.describe("[AC-013] the add-expense form exposes no recurring, receipt or currency control", () => {
  test("[AC-013] the add-expense dialog has no recurring-schedule, receipt-attachment or currency control", async ({
    page,
  }) => {
    await registerAndSignIn(page);
    await page.goto("/expenses");
    await page.getByRole("button", { name: /add expense/i }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await expect(dialog.getByText(/recurring|repeat|frequency/i)).toHaveCount(0);
    await expect(dialog.getByText(/receipt|attachment|upload/i)).toHaveCount(0);
    await expect(dialog.getByText(/currency/i)).toHaveCount(0);
    await expect(dialog.locator('input[type="file"]')).toHaveCount(0);
  });
});

test.describe("[AC-014] empty state for a user with no expenses", () => {
  test("[AC-014] a freshly signed-in user with no expenses sees the empty-state prompt to add a first expense, with no broken or empty widget", async ({
    page,
  }) => {
    await registerAndSignIn(page);
    await page.goto("/expenses");

    await expect(page.getByRole("table")).toHaveCount(0);
    await expect(page.getByText(/no expenses in this range/i)).toBeVisible();
    await expect(page.getByText(/add your first expense/i)).toBeVisible();
  });
});

test.describe("[AC-015] expense data is isolated per user", () => {
  test("[AC-015] expenses created by one user are not visible to a second signed-in user", async ({
    page,
    request,
  }) => {
    // First user creates a category and an expense through the UI.
    await registerAndSignIn(page);
    const categoryName = `QA Cat ${crypto.randomUUID().slice(0, 8)}`;
    await addCategory(page, categoryName);
    const note = `Private note ${crypto.randomUUID().slice(0, 8)}`;
    const today = todayIso();

    await page.goto("/expenses");
    await page.getByRole("button", { name: /add expense/i }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel(/amount/i).fill("19.99");
    await dialog.getByLabel(/date/i).fill(today);
    await dialog.getByLabel(/category/i).selectOption({ label: categoryName });
    await dialog.getByLabel(/description/i).fill(note);
    await dialog.getByRole("button", { name: /save/i }).click();
    await expect(page.getByText(note)).toBeVisible();

    // Second user, registered independently via the API, signs in through the UI.
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

    await page.goto("/expenses");
    await expect(page.getByText(note)).toHaveCount(0);
    await expect(page.getByText(categoryName)).toHaveCount(0);
    await expect(page.getByRole("table")).toHaveCount(0);
    await expect(page.getByText(/no expenses in this range/i)).toBeVisible();

    await page.goto("/categories");
    await expect(page.getByText(categoryName)).toHaveCount(0);
  });
});
