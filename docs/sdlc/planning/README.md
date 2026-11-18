# Planning

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start narrative -->
### EPIC-001 · approved · source: planning:EPIC-001

Lets each individual create a private account, sign in/out securely, and trust session and credential handling; data is private per account.

Goal: individuals can register with email/password, sign in and out, and have sessions and credentials handled securely, with data private per account. Assumption stated: no email delivery (SMTP removed from stack), so email verification and emailed password resets are out of scope for v1.

**Related:** US-001, US-002, US-003, US-004, US-005

### EPIC-002 · approved · source: planning:EPIC-002

Users manually record one-off expenses (amount, date, category, optional note) and can view, edit and delete them.

Goal: manual logging of one-off expenses with amount, date, category and optional note; users can view, edit and delete their expenses. Assumptions stated: single currency only (no multi-currency), no recurring expenses, no receipt photo attachments in v1, no automatic bank/card import.

**Related:** US-006, US-007, US-008, US-009

### EPIC-003 · approved · source: planning:EPIC-003

Each user manages their own set of expense categories used to classify expenses and drive report breakdowns.

Goal: users create, edit and delete their own expense categories. Categories are used to classify expenses and to drive the by-category breakdowns in reports.

**Related:** US-010, US-011, US-012

### EPIC-004 · approved · source: planning:EPIC-004

A post-sign-in dashboard summarizes recent spending and gives quick access to logging an expense and viewing reports.

Goal: after signing in the user lands on a dashboard summarizing recent spending with quick access to adding an expense and to reports. Covers the Dashboard capability at MVP scope.

**Related:** US-013, US-014

### EPIC-005 · approved · source: planning:EPIC-005

Users visualize spending over time and by category, filter by date range, and export their own data as CSV.

Goal (headline capability): spending-over-time charts, by-category breakdowns, filterable by date range, with CSV export. Assumption stated: budgets and overspend alerts are not in scope for v1.

**Related:** US-015, US-016, US-017, US-018

### EPIC-006 · approved · source: planning:EPIC-006

Delivers the product as a responsive web app for desktop and mobile browsers, backed by REST APIs and a database, with basic setup/use documentation.

Goal: establish the product as a responsive web application backed by REST APIs and a database, with basic documentation for setup and use. Assumptions stated: delivered as a responsive web app for desktop and mobile browsers (no native mobile app); the app is free to use with no billing or payment processing.

**Related:** US-019, US-020, US-021, US-022

### SPRINT-1 · approved · source: planning:SPRINT-1

Sprint 1 goal: deliver secure registration, login, session/logout, account deactivation, per-user data isolation, and core REST/DB scaffolding.

Plan v1 (approved), Sprint 1, capacity 20 points. Goal: "Secure registration, login, session/logout, account deactivation, per-user data isolation, and core REST/DB scaffolding in place."

**Related:** EPIC-001, EPIC-006

### SPRINT-2 · approved · source: planning:SPRINT-2

Sprint 2 goal: enable category management and start manual expense logging/viewing.

Plan v1 (approved), Sprint 2, capacity 20 points. Goal: "Users can manage their own categories and start logging and viewing expenses."

**Related:** EPIC-003, EPIC-002

### SPRINT-3 · approved · source: planning:SPRINT-3

Sprint 3 goal: complete expense editing/deletion and deliver the dashboard summary plus a responsive layout foundation.

Plan v1 (approved), Sprint 3, capacity 20 points. Goal: "Expense editing/deletion complete; dashboard summary and responsive layout foundation delivered."

**Related:** EPIC-002, EPIC-004, EPIC-006

### SPRINT-4 · approved · source: planning:SPRINT-4

Sprint 4 goal: deliver spending-over-time and by-category reports, date-range filtering, and CSV export.

Plan v1 (approved), Sprint 4, capacity 20 points. Goal: "Spending-over-time and by-category reports, date-range filtering, and CSV export delivered."

**Related:** EPIC-005

### SPRINT-5 · approved · source: planning:SPRINT-5

Sprint 5 goal: wire up dashboard shortcuts and publish setup/usage documentation.

Plan v1 (approved), Sprint 5, capacity 20 points. Goal: "Dashboard shortcuts wired up and setup/usage documentation published."

**Related:** EPIC-004, EPIC-006
<!-- sdlc:auto:end narrative -->
