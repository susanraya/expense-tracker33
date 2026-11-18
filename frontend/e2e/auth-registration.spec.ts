import { expect, test } from "@playwright/test";

import { apiBaseURL } from "./support/smoke";

// A password meeting the app's stated rule (>=10 chars, a letter and a digit),
// generated at run time rather than written as a literal.
function freshPassword(): string {
  return `Aa1${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`;
}

function freshEmail(): string {
  return `qa-${crypto.randomUUID()}@example.com`;
}

test.describe("registration", () => {
  test("[AC-001] a new visitor registers with a valid email and a conforming password and reaches the dashboard", async ({
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
  });

  test("[AC-002] registering with an already-registered email shows a clear rejection and no second account is created", async ({
    page,
    request,
  }) => {
    const email = freshEmail();
    const firstPassword = freshPassword();
    const secondPassword = freshPassword();

    const created = await request.post(`${apiBaseURL()}/auth/register`, {
      data: { email, password: firstPassword },
    });
    expect(created.ok()).toBeTruthy();

    await page.goto("/sign-in");
    await page.getByRole("tab", { name: "Create account" }).click();
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(secondPassword);
    await page.getByRole("button", { name: "Create account →" }).click();

    await expect(page.getByText(/already exists/i)).toBeVisible();
    await expect(page).toHaveURL(/\/sign-in$/);

    // No second account was created: the original password still signs in,
    // and the second (rejected) password does not.
    const loginOriginal = await request.post(`${apiBaseURL()}/auth/login`, {
      data: { email, password: firstPassword },
    });
    expect(loginOriginal.ok()).toBeTruthy();
    const loginRejected = await request.post(`${apiBaseURL()}/auth/login`, {
      data: { email, password: secondPassword },
    });
    expect(loginRejected.status()).toBe(401);
  });

  test("[AC-003] an invalid email shows a validation message and creates no account", async ({
    page,
    request,
  }) => {
    const email = "not-an-email";
    const password = freshPassword();

    await page.goto("/sign-in");
    await page.getByRole("tab", { name: "Create account" }).click();
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Create account →" }).click();

    await expect(page.locator("#auth-feedback")).toContainText(/doesn't look right/i);
    await expect(page).toHaveURL(/\/sign-in$/);

    const login = await request.post(`${apiBaseURL()}/auth/login`, {
      data: { email, password },
    });
    expect(login.status()).not.toBe(200);
  });

  test("[AC-003] a too-short password shows a validation message and creates no account", async ({
    page,
    request,
  }) => {
    const email = freshEmail();
    const password = "short1"; // 6 chars: fails the >=10-character rule

    await page.goto("/sign-in");
    await page.getByRole("tab", { name: "Create account" }).click();
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Create account →" }).click();

    await expect(page.locator("#auth-feedback")).toContainText(/at least 10 characters/i);
    await expect(page).toHaveURL(/\/sign-in$/);

    const login = await request.post(`${apiBaseURL()}/auth/login`, {
      data: { email, password },
    });
    expect(login.status()).not.toBe(200);
  });
});
