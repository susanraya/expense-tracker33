// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";

const { Button, Label } = UI;

const CURRENCY = "€";

const DAYS = [
  { k: "2026-10-20", d: "20 Oct", v: 18.4, n: 1, top: "Transport" },
  { k: "2026-10-21", d: "21 Oct", v: 62.1, n: 2, top: "Groceries" },
  { k: "2026-10-22", d: "22 Oct", v: 0, n: 0, top: null },
  { k: "2026-10-23", d: "23 Oct", v: 34.95, n: 2, top: "Dining out" },
  { k: "2026-10-24", d: "24 Oct", v: 128.6, n: 3, top: "Groceries" },
  { k: "2026-10-25", d: "25 Oct", v: 22.0, n: 1, top: "Transport" },
  { k: "2026-10-26", d: "26 Oct", v: 47.3, n: 2, top: "Household" },
  { k: "2026-10-27", d: "27 Oct", v: 9.8, n: 1, top: "Dining out" },
  { k: "2026-10-28", d: "28 Oct", v: 55.4, n: 2, top: "Groceries" },
  { k: "2026-10-29", d: "29 Oct", v: 0, n: 0, top: null },
  { k: "2026-10-30", d: "30 Oct", v: 71.25, n: 3, top: "Dining out" },
  { k: "2026-10-31", d: "31 Oct", v: 96.0, n: 2, top: "Groceries" },
  { k: "2026-11-01", d: "1 Nov", v: 24.5, n: 1, top: "Transport" },
  { k: "2026-11-02", d: "2 Nov", v: 350.0, n: 1, top: "Rent" },
  { k: "2026-11-03", d: "3 Nov", v: 12.75, n: 1, top: "Dining out" },
  { k: "2026-11-04", d: "4 Nov", v: 118.4, n: 4, top: "Groceries" },
  { k: "2026-11-05", d: "5 Nov", v: 41.2, n: 2, top: "Transport" },
  { k: "2026-11-06", d: "6 Nov", v: 0, n: 0, top: null },
  { k: "2026-11-07", d: "7 Nov", v: 94.65, n: 3, top: "Dining out" },
  { k: "2026-11-08", d: "8 Nov", v: 33.1, n: 2, top: "Household" },
  { k: "2026-11-09", d: "9 Nov", v: 97.8, n: 3, top: "Groceries" },
  { k: "2026-11-10", d: "10 Nov", v: 19.95, n: 1, top: "Transport" },
  { k: "2026-11-11", d: "11 Nov", v: 86.4, n: 4, top: "Dining out" },
  { k: "2026-11-12", d: "12 Nov", v: 0, n: 0, top: null },
  { k: "2026-11-13", d: "13 Nov", v: 45.25, n: 2, top: "Groceries" },
  { k: "2026-11-14", d: "14 Nov", v: 112.3, n: 5, top: "Groceries" },
  { k: "2026-11-15", d: "15 Nov", v: 28.6, n: 1, top: "Transport" },
  { k: "2026-11-16", d: "16 Nov", v: 113.15, n: 4, top: "Household" },
  { k: "2026-11-17", d: "17 Nov", v: 85.0, n: 2, top: "Dining out" },
  { k: "2026-11-18", d: "18 Nov", v: 21.45, n: 1, top: "Groceries" },
];

const TOP_CATEGORIES = [
  { id: "i-2-1-0", name: "Groceries", amount: 412.8, count: 14 },
  { id: "i-2-1-1", name: "Rent", amount: 350.0, count: 1 },
  { id: "i-2-1-2", name: "Transport", amount: 186.25, count: 9 },
  { id: "i-2-1-3", name: "Dining out", amount: 142.0, count: 8 },
];

const SUMMARY = {
  total: "1,284.50",
  totalHint: "1 – 18 Nov 2026 · up 12.4% on October",
  count: "37",
  countHint: "6 more than this time last month",
  avg: "42.80",
  avgHint: "November total ÷ 30 days",
};

const OTHER_TOTAL = 193.45;
const LAST_LOGGED = {
  amount: 21.45,
  category: "Groceries",
  note: "Lidl run — Parnell St",
  when: "2 hours ago",
};

