# Product Requirements

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start narrative -->
## Summary

### REQ-TECH-STACK · approved · source: requirements:v1

Technology stack approved by the product owner for the expense tracker; must be designed against exactly these choices.

Backend: FastAPI 0.115 -- authenticates users, stores private expenses/categories, runs date-range queries for charts and CSV export, with automatic request validation for amounts/dates/categories. Cloud: AWS -- dependable hosting, automatic backups, managed database and email services, room to scale cheaply. Database: PostgreSQL 16 -- relational store for expenses/categories/accounts needing per-user isolation and accurate-to-the-cent figures, efficient date-range grouping and per-category totals, no-cost default. Frontend: React 19 -- responsive web app with interactive, live-redrawing charts (spending over time and by category) as date-range filters change, smooth on desktop and mobile without a separate mobile app.

### REQ-SERVICES · approved · source: requirements:v1

Capabilities/services included in the build scope for this delivery.

In-scope capabilities: Authentication; Basic Project Structure; Dashboard; CRUD Screens; REST APIs; Database Integration; Basic Documentation.

### REQ-SCOPE · approved · source: requirements:v1

Delivery scope is lightweight; several features are explicitly excluded from this version.

Delivery scope: lightweight. Out of scope -- do not design or build: automatic bank/card transaction import; multiple currencies, recurring expenses, and receipt photo attachments; email (the suggested SMTP server was removed from the stack, so email verification and emailed password resets are also excluded).

### REQ-FEAT-SIGNIN · approved · source: requirements:Sign-in & accounts

Requirements covering account registration, sign-in, session handling, and account deactivation.

- Register a new account: create a private account with email + password meeting stated requirements; rejected with a clear message if email already has an account or email/password is invalid.
- Sign in to my account: sign in with email and password to reach the dashboard; wrong email or password fails with a generic message.
- Sign out and session expiry: signing out ends the session immediately; a session inactive beyond the configured period is treated as expired, requiring re-sign-in before any protected action.
- Deactivate my account: a signed-in user can confirm deactivation; active sessions end and the account can no longer sign in.

### REQ-FEAT-EXPENSES · approved · source: requirements:Logging expenses

Requirements covering manual creation, viewing, editing, and deletion of expenses.

- Add an expense: record a positive amount, date, one of the user's categories, and optional note, saved in the single supported currency; required fields and positive amount enforced; no fields for recurring schedules, receipts, or currency.
- View my expenses: list of the user's expenses (amount, date, category, note), most recent first; empty-state message when there are none.
- Edit an expense: change amount, date, category or note; valid changes saved and reflected in the list; invalid values rejected with a validation message.
- Delete an expense: delete after confirmation; it no longer appears in any lists or reports.

### REQ-FEAT-CATEGORIES · approved · source: requirements:Managing categories

Requirements covering creation, renaming, and deletion of expense categories.

- Create a category: name must be non-blank and unique within the account; becomes available for expenses immediately; blank/duplicate names rejected.
- Rename a category: rename to a valid, unique name; expenses assigned to it reflect the updated name.
- Delete a category: allowed only if it has no expenses assigned; if it has expenses, deletion is prevented with a clear explanation of how to proceed so no expense is left uncategorized.

### REQ-FEAT-DASHBOARD · approved · source: requirements:Dashboard

Requirements covering the spending summary dashboard and its quick-action shortcuts.

- See a spending summary: dashboard shows summary figures from the user's own data (e.g., total spending for the current period, top-category breakdown); helpful empty state when there are no expenses.
- Quick access to key actions: dashboard provides shortcuts to add an expense and to open the reports screen.

### REQ-FEAT-REPORTS · approved · source: requirements:Reports & export

Requirements covering spending charts, category breakdowns, date-range filtering, and CSV export.

- View spending over time: time-based chart of total spending built only from the user's own expenses; clear empty state when the selected range has none.
- View spending by category: breakdown of spending grouped by category for the selected range, as chart and/or totals.
- Filter reports by date range: selecting start/end dates updates charts and breakdowns to that range; a start date later than the end date is rejected with a validation message.
- Export my data as CSV: export expenses (optionally within the selected date range) as a CSV with amount, date, category and note columns, containing only the user's own expenses.

