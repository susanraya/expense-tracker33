// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Button, Input, Label, Badge, Table, THead, TBody, TR, TH, TD, Empty } = UI;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Plus, Check, ChevronRight, Home, Clock, Trash, Edit, AlertCircle, CheckCircle } = Icons;

const INITIAL_CATEGORIES = [
  { id: 'cat_gifts', name: 'Gifts', expense_count: 0, created_at: '2026-11-09' },
  { id: 'cat_travel', name: 'Travel', expense_count: 0, created_at: '2026-10-27' },
  { id: 'cat_software', name: 'Software Subscriptions', expense_count: 7, created_at: '2026-09-01' },
  { id: 'cat_homeoffice', name: 'Home Office', expense_count: 2, created_at: '2026-08-12' },
  { id: 'cat_health', name: 'Health', expense_count: 4, created_at: '2026-06-08' },
  { id: 'cat_coffee', name: 'Coffee & Snacks', expense_count: 23, created_at: '2026-04-19' },
  { id: 'cat_transport', name: 'Transport', expense_count: 9, created_at: '2026-03-02' },
  { id: 'cat_rent', name: 'Rent & Utilities', expense_count: 6, created_at: '2026-02-14' },
  { id: 'cat_groceries', name: 'Groceries', expense_count: 12, created_at: '2026-02-14' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmtDate(iso) {
  const parts = String(iso).split('-');
  if (parts.length !== 3) return iso;
  return `${Number(parts[2])} ${MONTHS[Number(parts[1]) - 1]} ${parts[0]}`;
}

function hexToRgba(hex, alpha) {
  const h = String(hex).replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function Screen() {
  const navigate = useNavigate();
  const glass = {
    backgroundColor: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.13)',
    borderRadius: brand.radius,
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    boxShadow: 'none',
  };
  const hairline = '1px solid rgba(255,255,255,0.10)';

  const [categories, setCategories] = React.useState(INITIAL_CATEGORIES);
  const [newName, setNewName] = React.useState('');
  const [message, setMessage] = React.useState(null); // {tone:'error'|'success', title, body, retry?}
  const [saving, setSaving] = React.useState(false);
  const [newId, setNewId] = React.useState(null);
  const [renamingId, setRenamingId] = React.useState(null);
  const [renameValue, setRenameValue] = React.useState('');
  const [renameError, setRenameError] = React.useState('');
  const [dialog, setDialog] = React.useState(null); // {mode:'blocked'|'confirm', category}
  const [sync, setSync] = React.useState('stale'); // stale | syncing | synced

  const timers = React.useRef([]);
  const idCounter = React.useRef(0);
  const panelRef = React.useRef(null);
  const returnFocusRef = React.useRef(null);
  const renameInputRef = React.useRef(null);
  const nameInputRef = React.useRef(null);

  React.useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  const schedule = (fn, ms) => { timers.current.push(setTimeout(fn, ms)); };

  const totals = React.useMemo(() => {
    const expenses = categories.reduce((s, c) => s + c.expense_count, 0);
    const max = categories.reduce((m, c) => Math.max(m, c.expense_count), 0) || 1;
    return { expenses, max };
  }, [categories]);

  /* ---------- create (POST /categories) ---------- */

  function commitAdd(name) {
    setSaving(true);
    schedule(() => {
      idCounter.current += 1;
      const created = {
        id: `cat_new_${idCounter.current}`,
        name,
        expense_count: 0,
        created_at: '2026-11-18',
      };
      setCategories((prev) => [created, ...prev]);
      setNewName('');
      setSaving(false);
      setNewId(created.id);
      setMessage({
        tone: 'success',
        title: 'Category added',
        body: `“${name}” is ready to pick the next time you log an expense.`,
      });
    }, 650);
  }

  function handleAdd(e) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) {
      setMessage({
        tone: 'error',
        title: 'Name cannot be blank',
        body: 'Give the category a name you’ll recognise in your reports — “Transport”, “Health”, “Gifts”.',
      });
      if (nameInputRef.current) nameInputRef.current.focus();
      return;
    }
    const clash = categories.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (clash) {
      setMessage({
        tone: 'error',
        title: 'That name is already taken',
        body: `Name cannot be blank and must be unique — you already have a category called ${clash.name}.`,
      });
      if (nameInputRef.current) nameInputRef.current.focus();
      return;
    }
    if (sync !== 'synced') {
      setMessage({
        tone: 'error',
        title: 'We couldn’t reach your account',
        body: `“${name}” is still in the box. Reconnect and we’ll save it straight away.`,
        retry: name,
      });
      return;
    }
    commitAdd(name);
  }

  function reconnect(retryName) {
    setSync('syncing');
    schedule(() => {
      setSync('synced');
      if (retryName) {
        setMessage(null);
        commitAdd(retryName);
      }
    }, 900);
  }

  /* ---------- rename (PATCH /categories/{id}) ---------- */

  function startRename(cat) {
    setRenamingId(cat.id);
    setRenameValue(cat.name);
    setRenameError('');
    setMessage(null);
    schedule(() => { if (renameInputRef.current) renameInputRef.current.focus(); }, 30);
  }

  function saveRename(e, cat) {
    e.preventDefault();
    const name = renameValue.trim();
    if (!name) {
      setRenameError('Name cannot be blank.');
      return;
    }
    const clash = categories.find(
      (c) => c.id !== cat.id && c.name.toLowerCase() === name.toLowerCase()
    );
    if (clash) {
      setRenameError(`You already have a category called ${clash.name}.`);
      return;
    }
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? { ...c, name } : c)));
    setRenamingId(null);
    setRenameError('');
    setMessage({
      tone: 'success',
      title: 'Category renamed',
      body: `${cat.name} is now “${name}” — its ${cat.expense_count} expense${cat.expense_count === 1 ? '' : 's'} moved with it.`,
    });
  }

  /* ---------- delete (DELETE /categories/{id}) ---------- */

  function askDelete(cat, e) {
    returnFocusRef.current = e.currentTarget;
    setDialog({ mode: cat.expense_count > 0 ? 'blocked' : 'confirm', category: cat });
  }

  function closeDialog() {
    setDialog(null);
    const node = returnFocusRef.current;
    schedule(() => { if (node && node.focus) node.focus(); }, 10);
  }

  function confirmDelete(cat) {
    setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    setDialog(null);
    setMessage({
      tone: 'success',
      title: 'Category deleted',
      body: `“${cat.name}” is gone. No expenses were affected.`,
    });
  }

  /* ---------- dialog keyboard handling ---------- */

  React.useEffect(() => {
    if (!dialog) return undefined;
    const onKey = (ev) => {
      if (ev.key === 'Escape') {
        ev.stopPropagation();
        closeDialog();
      } else if (ev.key === 'Tab' && panelRef.current) {
        const nodes = panelRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!nodes.length) return;
        const list = Array.prototype.slice.call(nodes);
        const first = list[0];
        const last = list[list.length - 1];
        if (ev.shiftKey && document.activeElement === first) {
          ev.preventDefault();
          last.focus();
        } else if (!ev.shiftKey && document.activeElement === last) {
          ev.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey, true);
    const t = setTimeout(() => {
      if (panelRef.current) {
        const keep = panelRef.current.querySelector('[data-autofocus]');
        if (keep) keep.focus();
      }
    }, 20);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      clearTimeout(t);
    };
  }, [dialog]);

  const css = `
    .np-focus:focus-visible { outline: 2px solid var(--np-accent); outline-offset: 2px; border-radius: 12px; }
    .np-row { transition: background-color .18s ease; }
    .np-row:hover { background-color: rgba(255,255,255,0.045); }
    .np-btn { transition: transform .14s ease, box-shadow .2s ease, background-color .2s ease, border-color .2s ease; }
    .np-btn:hover { transform: translateY(-1px); }
    .np-btn:active { transform: translateY(0); }
    .np-btn[disabled] { opacity: .55; transform: none; cursor: not-allowed; }
    @keyframes npIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
    @keyframes npPop { from { opacity: 0; transform: translateY(10px) scale(.985); } to { opacity: 1; transform: none; } }
    @keyframes npFade { from { opacity: 0; } to { opacity: 1; } }
    @keyframes npBlink { 0%,100% { opacity: .35; } 50% { opacity: 1; } }
    .np-in { animation: npIn .4s cubic-bezier(.22,1,.36,1); }
    .np-pop { animation: npPop .26s cubic-bezier(.22,1,.36,1); }
    .np-fade { animation: npFade .3s ease-out; }
    .np-blink { animation: npBlink 1.1s ease-in-out infinite; }
    .np-bar { transition: width .5s cubic-bezier(.22,1,.36,1); }
    @media (prefers-reduced-motion: reduce) {
      .np-in, .np-pop, .np-fade, .np-blink { animation: none !important; }
      .np-btn:hover { transform: none; }
      .np-bar { transition: none; }
    }
  `;

  const primaryBtn = {
    background: `linear-gradient(135deg, ${brand.primaryColor}, ${brand.accentColor})`,
    color: brand.backgroundColor,
    borderRadius: brand.radius,
    border: '1px solid rgba(255,255,255,0.22)',
    boxShadow: `0 22px 50px -18px ${hexToRgba(brand.accentColor, 0.9)}`,
    fontWeight: 700,
  };
  const quietBtn = {
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.16)',
    borderRadius: '12px',
    color: 'rgba(255,255,255,0.92)',
  };

  const syncLabel =
    sync === 'synced' ? 'Synced just now' : sync === 'syncing' ? 'Syncing your categories…' : 'Offline — last synced 14:32';

  return (
    <div
      className="np-root min-h-full w-full"
      style={{
        backgroundColor: brand.backgroundColor,
        fontFamily: brand.fontBody,
        '--np-accent': brand.accentColor,
        '--np-primary': brand.primaryColor,
      }}
    >
      <style>{css}</style>

      <div className="mx-auto w-full max-w-5xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
        {/* Row 1 — page title */}
        <header data-wf="b-0-0">
          <h1
            className="text-[34px] font-bold leading-tight tracking-tight text-white sm:text-[40px]"
            style={{ fontFamily: brand.fontHeading }}
          >
            Categories
          </h1>
          <p
            className="mt-2 max-w-[62ch] text-sm leading-relaxed sm:text-base"
            style={{ color: brand.neutralColor, fontVariantNumeric: 'tabular-nums' }}
          >
            {categories.length} categories classifying {totals.expenses} expenses on your account. Only you can see them.
          </p>
        </header>

        {/* Focal card: Row 2 (field + button) and Row 3 (message) */}
        <section className="relative mt-8" aria-labelledby="add-category-heading">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-6 left-6 right-6 h-32 blur-[64px]"
            style={{
              background: `linear-gradient(90deg, ${hexToRgba(brand.primaryColor, 0.55)}, ${hexToRgba(brand.accentColor, 0.55)})`,
              borderRadius: '40px',
              opacity: 0.5,
            }}
          />
          <div className="relative p-5 sm:p-7" style={glass}>
            <h2
              id="add-category-heading"
              className="text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: brand.primaryColor }}
            >
              Add a category
            </h2>

            <form onSubmit={handleAdd} className="mt-4 grid grid-cols-12 items-end gap-4" noValidate>
              <div data-wf="b-1-0" className="col-span-12 sm:col-span-8">
                <Label
                  htmlFor="new-category-name"
                  className="mb-2 block text-sm font-medium"
                  style={{ color: 'rgba(255,255,255,0.92)' }}
                >
                  New category name
                </Label>
                <Input
                  id="new-category-name"
                  ref={nameInputRef}
                  name="name"
                  value={newName}
                  onChange={(e) => { setNewName(e.target.value); if (message && message.tone === 'error') setMessage(null); }}
                  placeholder="Dining out"
                  autoComplete="off"
                  aria-describedby="category-form-message"
                  aria-invalid={message && message.tone === 'error' ? 'true' : 'false'}
                  className="np-focus h-12 w-full border-0 text-base"
                  style={{
                    backgroundColor: 'rgba(6,20,43,0.55)',
                    border: `1px solid ${message && message.tone === 'error' ? hexToRgba(brand.accentColor, 0.75) : 'rgba(255,255,255,0.16)'}`,
                    borderRadius: brand.radius,
                    color: '#ffffff',
                  }}
                />
              </div>
              <div className="col-span-12 sm:col-span-4">
                <Button
                  type="submit"
                  data-wf="b-1-1"
                  disabled={saving}
                  className="np-btn np-focus flex h-12 w-full items-center justify-center gap-2 text-base"
                  style={primaryBtn}
                >
                  {saving ? (
                    <>
                      <span
                        aria-hidden="true"
                        className="np-blink inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: brand.backgroundColor }}
                      />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Plus aria-hidden="true" className="h-5 w-5" />
                      Add category
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Row 3 — validation / status text */}
            <div
              data-wf="b-2-0"
              id="category-form-message"
              role="status"
              aria-live="polite"
              className="mt-4"
            >
              {!message && (
                <p className="text-sm leading-relaxed" style={{ color: brand.neutralColor }}>
                  Names are unique to your account. Every expense you log is grouped by the name you choose here.
                </p>
              )}

              {message && message.tone === 'error' && (
                <div
                  className="np-fade flex flex-wrap items-start gap-3 p-4"
                  style={{
                    backgroundColor: hexToRgba(brand.accentColor, 0.12),
                    border: `1px solid ${hexToRgba(brand.accentColor, 0.42)}`,
                    borderRadius: brand.radius,
                  }}
                >
                  <AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" style={{ color: brand.accentColor }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">{message.title}</p>
                    <p className="mt-1 max-w-[66ch] text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.82)' }}>
                      {message.body}
                    </p>
                    {message.retry && (
                      <Button
                        type="button"
                        onClick={() => reconnect(message.retry)}
                        disabled={sync === 'syncing'}
                        className="np-btn np-focus mt-3 h-10 px-4 text-sm font-semibold"
                        style={quietBtn}
                      >
                        {sync === 'syncing' ? 'Reconnecting…' : 'Reconnect and save it'}
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {message && message.tone === 'success' && (
                <div
                  className="np-fade flex items-start gap-3 p-4"
                  style={{
                    backgroundColor: hexToRgba(brand.primaryColor, 0.1),
                    border: `1px solid ${hexToRgba(brand.primaryColor, 0.38)}`,
                    borderRadius: brand.radius,
                  }}
                >
                  <CheckCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" style={{ color: brand.primaryColor }} />
                  <div>
                    <p className="text-sm font-semibold text-white">{message.title}</p>
                    <p className="mt-1 max-w-[66ch] text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.82)' }}>
                      {message.body}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Row 4 — table */}
        <section data-wf="b-3-0" className="mt-8" aria-labelledby="my-categories-heading">
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
                    borderRadius: '999px',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {categories.length}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium"
                  style={{
                    color: sync === 'synced' ? brand.primaryColor : brand.neutralColor,
                    border: `1px solid ${sync === 'synced' ? hexToRgba(brand.primaryColor, 0.35) : 'rgba(255,255,255,0.14)'}`,
                    borderRadius: '999px',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {sync === 'synced' ? (
                    <Check aria-hidden="true" className="h-3.5 w-3.5" />
                  ) : sync === 'syncing' ? (
                    <span className="np-blink inline-block h-2 w-2 rounded-full" style={{ backgroundColor: brand.neutralColor }} />
                  ) : (
                    <Clock aria-hidden="true" className="h-3.5 w-3.5" />
                  )}
                  {syncLabel}
                </span>
                {sync === 'stale' && (
                  <Button
                    type="button"
                    onClick={() => reconnect(null)}
                    className="np-btn np-focus h-9 px-3 text-xs font-semibold"
                    style={quietBtn}
                  >
                    Reconnect
                  </Button>
                )}
              </div>
            </div>

            {categories.length === 0 ? (
              <div className="px-5 py-12 sm:px-7">
                <Empty
                  title="No categories yet"
                  description="Add your first category above — most people start with Groceries, Transport and Rent & Utilities, then refine as they go."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="w-full min-w-[640px]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  <THead>
                    <TR style={{ borderBottom: hairline }}>
                      <TH
                        data-wf="i-3-0-0"
                        scope="col"
                        className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] sm:px-7"
                        style={{ color: brand.neutralColor }}
                      >
                        Name
                      </TH>
                      <TH
                        data-wf="i-3-0-1"
                        scope="col"
                        className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.14em]"
                        style={{ color: brand.neutralColor }}
                      >
                        Expenses
                      </TH>
                      <TH
                        data-wf="i-3-0-2"
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em]"
                        style={{ color: brand.neutralColor }}
                      >
                        Created
                      </TH>
                      <TH
                        data-wf="i-3-0-3"
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
                      const pct = cat.expense_count === 0 ? 0 : Math.max(6, Math.round((cat.expense_count / totals.max) * 100));
                      const editing = renamingId === cat.id;
                      return (
                        <TR
                          key={cat.id}
                          className={`np-row align-top ${newId === cat.id ? 'np-in' : ''}`}
                          style={{ borderBottom: hairline }}
                        >
                          <TD className="px-5 py-4 sm:px-7">
                            {editing ? (
                              <form onSubmit={(e) => saveRename(e, cat)} className="max-w-sm">
                                <Label
                                  htmlFor={`rename-${cat.id}`}
                                  className="mb-1.5 block text-xs font-medium"
                                  style={{ color: brand.neutralColor }}
                                >
                                  Rename “{cat.name}”
                                </Label>
                                <Input
                                  id={`rename-${cat.id}`}
                                  ref={renameInputRef}
                                  value={renameValue}
                                  onChange={(e) => { setRenameValue(e.target.value); setRenameError(''); }}
                                  aria-invalid={renameError ? 'true' : 'false'}
                                  aria-describedby={renameError ? `rename-error-${cat.id}` : undefined}
                                  className="np-focus h-10 w-full border-0 text-sm"
                                  style={{
                                    backgroundColor: 'rgba(6,20,43,0.6)',
                                    border: `1px solid ${renameError ? hexToRgba(brand.accentColor, 0.75) : 'rgba(255,255,255,0.18)'}`,
                                    borderRadius: '12px',
                                    color: '#ffffff',
                                  }}
                                />
                                {renameError && (
                                  <p
                                    id={`rename-error-${cat.id}`}
                                    role="alert"
                                    className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed"
                                    style={{ color: brand.accentColor }}
                                  >
                                    <AlertCircle aria-hidden="true" className="mt-px h-3.5 w-3.5 shrink-0" />
                                    {renameError}
                                  </p>
                                )}
                                <div className="mt-3 flex gap-2">
                                  <Button
                                    type="submit"
                                    className="np-btn np-focus h-9 px-4 text-xs font-bold"
                                    style={{ ...primaryBtn, borderRadius: '12px', boxShadow: 'none' }}
                                  >
                                    Save name
                                  </Button>
                                  <Button
                                    type="button"
                                    onClick={() => { setRenamingId(null); setRenameError(''); }}
                                    className="np-btn np-focus h-9 px-4 text-xs font-semibold"
                                    style={quietBtn}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </form>
                            ) : (
                              <div className="max-w-[260px]">
                                <span className="block text-[15px] font-semibold text-white">{cat.name}</span>
                                {/* signature element: the pulse meter */}
                                <span
                                  aria-hidden="true"
                                  className="mt-2 block h-[3px] w-full overflow-hidden rounded-full"
                                  style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                                >
                                  <span
                                    className="np-bar block h-full rounded-full"
                                    style={{
                                      width: `${pct}%`,
                                      background: `linear-gradient(90deg, ${brand.primaryColor}, ${brand.accentColor})`,
                                      boxShadow: pct ? `0 0 14px ${hexToRgba(brand.accentColor, 0.7)}` : 'none',
                                    }}
                                  />
                                </span>
                              </div>
                            )}
                          </TD>

                          <TD className="px-4 py-4 text-right">
                            <span className="block text-[15px] font-semibold text-white">{cat.expense_count}</span>
                            <span className="mt-1 block text-xs" style={{ color: brand.neutralColor }}>
                              {cat.expense_count === 0 ? 'unused' : cat.expense_count === 1 ? 'expense' : 'expenses'}
                            </span>
                          </TD>

                          <TD className="px-4 py-4 text-sm" style={{ color: brand.neutralColor }}>
                            {fmtDate(cat.created_at)}
                          </TD>

                          <TD className="px-5 py-4 sm:px-7">
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              <Button
                                type="button"
                                onClick={() => startRename(cat)}
                                disabled={editing}
                                className="np-btn np-focus flex h-9 items-center gap-1.5 px-3 text-xs font-semibold"
                                style={quietBtn}
                              >
                                <Edit aria-hidden="true" className="h-3.5 w-3.5" />
                                Rename
                              </Button>
                              <Button
                                type="button"
                                onClick={(e) => askDelete(cat, e)}
                                className="np-btn np-focus flex h-9 items-center gap-1.5 px-3 text-xs font-semibold"
                                style={{
                                  backgroundColor: 'transparent',
                                  border: `1px solid ${hexToRgba(brand.accentColor, 0.4)}`,
                                  borderRadius: '12px',
                                  color: brand.accentColor,
                                }}
                              >
                                <Trash aria-hidden="true" className="h-3.5 w-3.5" />
                                Delete
                              </Button>
                            </div>
                          </TD>
                        </TR>
                      );
                    })}
                  </TBody>
                </Table>
              </div>
            )}
          </div>

          <p className="mt-4 text-xs leading-relaxed" style={{ color: brand.neutralColor }}>
            Categories drive the by-category breakdown in{' '}
            <button
              type="button"
              onClick={() => navigate('reports')}
              className="np-focus font-semibold underline underline-offset-4"
              style={{ color: brand.primaryColor }}
            >
              Reports
            </button>
            .
          </p>
        </section>
      </div>

      {/* Rows 5–7 — modal */}
      {dialog && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(6,20,43,0.78)', backdropFilter: 'blur(6px)' }}
          />
          <div
            data-wf="b-4-0"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="np-dialog-title"
            aria-describedby="np-dialog-desc"
            className="np-pop relative w-full max-w-lg p-6 sm:p-8"
            style={{
              ...glass,
              backgroundColor: 'rgba(16,30,56,0.92)',
              boxShadow: `0 40px 90px -24px ${hexToRgba(brand.accentColor, 0.55)}`,
            }}
          >
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{
                  backgroundColor: hexToRgba(brand.accentColor, 0.16),
                  border: `1px solid ${hexToRgba(brand.accentColor, 0.4)}`,
                }}
              >
                {dialog.mode === 'blocked' ? (
                  <AlertCircle className="h-5 w-5" style={{ color: brand.accentColor }} />
                ) : (
                  <Trash className="h-5 w-5" style={{ color: brand.accentColor }} />
                )}
              </span>
              <h2
                id="np-dialog-title"
                className="pt-1 text-xl font-bold leading-snug text-white sm:text-2xl"
                style={{ fontFamily: brand.fontHeading }}
              >
                {dialog.mode === 'blocked'
                  ? `${dialog.category.name} still has ${dialog.category.expense_count} expenses`
                  : `Delete “${dialog.category.name}”?`}
              </h2>
            </div>

            <p
              data-wf="b-5-0"
              id="np-dialog-desc"
              className="mt-4 max-w-[62ch] text-sm leading-relaxed sm:text-[15px]"
              style={{ color: 'rgba(255,255,255,0.82)' }}
            >
              {dialog.mode === 'blocked'
                ? 'This category cannot be deleted while expenses are assigned to it. Move those expenses to another category first, then delete it.'
                : 'No expenses are assigned to this category, so deleting it won’t change any of your records. This can’t be undone.'}
            </p>

            <div className="mt-7 grid grid-cols-12 gap-3">
              {dialog.mode === 'blocked' ? (
                <div className="col-span-12 flex items-center sm:col-span-6">
                  <button
                    type="button"
                    data-wf="b-6-0"
                    onClick={() => navigate('expenses')}
                    className="np-focus inline-flex h-11 items-center gap-1.5 text-sm font-semibold underline underline-offset-4"
                    style={{ color: brand.primaryColor }}
                  >
                    View the {dialog.category.expense_count} expenses
                    <ChevronRight aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="col-span-12 sm:col-span-6">
                  <Button
                    type="button"
                    data-wf="b-6-0"
                    onClick={() => confirmDelete(dialog.category)}
                    className="np-btn np-focus flex h-11 w-full items-center justify-center gap-2 text-sm font-bold"
                    style={{
                      backgroundColor: hexToRgba(brand.accentColor, 0.18),
                      border: `1px solid ${hexToRgba(brand.accentColor, 0.65)}`,
                      borderRadius: brand.radius,
                      color: '#ffffff',
                    }}
                  >
                    <Trash aria-hidden="true" className="h-4 w-4" />
                    Delete category
                  </Button>
                </div>
              )}

              <div className="col-span-12 sm:col-span-6">
                <Button
                  type="button"
                  data-wf="b-6-1"
                  data-autofocus="true"
                  onClick={closeDialog}
                  className="np-btn np-focus flex h-11 w-full items-center justify-center text-sm font-bold"
                  style={primaryBtn}
                >
                  Keep category
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
