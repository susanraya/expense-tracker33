# Planning

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start narrative -->
### PLAN-EPIC-001 · approved · source: planning:EPIC-001

Account Registration, Sign-in and Security.

Each individual can create a private account with email and password, sign in and out, and trust that their session and credentials are handled securely; data is private per account. No email delivery is available in this version, so email-dependent flows (verification, emailed password reset) are out of scope for v1.

**Related:** US-001, US-002, US-003, US-004, US-005

### PLAN-EPIC-002 · approved · source: planning:EPIC-002

Manual Expense Logging.

Users record their own one-off expenses by hand, capturing amount, date, category and an optional note, and can view, edit and delete their expenses. Single currency only; no recurring expenses, receipt attachments, or automatic bank/card import.

**Related:** US-006, US-007, US-008, US-009

### PLAN-EPIC-003 · approved · source: planning:EPIC-003

Category Management.

Each user manages their own set of expense categories -- creating, renaming and deleting them -- which classify expenses and drive by-category report breakdowns.

**Related:** US-010, US-011, US-012

### PLAN-EPIC-004 · approved · source: planning:EPIC-004

Spending Dashboard.

After signing in, the user lands on a dashboard summarising recent spending and offering quick access to logging an expense and viewing reports, at MVP scope.

**Related:** US-013, US-014

### PLAN-EPIC-005 · approved · source: planning:EPIC-005

Reports, Charts and Data Export -- the headline capability.

Users visualise their spending over time and broken down by category, filter by a date range, and export their own data as CSV. Budgets and overspend alerts are explicitly not in scope for v1.

**Related:** US-015, US-016, US-017, US-018

### PLAN-EPIC-006 · approved · source: planning:EPIC-006

Responsive Web Application Foundation and Documentation.

Establishes the delivered product as a responsive web app for desktop and mobile browsers (no native mobile app), backed by REST APIs and a database, free to use with no billing, and covered by basic setup/usage documentation.

**Related:** US-019, US-020, US-021, US-022

### PLAN-SPRINT-1 · approved · source: planning:plan:Sprint 1

Sprint 1: secure auth and core scaffolding.

Goal: secure registration, login, session/logout, account deactivation, per-user data isolation, and core REST/DB scaffolding in place. Capacity: 20 points.

**Related:** PLAN-EPIC-001, PLAN-EPIC-006

### PLAN-SPRINT-2 · approved · source: planning:plan:Sprint 2

Sprint 2: category management and start of expense logging.

Goal: users can manage their own categories and start logging and viewing expenses. Capacity: 20 points.

**Related:** PLAN-EPIC-003, PLAN-EPIC-002

### PLAN-SPRINT-3 · approved · source: planning:plan:Sprint 3

Sprint 3: complete expense editing/deletion, dashboard and responsive layout foundation.

Goal: expense editing/deletion complete; dashboard summary and responsive layout foundation delivered. Capacity: 20 points.

**Related:** PLAN-EPIC-002, PLAN-EPIC-004, PLAN-EPIC-006

### PLAN-SPRINT-4 · approved · source: planning:plan:Sprint 4

Sprint 4: reports, filtering and CSV export.

Goal: spending-over-time and by-category reports, date-range filtering, and CSV export delivered. Capacity: 20 points.

**Related:** PLAN-EPIC-005

### PLAN-SPRINT-5 · approved · source: planning:plan:Sprint 5

Sprint 5: dashboard shortcuts and documentation.

Goal: dashboard shortcuts wired up and setup/usage documentation published. Capacity: 20 points.

**Related:** PLAN-EPIC-004, PLAN-EPIC-006
<!-- sdlc:auto:end narrative -->
