// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Switch } = UI;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Check, Clock, ArrowLeft, ArrowRight, AlertCircle, CheckCircle } = Icons;

const PRODUCT = "expense tracker";

// The one account that exists in this prototype's seed data.
const REGISTERED_EMAIL = "rae.mcallister@fastmail.com";

const TABS = [
  { key: "signin", label: "Sign in", wf: "i-1-0-0" },
  { key: "register", label: "Create account", wf: "i-1-0-1" },
];

const RULE_TEXT = "Passwords must be at least 10 characters with a letter and a number.";
const SIGNIN_FAIL_TEXT =
  "Email or password is incorrect. Passwords must be at least 10 characters with a letter and a number.";

const mix = (colour, percent) => `color-mix(in srgb, ${colour} ${percent}%, transparent)`;

const CSS = `
@keyframes np-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
@keyframes np-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .35; transform: scale(.72); } }
.np-rise { animation: np-rise .28s cubic-bezier(.2,.7,.3,1) both; }
.np-dot { animation: np-pulse 1.7s ease-in-out infinite; }
.np-dot-2 { animation-delay: .22s; }
.np-dot-3 { animation-delay: .44s; }
.np-focus:focus-visible { outline: 2px solid var(--np-accent); outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) {
  .np-rise, .np-dot { animation: none !important; }
  .np-move { transition: none !important; }
}
`;

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const passwordOk = (value) => value.length >= 10 && /[A-Za-z]/.test(value) && /[0-9]/.test(value);

