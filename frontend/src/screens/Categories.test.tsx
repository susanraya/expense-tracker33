import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider } from "@/lib/auth";
import { clearSessionToken, setSessionToken } from "@/lib/api";
import Categories from "./Categories";

function jsonResponse(status: number, body: unknown) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response);
}

function renderCategories() {
  return render(
    <MemoryRouter initialEntries={["/categories"]}>
      <AuthProvider>
        <Routes>
          <Route path="/categories" element={<Categories />} />
          <Route path="/sign-in" element={<div>Sign In Loaded</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("Categories", () => {
  beforeEach(() => {
    setSessionToken("tok-abc");
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    clearSessionToken();
  });

  it("[AC-036] renders the signed-in user's categories from GET /categories", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (String(url).includes("/categories")) {
        return jsonResponse(200, [
          { id: "cat_1", name: "Groceries", color: null, created_at: "2026-11-01T00:00:00Z" },
        ]);
      }
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    renderCategories();

    expect(screen.getByText("Loading your categories…")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("Groceries")).toBeInTheDocument());
  });

  it("[AC-036] shows the empty state when there are no categories", async () => {
    const fetchMock = vi.fn(() => jsonResponse(200, []));
    vi.stubGlobal("fetch", fetchMock);

    renderCategories();

    await waitFor(() => expect(screen.getByText("No categories yet")).toBeInTheDocument());
  });

  it("[AC-036] shows an error state when the list cannot be loaded", async () => {
    const fetchMock = vi.fn(() => jsonResponse(500, { detail: "server error" }));
    vi.stubGlobal("fetch", fetchMock);

    renderCategories();

    await waitFor(() =>
      expect(screen.getByText("We couldn’t load your categories")).toBeInTheDocument(),
    );
  });

  it("[AC-036] creating a category calls POST /categories and adds it to the list", async () => {
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (String(url).includes("/categories") && init?.method === "POST") {
        return jsonResponse(201, {
          id: "cat_new",
          name: "Travel",
          color: null,
          created_at: "2026-11-18T00:00:00Z",
        });
      }
      if (String(url).includes("/categories")) {
        return jsonResponse(200, []);
      }
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderCategories();
    await waitFor(() => expect(screen.getByText("No categories yet")).toBeInTheDocument());

    await user.type(screen.getByLabelText("New category name"), "Travel");
    await user.click(screen.getByRole("button", { name: "Add category" }));

    await waitFor(() => expect(screen.getByText("Travel")).toBeInTheDocument());
    expect(screen.getByText("Category added")).toBeInTheDocument();
  });

  it("[AC-036] a 409 on create shows a duplicate-name message", async () => {
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (String(url).includes("/categories") && init?.method === "POST") {
        return jsonResponse(409, { detail: "duplicate name" });
      }
      if (String(url).includes("/categories")) {
        return jsonResponse(200, [
          { id: "cat_1", name: "Travel", color: null, created_at: "2026-11-01T00:00:00Z" },
        ]);
      }
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderCategories();
    await waitFor(() => expect(screen.getByText("Travel")).toBeInTheDocument());

    await user.type(screen.getByLabelText("New category name"), "Travel");
    await user.click(screen.getByRole("button", { name: "Add category" }));

    await waitFor(() => expect(screen.getByText("That name is already taken")).toBeInTheDocument());
  });

  it("[AC-036] confirming delete calls DELETE /categories/{id}, removes it from the list and shows success", async () => {
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (String(url).includes("/categories/cat_1") && init?.method === "DELETE") {
        return jsonResponse(204, null);
      }
      if (String(url).includes("/categories")) {
        return jsonResponse(200, [
          { id: "cat_1", name: "Travel", color: null, created_at: "2026-11-01T00:00:00Z" },
        ]);
      }
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderCategories();
    await waitFor(() => expect(screen.getByText("Travel")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Delete Travel" }));
    expect(
      fetchMock.mock.calls.some(
        ([, init]) => (init as RequestInit | undefined)?.method === "DELETE",
      ),
    ).toBe(false);

    await user.click(screen.getByRole("button", { name: "Confirm delete Travel" }));

    await waitFor(() => expect(screen.queryByText("Travel")).not.toBeInTheDocument());
    expect(screen.getByText("Category deleted")).toBeInTheDocument();
  });

  it("[AC-036] cancelling a delete sends no request and keeps the category", async () => {
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      void init;
      if (String(url).includes("/categories")) {
        return jsonResponse(200, [
          { id: "cat_1", name: "Travel", color: null, created_at: "2026-11-01T00:00:00Z" },
        ]);
      }
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderCategories();
    await waitFor(() => expect(screen.getByText("Travel")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Delete Travel" }));
    await user.click(screen.getByRole("button", { name: "Cancel delete Travel" }));

    expect(screen.getByText("Travel")).toBeInTheDocument();
    expect(
      fetchMock.mock.calls.some(
        ([, init]) => (init as RequestInit | undefined)?.method === "DELETE",
      ),
    ).toBe(false);
  });

  it("[AC-036] a 409 on confirmed delete warns that the category still has expenses and keeps it in the list", async () => {
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (String(url).includes("/categories/cat_1") && init?.method === "DELETE") {
        return jsonResponse(409, {
          detail:
            "3 expense(s) still use this category. Reassign or delete them first, then delete the category.",
        });
      }
      if (String(url).includes("/categories")) {
        return jsonResponse(200, [
          { id: "cat_1", name: "Travel", color: null, created_at: "2026-11-01T00:00:00Z" },
        ]);
      }
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderCategories();
    await waitFor(() => expect(screen.getByText("Travel")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Delete Travel" }));
    await user.click(screen.getByRole("button", { name: "Confirm delete Travel" }));

    await waitFor(() => expect(screen.getByText("Can’t delete “Travel”")).toBeInTheDocument());
    expect(screen.getByText(/still has expenses assigned to it/)).toBeInTheDocument();
    expect(screen.getByText(/Reassign those expenses/)).toBeInTheDocument();
    expect(screen.getByText("Travel")).toBeInTheDocument();
  });

  it("[AC-009] a 401 clears the stored token and redirects to sign-in", async () => {
    const fetchMock = vi.fn(() => jsonResponse(401, { detail: "session expired" }));
    vi.stubGlobal("fetch", fetchMock);

    renderCategories();

    await waitFor(() => expect(screen.getByText("Sign In Loaded")).toBeInTheDocument());
  });
});
