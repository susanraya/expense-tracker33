// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { apiFetch, ApiError } from "@/lib/api";

const {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Textarea,
  Label,
  Select,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  Empty,
  Button,
} = UI;

const { Edit, Trash, AlertCircle } = Icons;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function startOfMonthIso() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

export default function Screen() {
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

  const TODAY_ISO = todayIso();

  // 'loading' | 'ready' | 'error'
  const [status, setStatus] = React.useState("loading");
  const [expenses, setExpenses] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [categories, setCategories] = React.useState([]);

  const [startInput, setStartInput] = React.useState(startOfMonthIso());
  const [endInput, setEndInput] = React.useState(TODAY_ISO);

  const [toast, setToast] = React.useState(null);
  const [modal, setModal] = React.useState({ open: false, mode: "add", id: null });
  const [form, setForm] = React.useState({
    amount: "",
    date: TODAY_ISO,
    category_id: "",
    description: "",
  });
  const [errors, setErrors] = React.useState({});
  const [saving, setSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState(null);

  const money = (n) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  const loadCategories = React.useCallback(async () => {
    try {
      const data = await apiFetch("/categories");
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      // Filter/select options just stay empty; the main list error state covers this.
    }
  }, []);

  const loadExpenses = React.useCallback(async () => {
    setStatus("loading");
    try {
      const params = new URLSearchParams();
      if (startInput) params.set("start", startInput);
      if (endInput) params.set("end", endInput);
      params.set("limit", "50");
      params.set("offset", "0");
      const data = await apiFetch(`/expenses?${params.toString()}`);
      setExpenses(Array.isArray(data?.items) ? data.items : []);
      setTotal(typeof data?.total === "number" ? data.total : 0);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [startInput, endInput]);

  React.useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  React.useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  function catName(id) {
    const c = categories.find((x) => x.id === id);
    return c ? c.name : "Uncategorised";
  }

  function openAdd() {
    setForm({ amount: "", date: TODAY_ISO, category_id: "", description: "" });
    setErrors({});
    setModal({ open: true, mode: "add", id: null });
  }

  function openEdit(exp) {
    setForm({
      amount: String(exp.amount),
      date: exp.date,
      category_id: exp.category_id || "",
      description: exp.description || "",
    });
    setErrors({});
    setModal({ open: true, mode: "edit", id: exp.id });
  }

  function closeModal() {
    setSaving(false);
    setModal({ open: false, mode: "add", id: null });
  }

  function validate(f) {
    const next = {};
    const raw = String(f.amount).trim();
    const n = Number(raw);
    if (!raw) next.amount = "Enter an amount, for example 24.50.";
    else if (!isFinite(n) || n <= 0) next.amount = "Amount must be greater than zero.";
    if (!f.date) next.date = "Pick the date you spent it.";
    if (!f.category_id) next.category_id = "Pick a category.";
    return next;
  }

  function fieldFromLoc(loc) {
    if (!Array.isArray(loc)) return null;
    const last = loc[loc.length - 1];
    if (last === "amount" || last === "date" || last === "category_id") return last;
    return null;
  }

  function messageFor422(err) {
    const detail = err.body && typeof err.body === "object" ? err.body.detail : null;
    const next = {};
    if (Array.isArray(detail)) {
      for (const item of detail) {
        const field = fieldFromLoc(item && item.loc);
        if (field) {
          next[field] =
            field === "category_id"
              ? "Pick a category."
              : field === "date"
                ? "Enter a valid date."
                : "Enter an amount greater than zero.";
        }
      }
    }
    if (Object.keys(next).length === 0) {
      next.amount = "Check the amount, date and category and try again.";
    }
    return next;
  }

  async function submit(e) {
    e.preventDefault();
    const next = validate(form);
    setErrors(next);
    if (Object.keys(next).length) return;

    const amount = Number(form.amount);
    const payload = {
      amount,
      date: form.date,
      description: form.description.trim(),
      category_id: form.category_id,
    };

    setSaving(true);
    try {
      if (modal.mode === "add") {
        await apiFetch("/expenses", { method: "POST", body: JSON.stringify(payload) });
        setToast({ kind: "ok", text: "Expense added" });
      } else {
        await apiFetch(`/expenses/${modal.id}`, { method: "PATCH", body: JSON.stringify(payload) });
        setToast({ kind: "ok", text: "Expense updated" });
      }
      closeModal();
      await loadExpenses();
    } catch (err) {
      setSaving(false);
      if (err instanceof ApiError && err.status === 404) {
        setErrors({ category_id: "That category no longer exists." });
      } else if (err instanceof ApiError && err.status === 422) {
        setErrors(messageFor422(err));
      } else {
        setErrors({ amount: "Something went wrong saving this expense. Try again." });
      }
    }
  }

  async function removeExpense(id) {
    setDeletingId(id);
    try {
      await apiFetch(`/expenses/${id}`, { method: "DELETE" });
      setToast({ kind: "gone", text: "Expense deleted" });
      await loadExpenses();
    } catch {
      setToast({ kind: "error", text: "Couldn’t delete that expense. Try again." });
    } finally {
      setDeletingId(null);
    }
  }

  React.useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  const css =
    ".np-focus:focus-visible{outline:2px solid " +
    brand.primaryColor +
    ";outline-offset:2px;border-radius:14px}";

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

      <div className="relative mx-auto w-full max-w-6xl">
        <div className="grid grid-cols-12 gap-4 items-end">
          <div className="col-span-12 sm:col-span-8">
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
          </div>
          <div className="col-span-12 sm:col-span-4 flex sm:justify-end">
            <Button
              type="button"
              onClick={openAdd}
              className="np-focus inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 h-12 text-sm font-bold"
              style={{
                borderRadius: brand.radius,
                color: brand.backgroundColor,
                backgroundImage:
                  "linear-gradient(120deg, " + brand.primaryColor + ", " + brand.accentColor + ")",
              }}
            >
              <Icons.Plus className="h-4 w-4" aria-hidden="true" />
              Add expense
            </Button>
          </div>
        </div>

        <section aria-labelledby="filter-heading" className="mt-8 px-4 sm:px-5 py-4" style={glass}>
          <h2 id="filter-heading" className="sr-only">
            Filter expenses
          </h2>
          <div className="flex flex-col lg:flex-row lg:items-end gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              <div>
                <Label
                  htmlFor="filter-start"
                  className="block mb-1.5 text-xs font-semibold uppercase"
                >
                  Start date
                </Label>
                <Input
                  id="filter-start"
                  type="date"
                  style={fieldStyle}
                  value={startInput}
                  onChange={(e) => setStartInput(e.target.value)}
                />
              </div>
              <div>
                <Label
                  htmlFor="filter-end"
                  className="block mb-1.5 text-xs font-semibold uppercase"
                >
                  End date
                </Label>
                <Input
                  id="filter-end"
                  type="date"
                  style={fieldStyle}
                  value={endInput}
                  onChange={(e) => setEndInput(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        <Card className="mt-6 overflow-hidden" style={glass}>
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
            </div>
            <p className="text-sm font-semibold" style={{ color: brand.neutralColor }}>
              <span style={{ color: ink }}>{expenses.length}</span> entries ·{" "}
              <span style={{ color: brand.primaryColor }}>{money(total)}</span> total
            </p>
          </CardHeader>

          <CardContent className="p-0">
            {status === "loading" && (
              <div className="px-5 sm:px-6 py-10" role="status" aria-live="polite">
                <p className="text-sm" style={{ color: brand.neutralColor }}>
                  Loading your expenses…
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="px-5 sm:px-6 py-10">
                <div
                  className="flex flex-wrap items-start gap-3 p-4"
                  style={{
                    backgroundColor: "rgba(255,95,122,0.1)",
                    border: "1px solid rgba(255,95,122,0.45)",
                    borderRadius: brand.radius,
                  }}
                >
                  <AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      We couldn’t load your expenses
                    </p>
                    <Button
                      type="button"
                      onClick={loadExpenses}
                      className="np-focus mt-3 h-10 px-4 text-sm font-semibold"
                      style={pillBtn}
                    >
                      Try again
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {status === "ready" && expenses.length === 0 && (
              <div className="px-5 sm:px-6 py-10">
                <Empty
                  title="No expenses in this range"
                  description="Add your first expense, or widen your date range."
                />
              </div>
            )}

            {status === "ready" && expenses.length > 0 && (
              <div className="overflow-x-auto">
                <Table className="w-full text-left">
                  <THead>
                    <TR style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                      <TH scope="col" className="px-5 sm:px-6 py-3 text-xs font-semibold uppercase">
                        Date
                      </TH>
                      <TH
                        scope="col"
                        className="px-4 py-3 text-xs font-semibold uppercase text-right"
                      >
                        Amount
                      </TH>
                      <TH scope="col" className="px-4 py-3 text-xs font-semibold uppercase">
                        Category
                      </TH>
                      <TH
                        scope="col"
                        className="hidden md:table-cell px-4 py-3 text-xs font-semibold uppercase"
                      >
                        Description
                      </TH>
                      <TH
                        scope="col"
                        className="px-5 sm:px-6 py-3 text-xs font-semibold uppercase text-right"
                      >
                        Actions
                      </TH>
                    </TR>
                  </THead>
                  <TBody>
                    {expenses.map((exp) => (
                      <TR key={exp.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <TD className="px-5 sm:px-6 py-3">{exp.date}</TD>
                        <TD className="px-4 py-3 text-right">{money(exp.amount)}</TD>
                        <TD className="px-4 py-3">{exp.category_name || "Uncategorised"}</TD>
                        <TD className="hidden md:table-cell px-4 py-3">{exp.description}</TD>
                        <TD className="px-5 sm:px-6 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              onClick={() => openEdit(exp)}
                              aria-label={`Edit expense on ${exp.date}`}
                              className="np-focus h-9 px-3 text-xs"
                              style={pillBtn}
                            >
                              <Edit className="h-3.5 w-3.5" aria-hidden="true" />
                              Edit
                            </Button>
                            <Button
                              type="button"
                              onClick={() => removeExpense(exp.id)}
                              disabled={deletingId === exp.id}
                              aria-label={`Delete expense on ${exp.date}`}
                              className="np-focus h-9 px-3 text-xs"
                              style={pillBtn}
                            >
                              <Trash className="h-3.5 w-3.5" aria-hidden="true" />
                              {deletingId === exp.id ? "Deleting…" : "Delete"}
                            </Button>
                          </div>
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {toast && (
          <p
            role="status"
            aria-live="polite"
            className="mt-4 text-sm"
            style={{ color: brand.neutralColor }}
          >
            {toast.text}
          </p>
        )}

        {modal.open && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="expense-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          >
            <div className="w-full max-w-md p-6" style={{ ...glass, backgroundColor: "#0a1d3a" }}>
              <h2 id="expense-modal-title" className="text-lg font-bold" style={{ color: ink }}>
                {modal.mode === "add" ? "Add expense" : "Edit expense"}
              </h2>
              <form onSubmit={submit} className="mt-4 space-y-4" noValidate>
                <div>
                  <Label
                    htmlFor="exp-amount"
                    className="block mb-1.5 text-xs font-semibold uppercase"
                  >
                    Amount
                  </Label>
                  <Input
                    id="exp-amount"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    aria-invalid={errors.amount ? "true" : "false"}
                    style={fieldStyle}
                  />
                  {errors.amount && (
                    <p className="mt-1 text-xs" style={{ color: "#ff5f7a" }}>
                      {errors.amount}
                    </p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor="exp-date"
                    className="block mb-1.5 text-xs font-semibold uppercase"
                  >
                    Date
                  </Label>
                  <Input
                    id="exp-date"
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    aria-invalid={errors.date ? "true" : "false"}
                    style={fieldStyle}
                  />
                  {errors.date && (
                    <p className="mt-1 text-xs" style={{ color: "#ff5f7a" }}>
                      {errors.date}
                    </p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor="exp-category"
                    className="block mb-1.5 text-xs font-semibold uppercase"
                  >
                    Category
                  </Label>
                  <Select
                    id="exp-category"
                    value={form.category_id}
                    onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                    aria-invalid={errors.category_id ? "true" : "false"}
                    style={fieldStyle}
                  >
                    <option value="" style={optionStyle}>
                      Select a category
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} style={optionStyle}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                  {errors.category_id && (
                    <p className="mt-1 text-xs" style={{ color: "#ff5f7a" }}>
                      {errors.category_id}
                    </p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor="exp-description"
                    className="block mb-1.5 text-xs font-semibold uppercase"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="exp-description"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    style={fieldStyle}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    onClick={closeModal}
                    className="np-focus h-10 px-4 text-sm"
                    style={pillBtn}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="np-focus h-10 px-4 text-sm font-bold"
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
                    {saving ? "Saving…" : "Save"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
