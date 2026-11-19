import { expect, test } from "@playwright/test";

import { apiBaseURL } from "./support/smoke";

// AC-038: free to use, no billing or payment flow anywhere -- registering, signing in,
// logging expenses and viewing reports never asks for payment details, and the API
// serves no billing/payment/subscription endpoint at all.

const API = process.env.E2E_API_URL ?? apiBaseURL();

// A real payment ask would show one of these phrases somewhere on screen.
const PAYMENT_ASK_PATTERN =
  /add (a )?payment method|upgrade (to|your)|enter (your )?card|card number|\bcvv\b|\bcvc\b|expiry date|billing address|subscribe now|pay now|start (a |your )?(free )?trial|go pro|enter payment/i;

function freshPassword(): string {
  return `Aa1${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`;
}

function freshEmail(): string {
  return `qa-${crypto.randomUUID()}@example.com`;
}

test.describe("[AC-038] free to use, no billing or payment flow", () => {
  test("[AC-038] registering a new account asks only for email and password, never a payment detail", async ({
    page,
  }) => {
    const email = freshEmail();
    const password = freshPassword();

    await page.goto("/sign-in");
    await page.getByRole("tab", { name: "Create account" }).click();

    // Only the two fields the approved api_spec names are present on the form.
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.locator("body")).not.toContainText(PAYMENT_ASK_PATTERN);
    await expect(page.getByText(/never ask for payment details/i)).toBeVisible();

    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Create account →" }).click();
    await page.waitForURL(/\/dashboard$/);

    // Reaching the dashboard never passed through anything payment-shaped.
    await expect(page.locator("body")).not.toContainText(PAYMENT_ASK_PATTERN);
  });

  test("[AC-038] the Expenses screen, where expenses are logged, never asks for payment details", async ({
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

    await page.goto("/expenses");
    await expect(page.locator("body")).not.toContainText(PAYMENT_ASK_PATTERN);
    await expect(
      page.getByRole("button", { name: /upgrade|subscribe|checkout|pay now|go pro/i }),
    ).toHaveCount(0);
  });

  test("[AC-038] a full journey -- register, create an expense, open the dashboard and reports -- never shows a payment, billing or subscription field or link", async ({
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
    await expect(page.locator("body")).not.toContainText(PAYMENT_ASK_PATTERN);

    // Create an expense through the app's own form.
    await page.goto("/expenses");
    await page.getByRole("button", { name: /add expense/i }).click();
    await expect(page.locator("body")).not.toContainText(PAYMENT_ASK_PATTERN);
    await page.getByLabel(/amount/i).fill("12.50");
    const categorySelect = page.getByLabel(/category/i);
    if (await categorySelect.count()) {
      await categorySelect.selectOption({ index: 1 });
    }
    await page
      .getByRole("dialog")
      .getByRole("button", { name: /add expense|save/i })
      .click();
    await expect(page.locator("body")).not.toContainText(PAYMENT_ASK_PATTERN);

    // Dashboard and Reports, reached after logging that expense, stay payment-free.
    await page.goto("/dashboard");
    await expect(page.locator("body")).not.toContainText(PAYMENT_ASK_PATTERN);
    await page.goto("/reports");
    await expect(page.locator("body")).not.toContainText(PAYMENT_ASK_PATTERN);
    await expect(
      page.getByRole("link", { name: /upgrade|subscribe|checkout|billing|pricing|plan|trial/i }),
    ).toHaveCount(0);
  });

  test("[AC-038] the Reports screen never asks for payment details", async ({ page }) => {
    const email = freshEmail();
    const password = freshPassword();

    await page.goto("/sign-in");
    await page.getByRole("tab", { name: "Create account" }).click();
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Create account →" }).click();
    await page.waitForURL(/\/dashboard$/);

    await page.goto("/reports");
    await expect(page.locator("body")).not.toContainText(PAYMENT_ASK_PATTERN);
    await expect(
      page.getByRole("button", { name: /upgrade|subscribe|checkout|pay now|go pro/i }),
    ).toHaveCount(0);
  });

  test("[AC-038] Account settings states the app is free to use and has no billing section", async ({
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
    await expect(page.locator("body")).not.toContainText(PAYMENT_ASK_PATTERN);
    await expect(
      page.getByText(/free to use.*no billing, subscription or payment step/i),
    ).toBeVisible();
  });

  test("[AC-038] no billing, payment or subscription endpoint is served by the API", async ({
    request,
  }) => {
    const spec = await request.get(`${API}/openapi.json`);
    expect(spec.ok()).toBeTruthy();
    const body = await spec.json();
    const paths: string[] = Object.keys(body.paths ?? {});
    expect(paths.length).toBeGreaterThan(0);

    const offending = paths.filter((path) =>
      /pay|bill|subscri|stripe|checkout|invoice/i.test(path),
    );
    expect(offending).toEqual([]);

    // A handful of URLs a payment feature would plausibly live at: none of them
    // is routed to anything.
    for (const candidate of [
      "/billing",
      "/payments",
      "/subscriptions",
      "/checkout",
      "/stripe/webhook",
    ]) {
      const getResponse = await request.get(`${API}${candidate}`);
      expect([404, 405]).toContain(getResponse.status());
    }
  });

  test("[AC-038] registering through the API succeeds from email and password alone, with no payment field required or echoed back", async ({
    request,
  }) => {
    const email = freshEmail();
    const password = freshPassword();

    const response = await request.post(`${API}/auth/register`, {
      data: { email, password },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).not.toHaveProperty("card");
    expect(body).not.toHaveProperty("billing");
    expect(body).not.toHaveProperty("subscription");
  });
});
