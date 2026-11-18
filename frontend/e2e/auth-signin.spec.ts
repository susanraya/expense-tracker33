import { expect, test } from "@playwright/test";

import { smokeCredentials, apiBaseURL } from "./support/smoke";

function freshPassword(): string {
  return `Aa1${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`;
}

test.describe("sign in", () => {
  test("[AC-004] signing in with the seeded smoke-test credentials reaches the dashboard", async ({
    page,
  }) => {
    const { email, password } = smokeCredentials();

    await page.goto("/sign-in");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in →" }).click();

    await page.waitForURL(/\/dashboard$/);
  });

  test("[AC-005] a wrong password for a real account shows the generic failure message", async ({
    page,
  }) => {
    const { email } = smokeCredentials();

    await page.goto("/sign-in");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(freshPassword());
    await page.getByRole("button", { name: "Sign in →" }).click();

    await expect(page.getByText("Email or password is incorrect")).toBeVisible();
    await expect(page).toHaveURL(/\/sign-in$/);
  });

  test("[AC-005] an unknown email shows the exact same generic failure message, never revealing whether the email exists", async ({
    page,
    request,
  }) => {
    const unknownEmail = `qa-${crypto.randomUUID()}@example.com`;
    const { email: knownEmail } = smokeCredentials();
    const wrongPassword = freshPassword();

    await page.goto("/sign-in");
    await page.getByLabel("Email").fill(unknownEmail);
    await page.getByLabel("Password").fill(wrongPassword);
    await page.getByRole("button", { name: "Sign in →" }).click();
    const unknownMessage = await page.getByText("Email or password is incorrect").textContent();
    await expect(page).toHaveURL(/\/sign-in$/);

    // Compare at the API level too: both failures must be byte-identical.
    const unknownResponse = await request.post(`${apiBaseURL()}/auth/login`, {
      data: { email: unknownEmail, password: wrongPassword },
    });
    const wrongPasswordResponse = await request.post(`${apiBaseURL()}/auth/login`, {
      data: { email: knownEmail, password: wrongPassword },
    });
    expect(unknownResponse.status()).toBe(401);
    expect(wrongPasswordResponse.status()).toBe(401);
    expect(await unknownResponse.json()).toEqual(await wrongPasswordResponse.json());
    expect(unknownMessage).toBe("Email or password is incorrect");
  });
});
