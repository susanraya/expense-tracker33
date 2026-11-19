import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider } from "@/lib/auth";
import { clearSessionToken, setSessionToken } from "@/lib/api";
import Settings from "./Settings";

function jsonResponse(status: number, body: unknown) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response);
}

function renderSettings() {
  return render(
    <MemoryRouter initialEntries={["/settings"]}>
      <AuthProvider>
        <Routes>
          <Route path="/settings" element={<Settings />} />
          <Route path="/sign-in" element={<div>Sign In Loaded</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("Settings deactivation counts", () => {
  beforeEach(() => {
    setSessionToken("tok-abc");
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    clearSessionToken();
  });

  it("[AC-010] the confirmation checkbox states how many expenses and categories will be deleted", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (String(url).includes("/auth/me")) {
        return jsonResponse(200, {
          id: "u1",
          email: "real.user@example.com",
          role: "user",
          created_at: "2026-03-04T00:00:00Z",
        });
      }
      if (String(url).includes("/expenses")) {
        return jsonResponse(200, { items: [], total: 3 });
      }
      if (String(url).includes("/categories")) {
        return jsonResponse(200, [{ id: "c1" }, { id: "c2" }]);
      }
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderSettings();

    await waitFor(() => expect(screen.getByText("real.user@example.com")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Deactivate account" }));

    await waitFor(() =>
      expect(screen.getByLabelText(/3 expenses and 2 categories/i)).toBeInTheDocument(),
    );
    // The original "cannot be undone" wording is still present for AC-010's existing contract.
    expect(screen.getByLabelText(/cannot be undone/i)).toBeInTheDocument();
  });

  it("[AC-010] the checkbox falls back to zero counts when the counts cannot be loaded", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (String(url).includes("/auth/me")) {
        return jsonResponse(200, {
          id: "u1",
          email: "real.user@example.com",
          role: "user",
          created_at: "2026-03-04T00:00:00Z",
        });
      }
      return jsonResponse(500, { detail: "server error" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderSettings();

    await waitFor(() => expect(screen.getByText("real.user@example.com")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Deactivate account" }));

    await waitFor(() =>
      expect(screen.getByLabelText(/0 expenses and 0 categories/i)).toBeInTheDocument(),
    );
  });
});
