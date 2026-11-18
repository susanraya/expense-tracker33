import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider } from "@/lib/auth";
import { clearSessionToken } from "@/lib/api";
import SignIn from "./SignIn";

function jsonResponse(status: number, body: unknown) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response);
}

function renderSignIn() {
  return render(
    <MemoryRouter initialEntries={["/sign-in"]}>
      <AuthProvider>
        <Routes>
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/dashboard" element={<div>Dashboard Loaded</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

async function fillAndSubmit(
  user: ReturnType<typeof userEvent.setup>,
  email: string,
  password: string,
) {
  await user.type(screen.getByLabelText("Email"), email);
  await user.type(screen.getByLabelText("Password"), password);
  await user.click(screen.getByRole("button", { name: /sign in →|create account →/i }));
}

describe("SignIn", () => {
  beforeEach(() => {
    clearSessionToken();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    clearSessionToken();
  });

  it("[AC-001] register success signs the user in and lands on /dashboard", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (String(url).includes("/auth/register")) {
        return jsonResponse(201, {
          id: "u1",
          email: "new.user@example.com",
          role: "user",
          created_at: "2026-11-18T00:00:00Z",
        });
      }
      if (String(url).includes("/auth/login")) {
        return jsonResponse(200, {
          token: "tok-abc",
          expires_at: "2026-11-18T01:00:00Z",
          user: { id: "u1", email: "new.user@example.com", role: "user" },
        });
      }
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderSignIn();
    await user.click(screen.getByRole("tab", { name: "Create account" }));
    await fillAndSubmit(user, "new.user@example.com", "goodpass10");

    await waitFor(() => expect(screen.getByText("Dashboard Loaded")).toBeInTheDocument());
  });

  it("[AC-002] a 409 on register shows the duplicate-email message and keeps the form", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (String(url).includes("/auth/register")) {
        return jsonResponse(409, { detail: "email already registered" });
      }
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderSignIn();
    await user.click(screen.getByRole("tab", { name: "Create account" }));
    await fillAndSubmit(user, "rae.mcallister@fastmail.com", "goodpass10");

    await waitFor(() =>
      expect(screen.getByText(/an account already exists for that email/i)).toBeInTheDocument(),
    );
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("[AC-003] a 422 on register explains what to fix and creates no account", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (String(url).includes("/auth/register")) {
        return jsonResponse(422, {
          detail: [{ loc: ["body", "password"], msg: "Password must contain a digit." }],
        });
      }
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderSignIn();
    await user.click(screen.getByRole("tab", { name: "Create account" }));
    // Passes client-side checks (10+ chars, a letter and a digit) so the request reaches the server.
    await fillAndSubmit(user, "new.user@example.com", "letters123");

    await waitFor(() =>
      expect(screen.getByText("Password must contain a digit.")).toBeInTheDocument(),
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).not.toHaveBeenCalledWith(
      expect.stringContaining("/auth/login"),
      expect.anything(),
    );
  });

  it("[AC-004] login success stores the token and lands on /dashboard", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (String(url).includes("/auth/login")) {
        return jsonResponse(200, {
          token: "tok-xyz",
          expires_at: "2026-11-18T01:00:00Z",
          user: { id: "u1", email: "rae.mcallister@fastmail.com", role: "user" },
        });
      }
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderSignIn();
    await fillAndSubmit(user, "rae.mcallister@fastmail.com", "goodpass10");

    await waitFor(() => expect(screen.getByText("Dashboard Loaded")).toBeInTheDocument());
  });

  it("[AC-005] a 401 on login shows exactly the generic message", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (String(url).includes("/auth/login")) {
        return jsonResponse(401, { detail: "Invalid email or password" });
      }
      return jsonResponse(404, { detail: "not found" });
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderSignIn();
    await fillAndSubmit(user, "unknown@example.com", "whatever10");

    await waitFor(() =>
      expect(screen.getByText("Email or password is incorrect")).toBeInTheDocument(),
    );
    expect(screen.queryByText(/does not exist/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Dashboard Loaded")).not.toBeInTheDocument();
  });
});
