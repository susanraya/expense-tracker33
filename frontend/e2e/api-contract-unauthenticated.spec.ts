import { expect, test } from "@playwright/test";

import { apiBaseURL } from "./support/smoke";

// AC-037/NFR-005: a protected API endpoint rejects a request with no valid session --
// no data is returned, and nothing is created, changed or removed. This is a pure API
// guarantee (no person watches a 401 response body), so it is driven entirely through
// Playwright's `request` fixture against the real booted backend, never through the UI.
//
// backend/tests covers this same contract against an in-memory test database; this spec
// re-proves it against the actual booted app the E2E run uses, end to end, and confirms
// "no data changed" by reading the rows back afterward through the owning account's own
// valid session -- not by inspecting the database directly.

const API = process.env.E2E_API_URL ?? apiBaseURL();

function freshPassword(): string {
  return `Aa1${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`;
}

function freshEmail(): string {
  return `qa-${crypto.randomUUID()}@example.com`;
}

type Fixtures = { request: import("@playwright/test").APIRequestContext };

async function registerAndGetToken(
  request: Fixtures["request"],
): Promise<{ token: string; email: string }> {
  const email = freshEmail();
  const password = freshPassword();
  const registered = await request.post(`${API}/auth/register`, {
    data: { email, password },
  });
  expect(registered.status()).toBe(201);
  const login = await request.post(`${API}/auth/login`, { data: { email, password } });
  expect(login.status()).toBe(200);
  const body = await login.json();
  return { token: body.token as string, email };
}

// Every endpoint this ticket adds, with a body shape valid enough that the only thing
// that could reject the call is the missing/invalid session.
function categoryEndpoints(categoryId: string) {
  return [
    { method: "GET" as const, path: "/categories" },
    { method: "POST" as const, path: "/categories", data: { name: `x-${crypto.randomUUID()}` } },
    { method: "PATCH" as const, path: `/categories/${categoryId}`, data: { name: "hijacked" } },
    { method: "DELETE" as const, path: `/categories/${categoryId}` },
  ];
}

function expenseEndpoints(expenseId: string) {
  return [
    { method: "GET" as const, path: "/expenses" },
    {
      method: "POST" as const,
      path: "/expenses",
      data: { amount: 10, date: "2026-01-01", description: "x" },
    },
    { method: "PATCH" as const, path: `/expenses/${expenseId}`, data: { amount: 999 } },
    { method: "DELETE" as const, path: `/expenses/${expenseId}` },
  ];
}

async function callWithHeaders(
  request: Fixtures["request"],
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  headers: Record<string, string>,
  data?: unknown,
) {
  const url = `${API}${path}`;
  if (method === "GET") return request.get(url, { headers });
  if (method === "DELETE") return request.delete(url, { headers });
  if (method === "POST") return request.post(url, { headers, data });
  return request.patch(url, { headers, data });
}

