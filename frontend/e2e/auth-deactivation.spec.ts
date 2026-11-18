import { expect, test } from "@playwright/test";

function freshPassword(): string {
  return `Aa1${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`;
}

function freshEmail(): string {
  return `qa-${crypto.randomUUID()}@example.com`;
}

test("[AC-010] confirming deactivation in Settings ends the session and the same credentials can no longer sign in", async ({
  page,
}) => {
  const email = freshEmail();
  const password = freshPassword();

  await page.goto("/sign-in");
  await page.getByRole("tab", { name: "Create account" }).click();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account →" }).click();
  await page.waitForURL(/\/dashboard$/);

  await page.goto("/settings");
  await page.getByRole("button", { name: /deactivate account/i }).click();
  await page
    .getByRole("dialog")
    .getByLabel(/expenses and \d+ categories/i)
    .check();
  await page.getByRole("button", { name: /confirm deactivation/i }).click();

  await page.waitForURL(/\/sign-in$/);

  // The same credentials no longer sign in.
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in →" }).click();

  await expect(page.getByText("Email or password is incorrect")).toBeVisible();
  await expect(page).toHaveURL(/\/sign-in$/);
});
