// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

const { Button, Card, CardHeader, CardContent, Label, Checkbox, Badge } = UI;

const { Check, X, ChevronDown, User, Clock, ArrowRight, AlertCircle, CheckCircle } = Icons;

const SESSION_WINDOW_SECONDS = 30 * 60;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmtDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

const DOCS = [
  {
    id: "i-6-0-0",
    title: "Setup and run the app locally",
    meta: "README · updated 12 Nov 2026",
    body: [
      "Clone the repository, run the install step, then copy .env.example to .env before anything else.",
      "Set DATABASE_URL=postgres://expense_app:<database-password>@localhost:5432/expense_tracker and SESSION_SECRET=<session-secret>. Never commit a filled-in .env.",
      "Run the migration task to create the users, sessions, categories and expenses tables, then start the dev server. The React client talks to the REST API on port 4000.",
    ],
  },
  {
    id: "i-6-0-1",
    title: "Logging and editing expenses",
    meta: "Feature guide · 3 min read",
    body: [
      "An expense carries an amount, the date it was spent on, one of your categories and an optional note. Amount must be a positive number.",
      "Edit or delete any entry from the Expenses list; deleting asks you to confirm and removes the entry from reports straight away.",
      "Out of scope for v1: recurring schedules, receipt attachments and currency selection. Everything is recorded in your single account currency.",
    ],
  },
  {
    id: "i-6-0-2",
    title: "Managing categories",
    meta: "Feature guide · 2 min read",
    body: [
      "Categories are yours alone. A name cannot be blank and cannot repeat another name in your account.",
      "Renaming a category updates every expense already filed under it — no re-tagging needed.",
      "A category that still has expenses cannot be deleted. Move those expenses to another category first, then delete it.",
    ],
  },
  {
    id: "i-6-0-3",
    title: "Reports and CSV export",
    meta: "Feature guide · 4 min read",
    body: [
      "Reports show spending over time and a by-category breakdown, both built only from your own expenses.",
      "Pick a start and end date to narrow the range. A start date later than the end date is rejected and the report keeps its last valid range.",
      "Export writes a CSV with four columns — amount, date, category, note — covering the range you currently have selected.",
    ],
  },
  {
    id: "i-6-0-4",
    title: "Accounts, sessions and privacy",
    meta: "Security notes · updated 05 Nov 2026",
    body: [
      "Passwords are stored only as a hash. Nothing in the app, the logs or the database holds a readable password.",
      "A session ends 30 minutes after your last activity, and signing out ends it immediately on this device.",
      "Every API read and write is scoped to the signed-in account, so no one else can reach your expenses or categories.",
    ],
  },
];