### REQ-FEAT-PLATFORM · approved · source: requirements:Platform & documentation

Requirements covering the no-cost model, REST API backbone, and baseline documentation.

- Free to use: users register, log expenses, and view reports without ever being asked for payment details; no billing or subscription flow.
- Core data over REST APIs: expenses, categories and account data are served through REST API endpoints that persist to and read from the database, scoped to the authenticated user.
- Setup and usage documentation: basic documentation covers how to set up and run the app and summarizes core features: accounts, expenses, categories, reports and export.

### NFR-001 · approved · source: requirements:NFR-001

Privacy: each user only ever sees and changes their own expenses and categories.

Applies whether viewing screens or requesting data through the API; another user's data must never be visible or editable.

### NFR-002 · approved · source: requirements:NFR-002

Privacy: sign-in failures must not reveal whether an account exists for a given email.

On sign-in failure, the user sees only a generic message, regardless of whether the email is registered.

### NFR-003 · approved · source: requirements:NFR-003

Security: passwords are stored only as hashes, never in plain text.

Applies to all stored user passwords.

### NFR-004 · approved · source: requirements:NFR-004

Security: sessions end on sign-out or account deactivation, and expire after a configured inactivity period.

After expiry, the user must sign in again to access any data.

### NFR-005 · approved · source: requirements:NFR-005

Security: protected screens and APIs require a valid authenticated session.

Any unauthenticated attempt to reach a protected screen or API is denied, returns or changes no data, and the user is directed to sign in.

### NFR-006 · approved · source: requirements:NFR-006

Security: documentation must show secrets only as angle-bracket placeholders, never real-looking values.

Applies to configuration examples such as database connection strings or passwords.

### NFR-007 · approved · source: requirements:NFR-007

Compatibility: the app must run as a responsive web app in modern desktop and mobile browsers.

Layout adapts so all core actions remain usable on a small screen.

### NFR-008 · approved · source: requirements:NFR-008

Usability: when there is no data, the expense list, dashboard and reports show a clear empty state rather than broken or misleading widgets.

Empty states should invite the user to add data.

### NFR-009 · approved · source: requirements:NFR-009

Accepted risk: no email-based account recovery in this version, since no email delivery is available.

Flows depending on sending email (e.g., email verification, emailed password resets) are intentionally excluded from v1; users cannot recover a forgotten password by email.
<!-- sdlc:auto:end narrative -->

<!-- sdlc:auto:start summary -->
**Requirements version:** v1  
**Delivery scope:** lightweight  
**Approved:** 2026-11-18

**Capabilities in scope:** Authentication, Basic Project Structure, Dashboard, CRUD Screens, REST APIs, Database Integration, Basic Documentation

**Approved technology stack:**

| Layer | Choice | Rationale |
|---|---|---|
| backend | FastAPI | The server's real job here is small and clear: authenticate each user, store their private expenses and categories, and run date-range queries to feed the charts and CSV export. FastAPI is a lean Python framework that does exactly this with little ceremony, and its automatic request validation keeps amounts, dates and categories clean as they come in — which matters for financial figures people trust. |
| cloud | AWS | A private personal-finance app needs dependable hosting, automatic backups of each person's data, and room to grow from a handful of users to many without re-platforming. AWS covers all of that with managed database and email services you can lean on, so you are not hand-building infrastructure for a free app you want to keep cheap to run. |
| database | PostgreSQL | Expenses, categories and accounts are structured records that must stay accurate to the cent and strictly separated per user — a relational database is the right fit, and PostgreSQL does the date-range grouping and per-category totals your reports need efficiently as each person's history grows. It is a dependable, no-cost default that will not become a limit for a personal-finance app. |
| frontend | React | Your product is a responsive web app where the headline feature is interactive reports and charts — spending over time and by category, re-drawn as the user changes the date-range filter. React handles this live redrawing smoothly and has mature, well-supported charting libraries, so the dashboard feels instant on both desktop and mobile browsers without you needing a separate mobile app. |
<!-- sdlc:auto:end summary -->

