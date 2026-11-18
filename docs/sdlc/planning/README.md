# Planning

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start narrative -->
### EPIC-001 · approved · source: planning:EPIC-001

Each individual can create a private account with email and password, sign in and out, and trust that their session and credentials are handled securely; data is private per account.

Assumption: users register and log in with email and password; no email delivery is available in this version, so flows depending on sending email (email verification, emailed password resets) are out of scope for v1.

**Related:** US-001, US-002, US-003, US-004, US-005

### EPIC-002 · approved · source: planning:EPIC-002

Users record their own one-off expenses by hand, capturing amount, date, category and an optional note, and can view, edit and delete them.

Assumptions: expenses entered manually; single currency only; no recurring expenses or receipt photo attachments in v1; no automatic bank/card import.

**Related:** US-006, US-007, US-008, US-009

### EPIC-003 · approved · source: planning:EPIC-003

Each user manages their own set of expense categories -- creating, editing and deleting them -- to classify expenses and drive by-category report breakdowns.

**Related:** US-010, US-011, US-012

### EPIC-004 · approved · source: planning:EPIC-004

After signing in, the user lands on a dashboard summarizing recent spending with quick access to logging an expense and viewing reports.

Covers the Dashboard capability at MVP scope.

**Related:** US-013, US-014

### EPIC-005 · approved · source: planning:EPIC-005

The headline capability: users visualize spending over time and by category, filter by date range, and export their own data as CSV.

Assumption: reports include spending-over-time charts and by-category breakdowns, filterable by date range, with CSV export; budgets and overspend alerts are not in scope for v1.

**Related:** US-015, US-016, US-017, US-018

### EPIC-006 · approved · source: planning:EPIC-006

Establishes the delivered product as a responsive web application backed by REST APIs and a database, with basic documentation for setup and use.

Assumptions: delivered as a responsive web app for desktop and mobile browsers (no native mobile app); the app is free to use with no billing or payment processing.

**Related:** US-019, US-020, US-021, US-022
<!-- sdlc:auto:end narrative -->