export default function Screen() {
  const { signOut, deactivate, expiresAt } = useAuth();
  const [signOutState, setSignOutState] = React.useState("idle");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [acknowledged, setAcknowledged] = React.useState(false);
  const [deactivateError, setDeactivateError] = React.useState("");
  const [deactivateState, setDeactivateState] = React.useState("idle");
  const [openDoc, setOpenDoc] = React.useState("i-6-0-0");

  // 'loading' | 'ready' | 'error'
  const [meStatus, setMeStatus] = React.useState("loading");
  const [me, setMe] = React.useState(null); // {email, created_at}

  // Counts shown in the deactivation confirmation, so the warning names what
  // is actually at stake rather than a vague "your data". Defaults to 0 while
  // loading or on failure: any digit satisfies the confirmation copy.
  const [counts, setCounts] = React.useState({ expenses: 0, categories: 0 });

  const loadMe = React.useCallback(async () => {
    setMeStatus("loading");
    try {
      const data = await apiFetch("/auth/me");
      setMe(data);
      setMeStatus("ready");
    } catch {
      setMeStatus("error");
    }
  }, []);

  const loadCounts = React.useCallback(async () => {
    try {
      const [expenseList, categories] = await Promise.all([
        apiFetch("/expenses?limit=1"),
        apiFetch("/categories"),
      ]);
      setCounts({
        expenses: expenseList?.total ?? 0,
        categories: Array.isArray(categories) ? categories.length : 0,
      });
    } catch {
      setCounts({ expenses: 0, categories: 0 });
    }
  }, []);

  React.useEffect(() => {
    loadMe();
    loadCounts();
  }, [loadMe, loadCounts]);

  const expiresAtMs = expiresAt ? new Date(expiresAt).getTime() : null;
  const hasExpiry = expiresAtMs !== null && !Number.isNaN(expiresAtMs);
  const [now, setNow] = React.useState(() => Date.now());

  const dialogRef = React.useRef(null);
  const deactivateTriggerRef = React.useRef(null);
  const ackRef = React.useRef(null);

  React.useEffect(() => {
    if (!hasExpiry) return undefined;
    const tick = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(tick);
  }, [hasExpiry]);

  React.useEffect(() => {
    if (!modalOpen) return undefined;
    const node = dialogRef.current;
    if (node) {
      const first = node.querySelector("button, input, [href]");
      if (first) first.focus();
    }
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeModal();
      } else if (e.key === "Tab" && node) {
        const focusable = Array.from(
          node.querySelectorAll("button:not([disabled]), input:not([disabled]), [href]"),
        );
        if (focusable.length === 0) return;
        const firstEl = focusable[0];
        const lastEl = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [modalOpen]);

  const closeModal = () => {
    setModalOpen(false);
    setDeactivateError("");
    setDeactivateState("idle");
    if (deactivateTriggerRef.current) deactivateTriggerRef.current.focus();
  };

  const handleSignOut = () => {
    if (signOutState === "working") return;
    setSignOutState("working");
    signOut().finally(() => setSignOutState("idle"));
  };

  const handleConfirmDeactivation = () => {
    if (!acknowledged) {
      setDeactivateError(
        "Tick the confirmation box first — this one cannot be undone from inside the app.",
      );
      if (ackRef.current) ackRef.current.focus();
      return;
    }
    setDeactivateError("");
    setDeactivateState("working");
    deactivate().catch(() => {
      setDeactivateState("idle");
      setDeactivateError("We couldn't close your account just now. Please try again.");
    });
  };

  const remaining = hasExpiry ? Math.max(0, Math.round((expiresAtMs - now) / 1000)) : 0;
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const pct = Math.max(0, Math.min(100, (remaining / SESSION_WINDOW_SECONDS) * 100));
  const expired = hasExpiry && remaining <= 0;

  const surface = "rgba(255,255,255,0.06)";
  const surfaceHi = "rgba(255,255,255,0.09)";
  const line = "rgba(255,255,255,0.13)";
  const danger = `color-mix(in oklab, ${brand.accentColor} 45%, crimson)`;
  const num = { fontVariantNumeric: "tabular-nums" };

  const cardStyle = {
    backgroundColor: surface,
    border: `1px solid ${line}`,
    borderRadius: brand.radius,
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    boxShadow: "none",
  };

  return (
    <div
      className="np-root w-full min-h-full px-4 py-8 sm:px-6 lg:px-8"
      style={{
        backgroundColor: brand.backgroundColor,
        fontFamily: brand.fontBody,
        color: "#ffffff",
        "--np-primary": brand.primaryColor,
        "--np-accent": brand.accentColor,
      }}
    >
      <style>{`
        .np-root :focus-visible { outline: 2px solid var(--np-primary); outline-offset: 2px; border-radius: 10px; }
        @keyframes npPulse { 0% { transform: translateX(-6%); opacity: .25 } 45% { opacity: 1 } 100% { transform: translateX(104%); opacity: .25 } }
        @keyframes npRise { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
        @keyframes npPop { from { opacity: 0; transform: translateY(14px) scale(.985) } to { opacity: 1; transform: none } }
        .np-pulse { animation: npPulse 2.8s cubic-bezier(.45,0,.2,1) infinite; }
        .np-rise { animation: npRise .28s ease-out both; }
        .np-pop { animation: npPop .22s ease-out both; }
        .np-doc-panel { animation: npRise .22s ease-out both; }
        .np-trans { transition: background-color .18s ease, border-color .18s ease, color .18s ease, transform .18s ease; }
        @media (prefers-reduced-motion: reduce) {
          .np-pulse, .np-rise, .np-pop, .np-doc-panel { animation: none !important; }
          .np-trans { transition: none !important; }
        }
      `}</style>

      <div className="mx-auto w-full max-w-5xl">
        {/* Row 1 — page title */}
        <header className="mb-8" data-wf="b-0-0">
          <p
            className="text-xs font-semibold uppercase tracking-[0.18em] mb-3"
            style={{ color: brand.primaryColor }}
          >
            Expense Tracker · Account
          </p>
          <h1
            className="text-[34px] sm:text-[40px] font-bold leading-tight tracking-tight"
            style={{ fontFamily: brand.fontHeading }}
          >
            Account settings
          </h1>
          <p
            className="mt-3 text-[15px] leading-relaxed max-w-[62ch]"
            style={{ color: brand.neutralColor }}
          >
            Sign out of this device, close the account for good, or read how the app is set up and
            used.
          </p>
        </header>

        {/* Row 2 — account + session cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="np-rise overflow-hidden" style={cardStyle} data-wf="b-1-0">
            <CardHeader className="p-6 pb-4">
              <div className="flex items-start gap-4">
                <span
                  className="shrink-0 grid place-items-center h-11 w-11 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${brand.primaryColor}, ${brand.accentColor})`,
                    color: brand.backgroundColor,
                    boxShadow: `0 0 48px -8px ${brand.accentColor}`,
                  }}
                >
                  <User className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  {meStatus === "loading" && (
                    <p
                      role="status"
                      aria-live="polite"
                      className="text-[14px]"
                      style={{ color: brand.neutralColor }}
                    >
                      Loading your account details…
                    </p>
                  )}
                  {meStatus === "error" && (
                    <div>
                      <p className="text-[14px] font-semibold" style={{ color: danger }}>
                        We couldn’t load your account details
                      </p>
                      <Button
                        type="button"
                        onClick={loadMe}
                        className="np-trans mt-3 h-9 px-4 text-[13px] font-semibold"
                        style={{
                          borderRadius: 10,
                          backgroundColor: "rgba(255,255,255,0.05)",
                          border: `1px solid ${line}`,
                          color: "#ffffff",
                        }}
                      >
                        Try again
                      </Button>
                    </div>
                  )}
                  {meStatus === "ready" && me && (
                    <h2 className="min-w-0">
                      <span
                        className="block text-[13px] font-semibold uppercase tracking-[0.14em]"
                        style={{ color: brand.neutralColor }}
                      >
                        {"Signed in as "}
                      </span>
                      <span
                        className="block mt-1 text-[19px] font-semibold break-all leading-snug"
                        style={{ fontFamily: brand.fontHeading }}
                      >
                        {me.email}
                      </span>
                      <span
                        className="block mt-1 text-[14px]"
                        style={{ color: brand.neutralColor, ...num }}
                      >
                        Account created {fmtDate(me.created_at)}
                      </span>
                    </h2>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="np-rise overflow-hidden" style={cardStyle} data-wf="b-1-1">
            <CardHeader className="p-6 pb-3">
              <div className="flex items-center justify-between gap-4">
                <h2
                  className="text-[13px] font-semibold uppercase tracking-[0.14em]"
                  style={{ color: brand.neutralColor }}
                >
                  This session
                </h2>
                <Badge
                  className="rounded-full px-3 py-1 text-[12px] font-semibold"
                  style={{
                    backgroundColor: expired ? "rgba(255,255,255,0.08)" : "rgba(34,211,238,0.14)",
                    color: expired ? brand.neutralColor : brand.primaryColor,
                    border: `1px solid ${expired ? line : "rgba(34,211,238,0.35)"}`,
                  }}
                >
                  {expired ? "Expired" : "Active"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-0">
              {!hasExpiry && (
                <div>
                  <p
                    className="text-[19px] font-semibold leading-snug"
                    style={{ fontFamily: brand.fontHeading }}
                  >
                    Session active
                  </p>
                  <p
                    className="mt-2 text-[14px] leading-relaxed"
                    style={{ color: brand.neutralColor }}
                  >
                    We don't have an expiry time for this session, so we can't show a countdown.
                  </p>
                </div>
              )}

              {hasExpiry && expired && (
                <div>
                  <p
                    className="text-[19px] font-semibold leading-snug"
                    style={{ fontFamily: brand.fontHeading }}
                  >
                    Your session timed out
                  </p>
                  <p
                    className="mt-2 text-[14px] leading-relaxed"
                    style={{ color: brand.neutralColor }}
                  >
                    Thirty quiet minutes passed, so we closed it. Sign in again to pick up where you
                    left off.
                  </p>
                </div>
              )}

              {hasExpiry && !expired && (
                <div>
                  <p
                    className="text-[44px] font-bold leading-none"
                    style={{ ...num, letterSpacing: "-0.02em" }}
                  >
                    {mm}
                    <span style={{ color: brand.accentColor }}>:</span>
                    {ss}
                  </p>
                  <p className="mt-2 text-[14px]" style={{ color: brand.neutralColor }}>
                    left before this session expires
                  </p>
                </div>
              )}

              {hasExpiry && (
                <div
                  className="mt-5 relative h-[6px] w-full overflow-hidden"
                  style={{ borderRadius: 999, backgroundColor: "rgba(255,255,255,0.08)" }}
                  aria-hidden="true"
                >
                  <div
                    className="np-trans h-full"
                    style={{
                      width: `${expired ? 0 : pct}%`,
                      borderRadius: 999,
                      background: `linear-gradient(90deg, ${brand.primaryColor}, ${brand.accentColor})`,
                      boxShadow: `0 0 24px 0 ${brand.accentColor}`,
                    }}
                  />
                  {!expired && (
                    <span
                      className="np-pulse absolute inset-y-0 left-0 w-10"
                      style={{
                        background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)`,
                      }}
                    />
                  )}
                </div>
              )}

              <p className="mt-5 text-[15px] leading-relaxed">
                Session ends after 30 minutes of inactivity
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Row 3 — actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Button
            data-wf="b-2-0"
            onClick={handleSignOut}
            aria-busy={signOutState === "working"}
            className="np-trans w-full min-h-[56px] px-6 text-[16px] font-semibold flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99]"
            style={{
              borderRadius: brand.radius,
              border: "1px solid transparent",
              background: `linear-gradient(120deg, ${brand.primaryColor}, ${brand.accentColor})`,
              color: brand.backgroundColor,
              boxShadow: `0 20px 60px -18px ${brand.accentColor}`,
              opacity: signOutState === "working" ? 0.85 : 1,
            }}
          >
            {signOutState === "working" ? (
              <>
                <Clock className="h-4 w-4" aria-hidden="true" />
                Ending your session…
              </>
            ) : (
              <>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                Sign out
              </>
            )}
          </Button>

          <Button
            data-wf="b-2-1"
            ref={deactivateTriggerRef}
            onClick={() => {
              setDeactivateError("");
              setModalOpen(true);
            }}
            aria-haspopup="dialog"
            aria-expanded={modalOpen}
            className="np-trans w-full min-h-[56px] px-6 text-[16px] font-semibold flex items-center justify-center gap-2 hover:bg-white/10"
            style={{
              borderRadius: brand.radius,
              backgroundColor: "rgba(255,255,255,0.04)",
              border: `1px solid ${line}`,
              color: danger,
              boxShadow: "none",
            }}
          >
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            Deactivate account
          </Button>
        </div>

        {/* Rows 4-6 — deactivation dialog */}
        {modalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ backgroundColor: "rgba(3,8,20,0.72)", backdropFilter: "blur(6px)" }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) closeModal();
            }}
          >
            <div
              data-wf="b-3-0"
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="deactivate-title"
              aria-describedby="deactivate-copy"
              className="np-pop w-full max-w-lg p-6 sm:p-8"
              style={{
                backgroundColor: "rgba(12,27,54,0.92)",
                border: `1px solid ${line}`,
                borderRadius: brand.radius,
                boxShadow: `0 40px 120px -30px ${danger}, 0 0 0 1px rgba(255,255,255,0.04)`,
                backdropFilter: "blur(24px)",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <h2
                  id="deactivate-title"
                  className="text-[24px] font-bold leading-tight"
                  style={{ fontFamily: brand.fontHeading }}
                >
                  Deactivate this account?
                </h2>
                <Button
                  onClick={closeModal}
                  aria-label="Close deactivation dialog"
                  className="np-trans shrink-0 h-9 w-9 grid place-items-center hover:bg-white/10"
                  style={{
                    borderRadius: 12,
                    backgroundColor: "transparent",
                    border: `1px solid ${line}`,
                    color: "#ffffff",
                    boxShadow: "none",
                  }}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>

              <p
                data-wf="b-4-0"
                id="deactivate-copy"
                className="mt-4 text-[15px] leading-relaxed"
                style={{ color: brand.neutralColor }}
              >
                All of your sessions end immediately and you will no longer be able to sign in with
                this email.
              </p>

              <div
                className="mt-5 p-4 flex items-start gap-3"
                style={{
                  borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: `1px solid ${line}`,
                }}
              >
                <Checkbox
                  id="deactivate-ack"
                  ref={ackRef}
                  checked={acknowledged}
                  onChange={(e) => {
                    setAcknowledged(e.target.checked);
                    if (e.target.checked) setDeactivateError("");
                  }}
                  className="mt-0.5"
                  aria-describedby={deactivateError ? "deactivate-error" : undefined}
                />
                <Label
                  htmlFor="deactivate-ack"
                  className="text-[14px] leading-relaxed cursor-pointer"
                >
                  I understand that my {counts.expenses} expenses and {counts.categories} categories
                  stay locked to a closed account, and this cannot be undone from inside the app.
                </Label>
              </div>

              {deactivateError && (
                <p
                  id="deactivate-error"
                  role="alert"
                  className="np-rise mt-4 text-[14px] flex items-start gap-2 p-3"
                  style={{
                    color: danger,
                    borderRadius: 12,
                    border: `1px solid ${line}`,
                    backgroundColor: "rgba(255,255,255,0.04)",
                  }}
                >
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
                  {deactivateError}
                </p>
              )}

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  data-wf="b-5-0"
                  onClick={handleConfirmDeactivation}
                  aria-busy={deactivateState === "working"}
                  className="np-trans w-full min-h-[52px] px-5 text-[15px] font-semibold flex items-center justify-center gap-2 hover:brightness-110"
                  style={{
                    borderRadius: brand.radius,
                    backgroundColor: danger,
                    color: brand.backgroundColor,
                    border: "1px solid transparent",
                    boxShadow: `0 18px 50px -20px ${danger}`,
                    opacity: deactivateState === "working" ? 0.85 : acknowledged ? 1 : 0.6,
                  }}
                >
                  {deactivateState === "working" ? (
                    <>
                      <Clock className="h-4 w-4" aria-hidden="true" />
                      Closing sessions…
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" aria-hidden="true" />
                      Confirm deactivation
                    </>
                  )}
                </Button>
                <Button
                  data-wf="b-5-1"
                  onClick={closeModal}
                  className="np-trans w-full min-h-[52px] px-5 text-[15px] font-semibold hover:bg-white/10"
                  style={{
                    borderRadius: brand.radius,
                    backgroundColor: "transparent",
                    border: `1px solid ${line}`,
                    color: "#ffffff",
                    boxShadow: "none",
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Row 7 — documentation */}
        <section className="mt-12" data-wf="b-6-0" aria-labelledby="docs-heading">
          <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <h2
                id="docs-heading"
                className="text-[22px] font-bold"
                style={{ fontFamily: brand.fontHeading }}
              >
                Documentation
              </h2>
              <p className="mt-1 text-[14px]" style={{ color: brand.neutralColor }}>
                Setup instructions and a short guide to every core feature. Open one to read it
                here.
              </p>
            </div>
            <span
              className="hidden sm:block text-[13px]"
              style={{ color: brand.neutralColor, ...num }}
            >
              {DOCS.length} articles
            </span>
          </div>

          <ul className="list-none p-0 m-0" style={{ ...cardStyle, overflow: "hidden" }}>
            {DOCS.map((doc, i) => {
              const open = openDoc === doc.id;
              return (
                <li key={doc.id} style={{ borderTop: i === 0 ? "none" : `1px solid ${line}` }}>
                  <button
                    type="button"
                    data-wf={doc.id}
                    aria-expanded={open}
                    aria-controls={`panel-${doc.id}`}
                    onClick={() => setOpenDoc(open ? null : doc.id)}
                    className="np-trans w-full text-left px-5 sm:px-6 py-5 flex items-center gap-4 hover:bg-white/5"
                    style={{ backgroundColor: open ? surfaceHi : "transparent", minHeight: 56 }}
                  >
                    <span
                      className="shrink-0 grid place-items-center h-9 w-9 text-[13px] font-bold"
                      style={{
                        borderRadius: 10,
                        border: `1px solid ${open ? brand.accentColor : line}`,
                        color: open ? brand.accentColor : brand.neutralColor,
                        backgroundColor: open ? "rgba(232,121,249,0.12)" : "rgba(255,255,255,0.04)",
                        ...num,
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[16px] font-semibold leading-snug">
                        {doc.title}
                      </span>
                      <span
                        className="block mt-0.5 text-[13px]"
                        style={{ color: brand.neutralColor }}
                      >
                        {doc.meta}
                      </span>
                    </span>
                    <ChevronDown
                      className="np-trans h-4 w-4 shrink-0"
                      aria-hidden="true"
                      style={{
                        color: open ? brand.primaryColor : brand.neutralColor,
                        transform: open ? "rotate(180deg)" : "none",
                      }}
                    />
                  </button>
                  {open && (
                    <div
                      id={`panel-${doc.id}`}
                      className="np-doc-panel px-5 sm:px-6 pb-6 pt-0"
                      style={{ backgroundColor: surfaceHi }}
                    >
                      <div className="sm:pl-[52px] space-y-3 max-w-[70ch]">
                        {doc.body.map((p, idx) => (
                          <p
                            key={idx}
                            className="text-[14px] leading-relaxed"
                            style={{ color: brand.neutralColor }}
                          >
                            {p}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* Row 8 — free to use */}
        <div
          data-wf="b-7-0"
          className="mt-6 mb-4 p-5 sm:p-6 flex items-start gap-4"
          style={{
            borderRadius: brand.radius,
            border: `1px solid ${line}`,
            backgroundColor: "rgba(34,211,238,0.07)",
          }}
        >
          <span
            className="shrink-0 grid place-items-center h-9 w-9"
            style={{
              borderRadius: 10,
              backgroundColor: "rgba(34,211,238,0.16)",
              color: brand.primaryColor,
            }}
          >
            <CheckCircle className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="text-[15px] leading-relaxed max-w-[70ch]">
            Expense Tracker is free to use — there is no billing, subscription or payment step
            anywhere in the app.
          </p>
        </div>
      </div>
    </div>
  );
}