<!-- sdlc:auto:start epics -->
## EPIC-001: Account Registration, Sign-in and Security

Each individual can create a private account with email and password, sign in and out, and trust that their session and credentials are handled securely. Data is private per account. Assumption: users register and log in with email and password; no email delivery is available in this version (SMTP was removed from the stack), so flows that would depend on sending email — such as email verification or emailed password resets — are out of scope for v1.

### US-001: Register a new account

**Priority:** critical

> As a new visitor, I want to create a private account using my email and a password, so that I can start tracking my own expenses privately.

| ID | Given | When | Then |
|---|---|---|---|
| AC-001 | I am on the registration screen and no account exists for my email | I enter a valid email and a password that meets the stated requirements and submit | my account is created, my password is stored only as a hash (never in plain text), and I am signed in or taken to the sign-in screen |
| AC-002 | I am on the registration screen | I enter an email that already has an account | registration is rejected with a clear message and no duplicate account is created |
| AC-003 | I am on the registration screen | I submit an invalid email or a password that does not meet the stated requirements | the account is not created and I see a validation message explaining what to fix |

### US-002: Sign in to my account

**Priority:** critical

> As a registered user, I want to sign in with my email and password, so that I can access my own expenses and reports.

| ID | Given | When | Then |
|---|---|---|---|
| AC-004 | I have a registered account | I enter my correct email and password and submit | I am signed in and taken to my dashboard |
| AC-005 | I am on the sign-in screen | I enter an incorrect email or password | I am not signed in and I see a generic message that does not reveal whether the email exists |

### US-003: Sign out and session expiry

**Priority:** high

> As a signed-in user, I want my session to end when I sign out and to expire after a period of inactivity, so that others cannot use my account from my device.

| ID | Given | When | Then |
|---|---|---|---|
| AC-006 | I am signed in | I choose to sign out | my session is ended and I must sign in again to access any of my data |
| AC-007 | I have a session that has been inactive beyond the configured expiry period | I next attempt a protected action | the session is treated as expired and I am required to sign in again |

### US-004: Keep my data private to my account

**Priority:** critical

> As a signed-in user, I want to only ever see and change my own expenses and categories, so that my personal finances stay private.

| ID | Given | When | Then |
|---|---|---|---|
| AC-008 | another user has their own expenses and categories | I am signed in and view or request data | I only see data belonging to my own account and never another user's data |
| AC-009 | I am not signed in | I try to access any protected screen or API endpoint | access is denied and I am directed to sign in |

### US-005: Deactivate my account

**Priority:** medium

> As a signed-in user, I want to deactivate my account, so that I can stop using the service and end access to my data.

| ID | Given | When | Then |
|---|---|---|---|
| AC-010 | I am signed in | I confirm deactivation of my account | my active sessions are ended and I can no longer sign in with that account |

## EPIC-002: Manual Expense Logging

Users record their own one-off expenses by hand. Each expense captures an amount, a date, a category and an optional note, and users can view, edit and delete their expenses. Assumptions surfaced here: expenses are entered manually; single currency only (no multi-currency); no recurring expenses and no receipt photo attachments in v1; no automatic bank/card import.

### US-006: Add an expense

**Priority:** critical

> As a signed-in user, I want to manually record an expense with amount, date, category and an optional note, so that my spending is captured accurately.

| ID | Given | When | Then |
|---|---|---|---|
| AC-011 | I am on the add-expense screen | I enter a positive amount, a date, select one of my categories, optionally add a note, and save | the expense is saved to my account in the single supported currency and appears in my expense list |
| AC-012 | I am adding an expense | I leave a required field (amount, date, or category) empty or enter a non-positive or non-numeric amount | the expense is not saved and I see a validation message explaining what to fix |
| AC-013 | I am adding an expense | I view the form | there is no field for recurring schedules, receipt attachments or currency selection, reflecting that these are out of scope for v1 |

