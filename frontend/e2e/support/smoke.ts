// The seeded "user"-role account every E2E run has: the platform sets these two settings
// for the run, and the backend creates this user from them at startup (see app/seed.py).
// Sign in as this user through the app's own sign-in screen. A missing setting fails the
// test: never skip one.
export function smokeCredentials(): { email: string; password: string } {
  const email = process.env.SMOKE_TEST_EMAIL;
  const password = process.env.SMOKE_TEST_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "SMOKE_TEST_EMAIL and SMOKE_TEST_PASSWORD are not set: the platform sets them for every E2E run.",
    );
  }
  return { email, password };
}

// Where the real backend API lives for a direct (non-UI) call, e.g. to create a
// duplicate account ahead of a UI registration attempt, or to revoke a session
// token server-side. Mirrors the default frontend/src/lib/api.ts falls back to
// when VITE_API_BASE_URL is not set, so it matches whatever the app itself calls.
export function apiBaseURL(): string {
  return (process.env.VITE_API_BASE_URL ?? "http://localhost:8000").replace(/\/+$/, "");
}
