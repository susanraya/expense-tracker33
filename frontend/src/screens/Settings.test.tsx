import { render, screen, waitFor } from "@testing-library/react";
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

describe("Settings", () => {
  beforeEach(() => {
    setSessionToken("tok-abc");
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    clearSessionToken();
  });

  it("[AC-009] shows a loading state while /auth/me is pending", async () => {
    let resolveMe: (value: unknown) => void = () => {};
    const fetchMock = vi.fn((url: string) => {
      if (String(url).includes("/auth/me")) {
        return new Promise((resolve) => {
          resolveMe = () =>
            resolve({
              ok: true,
              status: 200,
              json: () =>
                Promise.resolve({
                  id: "u1",
                  email: "susan.raya@quorq.ai",
                  role: "user",
                  created_at: "2026-03-04T00:00:00Z",
                }),
            } as Response);
        });
      }
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    renderSettings();

    expect(screen.getByText("Loading your account details…")).toBeInTheDocument();
    resolveMe({});
    await waitFor(() => expect(screen.getByText("susan.raya@quorq.ai")).toBeInTheDocument());
  });

  it("[AC-008] renders the email and created date returned by GET /auth/me, not a hardcoded account", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (String(url).includes("/auth/me")) {
        return jsonResponse(200, {
          id: "u1",
          email: "real.user@example.com",
          role: "user",
          created_at: "2026-03-04T00:00:00Z",
        });
      }
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    renderSettings();

    await waitFor(() => expect(screen.getByText("real.user@example.com")).toBeInTheDocument());
    expect(screen.queryByText("susan.raya@quorq.ai")).not.toBeInTheDocument();
    expect(screen.getByText("Account created 4 Mar 2026")).toBeInTheDocument();
  });

  it("[AC-007] a 401 from the background /auth/me fetch does not redirect away from Settings -- only an explicit action (like Sign out) does", async () => {
    const fetchMock = vi.fn(() => jsonResponse(401, { detail: "session expired" }));
    vi.stubGlobal("fetch", fetchMock);

    renderSettings();

    await waitFor(() =>
      expect(screen.queryByText("Loading your account details…")).not.toBeInTheDocument(),
    );
    expect(screen.queryByText("Sign In Loaded")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
  });
});
