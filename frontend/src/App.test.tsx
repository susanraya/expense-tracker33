import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { setSessionToken, clearSessionToken } from "@/lib/api";
import App from "./App";

describe("App", () => {
  beforeEach(() => {
    setSessionToken("a-test-session-token");
  });
  afterEach(() => {
    clearSessionToken();
  });

  it("renders a screen inside the app shell and shows its menu when signed in", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <App />
      </MemoryRouter>,
    );
    // getAllByText, not getByText: the page may repeat its menu item's text.
    expect(screen.getAllByText("Dashboard").length).toBeGreaterThan(0);
  });

  it("[AC-009] redirects to /sign-in instead of the app shell when signed out", () => {
    clearSessionToken();
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getAllByText("Sign in to your account").length).toBeGreaterThan(0);
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });
});
