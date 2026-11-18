// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Button, Input, Label, Table, THead, TBody, TR, TH, TD, Empty } = UI;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Plus, Calendar, Clock, Filter, Download, AlertCircle, CheckCircle } = Icons;

const CATEGORIES = [
  { id: "c1", name: "Groceries" },
  { id: "c2", name: "Rent & Bills" },
  { id: "c3", name: "Transport" },
  { id: "c4", name: "Dining out" },
  { id: "c5", name: "Health & Fitness" },
  { id: "c6", name: "Subscriptions" },
  { id: "c7", name: "Travel" },
  { id: "c8", name: "Gifts" }
];

const EXPENSES = [
  { id: "e01", category_id: "c2", amount: 695.0, spent_on: "2026-10-01", note: "October rent — flat share" },
  { id: "e02", category_id: "c6", amount: 10.99, spent_on: "2026-10-01", note: "Spotify Duo" },
  { id: "e03", category_id: "c1", amount: 54.2, spent_on: "2026-10-02", note: "Tesco Metro — weekly shop" },
  { id: "e04", category_id: "c4", amount: 32.5, spent_on: "2026-10-03", note: "Dinner at Padella with Amara" },
  { id: "e05", category_id: "c3", amount: 18.4, spent_on: "2026-10-04", note: "TfL contactless — week 40" },
  { id: "e06", category_id: "c5", amount: 42.0, spent_on: "2026-10-05", note: "Climbing gym membership" },
  { id: "e07", category_id: "c1", amount: 12.85, spent_on: "2026-10-06", note: "Sainsbury's top-up" },
  { id: "e08", category_id: "c4", amount: 4.6, spent_on: "2026-10-07", note: "Pret flat white + croissant" },
  { id: "e09", category_id: "c2", amount: 68.3, spent_on: "2026-10-08", note: "Octopus Energy — September" },
  { id: "e10", category_id: "c6", amount: 8.99, spent_on: "2026-10-09", note: "iCloud 2TB" },
  { id: "e11", category_id: "c7", amount: 186.0, spent_on: "2026-10-10", note: "Eurostar to Brussels" },
  { id: "e12", category_id: "c1", amount: 61.75, spent_on: "2026-10-11", note: "Tesco — weekly shop" },
  { id: "e13", category_id: "c3", amount: 22.1, spent_on: "2026-10-12", note: "Thameslink to St Albans" },
  { id: "e14", category_id: "c4", amount: 19.2, spent_on: "2026-10-13", note: "Lunch — Dishoom King's Cross" },
  { id: "e15", category_id: "c8", amount: 35.0, spent_on: "2026-10-14", note: "Birthday gift for Dad" },
  { id: "e16", category_id: "c5", amount: 14.5, spent_on: "2026-10-15", note: "Physio top-up session" },
  { id: "e17", category_id: "c1", amount: 48.9, spent_on: "2026-10-16", note: "Lidl — weekly shop" },
  { id: "e18", category_id: "c4", amount: 58.4, spent_on: "2026-10-17", note: "Supper club, Hackney" },
  { id: "e19", category_id: "c3", amount: 9.8, spent_on: "2026-10-18", note: "Uber home from Dalston" },
  { id: "e20", category_id: "c2", amount: 41.6, spent_on: "2026-10-19", note: "Thames Water — quarterly" },
  { id: "e21", category_id: "c6", amount: 12.99, spent_on: "2026-10-20", note: "Figma Professional" },
  { id: "e22", category_id: "c1", amount: 37.45, spent_on: "2026-10-21", note: "Whole Foods — odds & ends" },
  { id: "e23", category_id: "c5", amount: 26.0, spent_on: "2026-10-22", note: "Yoga drop-in ×2" },
  { id: "e24", category_id: "c4", amount: 27.8, spent_on: "2026-10-23", note: "Friday pizza — Yard Sale" },
  { id: "e25", category_id: "c7", amount: 74.25, spent_on: "2026-10-24", note: "Brussels hotel — second night" },
  { id: "e26", category_id: "c3", amount: 18.4, spent_on: "2026-10-25", note: "TfL contactless — week 43" },
  { id: "e27", category_id: "c1", amount: 52.3, spent_on: "2026-10-26", note: "Tesco — weekly shop" },
  { id: "e28", category_id: "c8", amount: 18.0, spent_on: "2026-10-28", note: "Leaving card & flowers for Priya" },
  { id: "e29", category_id: "c4", amount: 11.9, spent_on: "2026-10-29", note: "Coffee & pastry, Origin" },
  { id: "e30", category_id: "c2", amount: 24.0, spent_on: "2026-10-30", note: "Mobile — SMARTY" },
  { id: "e31", category_id: "c4", amount: 64.0, spent_on: "2026-10-31", note: "Halloween dinner, Brat" },
  { id: "e32", category_id: "c2", amount: 695.0, spent_on: "2026-11-01", note: "November rent — flat share" },
  { id: "e33", category_id: "c6", amount: 10.99, spent_on: "2026-11-01", note: "Spotify Duo" },
  { id: "e34", category_id: "c1", amount: 59.15, spent_on: "2026-11-02", note: "Tesco — weekly shop" },
  { id: "e35", category_id: "c3", amount: 18.4, spent_on: "2026-11-03", note: "TfL contactless — week 45" },
  { id: "e36", category_id: "c5", amount: 42.0, spent_on: "2026-11-04", note: "Climbing gym membership" },
  { id: "e37", category_id: "c4", amount: 23.6, spent_on: "2026-11-05", note: "Bonfire night takeaway" },
  { id: "e38", category_id: "c1", amount: 16.4, spent_on: "2026-11-06", note: "Market veg — Broadway" },
  { id: "e39", category_id: "c7", amount: 218.4, spent_on: "2026-11-07", note: "Flights to Lisbon, March" },
  { id: "e40", category_id: "c4", amount: 12.75, spent_on: "2026-11-08", note: "Brunch — Blank Street" },
  { id: "e41", category_id: "c2", amount: 71.05, spent_on: "2026-11-09", note: "Octopus Energy — October" },
  { id: "e42", category_id: "c6", amount: 8.99, spent_on: "2026-11-10", note: "iCloud 2TB" },
  { id: "e43", category_id: "c1", amount: 44.6, spent_on: "2026-11-11", note: "Sainsbury's — weekly shop" },
  { id: "e44", category_id: "c3", amount: 32.7, spent_on: "2026-11-12", note: "Trainline — Manchester return" },
  { id: "e45", category_id: "c4", amount: 46.3, spent_on: "2026-11-13", note: "Dinner with Kofi, Som Saa" },
  { id: "e46", category_id: "c8", amount: 62.0, spent_on: "2026-11-14", note: "Wedding gift — Jess & Tom" },
  { id: "e47", category_id: "c5", amount: 11.0, spent_on: "2026-11-15", note: "Swim at London Fields" },
  { id: "e48", category_id: "c1", amount: 51.05, spent_on: "2026-11-16", note: "Tesco — weekly shop" },
  { id: "e49", category_id: "c6", amount: 12.99, spent_on: "2026-11-17", note: "Figma Professional" },
  { id: "e50", category_id: "c3", amount: 8.9, spent_on: "2026-11-18", note: "Santander Cycles day pass" }
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DANGER = "#ff5f7a"; /* crimson from the Neon Pulse direction, reserved for errors only */

function fmtMoney(n) {
  return "£" + n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtMoneyShort(n) {
  if (n >= 1000) return "£" + (n / 1000).toFixed(1) + "k";
  return "£" + Math.round(n);
}
function fmtShort(iso) {
  const p = iso.split("-");
  return p[2] + " " + MONTHS[Number(p[1]) - 1];
}
function fmtLong(iso) {
  return fmtShort(iso) + " " + iso.split("-")[0];
}
function dayNum(iso) {
  const p = iso.split("-").map(Number);
  return Date.UTC(p[0], p[1] - 1, p[2]) / 86400000;
}
function isoFromDay(n) {
  return new Date(n * 86400000).toISOString().slice(0, 10);
}
function mixHex(a, b, t) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const out = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return "rgb(" + out.join(",") + ")";
}

export default function Screen() {
  const navigate = useNavigate();
  const DEFAULT_RANGE = { start: "2026-10-01", end: "2026-11-18" };

  const [startInput, setStartInput] = React.useState(DEFAULT_RANGE.start);
  const [endInput, setEndInput] = React.useState(DEFAULT_RANGE.end);
  const [applied, setApplied] = React.useState(DEFAULT_RANGE);
  const [rangeError, setRangeError] = React.useState(null);
  const [status, setStatus] = React.useState("ready");
  const [exportState, setExportState] = React.useState("idle");

  React.useEffect(() => {
    if (status !== "loading") return undefined;
    const t = setTimeout(() => setStatus("ready"), 600);
    return () => clearTimeout(t);
  }, [status, applied.start, applied.end]);

  React.useEffect(() => {
    if (exportState !== "working") return undefined;
    const t = setTimeout(() => setExportState("done"), 900);
    return () => clearTimeout(t);
  }, [exportState]);

  const dirty = startInput !== applied.start || endInput !== applied.end;

  function onApply(e) {
    e.preventDefault();
    if (!startInput || !endInput) {
      setRangeError("Both a start and an end date are needed — the report was not updated.");
      return;
    }
    if (startInput > endInput) {
      setRangeError("Start date must be on or before the end date — the report was not updated.");
      return;
    }
    setRangeError(null);
    setApplied({ start: startInput, end: endInput });
    setExportState("idle");
    setStatus("loading");
  }

  const filtered = React.useMemo(
    () =>
      EXPENSES.filter((e) => e.spent_on >= applied.start && e.spent_on <= applied.end).sort((a, b) =>
        a.spent_on < b.spent_on ? 1 : -1
      ),
    [applied.start, applied.end]
  );

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const buckets = React.useMemo(() => {
    const s = dayNum(applied.start);
    const en = dayNum(applied.end);
    const span = en - s + 1;
    const size = span <= 10 ? 1 : span <= 84 ? 7 : 30;
    const out = [];
    for (let d = s; d <= en; d += size) {
      const last = Math.min(d + size - 1, en);
      const sum = filtered
        .filter((x) => dayNum(x.spent_on) >= d && dayNum(x.spent_on) <= last)
        .reduce((a, x) => a + x.amount, 0);
      out.push({ key: d, label: fmtShort(isoFromDay(d)), total: sum, size: size });
    }
    return out;
  }, [filtered, applied.start, applied.end]);

  const bucketSize = buckets.length ? buckets[0].size : 7;
  const bucketWord = bucketSize === 1 ? "Daily" : bucketSize === 7 ? "Weekly" : "Monthly";
  const maxBucket = buckets.reduce((m, b) => Math.max(m, b.total), 0);
  const avgBucket = buckets.length ? total / buckets.length : 0;
  const peak = buckets.reduce((m, b) => (b.total > (m ? m.total : -1) ? b : m), null);

  const byCategory = React.useMemo(() => {
    const rows = CATEGORIES.map((c) => ({
      id: c.id,
      name: c.name,
      total: filtered.filter((e) => e.category_id === c.id).reduce((a, e) => a + e.amount, 0)
    }))
      .filter((r) => r.total > 0)
      .sort((a, b) => b.total - a.total);
    return rows.map((r, i) => ({
      ...r,
      share: total > 0 ? r.total / total : 0,
      color: mixHex(brand.primaryColor, brand.accentColor, rows.length > 1 ? i / (rows.length - 1) : 0)
    }));
  }, [filtered, total]);

  const hasData = filtered.length > 0;
  const loading = status === "loading";
  const rangeLabel = fmtShort(applied.start) + " to " + fmtLong(applied.end);

  const glass = {
    backgroundColor: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: brand.radius,
    backdropFilter: "blur(16px)"
  };
  const fieldStyle = {
    backgroundColor: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: "12px",
    color: "rgba(255,255,255,0.95)",
    height: "44px",
    fontVariantNumeric: "tabular-nums"
  };

  const donutR = 54;
  const donutC = 2 * Math.PI * donutR;
  let acc = 0;
  const segments = byCategory.map((c) => {
    const seg = { id: c.id, dash: Math.max(c.share * donutC - 2, 0.6), offset: -acc * donutC, color: c.color };
    acc += c.share;
    return seg;
  });

  return (
    <div
      className="rp min-h-full px-4 sm:px-6 lg:px-10 py-8 lg:py-10"
      style={{
        backgroundColor: brand.backgroundColor,
        color: "rgba(255,255,255,0.92)",
        fontFamily: brand.fontBody,
        "--rp-primary": brand.primaryColor,
        "--rp-accent": brand.accentColor,
        "--rp-neutral": brand.neutralColor,
        "--rp-danger": DANGER
      }}
    >
      <style>{`
        .rp :focus-visible { outline: 2px solid var(--rp-primary); outline-offset: 3px; border-radius: 12px; }
        .rp input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); opacity: .55; cursor: pointer; }
        .rp .rp-row { animation: rpUp .45s cubic-bezier(.2,.7,.3,1) both; }
        .rp .rp-bar { animation: rpGrow .6s cubic-bezier(.2,.7,.3,1) both; transform-origin: bottom; }
        .rp .rp-fade { animation: rpFade .4s ease both; }
        .rp .rp-skel { background: linear-gradient(90deg, rgba(255,255,255,.05), rgba(255,255,255,.13), rgba(255,255,255,.05)); background-size: 200% 100%; animation: rpShimmer 1.3s linear infinite; }
        .rp .rp-empty { color: rgba(255,255,255,.66); }
        .rp .rp-empty h1, .rp .rp-empty h2, .rp .rp-empty h3 { color: rgba(255,255,255,.96); font-family: ${brand.fontHeading}; }
        @keyframes rpUp { from { opacity: 0; transform: translateY(8px);} to { opacity:1; transform:none; } }
        @keyframes rpGrow { from { transform: scaleY(.02); opacity:.4 } to { transform: scaleY(1); opacity:1 } }
        @keyframes rpFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes rpShimmer { from { background-position: 200% 0 } to { background-position: -200% 0 } }
        @media (prefers-reduced-motion: reduce) {
          .rp *, .rp *::before, .rp *::after { animation: none !important; transition: none !important; }
        }
      `}</style>

      <div className="mx-auto w-full max-w-[1180px]">
        {/* Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div data-wf="b-0-0" className="lg:col-span-8">
            <h1
              className="text-[34px] sm:text-[40px] leading-[1.1] font-extrabold tracking-tight"
              style={{ fontFamily: brand.fontHeading, color: "#ffffff" }}
            >
              Reports
            </h1>
            <p className="mt-2 text-[15px] max-w-[62ch]" style={{ color: brand.neutralColor }}>
              Your spending over time and by category, for the range you choose. Only your own expenses, in GBP.
            </p>
          </div>
          <div className="lg:col-span-4 flex lg:justify-end">
            <div className="w-full lg:w-auto">
              <Button
                data-wf="b-0-1"
                type="button"
                onClick={() => setExportState("working")}
                disabled={!hasData || loading || exportState === "working"}
                className="w-full lg:w-auto h-[48px] px-6 font-semibold transition-transform hover:-translate-y-[1px] disabled:opacity-45 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                style={{
                  borderRadius: brand.radius,
                  color: brand.backgroundColor,
                  border: "none",
                  backgroundImage: "linear-gradient(100deg, " + brand.primaryColor + ", " + brand.accentColor + ")",
                  boxShadow: "0 18px 48px -14px " + brand.accentColor + "99"
                }}
              >
                <span className="inline-flex items-center gap-2">
                  <Download className="h-4 w-4" aria-hidden="true" />
                  {exportState === "working" ? "Preparing CSV…" : "Export CSV"}
                </span>
              </Button>
              <p className="mt-2 text-[12.5px] lg:text-right" aria-live="polite" style={{ color: brand.neutralColor }}>
                {exportState === "done" ? (
                  <span className="inline-flex items-center gap-1.5" style={{ color: brand.primaryColor }}>
                    <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    expenses_{applied.start}_{applied.end}.csv · {filtered.length} rows
                  </span>
                ) : hasData ? (
                  "Columns: amount, date, category, note — filtered range only"
                ) : (
                  "Nothing to export in this range yet"
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Row 2 — filter bar */}
        <form data-wf="b-1-0" onSubmit={onApply} className="mt-7 p-4 sm:p-5" style={glass} noValidate>
          <div className="flex flex-col lg:flex-row lg:items-end gap-4">
            <div className="flex items-center gap-2 lg:pb-[11px]">
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(34,211,238,0.14)", color: brand.primaryColor }}
              >
                <Filter className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-[13px] font-semibold uppercase tracking-[0.14em]" style={{ color: brand.neutralColor }}>
                Date range
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex-1 min-w-[170px]">
                <Label htmlFor="rp-start" className="block mb-1.5 text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>
                  Start date
                </Label>
                <Input
                  data-wf="i-1-0-0"
                  id="rp-start"
                  type="date"
                  value={startInput}
                  onChange={(e) => setStartInput(e.target.value)}
                  aria-invalid={rangeError ? "true" : "false"}
                  aria-describedby={rangeError ? "rp-range-error" : undefined}
                  className="w-full px-3"
                  style={{ ...fieldStyle, borderColor: rangeError ? DANGER : fieldStyle.border }}
                />
              </div>
              <div className="flex-1 min-w-[170px]">
                <Label htmlFor="rp-end" className="block mb-1.5 text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>
                  End date
                </Label>
                <Input
                  data-wf="i-1-0-1"
                  id="rp-end"
                  type="date"
                  value={endInput}
                  onChange={(e) => setEndInput(e.target.value)}
                  aria-invalid={rangeError ? "true" : "false"}
                  aria-describedby={rangeError ? "rp-range-error" : undefined}
                  className="w-full px-3"
                  style={{ ...fieldStyle, borderColor: rangeError ? DANGER : fieldStyle.border }}
                />
              </div>
              <div className="sm:self-end">
                <Button
                  data-wf="i-1-0-2"
                  type="submit"
                  className="w-full sm:w-auto h-[44px] px-6 font-semibold transition-colors"
                  style={{
                    borderRadius: "12px",
                    backgroundColor: "rgba(34,211,238,0.14)",
                    border: "1px solid " + brand.primaryColor,
                    color: brand.primaryColor
                  }}
                >
                  Apply range
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-[12.5px]" style={{ color: brand.neutralColor }}>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1"
              style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              Showing {fmtLong(applied.start)} – {fmtLong(applied.end)}
            </span>
            {dirty && !rangeError ? (
              <span
                className="rp-fade inline-flex items-center gap-1.5 rounded-full px-3 py-1"
                style={{ backgroundColor: "rgba(232,121,249,0.12)", border: "1px solid rgba(232,121,249,0.4)", color: "rgba(255,255,255,0.88)" }}
              >
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                Dates changed — select Apply range to refresh the figures
              </span>
            ) : null}
          </div>
        </form>

        {/* Row 3 — validation */}
        {rangeError ? (
          <div
            data-wf="b-2-0"
            id="rp-range-error"
            role="alert"
            className="rp-fade mt-4 flex items-start gap-3 p-4"
            style={{
              borderRadius: brand.radius,
              backgroundColor: "rgba(255,95,122,0.10)",
              border: "1px solid rgba(255,95,122,0.45)"
            }}
          >
            <AlertCircle className="h-5 w-5 shrink-0 mt-[1px]" aria-hidden="true" style={{ color: DANGER }} />
            <p className="text-[14.5px] leading-6" style={{ color: "rgba(255,255,255,0.94)" }}>
              <strong className="font-semibold">{rangeError}</strong>{" "}
              <span style={{ color: brand.neutralColor }}>
                Your dates are kept as typed — swap them or pick a later end date, then apply again.
              </span>
            </p>
          </div>
        ) : null}

        {/* Row 4 — spending over time */}
        <section data-wf="b-3-0" className="mt-6 p-5 sm:p-7 relative overflow-hidden" style={glass}>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full"
            style={{ background: brand.accentColor, opacity: 0.18, filter: "blur(80px)" }}
          />
          <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h2 className="text-[19px] font-bold" style={{ fontFamily: brand.fontHeading, color: "#ffffff" }}>
                Spending over time — {rangeLabel}
              </h2>
              <p className="mt-1 text-[13px]" style={{ color: brand.neutralColor }}>
                {bucketWord} totals · {filtered.length} expense{filtered.length === 1 ? "" : "s"} in range
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[12px] uppercase tracking-[0.14em]" style={{ color: brand.neutralColor }}>
                Total in range
              </p>
              <p
                className="text-[34px] sm:text-[40px] font-extrabold leading-none mt-1"
                style={{ fontFamily: brand.fontHeading, color: "#ffffff", fontVariantNumeric: "tabular-nums" }}
              >
                {fmtMoney(total)}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="relative mt-8 flex items-end gap-2 sm:gap-3 h-[220px]" aria-hidden="true">
              {[62, 38, 24, 30, 70, 44, 28].map((h, i) => (
                <div key={i} className="rp-skel flex-1 rounded-t-[10px]" style={{ height: h + "%" }} />
              ))}
            </div>
          ) : !hasData ? (
            <div
              className="mt-8 h-[220px] flex flex-col items-center justify-center text-center px-6"
              style={{ border: "1px dashed rgba(255,255,255,0.18)", borderRadius: brand.radius }}
            >
              <p className="text-[15px] font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>
                Nothing to plot between {fmtShort(applied.start)} and {fmtLong(applied.end)}
              </p>
              <p className="mt-1.5 text-[13.5px]" style={{ color: brand.neutralColor }}>
                The chart stays blank rather than guessing at a trend.
              </p>
            </div>
          ) : (
            <React.Fragment>
              <div
                className="relative mt-8 h-[220px]"
                role="img"
                aria-label={
                  bucketWord +
                  " spending from " +
                  fmtLong(applied.start) +
                  " to " +
                  fmtLong(applied.end) +
                  ": " +
                  buckets.map((b) => b.label + " " + fmtMoney(b.total)).join(", ")
                }
              >
                <div
                  aria-hidden="true"
                  className="absolute left-0 right-0 border-t border-dashed"
                  style={{
                    bottom: maxBucket > 0 ? (avgBucket / maxBucket) * 100 + "%" : "0%",
                    borderColor: "rgba(255,255,255,0.28)"
                  }}
                />
                <div className="absolute inset-0 flex items-end gap-2 sm:gap-3">
                  {buckets.map((b, i) => {
                    const h = maxBucket > 0 ? Math.max((b.total / maxBucket) * 100, 1.5) : 1.5;
                    const isPeak = peak && b.key === peak.key && b.total > 0;
                    return (
                      <div key={b.key} className="flex-1 flex flex-col justify-end items-center gap-2 h-full">
                        <span
                          className="text-[11.5px] font-semibold"
                          style={{ color: isPeak ? brand.accentColor : "rgba(255,255,255,0.72)", fontVariantNumeric: "tabular-nums" }}
                        >
                          {b.total > 0 ? fmtMoneyShort(b.total) : "—"}
                        </span>
                        <div
                          className="rp-bar w-full"
                          style={{
                            height: h + "%",
                            animationDelay: i * 55 + "ms",
                            borderRadius: "10px 10px 5px 5px",
                            backgroundImage:
                              "linear-gradient(180deg, " + brand.accentColor + ", " + brand.primaryColor + ")",
                            boxShadow: isPeak ? "0 0 40px -4px " + brand.accentColor : "0 0 26px -8px " + brand.primaryColor,
                            opacity: b.total > 0 ? 1 : 0.35
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-3 flex gap-2 sm:gap-3">
                {buckets.map((b) => (
                  <span
                    key={b.key}
                    className="flex-1 text-center text-[11.5px]"
                    style={{ color: brand.neutralColor, fontVariantNumeric: "tabular-nums" }}
                  >
                    {b.label}
                  </span>
                ))}
              </div>
              <div className="mt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }} />
              <div className="mt-4 flex flex-wrap gap-x-7 gap-y-2 text-[13px]" style={{ color: brand.neutralColor }}>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>
                  {bucketWord} average{" "}
                  <strong className="font-semibold" style={{ color: "rgba(255,255,255,0.92)" }}>
                    {fmtMoney(avgBucket)}
                  </strong>{" "}
                  (dashed line)
                </span>
                {peak && peak.total > 0 ? (
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>
                    Busiest {bucketSize === 1 ? "day" : "week"}{" "}
                    <strong className="font-semibold" style={{ color: brand.accentColor }}>
                      {peak.label} · {fmtMoney(peak.total)}
                    </strong>
                  </span>
                ) : null}
              </div>
            </React.Fragment>
          )}
        </section>

        {/* Row 5 */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section data-wf="b-4-0" className="lg:col-span-6 p-5 sm:p-7" style={glass}>
            <h2 className="text-[19px] font-bold" style={{ fontFamily: brand.fontHeading, color: "#ffffff" }}>
              Spending by category
            </h2>
            <p className="mt-1 text-[13px]" style={{ color: brand.neutralColor }}>
              {byCategory.length} categor{byCategory.length === 1 ? "y" : "ies"} used in this range
            </p>

            {loading ? (
              <div className="mt-7 flex justify-center" aria-hidden="true">
                <div className="rp-skel h-[180px] w-[180px] rounded-full" />
              </div>
            ) : !hasData ? (
              <div
                className="mt-7 py-12 text-center px-6"
                style={{ border: "1px dashed rgba(255,255,255,0.18)", borderRadius: brand.radius }}
              >
                <p className="text-[15px] font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>
                  No categories to break down
                </p>
                <p className="mt-1.5 text-[13.5px]" style={{ color: brand.neutralColor }}>
                  Widen the range and the ring will fill in.
                </p>
              </div>
            ) : (
              <React.Fragment>
                <div className="mt-6 flex justify-center">
                  <div className="relative" style={{ width: 200, height: 200 }}>
                    <svg
                      viewBox="0 0 140 140"
                      width="200"
                      height="200"
                      role="img"
                      aria-label={
                        "Share of " +
                        fmtMoney(total) +
                        " by category: " +
                        byCategory.map((c) => c.name + " " + Math.round(c.share * 100) + " percent").join(", ")
                      }
                    >
                      <circle cx="70" cy="70" r={donutR} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="17" />
                      {segments.map((s) => (
                        <circle
                          key={s.id}
                          cx="70"
                          cy="70"
                          r={donutR}
                          fill="none"
                          stroke={s.color}
                          strokeWidth="17"
                          strokeDasharray={s.dash + " " + (donutC - s.dash)}
                          strokeDashoffset={s.offset}
                          transform="rotate(-90 70 70)"
                          style={{ transition: "stroke-dasharray .55s cubic-bezier(.2,.7,.3,1)" }}
                        />
                      ))}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[11px] uppercase tracking-[0.14em]" style={{ color: brand.neutralColor }}>
                        Total
                      </span>
                      <span
                        className="text-[22px] font-extrabold"
                        style={{ fontFamily: brand.fontHeading, color: "#ffffff", fontVariantNumeric: "tabular-nums" }}
                      >
                        {fmtMoney(total)}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="mt-6 text-[14px] leading-6 text-center px-2" style={{ color: brand.neutralColor }}>
                  <strong className="font-semibold" style={{ color: "rgba(255,255,255,0.95)" }}>
                    {byCategory[0].name}
                  </strong>{" "}
                  leads at{" "}
                  <span style={{ fontVariantNumeric: "tabular-nums", color: "rgba(255,255,255,0.95)" }}>
                    {Math.round(byCategory[0].share * 100)}%
                  </span>{" "}
                  of your spend — every category and total is listed alongside.
                </p>
              </React.Fragment>
            )}
          </section>

          <section data-wf="b-4-1" className="lg:col-span-6 p-5 sm:p-7" style={glass}>
            <h2 className="text-[19px] font-bold" style={{ fontFamily: brand.fontHeading, color: "#ffffff" }}>
              Category totals
            </h2>
            <p className="mt-1 text-[13px]" style={{ color: brand.neutralColor }}>
              Highest first, for {fmtShort(applied.start)} – {fmtLong(applied.end)}
            </p>

            {loading ? (
              <div className="mt-6 space-y-3" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="rp-skel h-10 rounded-[10px]" />
                ))}
              </div>
            ) : !hasData ? (
              <div
                className="mt-6 py-12 text-center px-6"
                style={{ border: "1px dashed rgba(255,255,255,0.18)", borderRadius: brand.radius }}
              >
                <p className="text-[15px] font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>
                  No totals yet for this range
                </p>
                <p className="mt-1.5 text-[13.5px]" style={{ color: brand.neutralColor }}>
                  Categories appear here as soon as expenses fall inside the dates.
                </p>
              </div>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <Table className="w-full" style={{ fontVariantNumeric: "tabular-nums", borderCollapse: "collapse" }}>
                  <THead>
                    <TR>
                      <TH
                        data-wf="i-4-1-0"
                        scope="col"
                        className="text-left text-[11.5px] uppercase tracking-[0.14em] font-semibold py-2.5"
                        style={{ color: brand.neutralColor, borderBottom: "1px solid rgba(255,255,255,0.14)", background: "transparent" }}
                      >
                        Category
                      </TH>
                      <TH
                        data-wf="i-4-1-1"
                        scope="col"
                        className="text-right text-[11.5px] uppercase tracking-[0.14em] font-semibold py-2.5"
                        style={{ color: brand.neutralColor, borderBottom: "1px solid rgba(255,255,255,0.14)", background: "transparent" }}
                      >
                        Total
                      </TH>
                      <TH
                        data-wf="i-4-1-2"
                        scope="col"
                        className="text-right text-[11.5px] uppercase tracking-[0.14em] font-semibold py-2.5 w-[34%]"
                        style={{ color: brand.neutralColor, borderBottom: "1px solid rgba(255,255,255,0.14)", background: "transparent" }}
                      >
                        Share
                      </TH>
                    </TR>
                  </THead>
                  <TBody>
                    {byCategory.map((c, i) => (
                      <TR
                        key={c.id}
                        className="rp-row transition-colors"
                        style={{ animationDelay: i * 45 + "ms", background: "transparent" }}
                      >
                        <TD className="py-3 text-[14.5px]" style={{ color: "rgba(255,255,255,0.94)", borderBottom: "1px solid rgba(255,255,255,0.09)" }}>
                          <span className="inline-flex items-center gap-2.5">
                            <span
                              aria-hidden="true"
                              className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: c.color, boxShadow: "0 0 12px " + c.color }}
                            />
                            {c.name}
                          </span>
                        </TD>
                        <TD
                          className="py-3 text-right text-[14.5px] font-semibold"
                          style={{ color: "#ffffff", borderBottom: "1px solid rgba(255,255,255,0.09)", fontVariantNumeric: "tabular-nums" }}
                        >
                          {fmtMoney(c.total)}
                        </TD>
                        <TD className="py-3 text-right" style={{ borderBottom: "1px solid rgba(255,255,255,0.09)" }}>
                          <span className="flex items-center justify-end gap-2.5">
                            <span
                              aria-hidden="true"
                              className="h-1.5 rounded-full overflow-hidden hidden sm:block"
                              style={{ width: 72, backgroundColor: "rgba(255,255,255,0.12)" }}
                            >
                              <span
                                className="block h-full rounded-full"
                                style={{
                                  width: Math.max(c.share * 100, 2) + "%",
                                  backgroundColor: c.color,
                                  transition: "width .5s cubic-bezier(.2,.7,.3,1)"
                                }}
                              />
                            </span>
                            <span
                              className="text-[13.5px] w-[44px] inline-block"
                              style={{ color: brand.neutralColor, fontVariantNumeric: "tabular-nums" }}
                            >
                              {(c.share * 100).toFixed(1)}%
                            </span>
                          </span>
                        </TD>
                      </TR>
                    ))}
                    <TR style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                      <TD className="py-3 text-[13px] font-semibold uppercase tracking-[0.12em]" style={{ color: brand.neutralColor }}>
                        All categories
                      </TD>
                      <TD
                        className="py-3 text-right text-[15px] font-extrabold"
                        style={{ color: brand.primaryColor, fontVariantNumeric: "tabular-nums" }}
                      >
                        {fmtMoney(total)}
                      </TD>
                      <TD className="py-3 text-right text-[13.5px]" style={{ color: brand.neutralColor, fontVariantNumeric: "tabular-nums" }}>
                        100.0%
                      </TD>
                    </TR>
                  </TBody>
                </Table>
              </div>
            )}
          </section>
        </div>

        {/* Row 6 — empty state */}
        {!loading && !hasData ? (
          <div
            data-wf="b-5-0"
            className="rp-fade rp-empty mt-6 p-8 sm:p-12 text-center"
            style={{
              ...glass,
              backgroundImage:
                "radial-gradient(520px 180px at 50% 0%, rgba(232,121,249,0.16), rgba(255,255,255,0.02))"
            }}
          >
            <Empty
              className="rp-empty"
              title={"No expenses in " + fmtShort(applied.start) + " – " + fmtLong(applied.end) + "."}
              description="Try a wider range or log an expense."
              action={
                <Button
                  type="button"
                  onClick={() => navigate("expenses")}
                  className="h-[46px] px-6 font-semibold transition-transform hover:-translate-y-[1px]"
                  style={{
                    borderRadius: brand.radius,
                    border: "none",
                    color: brand.backgroundColor,
                    backgroundImage: "linear-gradient(100deg, " + brand.primaryColor + ", " + brand.accentColor + ")",
                    boxShadow: "0 16px 40px -14px " + brand.accentColor + "aa"
                  }}
                >
                  <span className="inline-flex items-center gap-2">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Log an expense
                  </span>
                </Button>
              }
            />
          </div>
        ) : null}

        <p className="mt-8 text-[12.5px]" style={{ color: brand.neutralColor }}>
          Figures are built from your account's expenses only, in GBP. Budgets and alerts aren't part of this version.
        </p>
      </div>
    </div>
  );
}
