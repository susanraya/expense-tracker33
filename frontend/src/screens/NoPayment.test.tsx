// AC-038: the app is free to use -- no billing/payment/subscription flow anywhere,
// and a user is never asked for payment details while registering, signing in, or
// using the app. SignIn.test.tsx and App.test.tsx already cover the register/sign-in
// behaviour itself; this file is the one that would fail if a payment step were ever
// added to those screens or to the signed-in app shell.
//
// Matching is deliberately not "the word 'subscription' never appears": the Expenses
// screen legitimately has a user-created "Subscriptions" category (Netflix, Spotify...)
// and reassurance copy on Sign-in/Settings legitimately says "no billing or payment
// step". What must never appear is an actual payment *ask* -- a card/CVV/billing-address
// field, or a button that would start a checkout, upgrade or subscribe flow.
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { setSessionToken, clearSessionToken } from "@/lib/api";
import App from "@/App";
import SignIn from "./SignIn";
import { AuthProvider } from "@/lib/auth";

// A real payment ask would use one of these phrases or autocomplete tokens.
const PAYMENT_ASK_PATTERN =
  /(add (a )?payment method|upgrade (to|your)|enter (your )?card|card number|\bcvv\b|\bcvc\b|expiry date|billing address|subscribe now|pay now|start (a |your )?(free )?trial|go pro|enter payment)/i;
const CARD_AUTOCOMPLETE_PATTERN = /^cc-/;

function renderSignedOut() {
  return render(
    <MemoryRouter initialEntries={["/sign-in"]}>
      <AuthProvider>
        <SignIn />
      </AuthProvider>
    </MemoryRouter>,
  );
}

function renderSignedIn(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  );
}

function assertNoPaymentAsk(container: HTMLElement) {
  expect(container.textContent ?? "").not.toMatch(PAYMENT_ASK_PATTERN);
  for (const input of Array.from(container.querySelectorAll("input"))) {
    const autocomplete = input.getAttribute("autocomplete") ?? "";
    expect(autocomplete).not.toMatch(CARD_AUTOCOMPLETE_PATTERN);
    const label = (
      (input.getAttribute("aria-label") ?? "") +
      " " +
      (input.getAttribute("name") ?? "") +
      " " +
      (input.getAttribute("placeholder") ?? "")
    ).toLowerCase();
    expect(label).not.toMatch(/card number|\bcvv\b|\bcvc\b|billing address/);
  }
  for (const button of within(container).queryAllByRole("button")) {
    expect(button.textContent ?? "").not.toMatch(
      /upgrade|subscribe|checkout|pay now|go pro|start trial/i,
    );
  }
}

describe("[AC-038] no billing or payment flow", () => {
  beforeEach(() => {
    clearSessionToken();
  });
  afterEach(() => {
    clearSessionToken();
  });

  it("the sign-in / create-account screen never asks for payment details and states the app is free", () => {
    const { container } = renderSignedOut();

    assertNoPaymentAsk(container);
    expect(screen.getByText(/never ask for payment details/i)).toBeInTheDocument();

    // Registering asks for exactly email and password -- no third, payment-shaped field.
    expect(screen.getAllByRole("textbox")).toHaveLength(1); // the email field
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("the dashboard a signed-in user lands on never asks for payment details", () => {
    setSessionToken("a-test-session-token");
    const { container } = renderSignedIn("/dashboard");

    assertNoPaymentAsk(container);
  });

  it("logging expenses never asks for payment details", () => {
    setSessionToken("a-test-session-token");
    const { container } = renderSignedIn("/expenses");

    assertNoPaymentAsk(container);
  });

  it("managing categories never asks for payment details", () => {
    setSessionToken("a-test-session-token");
    const { container } = renderSignedIn("/categories");

    assertNoPaymentAsk(container);
  });

  it("viewing reports never asks for payment details", () => {
    setSessionToken("a-test-session-token");
    const { container } = renderSignedIn("/reports");

    assertNoPaymentAsk(container);
  });

  it("account settings has no billing section and states the app is free to use", () => {
    setSessionToken("a-test-session-token");
    const { container } = renderSignedIn("/settings");

    assertNoPaymentAsk(container);
    expect(
      screen.getByText(/free to use.*no billing, subscription or payment step/i),
    ).toBeInTheDocument();
  });
});