export default function Screen() {
  const navigate = useNavigate();
  // 'loading' | 'ready' | 'error' | 'expired'
  const [status, setStatus] = React.useState("loading");
  const [selected, setSelected] = React.useState(DAYS.length - 1);

  React.useEffect(() => {
    if (status !== "loading") return undefined;
    const t = setTimeout(() => setStatus("ready"), 620);
    return () => clearTimeout(t);
  }, [status]);

  const hasData = DAYS.some((x) => x.v > 0) && TOP_CATEGORIES.length > 0;
  const max = DAYS.reduce((m, x) => Math.max(m, x.v), 0);
  const topCatMax = TOP_CATEGORIES.reduce((m, x) => Math.max(m, x.amount), 0);
  const periodTotal = 1284.5;
  const day = DAYS[selected];

  const fmt = (n) =>
    n.toLocaleString("en-IE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const vars = {
    "--np-primary": brand.primaryColor,
    "--np-accent": brand.accentColor,
    "--np-neutral": brand.neutralColor,
    "--np-bg": brand.backgroundColor,
    "--np-radius": brand.radius,
    "--np-surface": "rgba(255,255,255,0.06)",
    "--np-surface-2": "rgba(255,255,255,0.09)",
    "--np-hairline": "rgba(255,255,255,0.13)",
    fontFamily: brand.fontBody,
    color: "rgba(255,255,255,0.94)",
  };

  const glass = {
    backgroundColor: "var(--np-surface)",
    border: "1px solid var(--np-hairline)",
    borderRadius: brand.radius,
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
  };

  const css = `
    .np-focus:focus-visible{outline:2px solid var(--np-primary);outline-offset:3px;border-radius:12px}
    .np-cta{transition:transform .18s ease, box-shadow .18s ease, filter .18s ease}
    .np-cta:hover{transform:translateY(-1px);filter:saturate(1.1)}
    .np-cta:active{transform:translateY(0)}
    .np-ghost{transition:background-color .18s ease, border-color .18s ease}
    .np-ghost:hover{background-color:var(--np-surface-2);border-color:rgba(255,255,255,0.26)}
    .np-row{transition:background-color .18s ease, transform .18s ease}
    .np-row:hover{background-color:var(--np-surface-2)}
    .np-row:hover .np-chev{transform:translateX(3px)}
    .np-chev{transition:transform .18s ease}
    .np-bar-fill{transform-origin:bottom center;animation:npRise .5s cubic-bezier(.2,.8,.25,1) both}
    .np-bar:hover .np-bar-fill{filter:brightness(1.25)}
    .np-enter{animation:npFade .45s cubic-bezier(.2,.8,.25,1) both}
    .np-pulse{animation:npPulse 2.4s ease-in-out infinite}
    .np-skel{background:linear-gradient(90deg,rgba(255,255,255,.05) 25%,rgba(255,255,255,.12) 37%,rgba(255,255,255,.05) 63%);background-size:400% 100%;animation:npShimmer 1.4s ease-in-out infinite}
    @keyframes npRise{from{transform:scaleY(.02);opacity:0}to{transform:scaleY(1);opacity:1}}
    @keyframes npFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
    @keyframes npPulse{0%,100%{opacity:.35;transform:scale(1)}50%{opacity:.95;transform:scale(1.5)}}
    @keyframes npShimmer{0%{background-position:100% 0}100%{background-position:-100% 0}}
    @media (prefers-reduced-motion: reduce){
      .np-bar-fill,.np-enter,.np-pulse,.np-skel{animation:none!important}
      .np-cta,.np-ghost,.np-row,.np-chev{transition:none!important}
    }
  `;

  const Label = ({ children }) => (
    <span
      className="text-[11px] font-semibold uppercase tracking-[0.16em]"
      style={{ color: "var(--np-neutral)" }}
    >
      {children}
    </span>
  );

  const statCards = [
    {
      wf: "b-1-0",
      label: "Total spent this period",
      value: SUMMARY.total,
      hint: SUMMARY.totalHint,
      money: true,
      focal: true,
    },
    {
      wf: "b-1-1",
      label: "Expenses logged",
      value: SUMMARY.count,
      hint: SUMMARY.countHint,
      money: false,
      focal: false,
    },
    {
      wf: "b-1-2",
      label: "Average per day",
      value: SUMMARY.avg,
      hint: SUMMARY.avgHint,
      money: true,
      focal: false,
    },
  ];

  return (
    <div className="relative w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-10" style={vars}>
      <style>{css}</style>

      {/* ambient glows — decorative */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-28 left-[8%] h-72 w-72 rounded-full"
          style={{ background: brand.primaryColor, opacity: 0.16, filter: "blur(90px)" }}
        />
        <div
          className="absolute -top-10 right-[6%] h-80 w-80 rounded-full"
          style={{ background: brand.accentColor, opacity: 0.16, filter: "blur(110px)" }}
        />
      </div>

      <div className="relative mx-auto grid max-w-[1180px] grid-cols-12 gap-4 md:gap-6">
        {/* ── Row 1 ────────────────────────────────────────────── */}
        <div data-wf="b-0-0" className="col-span-12 md:col-span-6">
          <h1
            className="text-[32px] font-bold leading-tight tracking-[-0.02em] sm:text-[40px]"
            style={{ fontFamily: brand.fontHeading }}
          >
            Dashboard —{" "}
            <span
              style={{
                backgroundImage: `linear-gradient(100deg, ${brand.primaryColor}, ${brand.accentColor})`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              November 2026
            </span>
          </h1>
          <p
            className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px]"
            style={{ color: "var(--np-neutral)" }}
          >
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1"
              style={{
                backgroundColor: "var(--np-surface)",
                border: "1px solid var(--np-hairline)",
              }}
            >
              <span
                className="np-pulse inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: brand.primaryColor }}
                aria-hidden="true"
              />
              {status === "ready" ? "Synced 2 min ago" : "Syncing"}
            </span>
            <span>Your data only — susan.raya@quorq.ai</span>
            <span aria-hidden="true">·</span>
            <span>Session ends after 30 minutes idle</span>
          </p>
        </div>

        <div className="col-span-6 md:col-span-3 md:self-start md:pt-2">
          <Button
            data-wf="b-0-1"
            type="button"
            onClick={() => navigate("expenses")}
            className="np-cta np-focus flex h-14 w-full items-center justify-center gap-2 text-[15px] font-bold"
            style={{
              borderRadius: brand.radius,
              border: "1px solid rgba(255,255,255,0.22)",
              backgroundImage: `linear-gradient(120deg, ${brand.primaryColor}, ${brand.accentColor})`,
              color: brand.backgroundColor,
              boxShadow: `0 22px 56px -18px ${brand.accentColor}`,
            }}
          >
            <Icons.Plus className="h-5 w-5" aria-hidden="true" />
            Add expense
          </Button>
        </div>

        <div className="col-span-6 md:col-span-3 md:self-start md:pt-2">
          <Button
            data-wf="b-0-2"
            type="button"
            onClick={() => navigate("reports")}
            className="np-ghost np-focus flex h-14 w-full items-center justify-center gap-2 bg-transparent text-[15px] font-semibold"
            style={{
              borderRadius: brand.radius,
              border: "1px solid var(--np-hairline)",
              backgroundColor: "var(--np-surface)",
              color: "rgba(255,255,255,0.94)",
            }}
          >
            View reports
            <Icons.ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        {/* ── Loading ─────────────────────────────────────────── */}
        {status === "loading" && (
          <>
            <p
              className="col-span-12 text-[13px]"
              style={{ color: "var(--np-neutral)" }}
              aria-live="polite"
            >
              Pulling your November figures from /dashboard/summary…
            </p>
            {[0, 1, 2].map((i) => (
              <div key={i} className="col-span-12 sm:col-span-6 lg:col-span-4">
                <div style={glass} className="h-[148px] p-6">
                  <div className="np-skel h-3 w-28 rounded-full" />
                  <div className="np-skel mt-6 h-9 w-40 rounded-xl" />
                  <div className="np-skel mt-5 h-3 w-36 rounded-full" />
                </div>
              </div>
            ))}
            <div className="col-span-12 lg:col-span-8">
              <div style={glass} className="h-[340px] p-6">
                <div className="np-skel h-4 w-56 rounded-full" />
                <div className="np-skel mt-8 h-[220px] w-full rounded-2xl" />
              </div>
            </div>
            <div className="col-span-12 lg:col-span-4">
              <div style={glass} className="h-[340px] p-6">
                <div className="np-skel h-4 w-32 rounded-full" />
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="np-skel mt-6 h-9 w-full rounded-xl" />
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Error ───────────────────────────────────────────── */}
        {status === "error" && (
          <div className="col-span-12">
            <div
              className="np-enter flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"
              style={{ ...glass, borderColor: "rgba(232,121,249,0.4)" }}
            >
              <div className="flex items-start gap-3">
                <Icons.AlertCircle
                  className="mt-0.5 h-5 w-5 shrink-0"
                  style={{ color: brand.accentColor }}
                  aria-hidden="true"
                />
                <div>
                  <h2
                    className="text-[18px] font-semibold"
                    style={{ fontFamily: brand.fontHeading }}
                  >
                    November's summary didn't come back
                  </h2>
                  <p
                    className="mt-1 max-w-[62ch] text-[14px] leading-relaxed"
                    style={{ color: "var(--np-neutral)" }}
                  >
                    The request to <span className="font-mono text-[13px]">/dashboard/summary</span>{" "}
                    timed out after 10 seconds. Nothing was changed — your 37 logged expenses are
                    safe.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Session expired ─────────────────────────────────── */}
        {status === "expired" && (
          <div className="col-span-12">
            <div
              className="np-enter flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"
              style={glass}
            >
              <div className="flex items-start gap-3">
                <Icons.Clock
                  className="mt-0.5 h-5 w-5 shrink-0"
                  style={{ color: brand.primaryColor }}
                  aria-hidden="true"
                />
                <div>
                  <h2
                    className="text-[18px] font-semibold"
                    style={{ fontFamily: brand.fontHeading }}
                  >
                    Your session timed out
                  </h2>
                  <p
                    className="mt-1 max-w-[62ch] text-[14px] leading-relaxed"
                    style={{ color: "var(--np-neutral)" }}
                  >
                    You were idle for 30 minutes, so we ended the session on this device. Sign in
                    again to see your November figures.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Row 2: summary figures ──────────────────────────── */}
        {status === "ready" && hasData && (
          <dl className="col-span-12 grid grid-cols-12 gap-4 md:gap-6">
            {statCards.map((c, i) => (
              <div
                key={c.wf}
                data-wf={c.wf}
                className="np-enter col-span-12 overflow-hidden p-6 sm:col-span-6 lg:col-span-4"
                style={{
                  ...glass,
                  animationDelay: `${i * 70}ms`,
                  ...(c.focal
                    ? {
                        backgroundImage: `radial-gradient(120% 140% at 0% 0%, ${brand.accentColor}26 0%, rgba(255,255,255,0.04) 55%)`,
                        borderColor: "rgba(255,255,255,0.2)",
                        boxShadow: `0 30px 70px -40px ${brand.accentColor}`,
                      }
                    : {}),
                }}
              >
                <dt>
                  <Label>{c.label}</Label>
                </dt>
                <dd
                  className={`mt-4 tabular-nums font-bold leading-none tracking-[-0.03em] ${
                    c.focal ? "text-[44px] sm:text-[52px]" : "text-[36px] sm:text-[40px]"
                  }`}
                  style={{ fontFamily: brand.fontHeading }}
                >
                  {c.money && (
                    <span
                      className="mr-1 align-top text-[0.5em] font-semibold"
                      style={{ color: "var(--np-neutral)" }}
                    >
                      {CURRENCY}
                    </span>
                  )}
                  {c.value}
                </dd>
                <dd
                  className="mt-3 text-[13px] leading-relaxed"
                  style={{ color: "var(--np-neutral)" }}
                >
                  {c.hint}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {/* ── Row 3: chart + top categories ───────────────────── */}
        {status === "ready" && hasData && (
          <>
            <section
              data-wf="b-2-0"
              aria-labelledby="np-chart-title"
              className="np-enter col-span-12 p-6 lg:col-span-8"
              style={{ ...glass, animationDelay: "140ms" }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2
                    id="np-chart-title"
                    className="text-[20px] font-semibold tracking-[-0.01em]"
                    style={{ fontFamily: brand.fontHeading }}
                  >
                    Spending over the last 30 days
                  </h2>
                  <p className="mt-1 text-[13px]" style={{ color: "var(--np-neutral)" }}>
                    20 Oct – 18 Nov 2026 · select a bar for that day's total
                  </p>
                </div>
                <div className="text-right" aria-live="polite">
                  <p
                    className="tabular-nums text-[26px] font-bold leading-none"
                    style={{ fontFamily: brand.fontHeading }}
                  >
                    {CURRENCY}
                    {fmt(day.v)}
                  </p>
                  <p className="mt-1.5 text-[12px]" style={{ color: "var(--np-neutral)" }}>
                    {day.d} 2026 ·{" "}
                    {day.n === 0
                      ? "no expenses logged"
                      : `${day.n} ${day.n === 1 ? "expense" : "expenses"} · mostly ${day.top}`}
                  </p>
                </div>
              </div>

              <ul className="mt-7 flex h-[200px] w-full items-end gap-[3px]">
                {DAYS.map((x, i) => {
                  const isSel = i === selected;
                  return (
                    <li key={x.k} className="flex h-full min-w-0 flex-1 items-end">
                      <button
                        type="button"
                        onClick={() => setSelected(i)}
                        aria-pressed={isSel}
                        aria-label={`${x.d} 2026, ${CURRENCY}${fmt(x.v)} across ${x.n} ${x.n === 1 ? "expense" : "expenses"}`}
                        className="np-bar np-focus flex h-full w-full items-end rounded-full"
                      >
                        <span
                          className="np-bar-fill w-full rounded-full"
                          style={{
                            height: x.v > 0 ? `${Math.max(4, (x.v / max) * 100)}%` : "4px",
                            animationDelay: `${i * 16}ms`,
                            backgroundImage:
                              x.v > 0
                                ? `linear-gradient(180deg, ${brand.accentColor}, ${brand.primaryColor})`
                                : "none",
                            backgroundColor: x.v > 0 ? undefined : "rgba(255,255,255,0.16)",
                            opacity: x.v > 0 ? (isSel ? 1 : 0.6) : 1,
                            boxShadow:
                              isSel && x.v > 0 ? `0 0 26px 2px ${brand.accentColor}` : "none",
                            outline: isSel ? "1px solid rgba(255,255,255,0.5)" : "none",
                          }}
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div
                className="mt-3 flex justify-between tabular-nums text-[11px]"
                style={{ color: "var(--np-neutral)" }}
              >
                <span>20 Oct</span>
                <span className="hidden sm:inline">27 Oct</span>
                <span>3 Nov</span>
                <span className="hidden sm:inline">10 Nov</span>
                <span>18 Nov</span>
              </div>

              <div className="mt-5" style={{ borderTop: "1px solid var(--np-hairline)" }} />
              <p
                className="mt-4 flex items-center gap-2 text-[13px]"
                style={{ color: "var(--np-neutral)" }}
              >
                <Icons.CheckCircle
                  className="h-4 w-4 shrink-0"
                  style={{ color: brand.primaryColor }}
                  aria-hidden="true"
                />
                Peak day {CURRENCY}350.00 on 2 Nov (Rent) · 3 days with no spending
              </p>
            </section>

            <section
              data-wf="b-2-1"
              aria-labelledby="np-cats-title"
              className="np-enter col-span-12 p-6 lg:col-span-4"
              style={{ ...glass, animationDelay: "200ms" }}
            >
              <h2
                id="np-cats-title"
                className="text-[20px] font-semibold tracking-[-0.01em]"
                style={{ fontFamily: brand.fontHeading }}
              >
                Top categories
              </h2>
              <p className="mt-1 text-[13px]" style={{ color: "var(--np-neutral)" }}>
                Share of {CURRENCY}
                {fmt(periodTotal)} spent in November
              </p>

              <ul className="mt-5 flex flex-col">
                {TOP_CATEGORIES.map((c, i) => (
                  <li
                    key={c.id}
                    style={i > 0 ? { borderTop: "1px solid var(--np-hairline)" } : undefined}
                  >
                    <button
                      data-wf={c.id}
                      type="button"
                      onClick={() => navigate("reports")}
                      className="np-row np-focus group block w-full rounded-xl px-3 py-3.5 text-left"
                    >
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="flex items-baseline gap-2 truncate">
                          <span className="text-[15px] font-semibold">{c.name}</span>
                          <span
                            className="tabular-nums text-[12px]"
                            style={{ color: "var(--np-neutral)" }}
                          >
                            {c.count} {c.count === 1 ? "expense" : "expenses"}
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-1.5">
                          <span className="tabular-nums text-[15px] font-bold">
                            {CURRENCY}
                            {fmt(c.amount)}
                          </span>
                          <Icons.ChevronRight
                            className="np-chev h-4 w-4"
                            style={{ color: "var(--np-neutral)" }}
                            aria-hidden="true"
                          />
                        </span>
                      </span>
                      <span className="mt-2.5 flex items-center gap-3">
                        <span
                          className="h-1.5 flex-1 overflow-hidden rounded-full"
                          style={{ backgroundColor: "rgba(255,255,255,0.09)" }}
                          aria-hidden="true"
                        >
                          <span
                            className="block h-full rounded-full"
                            style={{
                              width: `${(c.amount / topCatMax) * 100}%`,
                              backgroundImage: `linear-gradient(90deg, ${brand.primaryColor}, ${brand.accentColor})`,
                            }}
                          />
                        </span>
                        <span
                          className="tabular-nums text-[12px]"
                          style={{ color: "var(--np-neutral)" }}
                        >
                          {Math.round((c.amount / periodTotal) * 100)}%
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-4" style={{ borderTop: "1px solid var(--np-hairline)" }} />
              <p
                className="mt-4 flex items-center justify-between text-[13px]"
                style={{ color: "var(--np-neutral)" }}
              >
                <span>Everything else (3 categories)</span>
                <span className="tabular-nums font-semibold">
                  {CURRENCY}
                  {fmt(OTHER_TOTAL)}
                </span>
              </p>
            </section>
          </>
        )}

        {/* ── Row 4: first-use prompt / empty state ───────────── */}
        {status === "ready" && (
          <section
            data-wf="b-3-0"
            aria-labelledby="np-empty-title"
            className="np-enter col-span-12"
            style={{
              ...glass,
              animationDelay: "260ms",
              border: "1px dashed var(--np-hairline)",
              backgroundColor: "rgba(255,255,255,0.04)",
            }}
          >
            {!hasData ? (
              <div className="flex flex-col items-center px-6 py-14 text-center">
                <span
                  className="relative mb-6 flex h-16 w-16 items-center justify-center"
                  aria-hidden="true"
                >
                  <span
                    className="np-pulse absolute inset-0 rounded-full"
                    style={{ backgroundColor: brand.accentColor, filter: "blur(14px)" }}
                  />
                  <span
                    className="relative flex h-16 w-16 items-center justify-center rounded-full"
                    style={{
                      border: `1px solid ${brand.primaryColor}`,
                      backgroundColor: "rgba(255,255,255,0.06)",
                    }}
                  >
                    <Icons.FileText className="h-7 w-7" style={{ color: brand.primaryColor }} />
                  </span>
                </span>
                <h2
                  id="np-empty-title"
                  className="text-[24px] font-bold tracking-[-0.01em]"
                  style={{ fontFamily: brand.fontHeading }}
                >
                  No expenses yet
                </h2>
                <p
                  className="mt-3 max-w-[56ch] text-[15px] leading-relaxed"
                  style={{ color: "var(--np-neutral)" }}
                >
                  Add your first expense to see your spending summary — November's total, the 30-day
                  trend and your top categories all fill in straight away.
                </p>
                <Button
                  type="button"
                  onClick={() => navigate("expenses")}
                  className="np-cta np-focus mt-7 inline-flex h-12 items-center gap-2 px-6 text-[15px] font-bold"
                  style={{
                    borderRadius: brand.radius,
                    backgroundImage: `linear-gradient(120deg, ${brand.primaryColor}, ${brand.accentColor})`,
                    color: brand.backgroundColor,
                    boxShadow: `0 22px 56px -20px ${brand.accentColor}`,
                  }}
                >
                  <Icons.Plus className="h-5 w-5" aria-hidden="true" />
                  Add first expense
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span
                    className="relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center"
                    aria-hidden="true"
                  >
                    <span
                      className="np-pulse absolute inset-0 rounded-full"
                      style={{ backgroundColor: brand.primaryColor, filter: "blur(10px)" }}
                    />
                    <span
                      className="relative flex h-9 w-9 items-center justify-center rounded-full"
                      style={{
                        border: "1px solid var(--np-hairline)",
                        backgroundColor: "rgba(255,255,255,0.06)",
                      }}
                    >
                      <Icons.Clock className="h-4 w-4" style={{ color: brand.primaryColor }} />
                    </span>
                  </span>
                  <div>
                    <h2
                      id="np-empty-title"
                      className="text-[16px] font-semibold"
                      style={{ fontFamily: brand.fontHeading }}
                    >
                      Last logged {LAST_LOGGED.when}
                    </h2>
                    <p
                      className="mt-1 max-w-[62ch] text-[14px] leading-relaxed tabular-nums"
                      style={{ color: "var(--np-neutral)" }}
                    >
                      {CURRENCY}
                      {fmt(LAST_LOGGED.amount)} · {LAST_LOGGED.category} · {LAST_LOGGED.note}. Keep
                      November accurate while it's still fresh.
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => navigate("expenses")}
                  className="np-ghost np-focus inline-flex h-12 shrink-0 items-center gap-2 px-5 text-[15px] font-semibold"
                  style={{
                    borderRadius: brand.radius,
                    border: "1px solid var(--np-hairline)",
                    backgroundColor: "var(--np-surface)",
                    color: "rgba(255,255,255,0.94)",
                  }}
                >
                  <Icons.Plus className="h-4 w-4" aria-hidden="true" />
                  Add another expense
                </Button>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
