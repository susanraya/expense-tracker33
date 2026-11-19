/// <reference types="vite/client" />
// Without the reference above, `import.meta.env` is not typed and `tsc --noEmit` fails --
// which `vite build` does not catch, because it tree-shakes this module out when no screen
// imports it yet.
//
// Where the generated API lives.
//
// Set at build time: the platform bakes the deployed API URL into the frontend build. The
// fallback is the local backend so a bare `npm run dev` still points somewhere real.
//
// The generated screens do NOT use this yet -- they render seeded sample data, exactly as
// they were approved. This is the seam to replace that with real calls, one screen at a
// time.
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

// The shared bearer the deployed API expects (its SECRET_KEY). The platform bakes the
// same value into both sides at deploy time, so authenticated calls work out of the box.
export const API_SECRET_KEY: string = import.meta.env.VITE_API_SECRET_KEY ?? "";

// The frontend and the API are on different origins once deployed, so a login flow
// cannot rely on a cookie coming back (a browser drops a cross-origin cookie unless every
// attribute is exactly right, and that keeps getting stricter regardless). A ticket that
// implements login reads `/auth/login`'s token from its response body and calls
// `setSessionToken` with it; apiFetch then sends it as the bearer on every later call,
// ahead of the shared secret.
const SESSION_TOKEN_KEY = "session_token";

export function getSessionToken(): string | null {
  try {
    return localStorage.getItem(SESSION_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setSessionToken(token: string): void {
  try {
    localStorage.setItem(SESSION_TOKEN_KEY, token);
  } catch {
    // Storage unavailable (private mode, quota): the session just won't persist.
  }
}

export function clearSessionToken(): void {
  try {
    localStorage.removeItem(SESSION_TOKEN_KEY);
  } catch {
    // Nothing to clear if storage was never reachable.
  }
}

// Thrown by apiFetch on any non-2xx response. `status` and `body` let a caller
// render a specific message (a 409 on register, a 422 validation list, a 401
// on login) instead of a generic failure string.
export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    const detail =
      typeof body === "object" && body !== null && "detail" in body
        ? (body as { detail: unknown }).detail
        : undefined;
    super(typeof detail === "string" ? detail : `request failed: ${status}`);
    this.status = status;
    this.body = body;
  }
}

// A session token rejected by the API (expired, revoked, unknown) is not
// something a screen can react to on its own: it has to clear the token and
// send the user back to sign in, from wherever the call happened to be made.
// AuthProvider registers itself here once, at the root, so apiFetch can reach
// it without importing react-router (which would make this module a
// component).
type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  onUnauthorized = handler;
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  options?: { silentUnauthorized?: boolean },
): Promise<T> {
  const sessionToken = getSessionToken();
  const bearer = sessionToken ?? API_SECRET_KEY;
  // Join with exactly one slash: API_BASE_URL is baked with a trailing slash (the API
  // sits behind a /apps/<slug>/ path prefix) and paths start with "/", so a naive
  // concat yields "...//auth/me", which a path-prefix proxy need not route.
  const response = await fetch(`${API_BASE_URL.replace(/\/+$/, "")}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    let body: unknown = null;
    try {
      body = response.status === 204 ? null : await response.json();
    } catch {
      // No JSON body to read: keep body as null.
    }
    if (response.status === 401 && !options?.silentUnauthorized) {
      // Only a previously-authenticated call (one that sent the real session
      // token, not the shared secret used before sign-in) counts as an
      // expired session -- a bad login/register attempt is not that.
      const hadSession = sessionToken !== null;
      clearSessionToken();
      if (hadSession) onUnauthorized?.();
    }
    throw new ApiError(response.status, body);
  }
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}