### US-007: View my expenses

**Priority:** high

> As a signed-in user, I want to see a list of my recorded expenses, so that I can review what I have spent.

| ID | Given | When | Then |
|---|---|---|---|
| AC-014 | I have recorded expenses | I open the expenses list | I see my expenses showing amount, date, category and note, ordered by date with the most recent first |
| AC-015 | I have no recorded expenses yet | I open the expenses list | I see an empty-state message prompting me to add my first expense |

### US-008: Edit an expense

**Priority:** high

> As a signed-in user, I want to edit an existing expense, so that I can correct mistakes.

| ID | Given | When | Then |
|---|---|---|---|
| AC-016 | I have an existing expense | I change its amount, date, category or note and save with valid values | the updated values are stored and shown in my expense list |
| AC-017 | I am editing an expense | I enter invalid values | the changes are not saved and I see a validation message |

### US-009: Delete an expense

**Priority:** medium

> As a signed-in user, I want to delete an expense, so that I can remove entries I no longer want.

| ID | Given | When | Then |
|---|---|---|---|
| AC-018 | I have an existing expense | I delete it and confirm | the expense is removed from my account and no longer appears in lists or reports |

## EPIC-003: Category Management

Each user manages their own set of expense categories, creating, editing and deleting them. Categories are used to classify expenses and to drive the by-category breakdowns in reports.

### US-010: Create a category

**Priority:** high

> As a signed-in user, I want to create my own expense categories, so that I can classify my spending in a way that suits me.

| ID | Given | When | Then |
|---|---|---|---|
| AC-019 | I am managing my categories | I enter a category name that is not blank and is unique within my account and save | the category is created and becomes available when adding or editing expenses |
| AC-020 | I am creating a category | I enter a blank name or a name that already exists in my account | the category is not created and I see a validation message |

### US-011: Edit a category

**Priority:** medium

> As a signed-in user, I want to rename my categories, so that I can keep my classification tidy.

| ID | Given | When | Then |
|---|---|---|---|
| AC-021 | I have an existing category | I rename it to a valid, unique name and save | the new name is applied and expenses assigned to it reflect the updated name |

### US-012: Delete a category

**Priority:** medium

> As a signed-in user, I want to delete a category I no longer use, so that my category list stays relevant.

| ID | Given | When | Then |
|---|---|---|---|
| AC-022 | I have a category with no expenses assigned to it | I delete it and confirm | the category is removed from my account |
| AC-023 | I have a category that still has expenses assigned to it | I attempt to delete it | I am warned and prevented from leaving those expenses without a category, with a clear explanation of how to proceed |

## EPIC-004: Spending Dashboard

After signing in the user lands on a dashboard that summarises their recent spending and gives quick access to logging an expense and viewing reports. This covers the Dashboard capability at MVP scope.

### US-013: See a spending summary on sign-in

**Priority:** high

> As a signed-in user, I want a dashboard summarising my recent spending, so that I get an at-a-glance picture without opening full reports.

| ID | Given | When | Then |
|---|---|---|---|
| AC-024 | I have recorded expenses | I open the dashboard | I see summary figures such as total spending for the current period and a breakdown of top categories, computed only from my own data |
| AC-025 | I have no expenses yet | I open the dashboard | I see an empty state inviting me to add my first expense rather than empty or broken widgets |

### US-014: Quick access to key actions

**Priority:** medium

> As a signed-in user, I want shortcuts from the dashboard to add an expense and to open reports, so that I can act quickly on what I see.

| ID | Given | When | Then |
|---|---|---|---|
| AC-026 | I am on the dashboard | I select the add-expense shortcut | I am taken to the add-expense screen |
| AC-027 | I am on the dashboard | I select the reports shortcut | I am taken to the reports screen |

## EPIC-005: Reports, Charts and Data Export

The headline capability: users visualise their spending over time and broken down by category, filter by a date range, and export their own data as CSV. Assumption surfaced: reports include spending-over-time charts and by-category breakdowns, filterable by date range, with CSV export; budgets and overspend alerts are not in scope for v1.