test.describe("[AC-037] protected endpoints without a valid session", () => {
  test("[AC-037] every categories/expenses endpoint returns 401 and no data with no Authorization header at all", async ({
    request,
  }) => {
    const someId = crypto.randomUUID();
    for (const endpoint of [...categoryEndpoints(someId), ...expenseEndpoints(someId)]) {
      const response = await callWithHeaders(
        request,
        endpoint.method,
        endpoint.path,
        {},
        "data" in endpoint ? endpoint.data : undefined,
      );
      expect(response.status(), `${endpoint.method} ${endpoint.path}`).toBe(401);
      const body = await response.json();
      // A rejection carries only an error detail -- never a list or a resource.
      expect(Array.isArray(body)).toBe(false);
      expect(body).toHaveProperty("detail");
      expect(body).not.toHaveProperty("items");
      expect(body).not.toHaveProperty("id");
    }
  });

  test("[AC-037] every categories/expenses endpoint returns 401 with a garbage bearer token", async ({
    request,
  }) => {
    const someId = crypto.randomUUID();
    const headers = { Authorization: "Bearer this-token-was-never-issued" };
    for (const endpoint of [...categoryEndpoints(someId), ...expenseEndpoints(someId)]) {
      const response = await callWithHeaders(
        request,
        endpoint.method,
        endpoint.path,
        headers,
        "data" in endpoint ? endpoint.data : undefined,
      );
      expect(response.status(), `${endpoint.method} ${endpoint.path}`).toBe(401);
    }
  });

  test("[AC-037] a revoked (logged-out) token is rejected on every categories/expenses endpoint", async ({
    request,
  }) => {
    const { token } = await registerAndGetToken(request);
    const logout = await request.post(`${API}/auth/logout`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(logout.status()).toBe(204);

    const someId = crypto.randomUUID();
    const headers = { Authorization: `Bearer ${token}` };
    for (const endpoint of [...categoryEndpoints(someId), ...expenseEndpoints(someId)]) {
      const response = await callWithHeaders(
        request,
        endpoint.method,
        endpoint.path,
        headers,
        "data" in endpoint ? endpoint.data : undefined,
      );
      expect(response.status(), `${endpoint.method} ${endpoint.path}`).toBe(401);
    }
  });

  test("[AC-037] an unauthenticated create, rename and delete attempt on a real category leaves it completely unchanged", async ({
    request,
  }) => {
    const { token } = await registerAndGetToken(request);
    const ownerHeaders = { Authorization: `Bearer ${token}` };
    const originalName = `QA Cat ${crypto.randomUUID().slice(0, 8)}`;

    const created = await request.post(`${API}/categories`, {
      headers: ownerHeaders,
      data: { name: originalName },
    });
    expect(created.status()).toBe(201);
    const category = await created.json();

    const beforeList = await request.get(`${API}/categories`, { headers: ownerHeaders });
    const beforeCount = (await beforeList.json()).length;

    // No token at all: attempt to create a second category, rename and delete the real one.
    const unauthorizedCreate = await request.post(`${API}/categories`, {
      data: { name: `should-not-exist-${crypto.randomUUID()}` },
    });
    expect(unauthorizedCreate.status()).toBe(401);

    const unauthorizedRename = await request.patch(`${API}/categories/${category.id}`, {
      data: { name: "hijacked" },
    });
    expect(unauthorizedRename.status()).toBe(401);

    const unauthorizedDelete = await request.delete(`${API}/categories/${category.id}`);
    expect(unauthorizedDelete.status()).toBe(401);

    // Confirmed through the owner's own valid session: nothing moved.
    const afterList = await request.get(`${API}/categories`, { headers: ownerHeaders });
    const afterCategories = await afterList.json();
    expect(afterCategories.length).toBe(beforeCount);
    const stillThere = afterCategories.find((c: { id: string }) => c.id === category.id);
    expect(stillThere).toBeTruthy();
    expect(stillThere.name).toBe(originalName);
  });

  test("[AC-037] an unauthenticated create, edit and delete attempt on a real expense leaves it completely unchanged", async ({
    request,
  }) => {
    const { token } = await registerAndGetToken(request);
    const ownerHeaders = { Authorization: `Bearer ${token}` };

    const created = await request.post(`${API}/expenses`, {
      headers: ownerHeaders,
      data: { amount: 42.5, date: "2026-01-15", description: "Owner's own expense" },
    });
    expect(created.status()).toBe(201);
    const expense = await created.json();

    const beforeList = await request.get(`${API}/expenses`, { headers: ownerHeaders });
    const beforeTotal = (await beforeList.json()).total;

    const unauthorizedCreate = await request.post(`${API}/expenses`, {
      data: { amount: 999, date: "2026-01-01", description: "should-not-exist" },
    });
    expect(unauthorizedCreate.status()).toBe(401);

    const unauthorizedEdit = await request.patch(`${API}/expenses/${expense.id}`, {
      data: { amount: 999, description: "hijacked" },
    });
    expect(unauthorizedEdit.status()).toBe(401);

    const unauthorizedDelete = await request.delete(`${API}/expenses/${expense.id}`);
    expect(unauthorizedDelete.status()).toBe(401);

    const afterList = await request.get(`${API}/expenses`, { headers: ownerHeaders });
    const afterBody = await afterList.json();
    expect(afterBody.total).toBe(beforeTotal);
    const stillThere = afterBody.items.find((e: { id: string }) => e.id === expense.id);
    expect(stillThere).toBeTruthy();
    expect(stillThere.amount).toBe(42.5);
    expect(stillThere.description).toBe("Owner's own expense");
  });
});
