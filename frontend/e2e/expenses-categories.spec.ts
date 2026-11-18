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

  test("[AC-009] navigating directly to /dashboard with no session lands on sign-in and shows no account data", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/sign-in$/);
    await expect(page.getByRole("table")).toHaveCount(0);
  });

  test("[AC-009] navigating directly to /reports with no session lands on sign-in and shows no account data", async ({
    page,
  }) => {
    await page.goto("/reports");
    await expect(page).toHaveURL(/\/sign-in$/);
    await expect(page.getByRole("table")).toHaveCount(0);
  });

  test("[AC-009] navigating directly to /settings with no session lands on sign-in and shows no account data", async ({
    page,
  }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL(/\/sign-in$/);
    await expect(page.getByText(/signed in as/i)).toHaveCount(0);
  });
});

test.describe("[AC-008/NFR-001] ownership scoping across two accounts in the same run", () => {
  test("[AC-008] two freshly registered accounts each see only their own categories and expenses after sign-in", async ({
    page,
  }) => {
    const { email: emailA } = await registerAndSignIn(page);
    const categoryA = `Scope A ${crypto.randomUUID().slice(0, 8)}`;
    const expenseDescriptionA = `Expense A ${crypto.randomUUID().slice(0, 8)}`;

    await page.goto("/categories");
    await page.getByLabel("New category name").fill(categoryA);
    await page.getByRole("button", { name: /add category/i }).click();
    await expect(page.getByRole("row", { name: new RegExp(categoryA) })).toBeVisible();

    await page.goto("/expenses");
    await page.getByRole("button", { name: /add expense/i }).click();
    const dialogA = page.getByRole("dialog");
    await dialogA.getByLabel(/amount/i).fill("10.00");
    await dialogA.getByLabel(/date/i).fill(todayIso());
    await dialogA.getByLabel(/description/i).fill(expenseDescriptionA);
    await dialogA.getByRole("button", { name: /save/i }).click();
    await expect(page.getByText(expenseDescriptionA)).toBeVisible();

    // Sign out of account A and register a brand-new account B in the same run.
    await page.goto("/settings");
    await page.getByRole("button", { name: /sign out/i }).click();
    await page.waitForURL(/\/sign-in$/);

    await registerAndSignIn(page);
    const categoryB = `Scope B ${crypto.randomUUID().slice(0, 8)}`;
    const expenseDescriptionB = `Expense B ${crypto.randomUUID().slice(0, 8)}`;

    // Account B's own screens show none of account A's rows.
    await page.goto("/categories");
    await expect(page.getByRole("row", { name: new RegExp(categoryA) })).toHaveCount(0);
    await page.goto("/expenses");
    await expect(page.getByText(expenseDescriptionA)).toHaveCount(0);

    await page.goto("/categories");
    await page.getByLabel("New category name").fill(categoryB);
    await page.getByRole("button", { name: /add category/i }).click();
    await expect(page.getByRole("row", { name: new RegExp(categoryB) })).toBeVisible();

    await page.goto("/expenses");
    await page.getByRole("button", { name: /add expense/i }).click();
    const dialogB = page.getByRole("dialog");
    await dialogB.getByLabel(/amount/i).fill("20.00");
    await dialogB.getByLabel(/date/i).fill(todayIso());
    await dialogB.getByLabel(/description/i).fill(expenseDescriptionB);
    await dialogB.getByRole("button", { name: /save/i }).click();
    await expect(page.getByText(expenseDescriptionB)).toBeVisible();

    // Still only B's rows, never A's.
    await expect(page.getByText(expenseDescriptionA)).toHaveCount(0);
    await page.goto("/categories");
    await expect(page.getByRole("row", { name: new RegExp(categoryA) })).toHaveCount(0);
    await expect(page.getByRole("row", { name: new RegExp(categoryB) })).toBeVisible();

    expect(emailA).not.toBe("");
  });
});

test.describe("[AC-008] Settings shows the signed-in account's own email", () => {
  test("[AC-008] Settings displays the email just registered, not a hardcoded one", async ({
    page,
  }) => {
    const { email } = await registerAndSignIn(page);

    await page.goto("/settings");
    await expect(page.getByText(email)).toBeVisible();
  });

  test("[AC-008] two different accounts each see their own email on Settings, never the other's", async ({
    page,
  }) => {
    const { email: emailA } = await registerAndSignIn(page);
    await page.goto("/settings");
    await expect(page.getByText(emailA)).toBeVisible();

    await page.getByRole("button", { name: /sign out/i }).click();
    await page.waitForURL(/\/sign-in$/);

    const { email: emailB } = await registerAndSignIn(page);
    await page.goto("/settings");
    await expect(page.getByText(emailB)).toBeVisible();
    await expect(page.getByText(emailA)).toHaveCount(0);
  });
});
