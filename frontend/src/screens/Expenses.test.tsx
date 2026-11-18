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

const CATEGORY = {
  id: "cat_1",
  name: "Groceries",
  color: null,
  created_at: "2026-11-01T00:00:00Z",
};

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

async function openAddDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Add expense" }));
}

describe("Expenses", () => {
  beforeEach(() => {
    setSessionToken("tok-abc");
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    clearSessionToken();
  });

  it("[AC-014] renders amount, date, category and note from GET /expenses newest first", async () => {
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
        return jsonResponse(200, [CATEGORY]);
      }
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    renderExpenses();

    expect(screen.getByText("Loading your expenses…")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("Coffee")).toBeInTheDocument());
    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("2026-11-10")).toBeInTheDocument();
    expect(screen.getAllByText("$12.50").length).toBeGreaterThan(0);
  });

  it("[AC-015] shows the empty state inviting the user to add their first expense", async () => {
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

  it("[AC-013] the form has no recurring, receipt or currency field", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (String(url).includes("/expenses?")) return jsonResponse(200, { items: [], total: 0 });
      if (String(url).includes("/categories")) return jsonResponse(200, [CATEGORY]);
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderExpenses();
    await waitFor(() => expect(screen.getByText("No expenses in this range")).toBeInTheDocument());
    await openAddDialog(user);

    expect(screen.queryByLabelText(/recur/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/receipt/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/currency/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Uncategorised")).not.toBeInTheDocument();
  });

  it("[AC-011] submitting with no category selected shows a validation message and sends no POST", async () => {
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (String(url).includes("/expenses") && init?.method === "POST") {
        throw new Error("should not POST without a category");
      }
      if (String(url).includes("/expenses?")) return jsonResponse(200, { items: [], total: 0 });
      if (String(url).includes("/categories")) return jsonResponse(200, [CATEGORY]);
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderExpenses();
    await waitFor(() => expect(screen.getByText("No expenses in this range")).toBeInTheDocument());
    await openAddDialog(user);

    await user.type(screen.getByLabelText("Amount"), "20");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Pick a category.")).toBeInTheDocument();
    expect(
      fetchMock.mock.calls.some(([, init]) => (init as RequestInit | undefined)?.method === "POST"),
    ).toBe(false);
  });

  it("[AC-012] empty, non-numeric and non-positive amount, and empty date, each show a field message and block submission", async () => {
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      void init;
      if (String(url).includes("/expenses?")) return jsonResponse(200, { items: [], total: 0 });
      if (String(url).includes("/categories")) return jsonResponse(200, [CATEGORY]);
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderExpenses();
    await waitFor(() => expect(screen.getByText("No expenses in this range")).toBeInTheDocument());
    await openAddDialog(user);

    await user.selectOptions(screen.getByLabelText("Category"), "cat_1");
    await user.clear(screen.getByLabelText("Date"));
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Enter an amount, for example 24.50.")).toBeInTheDocument();
    expect(screen.getByText("Pick the date you spent it.")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Amount"), "abc");
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Amount must be greater than zero.")).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Amount"));
    await user.type(screen.getByLabelText("Amount"), "-5");
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Amount must be greater than zero.")).toBeInTheDocument();

    expect(
      fetchMock.mock.calls.some(([, init]) => (init as RequestInit | undefined)?.method === "POST"),
    ).toBe(false);
  });

  it("[AC-012] a 422 from the API maps its detail to the matching field's message", async () => {
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (String(url).includes("/expenses") && init?.method === "POST") {
        return jsonResponse(422, {
          detail: [{ loc: ["body", "date"], msg: "invalid date" }],
        });
      }
      if (String(url).includes("/expenses?")) return jsonResponse(200, { items: [], total: 0 });
      if (String(url).includes("/categories")) return jsonResponse(200, [CATEGORY]);
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderExpenses();
    await waitFor(() => expect(screen.getByText("No expenses in this range")).toBeInTheDocument());
    await openAddDialog(user);

    await user.type(screen.getByLabelText("Amount"), "20");
    await user.selectOptions(screen.getByLabelText("Category"), "cat_1");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Enter a valid date.")).toBeInTheDocument();
    expect(
      screen.queryByText("Check the amount, date and category and try again."),
    ).not.toBeInTheDocument();
  });

  it("[AC-011][AC-012] a valid save posts to POST /expenses, closes the dialog and refreshes the list", async () => {
    let created = false;
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (String(url).includes("/expenses") && init?.method === "POST") {
        created = true;
        const body = JSON.parse(String(init.body));
        expect(body.category_id).toBe("cat_1");
        return jsonResponse(201, {
          id: "exp_new",
          amount: 20,
          date: "2026-11-18",
          description: "Lunch",
          category_id: "cat_1",
          category_name: "Groceries",
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
                    category_id: "cat_1",
                    category_name: "Groceries",
                    created_at: "2026-11-18T00:00:00Z",
                  },
                ],
                total: 20,
              }
            : { items: [], total: 0 },
        );
      }
      if (String(url).includes("/categories")) {
        return jsonResponse(200, [CATEGORY]);
      }
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderExpenses();
    await waitFor(() => expect(screen.getByText("No expenses in this range")).toBeInTheDocument());

    await openAddDialog(user);
    await user.type(screen.getByLabelText("Amount"), "20");
    await user.selectOptions(screen.getByLabelText("Category"), "cat_1");
    await user.type(screen.getByLabelText("Description"), "Lunch");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await waitFor(() => expect(screen.getByText("Lunch")).toBeInTheDocument());
    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("2026-11-18")).toBeInTheDocument();
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
                    category_id: "cat_1",
                    category_name: "Groceries",
                    created_at: "2026-11-10T00:00:00Z",
                  },
                ],
                total: 12.5,
              },
        );
      }
      if (String(url).includes("/categories")) {
        return jsonResponse(200, [CATEGORY]);
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