### US-015: View spending over time

**Priority:** critical

> As a signed-in user, I want a chart of my spending over time, so that I can see how my spending trends.

| ID | Given | When | Then |
|---|---|---|---|
| AC-028 | I have expenses across several dates | I open the spending-over-time report | I see a time-based chart of my total spending built only from my own expenses |
| AC-029 | I have no expenses in the selected range | I view the report | I see a clear empty state rather than a broken or misleading chart |

### US-016: View spending by category

**Priority:** critical

> As a signed-in user, I want a breakdown of my spending by category, so that I can see where my money goes.

| ID | Given | When | Then |
|---|---|---|---|
| AC-030 | I have expenses across several categories | I open the by-category report | I see a breakdown (chart and/or totals) of my spending grouped by category for the selected range |

### US-017: Filter reports by date range

**Priority:** high

> As a signed-in user, I want to filter reports by a date range, so that I can focus on a specific period.

| ID | Given | When | Then |
|---|---|---|---|
| AC-031 | I am viewing a report | I select a start and end date | the charts and breakdowns update to include only my expenses within that range |
| AC-032 | I select a start date later than the end date | I apply the filter | I see a validation message and the report is not updated with the invalid range |

### US-018: Export my data as CSV

**Priority:** high

> As a signed-in user, I want to export my expenses as a CSV file, so that I can keep my own copy or analyse it elsewhere.

| ID | Given | When | Then |
|---|---|---|---|
| AC-033 | I have recorded expenses | I choose to export, optionally within the selected date range | I receive a CSV file containing only my own expenses with amount, date, category and note columns |

## EPIC-006: Responsive Web Application Foundation and Documentation

Establishes the delivered product as a responsive web application backed by REST APIs and a database, with basic documentation for setup and use. Assumptions surfaced: delivered as a responsive web app for desktop and mobile browsers (no native mobile app); the app is free to use with no billing or payment processing.

### US-019: Use the app on desktop and mobile browsers

**Priority:** high

> As a user, I want the app to work in a browser on both desktop and mobile, so that I can track expenses from whichever device I have.

| ID | Given | When | Then |
|---|---|---|---|
| AC-034 | I open the app in a modern desktop browser | I navigate the main screens | the layout is usable and all core actions (log expense, manage categories, view reports) are accessible |
| AC-035 | I open the app in a mobile browser | I navigate the main screens | the layout adapts responsively so the same core actions remain usable on a small screen |

### US-020: Core data served over REST APIs backed by a database

**Priority:** high

> As a developer, I want expenses, categories and account data served via REST APIs persisted in a database, so that the web app has a reliable, structured backend.

| ID | Given | When | Then |
|---|---|---|---|
| AC-036 | the application is running | the web app performs create, read, update or delete actions for expenses and categories | those actions are served by REST API endpoints that persist to and read from the database, scoped to the authenticated user |
| AC-037 | a request is made to a protected API endpoint without a valid authenticated session | the request is processed | it is rejected and no data is returned or changed |

### US-021: Free to use with no payment processing

**Priority:** low

> As a user, I want to use the app without any billing or payment, so that I can track my expenses at no cost.

| ID | Given | When | Then |
|---|---|---|---|
| AC-038 | I am using any part of the app | I register, log expenses, or view reports | I am never asked for payment details and there is no billing or subscription flow, reflecting that monetisation is out of scope for v1 |

### US-022: Basic documentation for setup and use

**Priority:** medium

> As a developer or new user, I want basic documentation covering how to set up and run the app and how to use its main features, so that I can get started without guesswork.

| ID | Given | When | Then |
|---|---|---|---|
| AC-039 | the project is delivered | I open the documentation | I find setup/run instructions and a summary of core features (accounts, expenses, categories, reports, export) |
| AC-040 | the documentation shows configuration examples involving secrets such as database connection strings or passwords | I read them | any secret is shown only as a placeholder in angle brackets (for example <database-password>) and never as a real-looking value |
<!-- sdlc:auto:end epics -->
