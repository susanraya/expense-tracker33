// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
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

const { AlertCircle, Plus } = Icons;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function readableError(err, fallback) {
  if (err instanceof ApiError) {
    const body = err.body;
    if (body && typeof body === "object" && Array.isArray(body.detail)) {
      const first = body.detail[0];
      if (first && typeof first.msg === "string") return first.msg;
    }
    if (body && typeof body === "object" && typeof body.detail === "string") {
      return body.detail;
    }
    if (
      typeof err.message === "string" &&
      err.message &&
      !err.message.startsWith("request failed")
    ) {
      return err.message;
    }
  }
  return fallback;
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

  // 'loading' | 'ready' | 'error'
  const [status, setStatus] = React.useState("loading");
  const [expenses, setExpenses] = React.useState([]);
  const [categories, setCategories] = React.useState([]);

  const [form, setForm] = React.useState({
    amount: "",
    date: todayIso(),
    category_id: "",
    note: "",
  });
  const [errors, setErrors] = React.useState({});
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState(null); // {tone:'error'|'success', text}

  const money = (amount) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(amount));

  const loadCategories = React.useCallback(async () => {
    try {
      const data = await apiFetch("/categories");
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      // The add-expense category select just stays empty; validation still
      // requires a category to be chosen before submit is allowed.
    }
  }, []);

  const loadExpenses = React.useCallback(async () => {
    setStatus("loading");
    try {
      const data = await apiFetch("/expenses?limit=50&offset=0");
      setExpenses(Array.isArray(data?.items) ? data.items : []);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  React.useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  React.useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  function validate(f) {
    const next = {};
    const amountStr = String(f.amount).trim();
    if (!amountStr) {
      next.amount = "Enter an amount.";
    } else {
      const n = Number(amountStr);
      if (!Number.isFinite(n)) next.amount = "Enter a valid number for the amount.";
      else if (n <= 0) next.amount = "Amount must be greater than zero.";
    }
    if (!f.date) next.date = "Pick a date.";
    if (!f.category_id) next.category_id = "Choose a category.";
    return next;
  }

  async function submit(e) {
    e.preventDefault();
    const next = validate(form);
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    setMessage(null);
    try {
      await apiFetch("/expenses", {
        method: "POST",
        body: JSON.stringify({
          amount: String(form.amount).trim(),
          date: form.date,
          category_id: form.category_id,
          note: form.note.trim() ? form.note.trim() : null,
        }),
      });
      setForm({ amount: "", date: todayIso(), category_id: "", note: "" });
      setErrors({});
      setMessage({ tone: "success", text: "Expense added." });
      await loadExpenses();
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setErrors({ category_id: readableError(err, "That category could not be found.") });
      } else if (err instanceof ApiError && err.status === 422) {
        setMessage({ tone: "error", text: readableError(err, "Check the form and try again.") });
      } else {
        setMessage({
          tone: "error",
          text: "Something went wrong saving this expense. Try again.",
        });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="relative min-h-full px-4 sm:px-6 lg:px-8 py-8 lg:py-10"
      style={{ fontFamily: brand.fontBody, color: ink }}
    >
      <div className="relative mx-auto w-full max-w-5xl">
        <div>
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

        <section aria-labelledby="add-expense-heading" className="mt-8 p-5 sm:p-6" style={glass}>
          <h2
            id="add-expense-heading"
            className="text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: brand.primaryColor }}
          >
            Add expense
          </h2>

          <form onSubmit={submit} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4" noValidate>
            <div>
              <Label htmlFor="exp-amount" className="block mb-1.5 text-xs font-semibold uppercase">
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
              <Label htmlFor="exp-date" className="block mb-1.5 text-xs font-semibold uppercase">
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
              <Label htmlFor="exp-note" className="block mb-1.5 text-xs font-semibold uppercase">
                Note (optional)
              </Label>
              <Textarea
                id="exp-note"
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                style={fieldStyle}
              />
            </div>

            <div className="sm:col-span-2 flex items-center justify-between gap-4">
              <div id="add-expense-message" role="status" aria-live="polite" className="text-sm">
                {message && message.tone === "error" && (
                  <p style={{ color: "#ff5f7a" }}>{message.text}</p>
                )}
                {message && message.tone === "success" && (
                  <p style={{ color: brand.primaryColor }}>{message.text}</p>
                )}
              </div>
              <Button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-6 h-11 text-sm font-bold"
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
                {saving ? (
                  "Saving…"
                ) : (
                  <>
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Add expense
                  </>
                )}
              </Button>
            </div>
          </form>
        </section>

        <Card className="mt-6 overflow-hidden" style={glass}>
          <CardHeader
            className="px-5 sm:px-6 py-5"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
          >
            <CardTitle
              className="text-lg font-bold"
              style={{ color: ink, fontFamily: brand.fontHeading }}
            >
              My expenses — newest first
            </CardTitle>
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
                      className="mt-3 h-10 px-4 text-sm font-semibold"
                      style={{
                        borderRadius: "999px",
                        border: "1px solid rgba(255,255,255,0.16)",
                        backgroundColor: "rgba(255,255,255,0.05)",
                        color: ink,
                      }}
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
                  title="No expenses yet"
                  description="Add your first expense above to start tracking your spending."
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
                      <TH scope="col" className="px-4 py-3 text-xs font-semibold uppercase">
                        Note
                      </TH>
                    </TR>
                  </THead>
                  <TBody>
                    {expenses.map((exp) => (
                      <TR key={exp.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <TD className="px-5 sm:px-6 py-3">{exp.date}</TD>
                        <TD className="px-4 py-3 text-right">{money(exp.amount)}</TD>
                        <TD className="px-4 py-3">{exp.category_name || "Uncategorised"}</TD>
                        <TD className="px-4 py-3">{exp.note || ""}</TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
