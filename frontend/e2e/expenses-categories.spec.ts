import { expect, test } from "@playwright/test";

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

test.describe("[AC-036] categories and expenses CRUD, scoped and persisted", () => {
  test("[AC-036] a signed-in user creates, lists, edits and deletes a category and an expense, surviving a page reload", async ({
    page,
  }) => {
    await registerAndSignIn(page);

    const categoryName = `QA Category ${crypto.randomUUID().slice(0, 8)}`;
    const renamedCategoryName = `${categoryName} Renamed`;

    // --- Category: create ---
    await page.goto("/categories");
    await page.getByLabel("New category name").fill(categoryName);
    await page.getByRole("button", { name: /add category/i }).click();
    await expect(page.getByRole("row", { name: new RegExp(categoryName) })).toBeVisible();

    // --- Category: edit (rename) ---
    const categoryRow = page.getByRole("row", { name: new RegExp(categoryName) });
    await categoryRow
      .getByRole("button", { name: new RegExp(`rename ${categoryName}`, "i") })
      .click();
    const renameInput = categoryRow.getByRole("textbox");
    await renameInput.fill(renamedCategoryName);
    await categoryRow.getByRole("button", { name: /save/i }).click();
    await expect(page.getByRole("row", { name: new RegExp(renamedCategoryName) })).toBeVisible();

    // --- Category: survives reload ---
    await page.reload();
    await expect(page.getByRole("row", { name: new RegExp(renamedCategoryName) })).toBeVisible();

    // --- Expense: create, using the category above ---
    const today = todayIso();
    const description = `QA expense ${crypto.randomUUID().slice(0, 8)}`;
    await page.goto("/expenses");
    await page.getByRole("button", { name: /add expense/i }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel(/amount/i).fill("42.50");
    await dialog.getByLabel(/date/i).fill(today);
    await dialog.getByLabel(/category/i).selectOption({ label: renamedCategoryName });
    await dialog.getByLabel(/description/i).fill(description);
    await dialog.getByRole("button", { name: /save/i }).click();

    await expect(page.getByText(description)).toBeVisible();
    await expect(page.getByText("$42.50")).toBeVisible();

    // --- Expense: edit ---
    await page.getByRole("button", { name: `Edit expense on ${today}` }).click();
    const editDialog = page.getByRole("dialog");
    await editDialog.getByLabel(/amount/i).fill("55.00");
    await editDialog.getByRole("button", { name: /save/i }).click();

    await expect(page.getByText("$55.00")).toBeVisible();
    await expect(page.getByText(description)).toBeVisible();

    // --- Expense: survives reload ---
    await page.reload();
    await expect(page.getByText("$55.00")).toBeVisible();
    await expect(page.getByText(description)).toBeVisible();

    // --- Expense: delete ---
    await page.getByRole("button", { name: `Delete expense on ${today}` }).click();
    await expect(page.getByText(description)).not.toBeVisible();

    // --- Category: delete ---
    await page.goto("/categories");
    const renamedRow = page.getByRole("row", { name: new RegExp(renamedCategoryName) });
    await renamedRow
      .getByRole("button", { name: new RegExp(`delete ${renamedCategoryName}`, "i") })
      .click();
    await expect(page.getByRole("row", { name: new RegExp(renamedCategoryName) })).toHaveCount(0);
  });
});

test.describe("[AC-009] protected screens require a session", () => {
  test("[AC-009] navigating directly to /expenses with no session lands on sign-in and shows no data", async ({
    page,
  }) => {
    await page.goto("/expenses");
    await expect(page).toHaveURL(/\/sign-in$/);
    await expect(page.getByRole("table")).toHaveCount(0);
  });

  test("[AC-009] navigating directly to /categories with no session lands on sign-in and shows no data", async ({
    page,
  }) => {
    await page.goto("/categories");
    await expect(page).toHaveURL(/\/sign-in$/);
    await expect(page.getByRole("table")).toHaveCount(0);
  });

  test("[AC-009] navigating directly to /dashboard with no session lands on sign-in", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/sign-in$/);
  });

  test("[AC-009] navigating directly to /reports with no session lands on sign-in", async ({
    page,
  }) => {
    await page.goto("/reports");
    await expect(page).toHaveURL(/\/sign-in$/);
  });

  test("[AC-009] navigating directly to /settings with no session lands on sign-in", async ({
    page,
  }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL(/\/sign-in$/);
  });
});
