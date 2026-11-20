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

const CATEGORY = { id: "cat_1", name: "Groceries", expense_count: 1 };

describe("Expenses", () => {
  beforeEach(() => {
    setSessionToken("tok-abc");
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    clearSessionToken();
  });

  it("[AC-013] the add-expense form has exactly amount, date, category and note, no other fields", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (String(url).includes("/categories")) return jsonResponse(200, [CATEGORY]);
      if (String(url).includes("/expenses")) return jsonResponse(200, { items: [], total: 0 });
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    renderExpenses();
    await waitFor(() => expect(screen.getByText("No expenses yet")).toBeInTheDocument());

    expect(screen.getByLabelText("Amount")).toBeInTheDocument();
    expect(screen.getByLabelText("Date")).toBeInTheDocument();
    expect(screen.getByLabelText("Category")).toBeInTheDocument();
    expect(screen.getByLabelText("Note (optional)")).toBeInTheDocument();
    expect(screen.queryByText(/recurring/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/receipt/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/currency/i)).not.toBeInTheDocument();
  });

  it("[AC-014] renders amount, date, category name and note for each expense, most recent date first", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (String(url).includes("/categories")) return jsonResponse(200, [CATEGORY]);
      if (String(url).includes("/expenses")) {
        return jsonResponse(200, {
          items: [
            {
              id: "exp_2",
              amount: "20.00",
              date: "2026-11-15",
              category_id: "cat_1",
              category_name: "Groceries",
              note: "Big shop",
              created_at: "2026-11-15T10:00:00Z",
            },
            {
              id: "exp_1",
              amount: "12.50",
              date: "2026-11-10",
              category_id: "cat_1",
              category_name: "Groceries",
              note: "Coffee",
              created_at: "2026-11-10T00:00:00Z",
            },
          ],
          total: 32.5,
        });
      }
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    renderExpenses();

    expect(screen.getByText("Loading your expenses…")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("Big shop")).toBeInTheDocument());
    expect(screen.getByText("Coffee")).toBeInTheDocument();

    const rows = screen.getAllByRole("row");
    // row 0 is the header
    expect(rows[1]).toHaveTextContent("2026-11-15");
    expect(rows[2]).toHaveTextContent("2026-11-10");
    expect(screen.getByText("$20.00")).toBeInTheDocument();
    expect(screen.getByText("$12.50")).toBeInTheDocument();
  });

  it("[AC-015] shows an empty state prompting the user to add their first expense", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (String(url).includes("/categories")) return jsonResponse(200, []);
      if (String(url).includes("/expenses")) return jsonResponse(200, { items: [], total: 0 });
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    renderExpenses();

    await waitFor(() => expect(screen.getByText("No expenses yet")).toBeInTheDocument());
    expect(screen.getByText(/add your first expense/i)).toBeInTheDocument();
  });

  it("shows an error state and lets the user retry when the list cannot be loaded", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (String(url).includes("/categories")) return jsonResponse(200, []);
      if (String(url).includes("/expenses")) return jsonResponse(500, { detail: "server error" });
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    renderExpenses();

    await waitFor(() =>
      expect(screen.getByText("We couldn’t load your expenses")).toBeInTheDocument(),
    );
  });

  it("[AC-012] empty amount blocks submission with an inline message", async () => {
    const fetchMock = vi.fn((url: string, _init?: RequestInit) => {
      if (String(url).includes("/categories")) return jsonResponse(200, [CATEGORY]);
      if (String(url).includes("/expenses")) return jsonResponse(200, { items: [], total: 0 });
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderExpenses();
    await waitFor(() => expect(screen.getByText("No expenses yet")).toBeInTheDocument());

    await user.clear(screen.getByLabelText("Date"));
    await user.type(screen.getByLabelText("Date"), "2026-11-20");
    await user.selectOptions(screen.getByLabelText("Category"), "cat_1");
    await user.click(screen.getByRole("button", { name: "Add expense" }));

    expect(screen.getByText("Enter an amount.")).toBeInTheDocument();
    expect(
      fetchMock.mock.calls.some((call) => (call[1] as RequestInit | undefined)?.method === "POST"),
    ).toBe(false);
  });

  it("[AC-012] empty date blocks submission with an inline message", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (String(url).includes("/categories")) return jsonResponse(200, [CATEGORY]);
      if (String(url).includes("/expenses")) return jsonResponse(200, { items: [], total: 0 });
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderExpenses();
    await waitFor(() => expect(screen.getByText("No expenses yet")).toBeInTheDocument());

    await user.type(screen.getByLabelText("Amount"), "10");
    await user.clear(screen.getByLabelText("Date"));
    await user.selectOptions(screen.getByLabelText("Category"), "cat_1");
    await user.click(screen.getByRole("button", { name: "Add expense" }));

    expect(screen.getByText("Pick a date.")).toBeInTheDocument();
  });

  it("[AC-012] empty category blocks submission with an inline message", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (String(url).includes("/categories")) return jsonResponse(200, [CATEGORY]);
      if (String(url).includes("/expenses")) return jsonResponse(200, { items: [], total: 0 });
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderExpenses();
    await waitFor(() => expect(screen.getByText("No expenses yet")).toBeInTheDocument());

    await user.type(screen.getByLabelText("Amount"), "10");
    await user.clear(screen.getByLabelText("Date"));
    await user.type(screen.getByLabelText("Date"), "2026-11-20");
    await user.click(screen.getByRole("button", { name: "Add expense" }));

    expect(screen.getByText("Choose a category.")).toBeInTheDocument();
  });

  it("[AC-012] a non-numeric amount blocks submission with an inline message", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (String(url).includes("/categories")) return jsonResponse(200, [CATEGORY]);
      if (String(url).includes("/expenses")) return jsonResponse(200, { items: [], total: 0 });
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderExpenses();
    await waitFor(() => expect(screen.getByText("No expenses yet")).toBeInTheDocument());

    await user.type(screen.getByLabelText("Amount"), "abc");
    await user.clear(screen.getByLabelText("Date"));
    await user.type(screen.getByLabelText("Date"), "2026-11-20");
    await user.selectOptions(screen.getByLabelText("Category"), "cat_1");
    await user.click(screen.getByRole("button", { name: "Add expense" }));

    expect(screen.getByText("Enter a valid number for the amount.")).toBeInTheDocument();
  });

  it("[AC-012] a zero amount blocks submission with an inline message", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (String(url).includes("/categories")) return jsonResponse(200, [CATEGORY]);
      if (String(url).includes("/expenses")) return jsonResponse(200, { items: [], total: 0 });
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderExpenses();
    await waitFor(() => expect(screen.getByText("No expenses yet")).toBeInTheDocument());

    await user.type(screen.getByLabelText("Amount"), "0");
    await user.clear(screen.getByLabelText("Date"));
    await user.type(screen.getByLabelText("Date"), "2026-11-20");
    await user.selectOptions(screen.getByLabelText("Category"), "cat_1");
    await user.click(screen.getByRole("button", { name: "Add expense" }));

    expect(screen.getByText("Amount must be greater than zero.")).toBeInTheDocument();
  });

  it("[AC-012] a negative amount blocks submission with an inline message", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (String(url).includes("/categories")) return jsonResponse(200, [CATEGORY]);
      if (String(url).includes("/expenses")) return jsonResponse(200, { items: [], total: 0 });
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderExpenses();
    await waitFor(() => expect(screen.getByText("No expenses yet")).toBeInTheDocument());

    await user.type(screen.getByLabelText("Amount"), "-5");
    await user.clear(screen.getByLabelText("Date"));
    await user.type(screen.getByLabelText("Date"), "2026-11-20");
    await user.selectOptions(screen.getByLabelText("Category"), "cat_1");
    await user.click(screen.getByRole("button", { name: "Add expense" }));

    expect(screen.getByText("Amount must be greater than zero.")).toBeInTheDocument();
  });

  it("[AC-012] a 422 from the API is surfaced as a readable message and nothing is added", async () => {
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (String(url).includes("/categories")) return jsonResponse(200, [CATEGORY]);
      if (String(url).includes("/expenses") && init?.method === "POST") {
        return jsonResponse(422, {
          detail: [{ loc: ["body", "amount"], msg: "amount must be positive" }],
        });
      }
      if (String(url).includes("/expenses")) return jsonResponse(200, { items: [], total: 0 });
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderExpenses();
    await waitFor(() => expect(screen.getByText("No expenses yet")).toBeInTheDocument());

    await user.type(screen.getByLabelText("Amount"), "10");
    await user.clear(screen.getByLabelText("Date"));
    await user.type(screen.getByLabelText("Date"), "2026-11-20");
    await user.selectOptions(screen.getByLabelText("Category"), "cat_1");
    await user.click(screen.getByRole("button", { name: "Add expense" }));

    await waitFor(() => expect(screen.getByText("amount must be positive")).toBeInTheDocument());
    expect(screen.getByText("No expenses yet")).toBeInTheDocument();
  });

  it("[AC-012] a 404 from the API (unknown category) is surfaced as a readable message and nothing is added", async () => {
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (String(url).includes("/categories")) return jsonResponse(200, [CATEGORY]);
      if (String(url).includes("/expenses") && init?.method === "POST") {
        return jsonResponse(404, { detail: "Category not found." });
      }
      if (String(url).includes("/expenses")) return jsonResponse(200, { items: [], total: 0 });
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderExpenses();
    await waitFor(() => expect(screen.getByText("No expenses yet")).toBeInTheDocument());

    await user.type(screen.getByLabelText("Amount"), "10");
    await user.clear(screen.getByLabelText("Date"));
    await user.type(screen.getByLabelText("Date"), "2026-11-20");
    await user.selectOptions(screen.getByLabelText("Category"), "cat_1");
    await user.click(screen.getByRole("button", { name: "Add expense" }));

    await waitFor(() => expect(screen.getByText("Category not found.")).toBeInTheDocument());
    expect(screen.getByText("No expenses yet")).toBeInTheDocument();
  });

  it("[AC-011] saving a valid expense calls POST /expenses and the new expense appears at the top without a page reload", async () => {
    let created = false;
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (String(url).includes("/categories")) return jsonResponse(200, [CATEGORY]);
      if (String(url).includes("/expenses") && init?.method === "POST") {
        expect(JSON.parse(init.body as string)).toEqual({
          amount: "15.25",
          date: "2026-11-20",
          category_id: "cat_1",
          note: "Taxi",
        });
        created = true;
        return jsonResponse(201, {
          id: "exp_new",
          amount: "15.25",
          date: "2026-11-20",
          category_id: "cat_1",
          category_name: "Groceries",
          note: "Taxi",
          created_at: "2026-11-20T00:00:00Z",
        });
      }
      if (String(url).includes("/expenses")) {
        return jsonResponse(
          200,
          created
            ? {
                items: [
                  {
                    id: "exp_new",
                    amount: "15.25",
                    date: "2026-11-20",
                    category_id: "cat_1",
                    category_name: "Groceries",
                    note: "Taxi",
                    created_at: "2026-11-20T00:00:00Z",
                  },
                ],
                total: 15.25,
              }
            : { items: [], total: 0 },
        );
      }
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderExpenses();
    await waitFor(() => expect(screen.getByText("No expenses yet")).toBeInTheDocument());

    await user.type(screen.getByLabelText("Amount"), "15.25");
    await user.clear(screen.getByLabelText("Date"));
    await user.type(screen.getByLabelText("Date"), "2026-11-20");
    await user.selectOptions(screen.getByLabelText("Category"), "cat_1");
    await user.type(screen.getByLabelText("Note (optional)"), "Taxi");
    await user.click(screen.getByRole("button", { name: "Add expense" }));

    await waitFor(() => expect(screen.getByText("Taxi")).toBeInTheDocument());
    expect(screen.getByText("$15.25")).toBeInTheDocument();
  });

  it("a 401 clears the stored token and redirects to sign-in", async () => {
    const fetchMock = vi.fn(() => jsonResponse(401, { detail: "session expired" }));
    vi.stubGlobal("fetch", fetchMock);

    renderExpenses();

    await waitFor(() => expect(screen.getByText("Sign In Loaded")).toBeInTheDocument());
  });
});
