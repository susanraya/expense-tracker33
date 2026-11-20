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

function dateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
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

// The delivered Expenses screen (US-006) is a plain inline form on the page --
// there is no modal/dialog for adding an expense. Fields: Amount (#exp-amount),
// Date (#exp-date, type=date), Category (#exp-category, a <select>), and
// Note (optional) (#exp-note). Submitting posts directly; on success the form
// resets, a success message appears, and the list reloads with newest first.
async function fillExpenseForm(
  page: import("@playwright/test").Page,
  opts: { amount?: string; date?: string; categoryName?: string; note?: string },
) {
  if (opts.amount !== undefined) await page.getByLabel(/amount/i).fill(opts.amount);
  if (opts.date !== undefined) await page.getByLabel(/date/i).fill(opts.date);
  if (opts.categoryName)
    await page.getByLabel(/category/i).selectOption({ label: opts.categoryName });
  if (opts.note !== undefined) await page.getByLabel(/note/i).fill(opts.note);
}

async function submitExpenseForm(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: /^add expense$/i }).click();
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
    await fillExpenseForm(page, { amount: "33.75", date: today, categoryName, note });
    await submitExpenseForm(page);

    await expect(page.getByText(/expense added/i)).toBeVisible();
    const firstRow = page.getByRole("table").locator("tbody tr").first();
    await expect(firstRow).toContainText(today);
    await expect(firstRow).toContainText("$33.75");
    await expect(firstRow).toContainText(categoryName);
    await expect(firstRow).toContainText(note);
  });
});

test.describe("[AC-012] expense form validation", () => {
  test("[AC-012] an empty amount shows a validation message and creates no expense", async ({
    page,
  }) => {
    await registerAndSignIn(page);
    const categoryName = `QA Cat ${crypto.randomUUID().slice(0, 8)}`;
    await addCategory(page, categoryName);

    await page.goto("/expenses");
    await fillExpenseForm(page, { date: todayIso(), categoryName });
    await submitExpenseForm(page);

    await expect(page.getByText(/enter an amount/i)).toBeVisible();
    await expect(page.getByRole("table")).toHaveCount(0);
  });

  test("[AC-012] an empty date shows a validation message and creates no expense", async ({
    page,
  }) => {
    await registerAndSignIn(page);
    const categoryName = `QA Cat ${crypto.randomUUID().slice(0, 8)}`;
    await addCategory(page, categoryName);

    await page.goto("/expenses");
    await fillExpenseForm(page, { amount: "10.00", categoryName });
    await page.getByLabel(/date/i).fill("");
    await submitExpenseForm(page);

    await expect(page.getByText(/pick a date/i)).toBeVisible();
    await expect(page.getByRole("table")).toHaveCount(0);
  });

  test("[AC-012] an empty category shows a validation message and creates no expense", async ({
    page,
  }) => {
    await registerAndSignIn(page);
    const categoryName = `QA Cat ${crypto.randomUUID().slice(0, 8)}`;
    await addCategory(page, categoryName);

    await page.goto("/expenses");
    await fillExpenseForm(page, { amount: "10.00", date: todayIso() });
    await submitExpenseForm(page);

    await expect(page.getByText(/choose a category/i)).toBeVisible();
    await expect(page.getByRole("table")).toHaveCount(0);
  });

  test("[AC-012] a zero amount shows a validation message and creates no expense", async ({
    page,
  }) => {
    await registerAndSignIn(page);
    const categoryName = `QA Cat ${crypto.randomUUID().slice(0, 8)}`;
    await addCategory(page, categoryName);

    await page.goto("/expenses");
    await fillExpenseForm(page, { amount: "0", date: todayIso(), categoryName });
    await submitExpenseForm(page);

    await expect(page.getByText(/greater than zero/i)).toBeVisible();
    await expect(page.getByRole("table")).toHaveCount(0);
  });

  test("[AC-012] a negative amount shows a validation message and creates no expense", async ({
    page,
  }) => {
    await registerAndSignIn(page);
    const categoryName = `QA Cat ${crypto.randomUUID().slice(0, 8)}`;
    await addCategory(page, categoryName);

    await page.goto("/expenses");
    await fillExpenseForm(page, { amount: "-5", date: todayIso(), categoryName });
    await submitExpenseForm(page);

    await expect(page.getByText(/greater than zero/i)).toBeVisible();
    await expect(page.getByRole("table")).toHaveCount(0);
  });

  test("[AC-012] a non-numeric amount shows a validation message and creates no expense", async ({
    page,
  }) => {
    await registerAndSignIn(page);
    const categoryName = `QA Cat ${crypto.randomUUID().slice(0, 8)}`;
    await addCategory(page, categoryName);

    await page.goto("/expenses");
    await fillExpenseForm(page, { amount: "abc", date: todayIso(), categoryName });
    await submitExpenseForm(page);

    await expect(page.getByText(/valid number/i)).toBeVisible();
    await expect(page.getByRole("table")).toHaveCount(0);
  });
});

test.describe("[AC-013] the add-expense form exposes no recurring, receipt or currency control", () => {
  test("[AC-013] the add-expense form has no recurring-schedule, receipt-attachment or currency control", async ({
    page,
  }) => {
    await registerAndSignIn(page);
    await page.goto("/expenses");

    const addExpenseSection = page.locator("section", {
      has: page.locator("#add-expense-heading"),
    });
    await expect(addExpenseSection).toBeVisible();
    await expect(addExpenseSection.getByText(/recurring|repeat|frequency/i)).toHaveCount(0);
    await expect(addExpenseSection.getByText(/receipt|attachment|upload/i)).toHaveCount(0);
    await expect(addExpenseSection.getByText(/currency/i)).toHaveCount(0);
    await expect(addExpenseSection.locator('input[type="file"]')).toHaveCount(0);
  });
});

test.describe("[AC-015] empty state for a user with no expenses", () => {
  test("[AC-015] a freshly signed-in user with no expenses sees the empty-state prompt to add a first expense, with no broken or empty widget", async ({
    page,
  }) => {
    await registerAndSignIn(page);
    await page.goto("/expenses");

    await expect(page.getByRole("table")).toHaveCount(0);
    await expect(page.getByText(/no expenses yet/i)).toBeVisible();
    await expect(page.getByText(/add your first expense/i)).toBeVisible();
  });
});

test.describe("[AC-014] expenses are ordered most recent first", () => {
  test("[AC-014] expenses are listed with the most recent date first across at least three dates", async ({
    page,
  }) => {
    await registerAndSignIn(page);
    const categoryName = `QA Cat ${crypto.randomUUID().slice(0, 8)}`;
    await addCategory(page, categoryName);

    const oldDate = dateDaysAgo(10);
    const midDate = dateDaysAgo(5);
    const newDate = dateDaysAgo(1);

    for (const [date, note] of [
      [oldDate, "Oldest"],
      [newDate, "Newest"],
      [midDate, "Middle"],
    ] as const) {
      await page.goto("/expenses");
      await fillExpenseForm(page, { amount: "10.00", date, categoryName, note });
      await submitExpenseForm(page);
      await expect(page.getByText(/expense added/i)).toBeVisible();
    }

    await page.goto("/expenses");
    const rows = page.getByRole("table").locator("tbody tr");
    await expect(rows).toHaveCount(3);
    await expect(rows.nth(0)).toContainText(newDate);
    await expect(rows.nth(1)).toContainText(midDate);
    await expect(rows.nth(2)).toContainText(oldDate);
  });
});
