import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider } from "@/lib/auth";
import { clearSessionToken, setSessionToken } from "@/lib/api";
import Expenses from "./Expenses";

function jsonResponse(status: number, body: unknown) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response);
}

function renderExpenses() {
  return render(
    <MemoryRouter initialEntries={["/expenses"]}>
      <AuthProvider>
        <Routes>
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/sign-in" element={<div>Sign In Loaded</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("Expenses", () => {
  beforeEach(() => {
    setSessionToken("tok-abc");
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    clearSessionToken();
  });

  it("[AC-036] renders items and total from GET /expenses", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (String(url).includes("/expenses?")) {
        return jsonResponse(200, {
          items: [
            {
              id: "exp_1",
              amount: 12.5,
              date: "2026-11-10",
              description: "Coffee",
              category_id: "cat_1",
              category_name: "Groceries",
              created_at: "2026-11-10T00:00:00Z",
            },
          ],
          total: 12.5,
        });
      }
      if (String(url).includes("/categories")) {
        return jsonResponse(200, [
          { id: "cat_1", name: "Groceries", color: null, created_at: "2026-11-01T00:00:00Z" },
        ]);
      }
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    renderExpenses();

    expect(screen.getByText("Loading your expenses…")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("Coffee")).toBeInTheDocument());
    expect(screen.getAllByText("$12.50").length).toBeGreaterThan(0);
  });

  it("[AC-036] shows the empty state when there are no expenses in range", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (String(url).includes("/expenses?")) {
        return jsonResponse(200, { items: [], total: 0 });
      }
      return jsonResponse(200, []);
    });
    vi.stubGlobal("fetch", fetchMock);

    renderExpenses();

    await waitFor(() => expect(screen.getByText("No expenses in this range")).toBeInTheDocument());
  });

  it("[AC-036] shows an error state when the list cannot be loaded", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (String(url).includes("/expenses?")) {
        return jsonResponse(500, { detail: "server error" });
      }
      return jsonResponse(200, []);
    });
    vi.stubGlobal("fetch", fetchMock);

    renderExpenses();

    await waitFor(() =>
      expect(screen.getByText("We couldn’t load your expenses")).toBeInTheDocument(),
    );
  });

  it("[AC-036] creating an expense calls POST /expenses and the list refreshes", async () => {
    let created = false;
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (String(url).includes("/expenses") && init?.method === "POST") {
        created = true;
        return jsonResponse(201, {
          id: "exp_new",
          amount: 20,
          date: "2026-11-18",
          description: "Lunch",
          category_id: null,
          category_name: null,
          created_at: "2026-11-18T00:00:00Z",
        });
      }
      if (String(url).includes("/expenses?")) {
        return jsonResponse(
          200,
          created
            ? {
                items: [
                  {
                    id: "exp_new",
                    amount: 20,
                    date: "2026-11-18",
                    description: "Lunch",
                    category_id: null,
                    category_name: null,
                    created_at: "2026-11-18T00:00:00Z",
                  },
                ],
                total: 20,
              }
            : { items: [], total: 0 },
        );
      }
      if (String(url).includes("/categories")) {
        return jsonResponse(200, []);
      }
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderExpenses();
    await waitFor(() => expect(screen.getByText("No expenses in this range")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Add expense" }));
    await user.type(screen.getByLabelText("Amount"), "20");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(screen.getByText("Lunch")).toBeInTheDocument());
  });

  it("[AC-036] deleting an expense calls DELETE /expenses/{id} and the list refreshes", async () => {
    let deleted = false;
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (String(url).includes("/expenses/exp_1") && init?.method === "DELETE") {
        deleted = true;
        return jsonResponse(204, null);
      }
      if (String(url).includes("/expenses?")) {
        return jsonResponse(
          200,
          deleted
            ? { items: [], total: 0 }
            : {
                items: [
                  {
                    id: "exp_1",
                    amount: 12.5,
                    date: "2026-11-10",
                    description: "Coffee",
                    category_id: null,
                    category_name: null,
                    created_at: "2026-11-10T00:00:00Z",
                  },
                ],
                total: 12.5,
              },
        );
      }
      if (String(url).includes("/categories")) {
        return jsonResponse(200, []);
      }
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderExpenses();
    await waitFor(() => expect(screen.getByText("Coffee")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Delete expense on 2026-11-10" }));

    await waitFor(() => expect(screen.queryByText("Coffee")).not.toBeInTheDocument());
  });

  it("[AC-009] a 401 clears the stored token and redirects to sign-in", async () => {
    const fetchMock = vi.fn(() => jsonResponse(401, { detail: "session expired" }));
    vi.stubGlobal("fetch", fetchMock);

    renderExpenses();

    await waitFor(() => expect(screen.getByText("Sign In Loaded")).toBeInTheDocument());
  });
});
