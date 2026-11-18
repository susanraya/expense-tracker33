// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Input, Textarea, Label, Select, Badge, Table, THead, TBody, TR, TH, TD, Empty } = UI;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Edit, Filter } = Icons;

const CATEGORIES = [
  { id: "cat_grocery", name: "Groceries" },
  { id: "cat_transport", name: "Transport" },
  { id: "cat_coffee", name: "Coffee & Snacks" },
  { id: "cat_bills", name: "Rent & Bills" },
  { id: "cat_dining", name: "Dining Out" },
  { id: "cat_health", name: "Health" },
  { id: "cat_subs", name: "Subscriptions" },
  { id: "cat_travel", name: "Travel" },
];

const SEED_EXPENSES = [
  { id: "exp_2061", category_id: "cat_grocery", amount: 64.2, spent_on: "2026-11-18", note: "Whole Foods — weekly shop" },
  { id: "exp_2060", category_id: "cat_coffee", amount: 5.75, spent_on: "2026-11-17", note: "Flat white at Rook & Rye" },
  { id: "exp_2059", category_id: "cat_transport", amount: 2.9, spent_on: "2026-11-17", note: "" },
  { id: "exp_2058", category_id: "cat_dining", amount: 48.6, spent_on: "2026-11-16", note: "Dinner with Priya — Saffron Hill" },
  { id: "exp_2057", category_id: "cat_subs", amount: 17.99, spent_on: "2026-11-15", note: "Spotify family plan" },
  { id: "exp_2056", category_id: "cat_grocery", amount: 23.85, spent_on: "2026-11-14", note: "Farmers market — produce" },
  { id: "exp_2055", category_id: "cat_health", amount: 35.0, spent_on: "2026-11-13", note: "Physio session" },
  { id: "exp_2054", category_id: "cat_transport", amount: 41.3, spent_on: "2026-11-12", note: "Rideshare to the airport" },
  { id: "exp_2053", category_id: "cat_travel", amount: 212.4, spent_on: "2026-11-11", note: "Train to Boston, return" },
  { id: "exp_2052", category_id: "cat_bills", amount: 1450.0, spent_on: "2026-11-09", note: "November rent" },
  { id: "exp_2051", category_id: "cat_coffee", amount: 9.4, spent_on: "2026-11-08", note: "Bagels for the Monday standup" },
  { id: "exp_2050", category_id: "cat_bills", amount: 88.12, spent_on: "2026-11-05", note: "Con Edison — electricity" },
  { id: "exp_2049", category_id: "cat_dining", amount: 26.75, spent_on: "2026-11-03", note: "Lunch at Mercado Little Spain" },
  { id: "exp_2048", category_id: "cat_subs", amount: 12.99, spent_on: "2026-11-01", note: "iCloud storage" },
  { id: "exp_2047", category_id: "cat_grocery", amount: 71.05, spent_on: "2026-10-29", note: "Trader Joe's" },
  { id: "exp_2046", category_id: "cat_health", amount: 22.5, spent_on: "2026-10-27", note: "Pharmacy — allergy refill" },
  { id: "exp_2045", category_id: "cat_travel", amount: 139.0, spent_on: "2026-10-24", note: "Hotel night, Philadelphia" },
  { id: "exp_2044", category_id: "cat_transport", amount: 2.9, spent_on: "2026-10-21", note: "" },
  { id: "exp_2043", category_id: "cat_dining", amount: 55.4, spent_on: "2026-10-18", note: "Birthday dinner for Marcus" },
];

const PERIODS = [
  { key: "month", label: "This month" },
  { key: "days30", label: "Last 30 days" },
  { key: "lastmonth", label: "Last month" },
  { key: "all", label: "All time" },
];

const TODAY_ISO = "2026-11-18";

