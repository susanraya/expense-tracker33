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
    vi.restoreAllMocks();
    clearSessionToken();
  });

  it("loads categories from GET /categories on mount with the Bearer token and shows no sample data", async () => {
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (String(url).includes("/categories")) {
        expect((init?.headers as Record<string, string>)?.Authorization).toBe("Bearer tok-abc");
        return jsonResponse(200, [{ id: "cat_1", name: "Groceries", expense_count: 3 }]);
      }
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    renderCategories();

    expect(screen.getByText("Loading your categories…")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("Groceries")).toBeInTheDocument());
    expect(screen.queryByText("Dining out")).not.toBeInTheDocument();
  });

  it("[NFR-008] shows an empty state inviting the user to create their first category", async () => {
    const fetchMock = vi.fn(() => jsonResponse(200, []));
    vi.stubGlobal("fetch", fetchMock);

    renderCategories();

    await waitFor(() => expect(screen.getByText("No categories yet")).toBeInTheDocument());
  });

  it("[AC-019] creating a category with a non-blank name calls POST /categories and the new category appears without a reload", async () => {
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (String(url).includes("/categories") && init?.method === "POST") {
        expect(JSON.parse(init.body as string)).toEqual({ name: "Travel" });
        return jsonResponse(201, { id: "cat_new", name: "Travel", expense_count: 0 });
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

  it("[AC-020] a blank name is blocked client-side with a visible validation message", async () => {
    const fetchMock = vi.fn((_url: string, _init?: RequestInit) => jsonResponse(200, []));
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderCategories();
    await waitFor(() => expect(screen.getByText("No categories yet")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Add category" }));

    expect(screen.getByText("Name cannot be blank")).toBeInTheDocument();
    // no POST was attempted
    expect(fetchMock.mock.calls.some(([, init]) => (init as RequestInit)?.method === "POST")).toBe(
      false,
    );
  });

  it("[AC-020] a 409 from the API renders the server's detail inline and leaves the list unchanged", async () => {
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (String(url).includes("/categories") && init?.method === "POST") {
        return jsonResponse(409, { detail: "A category with that name already exists." });
      }
      if (String(url).includes("/categories")) {
        return jsonResponse(200, [{ id: "cat_1", name: "Travel", expense_count: 0 }]);
      }
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderCategories();
    await waitFor(() => expect(screen.getByText("Travel")).toBeInTheDocument());

    await user.type(screen.getByLabelText("New category name"), "Travel");
    await user.click(screen.getByRole("button", { name: "Add category" }));

    await waitFor(() =>
      expect(screen.getByText("A category with that name already exists.")).toBeInTheDocument(),
    );
    expect(screen.getAllByText("Travel")).toHaveLength(1);
  });

  it("[AC-021] renaming a category calls PATCH /categories/{id} and the new name shows in the list", async () => {
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (String(url).includes("/categories/cat_1") && init?.method === "PATCH") {
        expect(JSON.parse(init.body as string)).toEqual({ name: "Dining" });
        return jsonResponse(200, { id: "cat_1", name: "Dining", expense_count: 2 });
      }
      if (String(url).includes("/categories")) {
        return jsonResponse(200, [{ id: "cat_1", name: "Dining out", expense_count: 2 }]);
      }
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderCategories();
    await waitFor(() => expect(screen.getByText("Dining out")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Rename Dining out" }));
    const renameInput = screen.getByLabelText("Rename Dining out");
    await user.clear(renameInput);
    await user.type(renameInput, "Dining");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(screen.getByText("Dining")).toBeInTheDocument());
    expect(screen.queryByText("Dining out")).not.toBeInTheDocument();
  });

  it("[AC-022] deleting a category asks for confirmation, then calls DELETE and the row disappears on 204", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (String(url).includes("/categories/cat_1") && init?.method === "DELETE") {
        return jsonResponse(204, null);
      }
      if (String(url).includes("/categories")) {
        return jsonResponse(200, [{ id: "cat_1", name: "Travel", expense_count: 0 }]);
      }
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderCategories();
    await waitFor(() => expect(screen.getByText("Travel")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Delete Travel" }));

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByText("Travel")).not.toBeInTheDocument());
  });

  it("[AC-022] declining the confirmation does not call DELETE", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const fetchMock = vi.fn((url: string, _init?: RequestInit) => {
      if (String(url).includes("/categories")) {
        return jsonResponse(200, [{ id: "cat_1", name: "Travel", expense_count: 0 }]);
      }
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderCategories();
    await waitFor(() => expect(screen.getByText("Travel")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Delete Travel" }));

    expect(
      fetchMock.mock.calls.some(([, init]) => (init as RequestInit)?.method === "DELETE"),
    ).toBe(false);
    expect(screen.getByText("Travel")).toBeInTheDocument();
  });

  it("[AC-023] a 409 on delete shows a clear warning and leaves the category in the list", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (String(url).includes("/categories/cat_1") && init?.method === "DELETE") {
        return jsonResponse(409, {
          detail:
            "This category still has 3 expenses. Reassign or delete them before deleting the category.",
        });
      }
      if (String(url).includes("/categories")) {
        return jsonResponse(200, [{ id: "cat_1", name: "Travel", expense_count: 3 }]);
      }
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderCategories();
    await waitFor(() => expect(screen.getByText("Travel")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Delete Travel" }));

    await waitFor(() =>
      expect(
        screen.getByText(
          "This category still has 3 expenses. Reassign or delete them before deleting the category.",
        ),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText("Travel")).toBeInTheDocument();
  });

  it("a 401 clears the stored token and redirects to sign-in", async () => {
    const fetchMock = vi.fn(() => jsonResponse(401, { detail: "session expired" }));
    vi.stubGlobal("fetch", fetchMock);

    renderCategories();

    await waitFor(() => expect(screen.getByText("Sign In Loaded")).toBeInTheDocument());
  });
});