export default function Screen() {
  const navigate = useNavigate();
  const [tab, setTab] = React.useState("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [phase, setPhase] = React.useState("idle"); // idle | working | error | success
  const [message, setMessage] = React.useState("");
  const [badField, setBadField] = React.useState(null); // "email" | "password" | null

  const timers = React.useRef([]);
  React.useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  const glass = {
    backgroundColor: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: brand.radius,
  };
  const glow = `0 20px 60px -10px ${mix(brand.primaryColor, 70)}`;
  const gradient = `linear-gradient(90deg, ${brand.primaryColor}, ${brand.accentColor})`;

  const registering = tab === "register";
  const working = phase === "working";
  const done = phase === "success";

  const fieldStyle = (name) => ({
    ...glass,
    borderColor:
      phase === "error" && badField === name ? mix(brand.accentColor, 75) : "rgba(255,255,255,0.14)",
  });

  const switchTab = (key) => {
    if (key === tab) return;
    setTab(key);
    setPhase("idle");
    setMessage("");
    setBadField(null);
  };

  const fail = (text, field) => {
    setPhase("error");
    setMessage(text);
    setBadField(field || null);
  };

  const onSubmit = (event) => {
    event.preventDefault();
    if (working || done) return;

    const trimmed = email.trim();

    if (!trimmed) return fail("Enter the email you track your expenses with.", "email");
    if (!isEmail(trimmed)) return fail("That email doesn't look right — try the form name@example.com.", "email");
    if (!password) return fail(registering ? "Choose a password. " + RULE_TEXT : "Enter your password.", "password");
    if (registering && !passwordOk(password)) return fail(RULE_TEXT, "password");

    setPhase("working");
    setMessage(registering ? "Setting up your private ledger…" : "Checking your details…");
    setBadField(null);

    later(() => {
      if (registering) {
        if (trimmed.toLowerCase() === REGISTERED_EMAIL) {
          return fail("An account already exists for that email. Switch to Sign in to get back to it.", "email");
        }
        setPhase("success");
        setMessage("Account created. Opening your dashboard…");
        later(() => navigate("dashboard"), 700);
        return;
      }

      const ok = trimmed.toLowerCase() === REGISTERED_EMAIL && passwordOk(password);
      if (!ok) return fail(SIGNIN_FAIL_TEXT, "password");

      setPhase("success");
      setMessage("Signed in. Opening your dashboard…");
      later(() => navigate("dashboard"), 700);
    }, 650);
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12 text-white"
      style={{ fontFamily: brand.fontBody, backgroundColor: brand.backgroundColor, "--np-accent": brand.accentColor }}
    >
      <style>{CSS}</style>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-[-120px] h-[520px] w-[520px] rounded-full blur-[120px]"
        style={{ backgroundColor: mix(brand.primaryColor, 70) }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-160px] right-[-80px] h-[560px] w-[560px] rounded-full blur-[130px]"
        style={{ backgroundColor: mix(brand.accentColor, 60) }}
      />

      <p className="absolute left-6 top-7 text-lg font-bold sm:left-10 sm:top-8" style={{ fontFamily: brand.fontHeading }}>
        {PRODUCT}
      </p>

      <main
        className="np-rise relative w-full max-w-[460px] p-7 backdrop-blur-2xl sm:p-10"
        style={{ ...glass, boxShadow: "0 40px 120px -20px rgba(0,0,0,0.6)" }}
      >
        <p
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
          style={{ backgroundColor: mix(brand.accentColor, 25), color: "#fff" }}
        >
          <span aria-hidden="true" className="np-dot inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: brand.accentColor }} />
          Private by default
        </p>

        <h1
          data-wf="b-0-0"
          className="mt-5 text-[34px] font-extrabold leading-[1.1] tracking-tight sm:text-4xl"
          style={{ fontFamily: brand.fontHeading }}
        >
          Sign in to your account
        </h1>
        <p className="mt-2 text-sm text-white/65">
          Every expense, category and report you create stays on your account and nobody else's.
        </p>

        {/* Row 2 — tabs */}
        <div
          data-wf="b-1-0"
          role="tablist"
          aria-label="Sign in or create account"
          className="mt-7 grid grid-cols-2 gap-1.5 p-1.5"
          style={{ ...glass, backgroundColor: "rgba(255,255,255,0.05)" }}
        >
          {TABS.map((t) => {
            const active = t.key === tab;
            return (
              <button
                key={t.key}
                data-wf={t.wf}
                id={`tab-${t.key}`}
                role="tab"
                type="button"
                aria-selected={active}
                aria-controls="auth-panel"
                tabIndex={active ? 0 : -1}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                    e.preventDefault();
                    const next = TABS[(TABS.findIndex((x) => x.key === tab) + 1) % TABS.length];
                    switchTab(next.key);
                    const el = document.getElementById(`tab-${next.key}`);
                    if (el) el.focus();
                  }
                }}
                onClick={() => switchTab(t.key)}
                className="np-focus np-move flex min-h-[44px] items-center justify-center gap-2 px-3 text-sm font-bold transition-colors"
                style={
                  active
                    ? { background: gradient, color: brand.backgroundColor, borderRadius: brand.radius, boxShadow: glow }
                    : { color: "rgba(255,255,255,0.72)", borderRadius: brand.radius, backgroundColor: "transparent" }
                }
              >
                {active ? <Check aria-hidden="true" className="h-4 w-4" /> : null}
                {t.label}
              </button>
            );
          })}
        </div>

        <div id="auth-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
          {/* Row 3 — form */}
          <form data-wf="b-2-0" className="mt-6 space-y-5" onSubmit={onSubmit} noValidate>
            <div className="space-y-2">
              <label htmlFor="auth-email" className="block text-xs font-bold uppercase tracking-[0.12em] text-white/60">
                Email
              </label>
              <input
                data-wf="i-2-0-0"
                id="auth-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                spellCheck="false"
                disabled={working || done}
                aria-invalid={phase === "error" && badField === "email"}
                aria-describedby="auth-feedback"
                placeholder="rae.mcallister@fastmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="np-focus h-12 w-full px-4 text-sm text-white outline-none placeholder:text-white/35 disabled:opacity-60"
                style={fieldStyle("email")}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="auth-password" className="block text-xs font-bold uppercase tracking-[0.12em] text-white/60">
                Password
              </label>
              <input
                data-wf="i-2-0-1"
                id="auth-password"
                name="password"
                type="password"
                autoComplete={registering ? "new-password" : "current-password"}
                disabled={working || done}
                aria-invalid={phase === "error" && badField === "password"}
                aria-describedby="auth-feedback"
                placeholder={registering ? "At least 10 characters" : "Your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="np-focus h-12 w-full px-4 text-sm text-white outline-none placeholder:text-white/35 disabled:opacity-60"
                style={fieldStyle("password")}
              />
            </div>

            {/* Row 4 — primary action */}
            <button
              data-wf="b-3-0"
              type="submit"
              disabled={working || done}
              aria-busy={working}
              className="np-focus np-move h-12 w-full text-sm font-extrabold tracking-wide transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                background: gradient,
                color: brand.backgroundColor,
                borderRadius: brand.radius,
                boxShadow: glow,
                opacity: working || done ? 0.78 : 1,
              }}
            >
              {working ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <span aria-hidden="true" className="np-dot inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: brand.backgroundColor }} />
                  <span aria-hidden="true" className="np-dot np-dot-2 inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: brand.backgroundColor }} />
                  <span aria-hidden="true" className="np-dot np-dot-3 inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: brand.backgroundColor }} />
                  {registering ? "Creating your account" : "Signing you in"}
                </span>
              ) : done ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <CheckCircle aria-hidden="true" className="h-4 w-4" />
                  {registering ? "Account created" : "Signed in"}
                </span>
              ) : registering ? (
                "Create account →"
              ) : (
                "Sign in →"
              )}
            </button>
          </form>
        </div>

        {/* Row 5 — feedback: rules, validation, failure, success */}
        <div
          data-wf="b-4-0"
          id="auth-feedback"
          role={phase === "error" ? "alert" : "status"}
          aria-live="polite"
          className="mt-5"
        >
          {phase === "idle" ? (
            <p className="text-sm leading-relaxed text-white/55">{RULE_TEXT}</p>
          ) : (
            <p
              key={message}
              className="np-rise flex gap-3 p-4 text-sm font-semibold leading-relaxed"
              style={{
                ...glass,
                borderColor: phase === "error" ? mix(brand.accentColor, 60) : mix(brand.primaryColor, 55),
                boxShadow: phase === "error" ? `0 20px 60px -16px ${mix(brand.accentColor, 65)}` : glow,
                color: phase === "error" ? brand.accentColor : "#fff",
              }}
            >
              {phase === "error" ? (
                <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              ) : phase === "success" ? (
                <CheckCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" style={{ color: brand.primaryColor }} />
              ) : (
                <Clock aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" style={{ color: brand.primaryColor }} />
              )}
              <span>
                <span className="sr-only">{phase === "error" ? "Error: " : ""}</span>
                {message}
              </span>
            </p>
          )}
        </div>

        {/* Row 6 — reassurance */}
        <p data-wf="b-5-0" className="mt-6 text-center text-xs leading-relaxed text-white/55">
          Free to use. Your expenses are private to your account and we never ask for payment details.
        </p>
      </main>
    </div>
  );
}
