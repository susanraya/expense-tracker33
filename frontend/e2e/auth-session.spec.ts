import { expect, test } from "@playwright/test";

import { apiBaseURL } from "./support/smoke";

function freshPassword(): string {
  return `Aa1${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`;
}

function freshEmail(): string {
  return `qa-${crypto.randomUUID()}@example.com`;
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

test.describe("session lifecycle", () => {
  test("[AC-006] after Sign out, navigating directly to /dashboard lands on the sign-in screen", async ({
    page,
  }) => {
    await registerAndSignIn(page);

    await page.goto("/settings");
    await page.getByRole("button", { name: /sign out/i }).click();
    await page.waitForURL(/\/sign-in$/);

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/sign-in$/);
  });

  test("[AC-007] with the stored token cleared, the next protected action redirects to sign-in", async ({
    page,
  }) => {
    await registerAndSignIn(page);

    await page.evaluate(() => localStorage.removeItem("session_token"));
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/sign-in$/);
  });

  test("[AC-007] with the stored token revoked server-side, the next protected action redirects to sign-in", async ({
    page,
    request,
  }) => {
    await registerAndSignIn(page);

    const token = await page.evaluate(() => localStorage.getItem("session_token"));
    expect(token).toBeTruthy();

    // Revoke the session server-side without telling this browser tab.
    const revoke = await request.post(`${apiBaseURL()}/auth/logout`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(revoke.status()).toBe(204);

    // This tab still believes it is signed in; its next authenticated call
    // (Settings' Sign out button) must be rejected and send it to sign-in.
    await page.goto("/settings");
    await page.getByRole("button", { name: /sign out/i }).click();

    await expect(page).toHaveURL(/\/sign-in$/);
  });
});
