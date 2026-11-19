// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { apiFetch, ApiError } from "@/lib/api";

const { Button, Input, Label, Badge, Table, THead, TBody, TR, TH, TD, Empty } = UI;

const { Plus, Trash, Edit, AlertCircle, CheckCircle } = Icons;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmtDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function hexToRgba(hex, alpha) {
  const h = String(hex).replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function Screen() {
  const glass = {
    backgroundColor: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: brand.radius,
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    boxShadow: "none",
  };
  const hairline = "1px solid rgba(255,255,255,0.10)";

  // 'loading' | 'ready' | 'error'
  const [status, setStatus] = React.useState("loading");
  const [categories, setCategories] = React.useState([]);
  const [newName, setNewName] = React.useState("");
  const [message, setMessage] = React.useState(null); // {tone:'error'|'success', title, body}
  const [saving, setSaving] = React.useState(false);
  const [renamingId, setRenamingId] = React.useState(null);
  const [renameValue, setRenameValue] = React.useState("");
  const [renameError, setRenameError] = React.useState("");
  const [deletingId, setDeletingId] = React.useState(null);
  const nameInputRef = React.useRef(null);
  const renameInputRef = React.useRef(null);

  const loadCategories = React.useCallback(async () => {
    setStatus("loading");
    try {
      const data = await apiFetch("/categories");
      setCategories(Array.isArray(data) ? data : []);
      setStatus("ready");
    } catch (err) {
      setStatus("error");
    }
  }, []);

  React.useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  /* ---------- create (POST /categories) ---------- */

  async function handleAdd(e) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) {
      setMessage({
        tone: "error",
        title: "Name cannot be blank",
        body: "Give the category a name you’ll recognise in your reports — “Transport”, “Health”, “Gifts”.",
      });
      if (nameInputRef.current) nameInputRef.current.focus();
      return;
    }
    setSaving(true);
    try {
      const created = await apiFetch("/categories", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      setCategories((prev) => [created, ...prev]);
      setNewName("");
      setMessage({
        tone: "success",
        title: "Category added",
        body: `“${name}” is ready to pick the next time you log an expense.`,
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setMessage({
          tone: "error",
          title: "That name is already taken",
          body: `You already have a category called “${name}”. Pick a different name.`,
        });
      } else {
        setMessage({
          tone: "error",
          title: "We couldn’t save that category",
          body: "Something went wrong talking to the server. Try again.",
        });
      }
      if (nameInputRef.current) nameInputRef.current.focus();
    } finally {
      setSaving(false);
    }
  }

  /* ---------- rename (PATCH /categories/{id}) ---------- */

  function startRename(cat) {
    setRenamingId(cat.id);
    setRenameValue(cat.name);
    setRenameError("");
    setMessage(null);
  }

  function cancelRename() {
    setRenamingId(null);
    setRenameError("");
  }

  async function saveRename(e, cat) {
    e.preventDefault();
    const name = renameValue.trim();
    if (!name) {
      setRenameError("Name cannot be blank.");
      return;
    }
    try {
      const updated = await apiFetch(`/categories/${cat.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
      });
      setCategories((prev) => prev.map((c) => (c.id === cat.id ? updated : c)));
      setRenamingId(null);
      setRenameError("");
      setMessage({
        tone: "success",
        title: "Category renamed",
        body: `${cat.name} is now “${name}”.`,
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setRenameError(`You already have a category called “${name}”.`);
      } else {
        setRenameError("Something went wrong saving that name. Try again.");
      }
    }
  }

  /* ---------- delete (DELETE /categories/{id}) ---------- */

  async function confirmDelete(cat) {
    setDeletingId(cat.id);
    try {
      await apiFetch(`/categories/${cat.id}`, { method: "DELETE" });
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      setMessage({
        tone: "success",
        title: "Category deleted",
        body: `“${cat.name}” is gone.`,
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setMessage({
          tone: "error",
          title: "Category still has expenses assigned to it",
          body: `“${cat.name}” still has expenses assigned to it. Move them to another category before deleting.`,
        });
      } else {
        setMessage({
          tone: "error",
          title: "We couldn’t delete that category",
          body: "Something went wrong talking to the server. Try again.",
        });
      }
    } finally {
      setDeletingId(null);
    }
  }

  const css = `
    .np-focus:focus-visible { outline: 2px solid var(--np-accent); outline-offset: 2px; border-radius: 12px; }
    .np-row { transition: background-color .18s ease; }
    .np-row:hover { background-color: rgba(255,255,255,0.045); }
    .np-btn { transition: transform .14s ease, box-shadow .2s ease, background-color .2s ease, border-color .2s ease; }
    .np-btn:hover { transform: translateY(-1px); }
    .np-btn:active { transform: translateY(0); }
    .np-btn[disabled] { opacity: .55; transform: none; cursor: not-allowed; }
    @media (prefers-reduced-motion: reduce) {
      .np-btn:hover { transform: none; }
    }
  `;

  const primaryBtn = {
    background: `linear-gradient(135deg, ${brand.primaryColor}, ${brand.accentColor})`,
    color: brand.backgroundColor,
    borderRadius: brand.radius,
    border: "1px solid rgba(255,255,255,0.22)",
    boxShadow: `0 22px 50px -18px ${hexToRgba(brand.accentColor, 0.9)}`,
    fontWeight: 700,
  };
  const quietBtn = {
    backgroundColor: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: "12px",
    color: "rgba(255,255,255,0.92)",
  };

  return (
    <div
      className="np-root min-h-full w-full"
      style={{
        backgroundColor: brand.backgroundColor,
        fontFamily: brand.fontBody,
        "--np-accent": brand.accentColor,
        "--np-primary": brand.primaryColor,
      }}
    >
      <style>{css}</style>

      <div className="mx-auto w-full max-w-5xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
        <header>
          <h1
            className="text-[34px] font-bold leading-tight tracking-tight text-white sm:text-[40px]"
            style={{ fontFamily: brand.fontHeading }}
          >
            Categories
          </h1>
          <p
            className="mt-2 max-w-[62ch] text-sm leading-relaxed sm:text-base"
            style={{ color: brand.neutralColor }}
          >
            Only you can see your categories.
          </p>
        </header>

        <section className="relative mt-8" aria-labelledby="add-category-heading">
          <div className="relative p-5 sm:p-7" style={glass}>
            <h2
              id="add-category-heading"
              className="text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: brand.primaryColor }}
            >
              Add a category
            </h2>

            <form
              onSubmit={handleAdd}
              className="mt-4 grid grid-cols-12 items-end gap-4"
              noValidate
            >
              <div className="col-span-12 sm:col-span-8">
                <Label
                  htmlFor="new-category-name"
                  className="mb-2 block text-sm font-medium"
                  style={{ color: "rgba(255,255,255,0.92)" }}
                >
                  New category name
                </Label>
                <Input
                  id="new-category-name"
                  ref={nameInputRef}
                  name="name"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    if (message && message.tone === "error") setMessage(null);
                  }}
                  placeholder="Dining out"
                  autoComplete="off"
                  aria-describedby="category-form-message"
                  aria-invalid={message && message.tone === "error" ? "true" : "false"}
                  className="np-focus h-12 w-full border-0 text-base"
                  style={{
                    backgroundColor: "rgba(6,20,43,0.55)",
                    border: `1px solid ${message && message.tone === "error" ? hexToRgba(brand.accentColor, 0.75) : "rgba(255,255,255,0.16)"}`,
                    borderRadius: brand.radius,
                    color: "#ffffff",
                  }}
                />
              </div>
              <div className="col-span-12 sm:col-span-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="np-btn np-focus flex h-12 w-full items-center justify-center gap-2 text-base"
                  style={primaryBtn}
                >
                  {saving ? (
                    "Saving…"
                  ) : (
                    <>
                      <Plus aria-hidden="true" className="h-5 w-5" />
                      Add category
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div id="category-form-message" role="status" aria-live="polite" className="mt-4">
              {!message && (
                <p className="text-sm leading-relaxed" style={{ color: brand.neutralColor }}>
                  Names are unique to your account.
                </p>
              )}

              {message && message.tone === "error" && (
                <div
                  className="flex flex-wrap items-start gap-3 p-4"
                  style={{
                    backgroundColor: hexToRgba(brand.accentColor, 0.12),
                    border: `1px solid ${hexToRgba(brand.accentColor, 0.42)}`,
                    borderRadius: brand.radius,
                  }}
                >
                  <AlertCircle
                    aria-hidden="true"
                    className="mt-0.5 h-5 w-5 shrink-0"
                    style={{ color: brand.accentColor }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">{message.title}</p>
                    <p
                      className="mt-1 max-w-[66ch] text-sm leading-relaxed"
                      style={{ color: "rgba(255,255,255,0.82)" }}
                    >
                      {message.body}
                    </p>
                  </div>
                </div>
              )}

              {message && message.tone === "success" && (
                <div
                  className="flex items-start gap-3 p-4"
                  style={{
                    backgroundColor: hexToRgba(brand.primaryColor, 0.1),
                    border: `1px solid ${hexToRgba(brand.primaryColor, 0.38)}`,
                    borderRadius: brand.radius,
                  }}
                >
                  <CheckCircle
                    aria-hidden="true"
                    className="mt-0.5 h-5 w-5 shrink-0"
                    style={{ color: brand.primaryColor }}
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">{message.title}</p>
                    <p
                      className="mt-1 max-w-[66ch] text-sm leading-relaxed"
                      style={{ color: "rgba(255,255,255,0.82)" }}
                    >
                      {message.body}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mt-8" aria-labelledby="my-categories-heading">
          <div style={glass} className="overflow-hidden">
            <div
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-7 sm:py-5"
              style={{ borderBottom: hairline }}
            >
              <div className="flex items-center gap-3">
                <h2
                  id="my-categories-heading"
                  className="text-lg font-semibold text-white sm:text-xl"
                  style={{ fontFamily: brand.fontHeading }}
                >
                  My categories
                </h2>
                <Badge
                  className="border-0 px-2.5 py-1 text-xs font-semibold"
                  style={{
                    backgroundColor: hexToRgba(brand.primaryColor, 0.16),
                    color: brand.primaryColor,
                    borderRadius: "999px",
                  }}
                >
                  {categories.length}
                </Badge>
              </div>
            </div>

            {status === "loading" && (
              <div className="px-5 py-12 sm:px-7" role="status" aria-live="polite">
                <p className="text-sm" style={{ color: brand.neutralColor }}>
                  Loading your categories…
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="px-5 py-12 sm:px-7">
                <div
                  className="flex flex-wrap items-start gap-3 p-4"
                  style={{
                    backgroundColor: hexToRgba(brand.accentColor, 0.12),
                    border: `1px solid ${hexToRgba(brand.accentColor, 0.42)}`,
                    borderRadius: brand.radius,
                  }}
                >
                  <AlertCircle
                    aria-hidden="true"
                    className="mt-0.5 h-5 w-5 shrink-0"
                    style={{ color: brand.accentColor }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">
                      We couldn’t load your categories
                    </p>
                    <Button
                      type="button"
                      onClick={loadCategories}
                      className="np-btn np-focus mt-3 h-10 px-4 text-sm font-semibold"
                      style={quietBtn}
                    >
                      Try again
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {status === "ready" && categories.length === 0 ? (
              <div className="px-5 py-12 sm:px-7">
                <Empty
                  title="No categories yet"
                  description="Add your first category above — most people start with Groceries, Transport and Rent & Utilities, then refine as they go."
                />
              </div>
            ) : null}

            {status === "ready" && categories.length > 0 ? (
              <div className="overflow-x-auto">
                <Table className="w-full min-w-[640px]">
                  <THead>
                    <TR style={{ borderBottom: hairline }}>
                      <TH
                        scope="col"
                        className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] sm:px-7"
                        style={{ color: brand.neutralColor }}
                      >
                        Name
                      </TH>
                      <TH
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em]"
                        style={{ color: brand.neutralColor }}
                      >
                        Created
                      </TH>
                      <TH
                        scope="col"
                        className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.14em] sm:px-7"
                        style={{ color: brand.neutralColor }}
                      >
                        Actions
                      </TH>
                    </TR>
                  </THead>
                  <TBody>
                    {categories.map((cat) => {
                      const editing = renamingId === cat.id;
                      return (
                        <TR
                          key={cat.id}
                          className="np-row align-top"
                          style={{ borderBottom: hairline }}
                        >
                          <TD className="px-5 py-4 sm:px-7">
                            {editing ? (
                              <form onSubmit={(e) => saveRename(e, cat)} className="max-w-sm">
                                <Label htmlFor={`rename-${cat.id}`} className="sr-only">
                                  Rename {cat.name}
                                </Label>
                                <Input
                                  id={`rename-${cat.id}`}
                                  ref={renameInputRef}
                                  value={renameValue}
                                  onChange={(e) => setRenameValue(e.target.value)}
                                  className="np-focus h-10 text-sm"
                                  style={{
                                    backgroundColor: "rgba(6,20,43,0.55)",
                                    border: "1px solid rgba(255,255,255,0.16)",
                                    borderRadius: "10px",
                                    color: "#fff",
                                  }}
                                  autoFocus
                                />
                                {renameError && (
                                  <p className="mt-2 text-xs" style={{ color: brand.accentColor }}>
                                    {renameError}
                                  </p>
                                )}
                                <div className="mt-2 flex gap-2">
                                  <Button
                                    type="submit"
                                    className="np-btn np-focus h-8 px-3 text-xs"
                                    style={quietBtn}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    type="button"
                                    onClick={cancelRename}
                                    className="np-btn np-focus h-8 px-3 text-xs"
                                    style={quietBtn}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </form>
                            ) : (
                              <span className="text-sm font-medium text-white">{cat.name}</span>
                            )}
                          </TD>
                          <TD className="px-4 py-4 text-sm" style={{ color: brand.neutralColor }}>
                            {cat.created_at ? fmtDate(cat.created_at) : "—"}
                          </TD>
                          <TD className="px-5 py-4 text-right sm:px-7">
                            {!editing && (
                              <div className="flex justify-end gap-2">
                                <Button
                                  type="button"
                                  onClick={() => startRename(cat)}
                                  aria-label={`Rename ${cat.name}`}
                                  className="np-btn np-focus h-9 px-3 text-xs"
                                  style={quietBtn}
                                >
                                  <Edit className="h-3.5 w-3.5" aria-hidden="true" />
                                  Rename
                                </Button>
                                <Button
                                  type="button"
                                  onClick={() => confirmDelete(cat)}
                                  disabled={deletingId === cat.id}
                                  aria-label={`Delete ${cat.name}`}
                                  className="np-btn np-focus h-9 px-3 text-xs"
                                  style={quietBtn}
                                >
                                  <Trash className="h-3.5 w-3.5" aria-hidden="true" />
                                  {deletingId === cat.id ? "Deleting…" : "Delete"}
                                </Button>
                              </div>
                            )}
                          </TD>
                        </TR>
                      );
                    })}
                  </TBody>
                </Table>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