export default function Screen() {
  const navigate = useNavigate();
  const ink = "#eaf3ff";
  const glass = {
    backgroundColor: "rgba(255,255,255,0.055)",
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: brand.radius,
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
  };
  const fieldStyle = {
    backgroundColor: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: "12px",
    color: ink,
    width: "100%",
    minHeight: "46px",
    padding: "10px 12px",
    fontFamily: brand.fontBody,
  };
  const optionStyle = { backgroundColor: "#0a1d3a", color: ink };

  const [expenses, setExpenses] = React.useState(SEED_EXPENSES);
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [period, setPeriod] = React.useState("month");
  const [sync, setSync] = React.useState("syncing");
  const [rowConfirm, setRowConfirm] = React.useState(null);
  const [toast, setToast] = React.useState(null);
  const [justSavedId, setJustSavedId] = React.useState(null);

  const [modal, setModal] = React.useState({ open: false, mode: "add", id: null });
  const [form, setForm] = React.useState({ amount: "", spent_on: TODAY_ISO, category_id: "", note: "" });
  const [errors, setErrors] = React.useState({});
  const [saving, setSaving] = React.useState(false);
  const [modalConfirmDelete, setModalConfirmDelete] = React.useState(false);

  const dialogRef = React.useRef(null);
  const saveTimer = React.useRef(null);
  const nextId = React.useRef(2100);

  React.useEffect(() => {
    const t = setTimeout(() => setSync("ready"), 1000);
    return () => clearTimeout(t);
  }, []);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  React.useEffect(() => () => clearTimeout(saveTimer.current), []);

  const money = (n) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
  const parseDay = (iso) => {
    const p = String(iso).split("-");
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  };
  const fmtDay = (iso) => {
    const d = parseDay(iso);
    return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }).format(d);
  };
  const catName = (id) => (CATEGORIES.find((c) => c.id === id) || { name: "Uncategorised" }).name;

  const today = parseDay(TODAY_ISO);
  const inPeriod = (iso) => {
    const d = parseDay(iso);
    if (period === "all") return true;
    if (period === "month") return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth();
    if (period === "lastmonth") {
      const lm = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      return d.getFullYear() === lm.getFullYear() && d.getMonth() === lm.getMonth();
    }
    const cutoff = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29);
    return d >= cutoff && d <= today;
  };

  const sorted = React.useMemo(
    () => expenses.slice().sort((a, b) => (a.spent_on < b.spent_on ? 1 : a.spent_on > b.spent_on ? -1 : b.id.localeCompare(a.id))),
    [expenses]
  );
  const filtered = sorted.filter(
    (e) => inPeriod(e.spent_on) && (categoryFilter === "all" || e.category_id === categoryFilter)
  );
  const shownTotal = filtered.reduce((s, e) => s + e.amount, 0);
  const maxAmount = filtered.reduce((m, e) => Math.max(m, e.amount), 0) || 1;
  const filtersActive = categoryFilter !== "all" || period !== "month";
  const periodLabel = (PERIODS.find((p) => p.key === period) || PERIODS[0]).label;

  function openAdd() {
    setForm({ amount: "", spent_on: TODAY_ISO, category_id: "", note: "" });
    setErrors({});
    setModalConfirmDelete(false);
    setModal({ open: true, mode: "add", id: null });
  }
  function openEdit(exp) {
    setForm({
      amount: exp.amount.toFixed(2),
      spent_on: exp.spent_on,
      category_id: exp.category_id,
      note: exp.note || "",
    });
    setErrors({});
    setModalConfirmDelete(false);
    setModal({ open: true, mode: "edit", id: exp.id });
  }
  function closeModal() {
    clearTimeout(saveTimer.current);
    setSaving(false);
    setModalConfirmDelete(false);
    setModal({ open: false, mode: "add", id: null });
  }

  React.useEffect(() => {
    if (!modal.open) return;
    const node = dialogRef.current;
    const previous = document.activeElement;
    const first = node && node.querySelector("[data-autofocus]");
    if (first) first.focus();
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeModal();
        return;
      }
      if (e.key === "Tab" && node) {
        const list = Array.prototype.slice
          .call(node.querySelectorAll("button, input, select, textarea, a[href]"))
          .filter((n) => !n.disabled && n.offsetParent !== null);
        if (!list.length) return;
        const i = list.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) {
          e.preventDefault();
          list[list.length - 1].focus();
        } else if (!e.shiftKey && i === list.length - 1) {
          e.preventDefault();
          list[0].focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (previous && previous.focus) previous.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal.open]);

  function validate(f) {
    const next = {};
    const raw = String(f.amount).trim();
    const n = Number(raw.replace(/[$,\s]/g, ""));
    if (!raw) next.amount = "Enter an amount, for example 24.50.";
    else if (!isFinite(n) || Number.isNaN(n)) next.amount = "Amounts take numbers only — try 24.50.";
    else if (n <= 0) next.amount = "Amount must be greater than zero.";
    if (!f.spent_on) next.spent_on = "Pick the date you spent it.";
    if (!f.category_id) next.category_id = "Choose one of your categories.";
    return next;
  }

  function submit(e) {
    e.preventDefault();
    const next = validate(form);
    setErrors(next);
    if (Object.keys(next).length) {
      const el = dialogRef.current && dialogRef.current.querySelector("[aria-invalid='true']");
      if (el) el.focus();
      return;
    }
    const amount = Number(String(form.amount).replace(/[$,\s]/g, ""));
    setSaving(true);
    saveTimer.current = setTimeout(() => {
      let savedId = modal.id;
      if (modal.mode === "add") {
        nextId.current += 1;
        savedId = "exp_" + nextId.current;
        setExpenses((prev) =>
          prev.concat([
            { id: savedId, category_id: form.category_id, amount, spent_on: form.spent_on, note: form.note.trim() },
          ])
        );
      } else {
        setExpenses((prev) =>
          prev.map((x) =>
            x.id === modal.id
              ? { ...x, amount, spent_on: form.spent_on, category_id: form.category_id, note: form.note.trim() }
              : x
          )
        );
      }
      setSaving(false);
      setJustSavedId(savedId);
      setToast({
        kind: "ok",
        text:
          (modal.mode === "add" ? "Saved " : "Updated ") +
          money(amount) +
          " · " +
          catName(form.category_id) +
          " · " +
          fmtDay(form.spent_on),
      });
      setModal({ open: false, mode: "add", id: null });
    }, 480);
  }

  function removeExpense(id) {
    const victim = expenses.find((x) => x.id === id);
    setExpenses((prev) => prev.filter((x) => x.id !== id));
    setRowConfirm(null);
    closeModal();
    setToast({
      kind: "gone",
      text: "Deleted " + money(victim ? victim.amount : 0) + (victim && victim.note ? " — " + victim.note : ""),
    });
  }

  const css =
    ".np-focus:focus-visible{outline:2px solid " +
    brand.primaryColor +
    ";outline-offset:2px;border-radius:14px}" +
    ".np-field:focus{outline:2px solid " +
    brand.primaryColor +
    ";outline-offset:1px}" +
    "@keyframes npRowIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}" +
    "@keyframes npPop{from{opacity:0;transform:translateY(10px) scale(.985)}to{opacity:1;transform:none}}" +
    "@keyframes npFadeIn{from{opacity:0}to{opacity:1}}" +
    "@keyframes npSpin{to{transform:rotate(360deg)}}" +
    "@keyframes npPulse{0%,100%{opacity:.45}50%{opacity:1}}" +
    ".np-rowin{animation:npRowIn .34s cubic-bezier(.2,.7,.3,1)}" +
    ".np-pop{animation:npPop .22s cubic-bezier(.2,.7,.3,1)}" +
    ".np-fade{animation:npFadeIn .2s ease-out}" +
    ".np-spin{animation:npSpin .7s linear infinite}" +
    ".np-pulsing{animation:npPulse 1.4s ease-in-out infinite}" +
    ".np-empty *{color:" +
    brand.neutralColor +
    " !important}" +
    ".np-empty h1,.np-empty h2,.np-empty h3,.np-empty h4{color:" +
    ink +
    " !important;font-weight:700}" +
    ".np-empty button{color:" +
    brand.backgroundColor +
    " !important}" +
    "@media (prefers-reduced-motion: reduce){.np-rowin,.np-pop,.np-fade,.np-spin,.np-pulsing{animation:none !important}" +
    ".np-bar{transition:none !important}}";

  const pillBtn = {
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.05)",
    color: ink,
  };

  return (
    <div
      className="relative min-h-full px-4 sm:px-6 lg:px-8 py-8 lg:py-10"
      style={{ fontFamily: brand.fontBody, color: ink }}
    >
      <style>{css}</style>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -left-24 h-96 w-96 rounded-full"
          style={{ background: brand.primaryColor, opacity: 0.16, filter: "blur(120px)" }}
        />
        <div
          className="absolute -top-24 right-0 h-80 w-80 rounded-full"
          style={{ background: brand.accentColor, opacity: 0.14, filter: "blur(130px)" }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-6xl">
        {/* Row 1 */}
        <div className="grid grid-cols-12 gap-4 items-end">
          <div data-wf="b-0-0" className="col-span-12 sm:col-span-8">
            <p
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: brand.primaryColor }}
            >
              Your ledger
            </p>
            <h1
              className="mt-2 text-4xl sm:text-5xl font-black tracking-tight"
              style={{ fontFamily: brand.fontHeading, color: ink }}
            >
              Expenses
            </h1>
            <p className="mt-2 text-sm max-w-[62ch]" style={{ color: brand.neutralColor }}>
              Every entry you have logged, newest first. Add, correct or remove one without leaving this list.
            </p>
          </div>
          <div className="col-span-12 sm:col-span-4 flex sm:justify-end">
            <button
              type="button"
              data-wf="b-0-1"
              onClick={openAdd}
              className="np-focus inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 h-12 text-sm font-bold transition-transform duration-150 hover:-translate-y-0.5"
              style={{
                borderRadius: brand.radius,
                color: brand.backgroundColor,
                backgroundImage:
                  "linear-gradient(120deg, " + brand.primaryColor + ", " + brand.accentColor + ")",
                boxShadow: "0 18px 48px -14px " + brand.accentColor,
              }}
            >
              <Icons.Plus className="h-4 w-4" aria-hidden="true" />
              Add expense
            </button>
          </div>
        </div>

        {/* Row 2 */}
        <section
          data-wf="b-1-0"
          aria-labelledby="filter-heading"
          className="mt-8 px-4 sm:px-5 py-4"
          style={glass}
        >
          <h2 id="filter-heading" className="sr-only">
            Filter expenses
          </h2>
          <div className="flex flex-col lg:flex-row lg:items-end gap-4">
            <div className="flex items-center gap-2 lg:pb-3">
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(34,211,238,0.14)", color: brand.primaryColor }}
              >
                <Icons.Filter className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold">Filters</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              <div>
                <Label
                  htmlFor="filter-category"
                  className="block mb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]"
                  style={{ color: brand.neutralColor }}
                >
                  Category
                </Label>
                <Select
                  id="filter-category"
                  data-wf="i-1-0-0"
                  className="np-field"
                  style={fieldStyle}
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setRowConfirm(null);
                  }}
                >
                  <option value="all" style={optionStyle}>
                    All categories
                  </option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id} style={optionStyle}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="filter-period"
                  className="block mb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]"
                  style={{ color: brand.neutralColor }}
                >
                  Period
                </Label>
                <Select
                  id="filter-period"
                  data-wf="i-1-0-1"
                  className="np-field"
                  style={fieldStyle}
                  value={period}
                  onChange={(e) => {
                    setPeriod(e.target.value);
                    setRowConfirm(null);
                  }}
                >
                  {PERIODS.map((p) => (
                    <option key={p.key} value={p.key} style={optionStyle}>
                      {p.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="lg:pb-3 flex items-center gap-2" aria-live="polite">
              {sync === "syncing" ? (
                <span
                  className="np-pulsing inline-flex items-center gap-2 px-3 h-9 text-xs font-semibold"
                  style={{ ...pillBtn, color: brand.neutralColor }}
                >
                  <Icons.Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  Syncing your entries…
                </span>
              ) : (
                <span
                  className="np-fade inline-flex items-center gap-2 px-3 h-9 text-xs font-semibold"
                  style={{ ...pillBtn, color: brand.neutralColor }}
                >
                  <Icons.Check className="h-3.5 w-3.5" style={{ color: brand.primaryColor }} aria-hidden="true" />
                  Up to date · 09:42
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Row 3 */}
        <Card data-wf="b-2-0" className="mt-6 overflow-hidden" style={glass}>
          <CardHeader
            className="px-5 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div>
              <CardTitle
                className="text-lg font-bold"
                style={{ color: ink, fontFamily: brand.fontHeading }}
              >
                My expenses — newest first
              </CardTitle>
              <CardDescription className="mt-1 text-sm" style={{ color: brand.neutralColor }}>
                {periodLabel}
                {categoryFilter === "all" ? "" : " · " + catName(categoryFilter)}
              </CardDescription>
            </div>
            <p
              className="text-sm font-semibold"
              style={{ color: brand.neutralColor, fontVariantNumeric: "tabular-nums" }}
            >
              <span style={{ color: ink }}>{filtered.length}</span> of {expenses.length} entries ·{" "}
              <span style={{ color: brand.primaryColor }}>{money(shownTotal)}</span> shown
            </p>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="w-full text-left" style={{ fontVariantNumeric: "tabular-nums" }}>
                <THead>
                  <TR style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <TH
                      data-wf="i-2-0-0"
                      scope="col"
                      className="px-5 sm:px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em]"
                      style={{ color: brand.neutralColor }}
                    >
                      Date
                    </TH>
                    <TH
                      data-wf="i-2-0-1"
                      scope="col"
                      className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-right"
                      style={{ color: brand.neutralColor }}
                    >
                      Amount
                    </TH>
                    <TH
                      data-wf="i-2-0-2"
                      scope="col"
                      className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em]"
                      style={{ color: brand.neutralColor }}
                    >
                      Category
                    </TH>
                    <TH
                      data-wf="i-2-0-3"
                      scope="col"
                      className="hidden md:table-cell px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em]"
                      style={{ color: brand.neutralColor }}
                    >
                      Note
                    </TH>
                    <TH
                      data-wf="i-2-0-4"
                      scope="col"
                      className="px-5 sm:px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-right"
                      style={{ color: brand.neutralColor }}
                    >
                      Actions
                    </TH>
                  </TR>
                </THead>
                <TBody>
                  {filtered.length === 0 ? (
                    <TR>
                      <TD colSpan={5} className="px-5 sm:px-6 py-10">
                        {/* Row 4 */}
                        <div data-wf="b-3-0" className="np-fade mx-auto max-w-xl text-center">
                          <div
                            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center"
                            style={{
                              borderRadius: brand.radius,
                              border: "1px solid rgba(255,255,255,0.16)",
                              backgroundImage:
                                "linear-gradient(140deg, rgba(34,211,238,0.18), rgba(232,121,249,0.18))",
                              boxShadow: "0 24px 60px -24px " + brand.accentColor,
                            }}
                          >
                            <Icons.FileText className="h-7 w-7" style={{ color: ink }} aria-hidden="true" />
                          </div>
                          {expenses.length === 0 ? (
                            <Empty
                              className="np-empty"
                              title="No expenses yet"
                              description="No expenses yet. Add your first expense to start tracking your spending."
                              action={
                                <button
                                  type="button"
                                  onClick={openAdd}
                                  className="np-focus inline-flex items-center gap-2 px-5 h-11 text-sm font-bold"
                                  style={{
                                    borderRadius: brand.radius,
                                    color: brand.backgroundColor,
                                    backgroundImage:
                                      "linear-gradient(120deg, " +
                                      brand.primaryColor +
                                      ", " +
                                      brand.accentColor +
                                      ")",
                                  }}
                                >
                                  <Icons.Plus className="h-4 w-4" aria-hidden="true" />
                                  Add your first expense
                                </button>
                              }
                            />
                          ) : (
                            <Empty
                              className="np-empty"
                              title="Nothing matches those filters"
                              description={
                                "You have " +
                                expenses.length +
                                " entries, but none in " +
                                periodLabel.toLowerCase() +
                                (categoryFilter === "all" ? "" : " under " + catName(categoryFilter)) +
                                ". Widen the period or pick another category."
                              }
                              action={
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCategoryFilter("all");
                                    setPeriod("all");
                                  }}
                                  className="np-focus inline-flex items-center gap-2 px-5 h-11 text-sm font-bold"
                                  style={{
                                    borderRadius: brand.radius,
                                    color: brand.backgroundColor,
                                    backgroundImage:
                                      "linear-gradient(120deg, " +
                                      brand.primaryColor +
                                      ", " +
                                      brand.accentColor +
                                      ")",
                                  }}
                                >
                                  <Icons.X className="h-4 w-4" aria-hidden="true" />
                                  Clear filters
                                </button>
                              }
                            />
                          )}
                        </div>
                      </TD>
                    </TR>
                  ) : (
                    filtered.map((e) => {
                      const confirming = rowConfirm === e.id;
                      return (
                        <TR
                          key={e.id}
                          className={justSavedId === e.id ? "np-rowin" : ""}
                          style={{
                            borderBottom: "1px solid rgba(255,255,255,0.08)",
                            backgroundColor: confirming
                              ? "rgba(232,121,249,0.09)"
                              : justSavedId === e.id
                              ? "rgba(34,211,238,0.07)"
                              : "transparent",
                          }}
                        >
                          <TD className="px-5 sm:px-6 py-4 align-middle whitespace-nowrap">
                            <span className="text-sm font-semibold" style={{ color: ink }}>
                              {fmtDay(e.spent_on)}
                            </span>
                            <span className="block text-xs" style={{ color: brand.neutralColor }}>
                              {parseDay(e.spent_on).getFullYear()}
                            </span>
                          </TD>
                          <TD className="px-4 py-4 align-middle text-right whitespace-nowrap">
                            <span className="text-base font-bold" style={{ color: ink }}>
                              {money(e.amount)}
                            </span>
                            <span
                              aria-hidden="true"
                              className="mt-1.5 ml-auto block h-[3px] rounded-full np-bar transition-all duration-500"
                              style={{
                                width: Math.max(10, Math.round((e.amount / maxAmount) * 100)) + "%",
                                maxWidth: "120px",
                                backgroundImage:
                                  "linear-gradient(90deg, " +
                                  brand.primaryColor +
                                  ", " +
                                  brand.accentColor +
                                  ")",
                                boxShadow: "0 0 12px -2px " + brand.accentColor,
                              }}
                            />
                          </TD>
                          <TD className="px-4 py-4 align-middle">
                            <Badge
                              className="inline-flex items-center px-3 py-1 text-xs font-semibold whitespace-nowrap"
                              style={{
                                borderRadius: "999px",
                                color: ink,
                                backgroundColor: "rgba(255,255,255,0.07)",
                                border: "1px solid rgba(255,255,255,0.16)",
                              }}
                            >
                              {catName(e.category_id)}
                            </Badge>
                          </TD>
                          <TD
                            className="hidden md:table-cell px-4 py-4 align-middle text-sm max-w-[22rem]"
                            style={{ color: brand.neutralColor }}
                          >
                            {e.note ? e.note : <span aria-label="No note">—</span>}
                          </TD>
                          <TD className="px-5 sm:px-6 py-4 align-middle">
                            {confirming ? (
                              <div className="np-pop flex items-center justify-end gap-2">
                                <span className="hidden sm:inline text-xs font-semibold" style={{ color: ink }}>
                                  Delete this entry?
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeExpense(e.id)}
                                  className="np-focus inline-flex items-center gap-1.5 h-11 px-3 text-xs font-bold"
                                  style={{
                                    borderRadius: "12px",
                                    color: brand.backgroundColor,
                                    backgroundColor: brand.accentColor,
                                  }}
                                >
                                  <Icons.Check className="h-4 w-4" aria-hidden="true" />
                                  Yes, delete
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRowConfirm(null)}
                                  className="np-focus inline-flex items-center h-11 px-3 text-xs font-semibold"
                                  style={{ ...pillBtn, borderRadius: "12px" }}
                                >
                                  Keep
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => openEdit(e)}
                                  aria-label={"Edit expense " + money(e.amount) + " on " + fmtDay(e.spent_on)}
                                  className="np-focus inline-flex h-11 w-11 items-center justify-center transition-colors duration-150 hover:bg-white/10"
                                  style={{ ...pillBtn, borderRadius: "12px" }}
                                >
                                  <Icons.Edit className="h-4 w-4" aria-hidden="true" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRowConfirm(e.id)}
                                  aria-label={"Delete expense " + money(e.amount) + " on " + fmtDay(e.spent_on)}
                                  className="np-focus inline-flex h-11 w-11 items-center justify-center transition-colors duration-150 hover:bg-white/10"
                                  style={{ ...pillBtn, borderRadius: "12px", color: brand.accentColor }}
                                >
                                  <Icons.Trash className="h-4 w-4" aria-hidden="true" />
                                </button>
                              </div>
                            )}
                          </TD>
                        </TR>
                      );
                    })
                  )}
                </TBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter
            className="px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3 text-xs"
            style={{ borderTop: "1px solid rgba(255,255,255,0.1)", color: brand.neutralColor }}
          >
            <span>Amounts are in US dollars, the only currency this version tracks.</span>
            <span className="inline-flex items-center gap-1.5">
              <Icons.AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
              Deleting an entry removes it from your reports too.
            </span>
          </CardFooter>
        </Card>

        {filtersActive && filtered.length > 0 ? (
          <p className="mt-4 text-xs" style={{ color: brand.neutralColor }}>
            Filtered view — {filtered.length} of {expenses.length} entries.
          </p>
        ) : null}
      </div>

      {/* Rows 5–7: add / edit dialog */}
      {modal.open ? (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div
            className="np-fade absolute inset-0"
            style={{ backgroundColor: "rgba(3,10,22,0.76)", backdropFilter: "blur(6px)" }}
            onClick={closeModal}
            aria-hidden="true"
          />
          <div
            data-wf="b-4-0"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="expense-dialog-title"
            className="np-pop relative w-full sm:max-w-xl max-h-[92vh] overflow-y-auto"
            style={{
              ...glass,
              backgroundColor: "rgba(12,30,58,0.92)",
              boxShadow: "0 40px 120px -30px " + brand.accentColor,
            }}
          >
            <form onSubmit={submit} noValidate>
              <div
                className="px-5 sm:px-7 py-5 flex items-start justify-between gap-4"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
              >
                <div>
                  <h2
                    id="expense-dialog-title"
                    className="text-2xl font-black tracking-tight"
                    style={{ fontFamily: brand.fontHeading, color: ink }}
                  >
                    {modal.mode === "add" ? "Add expense" : "Edit expense"}
                  </h2>
                  <p className="mt-1 text-sm" style={{ color: brand.neutralColor }}>
                    {modal.mode === "add"
                      ? "One-off entry, logged to your account only."
                      : "Correcting entry " + modal.id + "."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Close add expense dialog"
                  className="np-focus inline-flex h-11 w-11 shrink-0 items-center justify-center transition-colors duration-150 hover:bg-white/10"
                  style={{ ...pillBtn, borderRadius: "12px" }}
                >
                  <Icons.X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="px-5 sm:px-7 py-6 space-y-5">
                {Object.keys(errors).length > 0 ? (
                  <div
                    className="np-pop flex items-start gap-3 px-4 py-3"
                    style={{
                      borderRadius: "14px",
                      border: "1px solid " + brand.accentColor,
                      backgroundColor: "rgba(232,121,249,0.12)",
                    }}
                    role="alert"
                  >
                    <Icons.AlertCircle
                      className="h-5 w-5 shrink-0 mt-0.5"
                      style={{ color: brand.accentColor }}
                      aria-hidden="true"
                    />
                    <p className="text-sm" style={{ color: ink }}>
                      Nothing was saved — fix the highlighted {Object.keys(errors).length === 1 ? "field" : "fields"}{" "}
                      below. What you typed is still here.
                    </p>
                  </div>
                ) : null}

                <div>
                  <Label
                    htmlFor="f-amount"
                    className="block mb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]"
                    style={{ color: brand.neutralColor }}
                  >
                    Amount
                  </Label>
                  <div className="relative">
                    <span
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold"
                      style={{ color: brand.primaryColor }}
                      aria-hidden="true"
                    >
                      $
                    </span>
                    <Input
                      id="f-amount"
                      data-wf="i-4-0-0"
                      data-autofocus="true"
                      type="text"
                      inputMode="decimal"
                      className="np-field text-lg font-bold"
                      style={{
                        ...fieldStyle,
                        paddingLeft: "32px",
                        minHeight: "56px",
                        fontVariantNumeric: "tabular-nums",
                        borderColor: errors.amount ? brand.accentColor : "rgba(255,255,255,0.16)",
                      }}
                      value={form.amount}
                      aria-invalid={errors.amount ? "true" : "false"}
                      aria-describedby={errors.amount ? "err-amount rules-text" : "rules-text"}
                      onChange={(ev) => setForm({ ...form, amount: ev.target.value })}
                    />
                  </div>
                  {errors.amount ? (
                    <p id="err-amount" className="mt-1.5 text-xs font-semibold" style={{ color: brand.accentColor }}>
                      {errors.amount}
                    </p>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <Label
                      htmlFor="f-date"
                      className="block mb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]"
                      style={{ color: brand.neutralColor }}
                    >
                      Date spent
                    </Label>
                    <Input
                      id="f-date"
                      data-wf="i-4-0-1"
                      type="date"
                      className="np-field"
                      style={{
                        ...fieldStyle,
                        colorScheme: "dark",
                        borderColor: errors.spent_on ? brand.accentColor : "rgba(255,255,255,0.16)",
                      }}
                      value={form.spent_on}
                      aria-invalid={errors.spent_on ? "true" : "false"}
                      aria-describedby={errors.spent_on ? "err-date" : undefined}
                      onChange={(ev) => setForm({ ...form, spent_on: ev.target.value })}
                    />
                    {errors.spent_on ? (
                      <p id="err-date" className="mt-1.5 text-xs font-semibold" style={{ color: brand.accentColor }}>
                        {errors.spent_on}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <Label
                      htmlFor="f-category"
                      className="block mb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]"
                      style={{ color: brand.neutralColor }}
                    >
                      Category
                    </Label>
                    <Select
                      id="f-category"
                      data-wf="i-4-0-2"
                      className="np-field"
                      style={{
                        ...fieldStyle,
                        borderColor: errors.category_id ? brand.accentColor : "rgba(255,255,255,0.16)",
                      }}
                      value={form.category_id}
                      aria-invalid={errors.category_id ? "true" : "false"}
                      aria-describedby={errors.category_id ? "err-category" : undefined}
                      onChange={(ev) => setForm({ ...form, category_id: ev.target.value })}
                    >
                      <option value="" style={optionStyle}>
                        Select a category
                      </option>
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id} style={optionStyle}>
                          {c.name}
                        </option>
                      ))}
                    </Select>
                    {errors.category_id ? (
                      <p
                        id="err-category"
                        className="mt-1.5 text-xs font-semibold"
                        style={{ color: brand.accentColor }}
                      >
                        {errors.category_id}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="f-note"
                    className="block mb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]"
                    style={{ color: brand.neutralColor }}
                  >
                    Note (optional)
                  </Label>
                  <Textarea
                    id="f-note"
                    data-wf="i-4-0-3"
                    rows={3}
                    className="np-field"
                    style={{ ...fieldStyle, minHeight: "88px", resize: "vertical" }}
                    value={form.note}
                    placeholder="What was it for?"
                    onChange={(ev) => setForm({ ...form, note: ev.target.value })}
                  />
                </div>

                {/* Row 6 */}
                <p
                  id="rules-text"
                  data-wf="b-5-0"
                  className="text-xs leading-relaxed"
                  style={{ color: brand.neutralColor }}
                >
                  Amount must be a positive number. Date and category are required.
                </p>

                {modalConfirmDelete ? (
                  <div
                    className="np-pop flex items-start gap-3 px-4 py-3"
                    style={{
                      borderRadius: "14px",
                      border: "1px solid " + brand.accentColor,
                      backgroundColor: "rgba(232,121,249,0.12)",
                    }}
                    role="alert"
                  >
                    <Icons.Trash
                      className="h-5 w-5 shrink-0 mt-0.5"
                      style={{ color: brand.accentColor }}
                      aria-hidden="true"
                    />
                    <p className="text-sm" style={{ color: ink }}>
                      Press <strong>Confirm delete</strong> to remove this entry for good. It will disappear from your
                      list and your reports.
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Row 7 */}
              <div
                className="px-5 sm:px-7 py-5 grid grid-cols-1 sm:grid-cols-3 gap-3"
                style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
              >
                <button
                  type="submit"
                  data-wf="b-6-0"
                  disabled={saving}
                  className="np-focus inline-flex items-center justify-center gap-2 h-12 px-4 text-sm font-bold transition-transform duration-150 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-70"
                  style={{
                    borderRadius: brand.radius,
                    color: brand.backgroundColor,
                    backgroundImage:
                      "linear-gradient(120deg, " + brand.primaryColor + ", " + brand.accentColor + ")",
                    boxShadow: "0 18px 48px -18px " + brand.accentColor,
                  }}
                >
                  {saving ? (
                    <React.Fragment>
                      <span
                        className="np-spin inline-block h-4 w-4 rounded-full"
                        style={{
                          border: "2px solid rgba(6,20,43,0.35)",
                          borderTopColor: brand.backgroundColor,
                        }}
                        aria-hidden="true"
                      />
                      Saving…
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <Icons.Check className="h-4 w-4" aria-hidden="true" />
                      Save expense
                    </React.Fragment>
                  )}
                </button>

                <button
                  type="button"
                  data-wf="b-6-1"
                  disabled={modal.mode === "add" || saving}
                  onClick={() => {
                    if (modalConfirmDelete) removeExpense(modal.id);
                    else setModalConfirmDelete(true);
                  }}
                  aria-describedby={modal.mode === "add" ? "delete-hint" : undefined}
                  className="np-focus inline-flex items-center justify-center gap-2 h-12 px-4 text-sm font-bold transition-colors duration-150 enabled:hover:bg-white/10 disabled:opacity-45 disabled:cursor-not-allowed"
                  style={{
                    borderRadius: brand.radius,
                    border: "1px solid " + (modal.mode === "add" ? "rgba(255,255,255,0.16)" : brand.accentColor),
                    backgroundColor: modalConfirmDelete ? "rgba(232,121,249,0.18)" : "transparent",
                    color: modal.mode === "add" ? brand.neutralColor : brand.accentColor,
                  }}
                >
                  <Icons.Trash className="h-4 w-4" aria-hidden="true" />
                  {modalConfirmDelete ? "Confirm delete" : "Delete expense"}
                </button>

                <button
                  type="button"
                  data-wf="b-6-2"
                  onClick={() => navigate("categories")}
                  className="np-focus inline-flex items-center justify-center gap-1.5 h-12 px-4 text-sm font-semibold underline underline-offset-4 transition-colors duration-150 hover:bg-white/5"
                  style={{ borderRadius: brand.radius, color: brand.primaryColor }}
                >
                  Manage categories
                  <Icons.ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>

                {modal.mode === "add" ? (
                  <p
                    id="delete-hint"
                    className="sm:col-span-3 text-xs"
                    style={{ color: brand.neutralColor }}
                  >
                    Delete becomes available once this expense has been saved.
                  </p>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <div aria-live="polite" className="fixed bottom-6 right-6 z-50 max-w-sm">
        {toast ? (
          <div
            className="np-pop flex items-start gap-3 px-4 py-3"
            style={{
              ...glass,
              backgroundColor: "rgba(12,30,58,0.95)",
              boxShadow: "0 24px 70px -24px " + (toast.kind === "ok" ? brand.primaryColor : brand.accentColor),
            }}
          >
            {toast.kind === "ok" ? (
              <Icons.CheckCircle
                className="h-5 w-5 shrink-0 mt-0.5"
                style={{ color: brand.primaryColor }}
                aria-hidden="true"
              />
            ) : (
              <Icons.Trash
                className="h-5 w-5 shrink-0 mt-0.5"
                style={{ color: brand.accentColor }}
                aria-hidden="true"
              />
            )}
            <p className="text-sm font-semibold" style={{ color: ink, fontVariantNumeric: "tabular-nums" }}>
              {toast.text}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
